Bifrost
=======

Client library generator for Heimdall APIs

<img src="https://raw.githubusercontent.com/binarymax/bifrost/master/underconstruction.gif"> 

_Currently under construction_


## Command Line 

### Installation 

```
npm install -g bifrost
```

### Usage

Executing bifrost will generate the source code client library that consumes a Heimdall API.  All that is needed is the url of the API documentation, and the type of library to generate. 

```
bifrost [options]

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -u, --url <url>    URL of the Heimdall API specification
    -t, --type <type>  Type of the client to generate
    -f, --out [file]   The output file. If missing, prints to stdout

``` 

### Example

Executing the following command...
```
bifrost -u http://example.com/api -t javascript -f todoclient.js
```
...will generate the file ```todoclient.js```, that can be used as an AJAX library to work with the API at http://example.com/


## Module

### Installation
```
npm install bifrost
```

### Usage
```
var bifrost = require('bifrost');
var fs = require('fs');

bifrost.create('http://example.com/api','javascript',function(code){
	fs.writeFileSync(code,'todoclient.js','utf8');
});
```

