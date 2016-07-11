var express = require('express'),
	router = express.Router(),
	fs = require('fs');
	
var db = require('../db'),
	c = require('../appConfig');
	

router.get('/page/:id/:page', function(req, res) {
	res.render('testResults/'+req.params.id+'/html/'+req.params.page, {}, function(err,html) {
		if(err)
			return res.render('pages/404');
		return res.send(html);
	});
});

router.get('/page/:id', function(req, res) {
	res.redirect('/results/page/'+req.params.id+'/FirstPhase');
});

/*router.get('/last', function(req, res) {
	var results = db.get().collection("results");
	results.find().sort({time:-1}).limit(1).explain(function(err, doc) {
		if(err)
			return console.log(err);
		console.dir(doc);
		res.redirect('/results/page/'+doc.folder+'/FirstPhase');
	});
});*/

router.get('/', function(req, res) {
	var results = db.get().collection("results");
	results.find().sort({time: -1}).toArray(function(err, docs) {
		res.render('pages/resultsPage', {
			results: docs
		});
	});
});

module.exports = router;