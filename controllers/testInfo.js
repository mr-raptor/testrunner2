var express = require('express'),
	router = express.Router();

var c = require('../appConfig');
var getPath = require('../util').getPath;
var Executor = require('../Executor');
var testInfo = require('../testInfo.js');
var db = require('../db');

router.get('/:id', function(req, res) {
	var configs = db.get().collection('configs');
	configs.findOne({name: req.params.id}, function(err, obj) {		
		testInfo.sync(obj, function(obj) {
			res.render('pages/configPage', {
				fixtures: obj.data.fixtures,
				browsers: c.browsers
			});
		});
	});
});

router.get('/runconfig', function(req, res) {
	testInfo.readFile(function(obj) {
		var testList = buildTestList(obj);
		runTests(testList, res);
	});
});

router.post('/run', function(req, res) {
	testInfo.update(req.body);
	res.redirect('/runconfig');
});

router.post('/save', function(req, res) {
	testInfo.update(req.body);
	res.end('Saved');
});

router.get('/saveas', function(req, res) {
	console.log(testInfo.getConfigList());
});

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