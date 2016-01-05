var express = require('express'),
	router = express.Router();

var db = require('../db');
var c = require('../appConfig');
var getPath = require('../util').getPath;
var Executor = require('../Executor');
var synchronize = require('../synchronizer').synchronize;

router.get('/:id', function(req, res) {
	var configs = db.get().collection('configs');
	configs.findOne({name: req.params.id}, function(err, obj) {		
		synchronize(obj, function(obj) {
			res.render('pages/configPage', {
				testInfoName: obj.name,
				fixtures: obj.data.fixtures,
				browsers: c.browsers
			});
		});
	});
});

router.post('/run/:id', function(req, res) {
	updateConfig(req.params.id, req.body, function(data) {
		var testList = buildTestList(data);
		runTests(testList, res);
	});
});

router.post('/save/:id', function(req, res) {
	updateConfig(req.params.id, req.body, function() {
		res.end('Saved');
	});
});

function updateConfig(configName, data, callback) {
	var configs = db.get().collection('configs');
	var newObj = {
		name: configName,
		data: data
	};
	configs.update(
		{name: configName},
		newObj,
		{upsert: true},
		function(err, results) {
			if(err) {
				console.log(err);
			}
			callback(data);
		}
	);
}

/*router.get('/saveas', function(req, res) {
	console.log(testInfo.getConfigList());
});*/

function buildTestList(obj) {
	var testList = [];
	obj.fixtures.forEach(fixture => {
		fixture.tests.filter(test => {
			return test.active === true;
		}).forEach(test => {
			test.browsers.forEach(browser => {
				testList.push(test.assembly + "(\\\"" + browser + "\\\")." + test.name);
			});
		});
	});
	return testList.join();
}

function runTests(testlist, res) {
	new Executor({
		program: getPath(c.nunitApp),
		args: {
			tests: "/test:" + testlist,
			assembly: getPath(c.testAssemblyPath)
		},
		anywayAction: function() {
			generateReport(res);
		}
	});
}

function generateReport(res) {
	new Executor({
		program: getPath(c.HTMLReportApp),
		args: {
			inputFile: "TestResult.xml",
			outputFile: "result.html"
		},
		successAction: function() {
			moveReportToView(res);
		},
		errorAction: function(err) {
			console.log(err);
			res.send(err);
		}
	});
}

function moveReportToView(res) {
	new Executor({
		program: "MOVE",
		args: {
			rewrite: "/Y",
			fileLocation: "result.html",
			moveTo: "./views/result.ejs"
		},
		successAction: function() {
			res.send("<a href='/lastresult'>Test Results</a>");
		}
	});
}

module.exports = router;