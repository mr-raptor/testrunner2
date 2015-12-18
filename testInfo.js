var jsonfile	= require('jsonfile');

var config		= require('./config.json');
var Executor 	= require('./Executor');

var testInfo = {
	readFile : function(callback) {
		jsonfile.readFile(config.testInfoFile, function(err, obj) {
			if(err != null) {
				console.log(err);
			} else {
				callback(obj);
			}
		});
	},
	sync : function() {
		jsonfile.readFile(config.parsedDLLFile, function(err, obj) {
			if(err != null) {
				console.log(err);
			} else {
				obj.fixtures.forEach(fixture => {
					fixture.tests.forEach(test => { 
						test.active = false;
						test.browsers = [];
					});		
				});
				jsonfile.writeFile(config.testInfoFile, obj, function(err) {
					console.error(err);
				});
			}
		});
	},
	update : function(obj) {
		jsonfile.writeFile(config.testInfoFile, obj, function(err) {
			console.error(err);
		});
	}
}

module.exports = testInfo;