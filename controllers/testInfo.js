var express = require('express'),
	router = express.Router();
var fs = require('fs');
var xml2js = require('xml2js');


var db = require('../db');
var c = require('../appConfig');
var util = require('../util');
var Executor = require('../Executor');
var synchronize = require('../synchronizer').synchronize;
var select = require('../selector').select;
var browseTree = require('../selector').browseTree;

var testRunning = false;
var testFailed = false;


router.get('/report', function(req, res) {
	generateReport();
	res.end();
});

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
		if(obj != null) {
			synchronize(obj, function(obj) {
				res.render('pages/configPage', {
					testTree: obj.data.testTree,
					testInfoName: obj.name,
					substituteSettingsEnabled: c.substituteSettingsEnabled,
					settings: obj.data.settings || {}
				});
			});
		} else {
			res.redirect('/');
		}
	});
});

router.get('/run/:id', function(req, res) {
	var configs = db.get().collection('configs');
	configs.findOne({name: req.params.id}, function(err, obj) {		
		executeTests(JSON.parse(obj.data), res);
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

function executeTests(data, res) {
	if(testRunning)
		return res.end("Tests already are running");
	
	res.end("Started");
	
	testRunning = true;
	testFailed = false;
	
	substituteSettings(data, function() {
		prepareReportFolders(function(reportFolder) {
			buildTestListFromDB(data, function(testList) {
				// run selected tests
				runTests(testList, c.testList, "FirstPhase", reportFolder, function(reportPath) {
					if(c.rerunFailedTests) {
						// rerun failed tests if setting enabled
						rerunFailedTests(reportFolder, reportPath);
					} else {
						checkFailedTests(reportPath, function() {
							testFailed = true;
						});
						generateReport(reportFolder);
					}
				});
			});
		});
	});
}

function rerunFailedTests(reportFolder, sourceReport) {	
	checkFailedTests(sourceReport, function(tests) {
		buildTestListFromArray(tests, function(testList) {
			// generate test-list file and rerun tests				
			runTests(testList, c.testListError, "SecondPhase", reportFolder, function(secondReportPath) {
				// rerun same failed tests second time
				runTestList(c.testListError, "ThirdPhase", reportFolder, function(thirdReportPath) {
					var reports = [sourceReport, secondReportPath, thirdReportPath];
					
					// check results					
					getFailedTestsWithTimeouts(tests, reports, function(testData) {
						tests.forEach(currTest => {
							if(isFailedTest(testData, currTest, reports)) {
								testFailed = true;
							}
						});
					});
					
					generateReport(reportFolder);
				});
			});
		});
	}, function() {
		generateReport(reportFolder);
	});
}

function isFailedTest(testData, testName, reports) {
	var testResults = [];
	reports.forEach(report => {
		testResults = testData[report].filter(test => {
			return test.$.fullname === testName;
		}).concat(testResults);
	});
	return !isFailedByTimeout(testResults[2]) && testResults.some(item => item.failure);
}

function isFailedByTimeout(testResult) {
	return testResult.failure && Boolean(String(testResult.failure[0].message).match(/(OpenQA.Selenium.WebDriverTimeoutException|OpenQA.Selenium.ElementNotVisibleException)/i));
}


function runTests(testList, testListPath, xmlReportName, reportFolder, callback) {
	createTestListFile(testList, testListPath, function() {
		runTestList(testListPath, xmlReportName, reportFolder, function(reportPath) {
			callback(reportPath);
		});
	});
}

function checkFailedTests(sourceReport, existAction, nonExistAction) {
	// get test list from report
	from(sourceReport, function(xmlData) {
		whereAllTestsAreFailed(xmlData, function(failedTests) {
			if(failedTests.length !== 0) {
				existAction(failedTests);
			} else {
				if(nonExistAction)
					nonExistAction();
			}
		});
	});
}

function getFailedTestsWithTimeouts(failedTestList, reportPaths, callback) {
	var testData = [];
	var i = 0;
	reportPaths.forEach(report => {
		from(report, function(tests) {
			i++;			
			failedTestList.forEach((testName) => {
				getTestByName(tests, testName, function(testInfo) {
					if (!testData[report])
						testData[report] = [];
					testData[report].push(testInfo);			
				});
			});
			if (i === reportPaths.length)
				callback(testData);				
		});
	});
}

function from(sourceReport, callback) {
	fs.readFile(sourceReport, function(err, data) {
		xml2js.parseString(data, function(err, xml) {
			if(err)
				return console.log(err);
			callback(xml);
		});
	});
}

function getTestByName(source, testName, callback) {
	var fixtures = [];
	select(source["test-run"], fixtures, "test-suite", function(obj) {
		return obj["test-case"];
	});
	var results = [];
	fixtures.forEach(fixture => {
		results = fixture['test-case'].filter(test => {
			return test.$.fullname === testName;
		}).concat(results);
	});
	callback(results[0]);
}
	
function whereAllTestsAreFailed(source, callback) {
	var fixtures = [];
	select(source["test-run"], fixtures, "test-suite", function(obj) {
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
	browseTree(obj.testTree, function(test) {
		if(test.$.checked) {
			testList.push(test.$.fullname);
		}
	});
	callback(testList.join('\n'));
}

function runTestList(testList, name, reportFolder, callback) {
	var reportPath = reportFolder + "/xml/" + name + ".xml";
	
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

function generateReport(reportFolder) {
	testRunning = false;
	new Executor({
		program: util.getPath(c.HTMLReportApp),
		args: {
			inputFolder: reportFolder+"/xml",
			outputFolder: reportFolder+"/html"
		},
		errorAction: function(err) {
			console.log(err);
		},
		successAction: function() {
			console.dir(fs.readdir(reportFolder+"/html"));
			fs.readdir(reportFolder+"/html", function(err, files) {
				if (err)
					return console.log(err);
				
				files.forEach(fileName => {
					replaceTextInFile(reportFolder+"/html" + '/' + fileName, c.reportFilesFolder, "/getFile?name=");
				});
			});
		}
	});	
}

function replaceTextInFile(filePath, fromPattern, toPattern) {
	fs.readFile(filePath, 'utf8', function(err,data) {
		if(err) {
			return console.log(err);
		}
		var regex = new RegExp(fromPattern.replace(/\\/g,'\\\\'), 'gi');
		data = data.replace(regex, toPattern);
		fs.writeFile(filePath, data, function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("Replaced "+filePath);
		});
	});
}

function substituteSettings(data, callback) {
	if(c.substituteSettingsEnabled && data.settings && Object.keys(data.settings).length > 0) {
		var dllConfigFilePath = c.testAssemblyPath+'.config';
		fs.readFile(dllConfigFilePath, function(err, xmlData) {
			xml2js.parseString(xmlData, function(err, xml) {
				var config = xml['configuration']['appSettings'][0]['add'];
				var items = data.settings;

				for(var key in items) {
					var obj = config.find(config_item => {
						return key === config_item.$.key;
					});
					if(obj) {
						obj.$.value = items[key];
					}
				}
				
				var xmlBuilder = new xml2js.Builder();
				fs.writeFile(dllConfigFilePath, xmlBuilder.buildObject(xml), function(err) {
					if(err) {
						return console.log(err);
					}
					callback();
				});
			});
		});
	} else {
		callback();
	}
}

function prepareReportFolders(callback) {
	var now = new Date();
	var newFolderName = "Result-"+(now.toDateString()+" "+now.toTimeString().substr(0,8)).replace(/[\s:]/g, "-");
	var newFolderPath = c.reportFolder+"/"+newFolderName;
	createDirectory(newFolderPath);
	createDirectory(newFolderPath+"/xml");
	createDirectory(newFolderPath+"/html");
	
	var results = db.get().collection("results");
	results.insert({
		folder: newFolderName,
		time: now
	});
	
	callback(newFolderPath);
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

function createDirectory(name) {
	if (!fs.existsSync(name)){
		fs.mkdirSync(name);
	}
}

module.exports = router;