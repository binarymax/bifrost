//Module dependencies
var command = require('commander');
var bifrost = require('./index');
var fs = require('fs');

//Read in the package.json file:
var package = JSON.parse(fs.readFileSync(__dirname + "/package.json"));

command
	.version(package.version)
	.option('-u, --url <url>','URL of the Heimdall API specification')
	.option('-t, --type <type>','Type of the client to generate')
	.option('-f, --out [file]','The output file. If missing, prints to stdout')
	.parse(process.argv);

if (!command.url || !command.type) command.help();

// --------------------------------------------------------------------------
bifrost.create(command.url,command.type,function(err,api) {

	if (err) {
		console.error(err);
	} else if (command.file) {
		fs.writeFileSync(command.file,api,'utf8');
	} else {
		console.log(JSON.stringify(api));
	}

	process.exit();

});