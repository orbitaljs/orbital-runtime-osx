var jvm = require('bindings')('jvm');
var rpc = require('./rpc');
var path = require('path');
var process = require('process');
var app = require('app');

var initialized = false;

function initialize(options) {
	if (initialized)
		throw Error("Already initialized");

	if (!options)
		throw Error("'options' parameter is required");

	if (!options.main)
		throw Error("'options.main' parameter is required");

	initialized = true;

	// If we've been passed the PIPE environment variable, that means we're in inverted mode
	if (!process.env.PIPE) {
		console.log("Initializing JVM");
		try {
			var jvmPath = path.join(module.filename, "../../../../Java/lib/server/libjvm.dylib");
			console.log(jvmPath);
			jvm.load(jvmPath);
			jvm.init("-verbose:class", "-Djava.class.path=/tmp/runtime-osx/orbital-java/target/orbital-app-0.1.jar");
			jvm.run(options.main);
		} catch (e) {
			console.log("Failed to initialize the JVM", e);
			throw e;
		}
	}

	// Start RPC
	try {
		rpc.start();
	} catch (e) {
		console.log("Failed to initialize RPC", e);
		throw e;
	}

	// Set up protocol handler
	app.on('ready', function() {
		var rootWebPath = process.env.WEB_PATH 
			? process.env.WEB_PATH 
			: path.join(module.filename, "../../../../Resources/web");
		console.log("Web path root: ", rootWebPath);

		var protocol = require('protocol');
		protocol.registerProtocol('app', function(request) {
			var url = request.url.slice(4);
			if (url.slice(-1) == '/')
				url += "index.html";
			if (url.indexOf('#') != -1)
				url = url.slice(0, url.indexOf('#'));
			var file = path.normalize(rootWebPath + '/' + url);
			console.log(file);
			return new protocol.RequestFileJob(file);
		});
	}); 
}

module.exports = {
	init: function(options) {
		initialize(options);
	},

	registerEndpoint: function(endpoint, handler) {
		rpc.registerEndpoint(endpoint, handler);
	}
};
