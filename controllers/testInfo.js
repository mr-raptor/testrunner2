var express = require('express'),
	router = express.Router();
var fs = require('fs');
var parseXml = require('xml2js').parseString;

var db = require('../db');
var c = require('../appConfig');
var util = require('../util');
var Executor = require('../Executor');
var synchronize = require('../synchronizer').synchronize;

var testRunned = false;
var testFailed = false;

router.get('/checkStatus', function(req, res) {
	if(testRunned) {
		res.end('Running');
	} else if (testFailed) {
		res.end('Failed');
	} else {
		res.end('Success');
	}
});

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

/*router.get('/run/:id', function(req, res) {
	var configs = db.get().collection('configs');
	configs.findOne({name: req.params.id}, function(err, obj) {		
		executeTests(obj.data, 1, function() {
			var failed = getFailedTests();
			executeTests(failed, 2);
			res.end("Started");
		});
	});
});*/

router.post('/run/:id', function(req, res) {
	updateConfig(req.params.id, req.body, function(data) {
		executeTests(data, 1, function() {
			
			res.end("Started");
		});
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

function executeTests(data, count, callback) {
	createTestListFile(data, buildTestListFromDB, function() {
		runTestList(count);
		if(callback) {
			callback();
		}
	});
}

function executeFailedTests(count) {
	getFailedTests(function(list) {
		console.log(list);
		createTestListFile(list, buildTestListFromArray, function() {
			runTestList(count);
		});
	});
}

function getFailedTests(callback) {
	fs.readFile("./TestResult.xml", function(err, data) {
		parseXml(data, function(err, result) {
			fixtures = result["test-run"]['test-suite'][0]['test-suite'][0]['test-suite'][0]['test-suite'][0]['test-suite'];
			var failedTests = [];
			fixtures.forEach(fixture => {
				failedTests = fixture['test-case'].filter(test => {
					return test.$.result === 'Failed';
				}).map(test => {
					return test.$.fullname;
				}).concat(failedTests);
			});
			callback(failedTests);
		});
	});
}

function createTestListFile(obj, buildTestList, callback) {
	var testList = buildTestList(obj);
	fs.writeFile(c.testListPath, testList, function(err) {
		if(err)
			return console.log(err);
		
		callback();
	});
}

function buildTestListFromArray(array) {
	return array.join('\n');
}

function buildTestListFromDB(obj) {
	var testList = [];
	obj.fixtures.forEach(fixture => {
		fixture.tests.filter(test => {
			return test.active === true;
		}).forEach(test => {
			test.browsers.forEach(browser => {
				testList.push(test.assembly + "(\"" + browser + "\")." + test.name);
			});
		});
	});
	return testList.join('\n');
}

function runTestList(count) {
	testRunned = true;
	testFailed = false;
	
	new Executor({
		program: util.getPath(c.nunitApp),
		args: {
			tests: "--testlist=" + c.testListPath,
			workers: "--workers=10",
			assembly: util.getPath(c.testAssemblyPath),
			output: "--result="+"TestResults/"+ count +".xml"
		},
		errorAction: function(err) {
			testFailed = true;
			console.log(err);
		},
		anywayAction: function() {
			testRunned = false;
			//generateReport();
			if(count === 1) {
				executeFailedTests(2);
			}
		}
	});
}

function generateReport() {
	new Executor({
		program: util.getPath(c.HTMLReportApp),
		args: {
			inputFile: "TestResult.xml",
			outputFile: "result.html"
		},
		successAction: function() {
			moveReportToView();
		},
		errorAction: function(err) {
			console.log(err);
		}
	});
}

function moveReportToView() {
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
					console.log("Done!");
				});
			});
		}
	});
}

module.exports = router;