var exec = require('child_process').exec;
var colors = require('colors');

function Executor(options) {
	var self = this;
	self.program = options.program;
	self.args = options.args;	
	
	self.successAction = 
		(typeof options.successAction === 'function') ? options.successAction : function(data) { console.log(data); };
	self.errorAction = 
		(typeof options.errorAction === 'function') ? options.errorAction : function(err) { console.log("ERROR! ".red + err); };
	self.anywayAction = 
		(typeof options.anywayAction === 'function') ? options.anywayAction : function() {};

	self.execute = function() {
		var argsString = "";
		for(var o in self.args) {
			argsString += self.args[o] + ' ';
		}
		var command = self.program + ' ' + argsString;
		console.log("Execution => " + command);
		exec(command, function(err, data) {
			if(err != null) {
				self.errorAction(err);
			} else {
				self.successAction(data);
			}
			self.anywayAction();
		});
	}
	self.execute();
}

module.exports = Executor;