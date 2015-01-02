var Bifrost = (function(global){
	"use strict";

	var _online = true;

	var _listeners = {};

	var _stores = {};

	var _localKeySequence  = '_bifrost_sequence';
	var _localKeyPrefix    = '_bifrost_';


	// ----------------------------------------
	// Utils

	// Return true if obj argument is truthy, false otherwise
	var exists = function(obj) {
		if (obj === null) return false;
		if (typeof obj === "undefined") return false;
		if (obj instanceof Array) return obj.length>0;
		return (
			(typeof obj === 'number' && obj!=0) ||
			(typeof obj === 'string' && obj.length>0) ||
			(typeof obj === 'object' && Object.keys(obj).length>0)
		);
	};

	//Creates a querystring from an object, appends to optional url string
	var buildquery = function(data,url) {
		url = url || "";
		var qs = "";
		var ch = url.indexOf('?')<0?'?':'&';
		for(var key in data) {
			if(data.hasOwnProperty(key)) {
				qs = qs + ch + key + '=' + data[key];
				ch = '&';
			}
		}
		url = url + qs;

		return url;
	}

	// ----------------------------------------
	// Events

	var trigger = function(type,data) {
		// >=IE9
		var event = document.createEvent('HTMLEvents');
		event.initEvent(type, true, true);
		event.eventName = type;
		event.data = data || {};
		global.dispatchEvent(event);
	};

	var on = function(type,callback) {
		// >=IE9
		_listeners[type] = callback;
		global.addEventListener(type, callback, false);
	};

	var off = function(type,callback) {
		// >=IE9
		global.removeEventListener(type, callback||_listeners[type], false);
		if(!callback) delete _listeners[type];
	};


	// ----------------------------------------
	// Ajax

	var ajax = (function(){
		function request(type) {
			return function(url, data, callback) {
				var xhr  = new XMLHttpRequest();
				var body = null;

				if (typeof data === 'function') {
					callback = data;
					data = null;
				}

				xhr.onload = function () {
					var res = xhr.response;
					if (res) {
						try {
							res = JSON.parse(xhr.response);
						} catch (ex) {
							console.log(ex);
						}
						callback.call(xhr, null, res);
					} else {
						callback.call(xhr, true);
					}
				};

				xhr.onerror = function () {
					callback.call(xhr, true);
				};

				if ((type === 'GET' || type === 'HEAD') && data) {
					url = buildquery(data,url);
				};

				xhr.open(type, url, true);
				xhr.withCredentials = true;

				if ((type === 'POST' || type === 'PUT') && data) {
					body = JSON.stringify(data);
					xhr.setRequestHeader('Content-Type', 'application/json');
				}

				xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

				xhr.send(data ? body : null);
				return xhr;
			};
		}

		return {
			get:request('GET'),
			post:request('POST'),
			del:request('DELETE'),
			put:request('PUT'),
			head:request('HEAD')
		};
	})();

	// ----------------------------------------
	// React Components

	var reactMixin = function(store) {
		return {
			getInitialState: function() {
				return {items:[]};
			},
			componentDidMount:function(){
				var self = this;
				store.bind(function(e,d){
					self.state.items = store.state;
					self.setState(self.state);
				});
				store.sync();
			},
			setPersistentState:function(data) {
				store.save(data);
			},
			componentWillUnmount:function() {
				off(store.localevent);
			}
		};
	};

	// ----------------------------------------
	// Main Object

	var Store = function(options) {
		var self = this;
		self.name = options.name;
		self.key = options.key;
		self.timestamp = options.timestamp;
		self._host = options.host;
		self._setRemote = options.setRemote || null;
		self._getRemote = options.getRemote || null;
		self._hasRemote = (self._setRemote && self._getRemote) ? true:false;
		self._url = (self._hasRemote) ? (options.host+options.name+"/") : "";
		self._filter = (self._hasRemote && options.filter) ? options.filter : null;
		self._addfilter = (self._hasRemote && options.addfilter) ? options.addfilter : null;
		self._savefilter = (self._hasRemote && options.savefilter) ? options.savefilter : null;
		self.localevent = "local" + options.name;
		self.remoteevent = "remote" + options.name;
		self.state = [];

		if (options.reset===true) removeLocal(self.name);

	};

	Store.prototype.add = function(item) {
		var self  = this;
		var key = self.key;
		var id = item[key] || localkey();
		item[key] = id;
		self.state.push(item);
		setLocal(self.name,self.state);
		if(self._hasRemote) {
			var remote = function(){
				self._setRemote(key,self._url,item,function(err,res){
					if(err) {
						console.log("An error occurred when synchronizing to the remote resource");
						return;
					}
					//Rectify remote key with temporary local key:
					var newitem = null;
					if (self._addfilter) {
						//custom filter specified
						newitem = self._addfilter.call(self,item,res);
					} else if (res[key]) {
						//automatically set key
						newitem = item;
						newitem[key] = res[key];
					}
					
					if (newitem[key] === id) {
						console.warn("Local item key was not replaced with remote item key for",id);
					}

					//Replace the item in local state, trigger add events have occurred
					self.replace(id,newitem);
					trigger(self.localevent,self.state);
					trigger(self.remoteevent,self.res);
				});
			};
			if (_online) {
				remote();
			} else {
				queue.add(remote);
			}
		}
		trigger(self.localevent,self.state);
	};

	Store.prototype.save = function(item) {
		var self = this;
		var id = item[self.key];

		if(!id) { self.add(item); return; }
		for(var i=0;i<self.state.length;i++) {
			var stateitem = self.state[i];
			if (stateitem[self.key]===id) self.state[i] = item;
		}

		setLocal(self.name,self.state);

		if(self._hasRemote) {
			var remote = function(){
				self._setRemote(self.key,self._url+id,item,function(err,res){
					if(err) {
						console.log("An error occurred when synchronizing to the remote resource");
						return;
					}
					if(self._savefilter) res = self._savefilter.call(self,item,res);
					trigger(self.remoteevent,res);
				});
			};

			if (_online) {
				remote();
			} else {
				queue.add(remote);
			}
		}

		trigger(self.localevent,self.state);
	};

	Store.prototype.sync = function(query) {

		var self = this;
		var _newState = getLocal(self.name);

		self.state = exists(_newState) ? _newState : self.state;
		trigger(self.localevent,self.state);

		if (self._hasRemote) {

			query = query || {};
			var remote = function(){
				self._getRemote(self._url,query,function(err,res){

					if (err) {
						trigger("error"+self.name,err);
						trigger(self.localevent,self.state);

					} else {
						var items = self._filter ? self._filter(res) : res;
						var keyname = self.key;
						var timestamp = self.timestamp;

						// The algorithm works like this:
						// Look up the data by the keyname. If it is not present
						// in the store, add it. If it is, replace it in entirety.
						for (var i=0;i<items.length;i++) {
							var itemKey = items[i][keyname];
							if (!self.replace(itemKey),items[i]) {
								self.state.push(items[i]);
							}
						};

						self.state.sort(descending(keyname,timestamp));
						setLocal(self.name,self.state);
						trigger(self.localevent,self.state);
						trigger(self.remoteevent,self.res);

					}
				});
			};

			if (_online) {
				remote();
			} else {
				queue.add(remote);
			}
		}
	};

	Store.prototype.reactMixin = function(){
		return reactMixin(this);
	};

	Store.prototype.reset = function(){
		setLocal(this.name,[]);
	};

	Store.prototype.bind = function(callback){
		var self = this;
		on(self.localevent,callback);
	};

	Store.prototype.unbind = function(callback){
		var self = this;
		off(self.localevent,callback);
	};

	Store.prototype.find = function(key) {
		var self = this;
		var items = self.state;
		var keyname = self.key;
		for(var i=0;i<items.length;i++) {
			if(items[i] && items[i][keyname] === key) return items[i];
		}
		return null;
	};

	Store.prototype.replace = function(key,object) {
		var self = this;
		var items = self.state;
		var keyname = self.key;
		for(var i=0;i<items.length;i++) {
			if (items[i] && items[i][keyname] === key) {
				items[i] = object;
				//True if key found and object replaced
				return true;
			}
		}
		//False if key not found
		return false;
	};

	Store.prototype.ascending = function() {
		return ascending(this.key,this.timestamp);
	};

	Store.prototype.descending = function() {
		return descending(this.key,this.timestamp);
	};

	// ----------------------------------------
	// localStorage Operations

	var getLocal = function(resource) {
		var state = localStorage.getItem(resource);
		state = (state && state.length) ? JSON.parse(state) : {};
		return state;
	};

	var setLocal = function(resource,state) {
		localStorage.setItem(resource,JSON.stringify(state));
		return state;
	};

	var removeLocal = function(resource) {
		localStorage.removeItem(resource);
	};


	// ----------------------------------------
	// Remote Resource Operations

	var getRemoteAjax = function(resource,query,callback) {
		ajax.get(resource,query,callback);
	};

	var setRemoteAjax = function(keyname,resource,data,callback) {
		var body;
		if (data[keyname] && data[keyname].indexOf(_localKeyPrefix)===0) {
			body = JSON.parse(JSON.stringify(data));  //deep copy data object
			delete body[keyname];
		} else {
			body = data;
		}
		ajax.post(resource,body,callback);
	};

	// ----------------------------------------
	// Sort methods

	var descending = function(keyname,timestamp){
		return function(a,b){ return a && b && a[keyname] > b[keyname] ? -1 : 1; };
	};

	var ascending = function(keyname,timestamp){
		return function(a,b){ return a && b && a[keyname] < b[keyname] ? -1 : 1; };
	};

	var localkey = function() {
		var seq = localStorage.getItem(_localKeySequence) || 505;
		var key = _localKeyPrefix + (++seq);
		localStorage.setItem(_localKeySequence,seq);
		return key;
	};

	// ----------------------------------------
	// Connection state

	var online = function(){
		_online = true;
		queue.run();
	};
	
	var offline = function(){
		_online = false;
	};

	var queue = (function(){
		var calls = [];
		var add  = function(callback){
			calls.push(callback);
		};

		var run = function(){
			while (calls.length) calls.pop()();
		};

		return {
			add:add,
			run:run
		};
	})();

	// ----------------------------------------
	// Public API

	var createResource = function(options) {
		if (!options) throw "Missing Bifrost Options";

		options.name = options.name || options.resource;
		options.host = options.host || ("http://" + document.domain + "/");

		if (!options.name) throw "Missing Bifrost resource name";

		if (!options.key) throw "Missing Bifrost resource key";

		if (_stores[options.name]) return _stores[options.name];

		options.setRemote = setRemoteAjax;
		options.getRemote = getRemoteAjax;

		return new Store(options);
	};

	var createLocal = function(options) {
		if (!options) throw "Missing Bifrost Options";

		options.name = options.name||options.resource;

		if (!options.name) throw "Missing Bifrost strorage name";

		if (!options.key) throw "Missing Bifrost storage key";

		if (_stores[options.name]) return _stores[options.name];

		return new Store(options);

	};


	var createSocket = function(options) {
		//TODO: implement WebSocket as remote
	};


	return {
		trigger:trigger,
		on:on,
		off:off,
		online:online,
		offline:offline,
		get:ajax.get,
		post:ajax.post,
		put:ajax.put,
		del:ajax.del,
		head:ajax.head,
		exists:exists,
		buildquery:buildquery,
		createResource:createResource,
		createLocal:createLocal,
		createSocket:createSocket
	};

})(this);
