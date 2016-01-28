var express = require('express'),
	router = express.Router();
var fs = require('fs');

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
	if(data) {			
		var newObj = {
			name: configName,
			data: data
		};
		configs.update(
			{name: configName},
			newObj,
			{upsert: true},
			function(err, results) {
				if(err) 
					return console.log(err);
				callback(newObj.data);
			}
		);
	} else {
		configs.findOne({name: configName}, function(err, obj) {
			if(err)
				return console.log(err);
			
			callback(obj);
		});
	}
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
			fs.readFile("./views/result.ejs", 'utf8', function(err,data) {
				if(err) {
					return console.log(err);
				}
				var regex = new RegExp(c.reportFilesFolder.replace(/\\/g,'\\\\'), 'gi');
				data = data.replace(regex, "/getFile?name=");
				fs.writeFile("./views/result.ejs", data, function(err) {
					if(err) {
						return console.log(err);
					}
					res.send("<a href='/lastresult'>Test Results</a>");
				});
			});
		}
	});
}

module.exports = router;
