var c = require('./appConfig.json');
var PSExecutor = require('./Executor').PSExecutor;

var statusCode = {
	1: "Stopped",
	4: "Running"
};

function getNodeStatus(machine) {
	return new Promise((resolve, reject) => {
		new PSExecutor({
			args: { path: c.wsStatusScript, machine: machine },
			successAction: function(data) {
				if(data) {
					var result = JSON.parse(data);
					resolve({
						name: machine,
						status: statusCode[result["Status"]]
					});
				} else {
					reject(machine+"=> Status Checking failed!");
				}
			}
		});
	});
}

function startNode(machine, callback) {
	new PSExecutor({
		args: { path: c.wsStartScript, machine: machine },
		successAction: function() {
			getNodeStatus(machine)
				.then(callback);
		}
	});
}

function stopNode(machine, callback) {
	new PSExecutor({
		args: { path: c.wsStopScript, machine: machine },
		successAction: function() {
			getNodeStatus(machine)
				.then(callback);
		}
	});
}

function restartHub() {
	new PSExecutor({
		args: { path: c.wsStopScript, machine: machine },
		successAction: function() {
			callback("done");
		}
	});
}

module.exports = {
	getNodeStatus: getNodeStatus,
	startNode: startNode,
	stopNode: stopNode,
	restartHub: restartHub
};