var express = require('express'),
	router = express.Router();

var db = require('../db');
var sync = require('../synchronizer');
var runner = require('../runner');

router.get('/configs', function(req, res) {
	var configs = db.get().collection('configs');
	
	configs.find().toArray(function(err, docs) {
		res.json(docs.map(config => { 
			return { name: config.name }
		}).sort());
	});
});


router.get('/config/run/:name', function(req, res) {
	var configs = db.get().collection('configs');
	configs.findOne({name: req.params.name}, function(err, obj) {		
		runner.executeTests(JSON.parse(obj.data), req.params.name, res);
	});
});

router.post('/config/run/:name', function(req, res) {
	updateConfig(req.params.name, req.body.data, function(data) {
		runner.executeTests(data, req.params.name, res);
	});
});

router.get('/config/:name', function(req, res) {
	var configs = db.get().collection('configs');
	configs.findOne({name: req.params.name}, function(err, obj) {
		if(obj !== null) {
			sync.synchronize(obj, function(obj) {
				//obj.data = JSON.parse(obj.data);
				res.json(obj);
			});
		} else {
			return res.status(500).end('Config not found!');
		}
	});
});

router.post('/config/:name', function(req, res) {
	updateConfig(req.params.name, req.body.data, function() {
		res.end('Saved');
	});
});

router.post('/config', function(req, res) {
	var configName = req.body.name || "";
	if(configName === "")
		return res.status(500).end('Please, enter config name!');
	
	if(!/^[a-z0-9-_.]+$/ig.test(configName))
		return res.status(500).end('Please, use only alphanumeric, ".", "-", and "_" symbols');
	
	var configs = db.get().collection('configs');
	configs.count({name: configName}, function(err, count) {
		if(err)
			return console.log(err);
		
		if(count !== 0)
			return res.status(500).end('Config with this name already exists!');

		configs.insert({
			name: configName
		});
		configs.find().toArray(function(err, docs) {
			res.json(docs.map(config => { 
				return { name: config.name }
			}).sort());
		});
	});
});

router.delete('/config/:name', function(req, res) {
	var confToDelete = req.params.name;
	var configs = db.get().collection('configs');
	configs.remove({name: confToDelete}, function() {
		configs.find().toArray(function(err, docs) {
			res.json(docs.map(config => { 
				return { name: config.name }
			}).sort());
		});
	});
});

function updateConfig(configName, data, callback) {
	var configs = db.get().collection('configs');
	if(data) {			
		var newObj = {
			name: configName,
			data: JSON.stringify(data)
		};
		configs.update(
			{name: configName},
			newObj,
			{upsert: true},
			function(err, results) {
				if(err) 
					return console.log(err);
				callback(data);
			}
		);
	} else {
		configs.findOne({name: configName}, function(err, obj) {
			if(err)
				return console.log(err);
			
			callback(JSON.parse(obj));
		});
	}
}

module.exports = router;