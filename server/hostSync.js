var fs = require('fs');

var c = require('./appConfig.json');
var Executor = require('./Executor');
var util = require('./util');

function synchronize(hostfile, callback) {
	if(hostfile && hostfile.isActive) {
		fs.writeFile(c.hostTemplate, hostfile.template, function(err) {
			new Executor({
				program: util.getPath(c.hostSyncScript),
				successAction: function() {
					callback();
				}
			});		
		});
	} else {
		callback();
	}
}

module.exports.synchronize = synchronize;