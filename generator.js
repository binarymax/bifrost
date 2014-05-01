// Generates a client library based on Heimdall API data

var fs = require('fs');
var _ = require('underscore');


_.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };

var templates = [];
var template = function(filename) {

};
var load = function(path) {
	path = path||__dirname+'/templates/';

	var revar = /(\w+)\.(\w+)$/i;
	var files = fs.readdirSync(path);
	var file, name;
	for (var i=0,l=files.length;i<l;i++) {
		file = files[i];
		if (revar.test(file)) {
			console.log('Bifrost found template file',file);	
			name = file.substr(0,file.indexOf("."));
			template(path+name);
		}
	}

};


//----------------------
var generate = function(api,type) {

};

load();

module.exports = generate;
