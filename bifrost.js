#!/usr/bin/env node

/****************************************************************************
*
* Bifrost - a client generator for Heimdall APIs 
* (c)Copyright 2014, Max Iwin
* MIT License
*
****************************************************************************/

(require.main === module)
	? require('./command') 					// <-- run from the command line
	: module.exports = require('./index');	// <-- required as a node module