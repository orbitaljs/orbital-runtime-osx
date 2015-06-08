var jvm = require('bindings')('jvm');

console.log('get ready');

jvm.load("/tmp/runtime-osx/_tmp/Electron.app/Contents/Java/lib/server/libjvm.dylib");
console.log('loaded');
jvm.init("-esa");
console.log('inited');
jvm.run("com.foo");
console.log('done');
