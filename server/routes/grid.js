var express = require('express'),
	router = express.Router();

var c = require('../appConfig.json');
var gridManager = require('../gridManager');

router.get('/grid/nodes', function(req, res) {
	Promise.all(c.gridNodes.map(gridManager.getNodeStatus).map(reflect))
		.then(results => {
			res.json(results.filter(x => x.status === "resolved").map(item => item.v));
			console.log(results.filter(x => x.status === "rejected").map(item => item.e));
		});
});

router.get('/grid/:node/start', function(req, res) {
	gridManager.startNode(req.params.node, (status) => {
		res.json(status);
	});
});

router.get('/grid/:node/stop', function(req, res) {
	gridManager.stopNode(req.params.node, (status) => {
		res.json(status);
	});
});

router.get('/grid/node/status', function(req, res) {
	console.log(gridManager.getNodeStatus("local"));
	res.end();
});

router.get('/grid/restart', function(req, res) {
	gridManager.restartHub((status) => {
		res.json(status);
	});
});

function reflect(promise){
    return promise.then(function(v){ return {v:v, status: "resolved" }},
        				function(e){ return {e:e, status: "rejected" }});
}

module.exports = router;