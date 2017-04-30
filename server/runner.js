var fs = require('fs');
var xml2js = require('xml2js');

var settings = require('./settings');
var report = require('./reportGenerator');
var c = require('./appConfig.json');
var selector = require('./selector');
var util = require('./util');
var status = require('./status');
var Executor = require('./Executor');
var hostSync = require('./hostSync');

function executeTests(data, configName, res) {
	if(status.get().isTestRun)
		return res.end("Tests already are running");
	
	res.end("Started");
	status.run();
	
	hostSync.synchronize(data.hostfile, function() {
		settings.substituteSettings(data.settings, function() {
			report.prepareReportFolders(configName, function(reportFolder) {
				buildTestListFromDB(data, function(testList) {
					if(testList.length === 0) {
						status.end("Failed");
						return console.log("No tests selected!");
					}

					// run selected tests
					runTests(testList, c.testList, "FirstPhase", reportFolder, function(reportPath) {
						if(c.rerunFailedTests) {
							// rerun failed tests if setting enabled
							rerunFailedTests(reportFolder, reportPath);
						} else {
							checkFailedTests(reportPath, function() {
								status.change("Failed");
							});
							report.generateReport(reportFolder);
						}
					});
				});
			});
		});
	});
}

function buildTestListFromDB(obj, callback) {
	var testList = [];
	selector.browseTree(obj.testTree, {
		'TestCase': function(testcase) {
			if(testcase.$.checked) {
				testList = testcase['test-case']
					.filter(test => test.$.checked)
					.map(test => test.$.fullname)
					.concat(testList);
			}
		}
	});
	callback(testList.join('\n'));
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
					getFailedTests(tests, reports, function(testData) {
						for(currTest of tests) {
							if(isFailedTest(testData, currTest, reports)) {							
								if(isLowPriority(testData, reports[0], currTest)) {
									status.change("Warning");
								} else {
									status.change("Failed");
									break;
								}
							}
						}
					});
					
					report.generateReport(reportFolder);
				});
			});
		});
	}, function() {
		report.generateReport(reportFolder);
	});
}

function runTests(testList, testListPath, xmlReportName, reportFolder, callback) {
	if(testList.length === 0)
		return console.log("No tests selected!");
	
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

function runTestList(testList, name, reportFolder, callback) {
	var reportPath = reportFolder + "/xml/" + name + ".xml";
	
	new Executor({
		program: util.getPath(c.nunitApp),
		args: {
			tests: "--testlist=" + testList,
			workers: "--workers=" + c.nodesCount,
			assembly: util.getPath(Object.keys(c.testAssemblies).map(key => {
				return c.testAssemblies[key];
			}).join("\" \"")),
			output: "--result="+reportPath
		},
		anywayAction: function() {
			callback(reportPath);
		}
	});
}

function isFailedTest(testData, testName, reports) {
	var testResults = [];
	reports.forEach(report => {
		testResults = testData[report].filter(test => {
			return test.$.fullname === testName;
		}).concat(testResults);
	});
	return isFailedByTimeout(testResults[2])? 
		[testResults[0],testResults[1]].every(item => item.failure) : 
		[testResults[0],testResults[1]].some(item => item.failure);
}

function isFailedByTimeout(testResult) {
	return testResult.$.result === "Failed" && 
			Boolean(String(testResult.failure[0].message)
				.match(/(OpenQA.Selenium.WebDriverTimeoutException|OpenQA.Selenium.ElementNotVisibleException)/i));
}

function isLowPriority(testData, report, testName) {
	var property = testData[report].find(test => {
		return test.$.fullname === testName;
	}).properties[0].property;
	return property? property.filter(prop => {
		return prop.$.name === "Category" && prop.$.value === "LowPriority";
	}).length !== 0 : false;
}


function getFailedTests(failedTestList, reportPaths, callback) {
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
	selector.select(source["test-run"], fixtures, "test-suite", function(obj) {
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
	selector.select(source["test-run"], fixtures, "test-suite", function(obj) {
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

module.exports.executeTests = executeTests;