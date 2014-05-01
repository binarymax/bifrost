//Gets Heimdall API data from a server

var url = require('url');

var protocol;

var Client = module.exports = {};

Client.get = function(uri,callback) {

	uri = url.parse(uri);

	protocol = require(uri.protocol.substr(0,uri.protocol.length-1));

	protocol.get(uri,function(res){

		var data = "";

	    res.on('data', function(chunk) { data+=chunk; });

	    res.on('end', function() {
	    	var json = null;
	    	try {
	    		json = JSON.parse(data);
	    	} catch(ex) {
	    		callback(ex);
	    	}
	    	if (json) callback(null,json);
	    });

	}).on('error',callback);

}