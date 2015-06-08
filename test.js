var ffi = require('ffi');

var javaRoot = require('module').globalPaths[0] + '/../../Java';
var libjli = javaRoot + '/lib/jli/libjli';

var jli = ffi.Library(libjli, { JLI_Launch: [ 'int', [
	'int', 'char**',
	'int', 'char**',
	'int', 'char**',
	'string',
	'string',
	'string',
	'string',
	'int',
	'int',
	'int',
	'int'
] ] });

jli.JLI_Launch(1, ['java'], 0, null, 0, null, "", "", "java", "java", 0, 0, 0, 0);
