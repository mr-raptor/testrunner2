var exec = require('child_process').exec;

var MAX_BUFFER_SIZE = 1024 * 1024 * 100; // 100MB

function Executor(options) {
	var self = this;
	self.program = options.program;
	self.args = options.args;	
	
	self.successAction = 
		(typeof options.successAction === 'function') ? options.successAction : function(data) { console.log(data); };
	self.errorAction = 
		(typeof options.errorAction === 'function') ? options.errorAction : function(err) {};
	self.anywayAction = 
		(typeof options.anywayAction === 'function') ? options.anywayAction : function() {};

	self.execute = function() {
		var argsString = "";
		for(var o in self.args) {
			argsString += self.args[o] + ' ';
		}
		var command = self.program + ' ' + argsString;
		console.log("Execution => " + command);
		exec(command, {maxBuffer: MAX_BUFFER_SIZE}, function(err,  data) {
			if(err != null) {
				console.log("ERROR! ".red + err);
				self.errorAction(err);
			} else {
				self.successAction(data);
			}
			self.anywayAction();
		});
	}
	self.execute();
}

function PSExecutor(options) {
	options.program = "powershell.exe"
	new Executor(options);
}

module.exports = Executor;
module.exports.PSExecutor = PSExecutor;