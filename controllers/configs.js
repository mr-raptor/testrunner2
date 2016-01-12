var express = require('express'),
	router = express.Router();

var db = require('../db');

router.get('/', function(req, res) {
	// need to avoid this boilerplate
	var configs = db.get().collection('configs');
	
	configs.find().toArray(function(err, docs) {
		var configNames = docs.map(doc => doc.name);
		res.render('pages/configSelector', {
			configs: configNames
		});
	});
});

// Add new
router.post('/config', function(req, res) {
	var newConfig = req.body.configName || "";
	if(newConfig !== "") {
		var configs = db.get().collection('configs');
		configs.count({name: newConfig}, function(err, count) {
			if(err) {
				console.log(err);
				return;
			}
			if(count === 0) {
				configs.insert({
					name: newConfig
				});
			}
		});
	}
	res.redirect('/');
});

router.get('/deleteConfig/:id', function(req, res) {
	var confToDelete = req.params.id;
	var configs = db.get().collection('configs');
	configs.remove({name: confToDelete}, function() {
		res.redirect('/');
	});
});

module.exports = router;