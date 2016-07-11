var express = require('express'),
	router = express.Router();

var db = require('../db');

router.get('/', function(req, res) {
	// need to avoid this boilerplate
	var configs = db.get().collection('configs');
	
	configs.find().toArray(function(err, docs) {
		res.render('pages/configSelector', {
			configs: docs.map(doc => doc.name).sort()
		});
	});
});

// Add new
router.post('/config', function(req, res) {
	var newConfig = req.body.configName || "";
	if(newConfig === "")
		return res.status(500).end('Please, enter config name!');
	
	if(!/^[a-z0-9-_]+$/ig.test(newConfig))
		return res.status(500).end('Please, use only alphanumeric, "-" and "_" symbols');
	
	var configs = db.get().collection('configs');
	configs.count({name: newConfig}, function(err, count) {
		if(err)
			return console.log(err);
		
		if(count !== 0)
			return res.status(500).end('Config with this name already exists!');

		configs.insert({
			name: newConfig
		});
		configs.find().toArray(function(err, docs) {
			return res.json(docs.map(config => config.name).sort());
		});
	});
});

router.get('/deleteConfig/:id', function(req, res) {
	var confToDelete = req.params.id;
	var configs = db.get().collection('configs');
	configs.remove({name: confToDelete}, function() {
		res.redirect('/');
	});
});

module.exports = router;