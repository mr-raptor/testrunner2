var state = {
	message: "Ready to start",
	isTestRun: false
};

function get() {
	return state;
}

function run() {
	state.message = "Running";
	state.isTestRun = true;
}

function end(msg) {
	if(msg)
		state.message = msg;
	if(state.message !== "Failed")
		state.message = "Success";
	
	state.isTestRun = false;
}

function change(msg) {
	state.message = msg;
}

exports.get = get;
exports.run = run;
exports.end = end;
exports.change = change;