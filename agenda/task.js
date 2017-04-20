var Agenda = require('agenda');
var fs = require('fs');

var c = require('../server/appConfig');

var agenda = new Agenda({db: {address: 'mongodb://localhost:27017/agenda'}});

agenda.define('show msg', function(job, done) {
	console.log('Im here ' + i++);
	done();
});

agenda.define('greet the world', function(job, done) {
	console.log(job.attrs.data.time, 'hello world!');
	if (c) console.log(c.testAssemblyFolder);
	/*fs.readdirSync(c.testAssemblyFolder, (err, files) => {
		console.dir(files);
	});*/
	console.log("Done!");
	done();
});


agenda.on('ready', function() {
	//agenda.every('10 seconds', 'show msg');
	agenda.every('1 seconds', 'greet the world', {time: new Date()});
	agenda.start();
});

agenda.on('error', function() {
	console.error('error!');
});

console.log('Start');