var express = require('express'),
	router = express.Router();

var status = require('../status');

router.get('/checkStatus', function(req, res) {
	var statusState = status.get();
	if(statusState.isTestRun) {
		res.end('Running');
	} else {
		res.end(statusState.message);
	}
});

module.exports = router;