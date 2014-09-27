var Bifrost = (function(global){

	var _online_ = true;

	// ----------------------------------------
	// Events

	var listeners = {};

	var trigger = function(type,data) {
		// >=IE9		
		var event = document.createEvent('HTMLEvents');
		event.initEvent(type, true, true);
		event.eventName = type;
		event.target = global;
		event.data = data || {};
		global.dispatchEvent(event);
	};

	var on = function(type,callback) {
		// >=IE9
		listeners[type] = callback;
		global.addEventListener(type, callback, false);
	};

	var off = function(type) {
		// >=IE9
		global.removeEventListener(type, callback||listeners[type], false);
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

	var Store = function(host,resource,keyname,timestamp) {

		var self = this;
		self._host = host;
		self._keyname = keyname;
		self._timestamp = timestamp;
		self._resource = resource;
		self._url = host+resource+"/";
		self.localevent = "local" + resource;
		self.remoteevent = "remote" + resource;
		self.state = [];
	};

	Store.prototype.add = function(item) {
		var self = this;
		self.state.push(item);
		setLocal(self._resource,self.state);
		var remote = function(){
			setRemote(self._keyname,self._url,item,function(err,res){
				trigger(self.remoteevent,self.res);
			});
		};
		if (_online_) {
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

		if (_online_) {
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

		if (_online_) {
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
		if (data[keyname]===-1) delete data[keyname];
		ajax.post(resource,data,callback);
	};

	// ----------------------------------------
	// Sort method shortcuts

	var descending = function(keyname,timestamp){
		return function(a,b){ return a[keyname] > b[keyname] ? -1 : 1; };
	};

	var ascending = function(keyname,timestamp){
		return function(a,b){ return a[keyname] < b[keyname] ? -1 : 1; };
	};

	// ----------------------------------------
	// Connection state

	var online = function(){
		_online_ = true;
		queue.run();	
	}

	var offline = function(){
		_online_ = false;
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

	var create = function(host,resource,keyname,timestamp) {
		return new Store(host,resource,keyname,timestamp);
	};

	return {
		trigger:trigger,
		on:on,
		off:off,
		online:online,
		offline:offline,
		create:create
	};

})(window);