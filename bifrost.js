var Bifrost = (function(global){
	"use strict";

	var _online = true;

	var _listeners = {};

	var _stores = {};

	var _localKeySequence  = '_bifrost_sequence';
	var _localKeyPrefix    = '_bifrost_';

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

	var off = function(type) {
		// >=IE9
		global.removeEventListener(type, callback||_listeners[type], false);
		if(!callback) delete events[type];
	};


	// ----------------------------------------
	// Ajax

	var ajax = (function(){
		function request(type) {
			return function(url, data, callback) {
				var xhr = new XMLHttpRequest()
				var body = null;

				if (typeof data === 'function') {
					callback = data;
					data = null;
				}

				xhr.onload = function () {
					callback.call(xhr, null, JSON.parse(xhr.response));
				};

				xhr.onerror = function () {
					callback.call(xhr, true);
				};

				if (type === 'GET' && data) {
					var qs = "";
					var ch = url.indexOf('?')<0?'?':'&';
					for(var key in data) {
						if(data.hasOwnProperty(key)) {
							qs = qs + ch + key + '=' + data[key];
							ch = '&';
						}
					}
					url = url + qs;
				}

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
			put:request('PUT')	
		}
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
				on(store.localevent,function(e,d){
					self.state.items = store.state;
					self.setState(self.state);
				});
				store.collection();
			},
			componentWillUnmount:function(){
				off(store.localevent);
			}
		}
	};

	// ----------------------------------------
	// Main Object

	var Store = function(options) {
		var self = this;
		self._host = options.host;
		self._keyname = options.key;
		self._timestamp = options.timestamp;
		self._resource = options.resource;
		self._url = options.host+options.resource+"/";
		self.localevent = "local" + options.resource;
		self.remoteevent = "remote" + options.resource;
		self.state = [];
	};

	Store.prototype.add = function(item) {
		var self  = this;
		var keyname = self._keyname;
		var key = item[keyname] || localkey();
		item[keyname] = key;
		self.state.push(item);
		setLocal(self._resource,self.state);
		var remote = function(){
			setRemote(key,self._url,item,function(err,res){
				//Rectify remote key with temporary local key:
				var keysync = false;
				if(res[keyname]) for(var i=0;i<self.state.length;i++) {
					if(self.state[i][keyname] === key) {
						self.state[i][keyname] = res[keyname];
						keysync = true;
					}
				}
				if(keysync) trigger(self.localevent,self.state);
				trigger(self.remoteevent,self.res);
			});
		};
		if (_online) {
			remote();
		} else {
			queue.add(remote);
		}
		trigger(self.localevent,self.state);
	};

	Store.prototype.save = function(item) {
		var self = this;
		var id = item[self._keyname];
		
		if(!id) { add(item); return; }
		for(var i=0;i<self.state.length;i++) {
			var stateitem = self.state[i];
			if (stateitem[self._keyname]===id) self.state[i] = item;
		}

		setLocal(self._resource,self.state);

		var remote = function(){
			setRemote(self._keyname,self._url+id,item,function(err,res){
				trigger(self.remoteevent,self.res);
			});
		};

		if (_online) {
			remote();
		} else {
			queue.add(remote);
		}

		trigger(self.localevent,self.state);
	};

	Store.prototype.collection = function(query) {
		var self = this;
		query = query || {};
		var remote = function(){
			getRemote(self._url,query,function(err,res){

				if (err) {
					trigger("error"+self._resource,err);

				} else {
					var items = res.d.results;
					var keyname = self._keyname;
					var timestamp = self._timestamp;
					self.state = self.state.concat(items);
					self.state.sort(descending(keyname,timestamp));
					setLocal(self._resource,self.state);
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
	};

	Store.prototype.reactMixin = function(){
		return reactMixin(this);
	};

	Store.prototype.reset = function(){
		setLocal(this._resource,[]);
	};

	Store.prototype.bind = function(callback){
		var self = this;
		on(self.localevent,callback);
	};

	Store.prototype.unbind = function(callback){
		var self = this;
		off(self.localevent,callback);
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

	// ----------------------------------------
	// Remote Resource Operations

	var getRemote = function(resource,query,callback) {
		ajax.get(resource,query,callback);
	};

	var setRemote = function(keyname,resource,data,callback) {
		var body;
		if (data[keyname] && data[keyname].indexOf(_localKeyPrefix)===0) {
			body = JSON.parse(JSON.stringify(body));  //deep copy data object
			delete body[keyname];
		} else {
			body = data;
		}
		ajax.post(resource,body,callback);
	};

	// ----------------------------------------
	// Sort methods

	var descending = function(keyname,timestamp){
		return function(a,b){ return a[keyname] > b[keyname] ? -1 : 1; };
	};

	var ascending = function(keyname,timestamp){
		return function(a,b){ return a[keyname] < b[keyname] ? -1 : 1; };
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
	}

	var offline = function(){
		_online = false;
	}

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

		options.resource = options.name||options.resource;
		options.host = options.host || ("http://" + document.domain + "/");
		
		if (!options.resource) throw "Missing Bifrost resource name";

		if (!options.key) throw "Missing Bifrost resource key";

		if (!options.timestamp) throw "Missing Bifrost resource timestamp";
		
		if (_stores[options.resource]) return _stores[options.resource];

		return new Store(options);
	};

	var createLocal = function(options) {
		//TODO: implement localStorage only
	};


	var createSocket = function(options) {
		//TODO: implement WebSocket as remote
	};

	var createRTC = function(options) {
		//TODO: implement WebRTC as remote
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
		createResource:createResource,
		createLocal:createLocal,
		createSocket:createSocket,
		createRTC:createRTC,
	};

})(this);