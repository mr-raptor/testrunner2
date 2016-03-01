var express = require('express'),
	router = express.Router();
var fs = require('fs');
var parseXml = require('xml2js').parseString;

var db = require('../db');
var c = require('../appConfig');
var util = require('../util');
var Executor = require('../Executor');
var synchronize = require('../synchronizer').synchronize;
var select = require('../selector');

var testRunning = false;
var testFailed = false;


router.get('/checkStatus', function(req, res) {
	if(testRunning) {
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

router.get('/run/:id', function(req, res) {
	var configs = db.get().collection('configs');
	configs.findOne({name: req.params.id}, function(err, obj) {		
		executeTests(obj.data, res);
	});
});

router.post('/run/:id', function(req, res) {
	updateConfig(req.params.id, req.body, function(data) {
		executeTests(data, res);
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

function executeTests(data, res) {
	if(!testRunning) {
		res.end("Started");
		
		testRunning = true;
		testFailed = false;
		
		prepareTempFiles();
		buildTestListFromDB(data, function(testList) {
			// run selected tests
			runTests(testList, c.testList, "FirstPhase", function(reportPath) {
				if(c.rerunFailedTests) {
					// rerun failed tests if setting enabled
					rerunFailedTests(reportPath);
				} else {
					checkFailedTests(reportPath, function() {
						testFailed = true;
					});
					generateReport();
				}
			});
		});
	} else {
		res.end("Tests already are running");
	}
}

function rerunFailedTests(sourceReport) {	
	checkFailedTests(sourceReport, function(tests) {
		buildTestListFromArray(tests, function(testList) {
			// generate test-list file and rerun tests				
			runTests(testList, c.testListError, "SecondPhase", function(secondReportPath) {
				// rerun same failed tests second time
				runTestList(c.testListError, "ThirdPhase", function(thirdReportPath) {
					// check results
					checkFailedTests(secondReportPath, function() {
						testFailed = true;
					}, checkFailedTests(thirdReportPath, function() {
						testFailed = true;
					}));
					generateReport();
				});
			});
		});
	}, function() {
		generateReport();
	});
}

function runTests(testList, testListPath, xmlReportName, callback) {
	createTestListFile(testList, testListPath, function() {
		runTestList(testListPath, xmlReportName, function(reportPath) {
			callback(reportPath);
		});
	});
}

function getFailedTests(sourceReport, callback) {
	fs.readFile(sourceReport, function(err, data) {
		parseXml(data, function(err, result) {
			var fixtures = [];
			select(result["test-run"], fixtures, "test-suite", function(obj) {
				return obj["test-case"];
			});
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

function checkFailedTests(sourceReport, existAction, nonExistAction) {
	// get test list from report
	getFailedTests(sourceReport, function(failedTests) {
		if(failedTests.length !== 0) {
			existAction(failedTests);
		} else {
			if(nonExistAction)
				nonExistAction();
		}
	});
}

function createTestListFile(testList, fileName, callback) {
	fs.writeFile(fileName, testList, function(err) {
		if(err)
			return console.log(err);
		
		callback();
	});
}

function buildTestListFromArray(array, callback) {
	callback(array.join('\n'));
}

function buildTestListFromDB(obj, callback) {
	var testList = [];
	obj.fixtures.forEach(fixture => {
		fixture.tests.filter(test => {
			return test.active === true;
		}).forEach(test => {
			test.browsers.forEach(browser => {
				testList.push(test.fullname); //fix browsers!!
			});
		});
	});
	callback(testList.join('\n'));
}

function runTestList(testList, name, callback) {
	var reportPath = "testResultsXml/" + name + ".xml";
	
	new Executor({
		program: util.getPath(c.nunitApp),
		args: {
			tests: "--testlist=" + testList,
			workers: "--workers=" + c.nodesCount,
			assembly: util.getPath(c.testAssemblyPath),
			output: "--result="+reportPath
		},
		anywayAction: function() {
			callback(reportPath);
		}
	});
}

function generateReport() {
	testRunning = false;
	new Executor({
		program: util.getPath(c.HTMLReportApp),
		args: {
			inputFolder: "testResultsXml",
			outputFolder: "views/testResults"
		},
		errorAction: function(err) {
			console.log(err);
		}
	});	
}

function cleanFolder(path) {
	new Executor({
		program: "del",
		args: {
			path: path,
			mode: "/Q"
		},
		errorAction: function(err) {
			console.log(err);
		}
	});
}

function cleanReportFolder() {
	cleanFolder("views\\testResults\\*");
}

function removeXmlReports() {
	cleanFolder("testResultsXml\\*");
}

function prepareTempFiles() {
	cleanReportFolder();
	removeXmlReports();
}

module.exports = router;