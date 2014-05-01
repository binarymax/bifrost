// Bifrost moderator

var Bifrost = module.exports = {};

var _ = require('underscore');
var generator = require('./generator');
var client = require('./client');

var generate = function(api) {
	return generator(Bifrost.type,api);
};

var create = Bifrost.create = function(url,type,callback) {
	Object.defineProperty(Bifrost,"type",{get:function(){return type;}});
	client.get(url,_.compose(generate,callback),callback);
};