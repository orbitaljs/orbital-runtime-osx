var jvm = require('bindings')('jvm');
var rpc = require('./rpc');
var path = require('path');

var initialized = false;

function initialize(options) {
	if (initialized)
		throw Error("Already initialized");

	if (!options)
		throw Error("'options' parameter is required");

	if (!options.main)
		throw Error("'options.main' parameter is required");

	initialized = true;

	var jvmPath = path.join(module.filename, "../../../../Java/lib/server/libjvm.dylib");
	console.log(jvmPath);
	jvm.load(jvmPath);
	jvm.init("-verbose:class", "-Djava.class.path=/tmp/runtime-osx/orbital-java/target/orbital-app-0.1.jar");
	jvm.run(options.main);

	rpc.start();
}

module.exports = {
	init: function(options) {
		initialize(options);
	},

	registerEndpoint: function(endpoint, handler) {
		rpc.registerEndpoint(endpoint, handler);
	}
};
