var express = require('express'),
	router = express.Router();
var db = require('../db');

router.get('/results', function(req, res) {
	var results = db.get().collection("results");
	results.find().sort({time: -1}).toArray(function(err, docs) {
		res.json(docs);
	});
});

module.exports = router;