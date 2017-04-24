var parseXml = require('xml2js').parseString;
var fs = require('fs');

var c = require('./appConfig.json');
var Executor = require('./Executor');
var getPath = require('./util').getPath;
var selector = require('./selector');

//obsolete
/*module.exports.synchronize = function(config, callback) {
	exploreDLL(function() {
		parseTests(function(data) {
			syncFile(config, data, callback);
		});
	});
}*/


module.exports.synchronize = function(config, data, callback) {
	syncFile(config, data, callback);
}

module.exports.getExploredData = function(callback) {
	exploreDLL(() => {
		parseTests(data => {
			callback(data);
		});
	});
}

function exploreDLL(callback) {
	new Executor({
		program: getPath(c.nunitApp),
		args: {
			input: getPath(Object.keys(c.testAssemblies).map(key => {
				return c.testAssemblies[key];
			}).join("\" \"")),
			output: "-explore="+c.exploredTests
		},
		successAction: function() {
			callback();
		}
	});
}

function parseTests(callback) {
	fs.readFile(c.exploredTests, function(err, data) {
		parseXml(data, function(err, result) {
			remapFixtures(result["test-run"], callback);
		});
	});
}

function remapFixtures(data, callback) {
	selector.browseTree(data, {
		"ParameterizedFixture": function(pFixture) {
			var fixtures = pFixture['test-suite'];

			var testCaseList = [];
			function selectTestCaseNames(obj) {
				if(obj["test-case"]) {
					testCaseList = obj["test-case"].map(test => {
						return { 
							name: test.$.name,
							fullname: test.$.fullname
						}
					}).concat(testCaseList);
				}
			}

			selector.browseTree(fixtures[0], {
				"TestFixture": selectTestCaseNames,
				"ParameterizedMethod": selectTestCaseNames
			});

			pFixture['test-suite'] = testCaseList.map(testCase => {
				var list = [];
				selector.searchTests(pFixture, "name", testCase.name, function(test) {
					test.$.browser = getBrowserName(test);
					list.push(test); 
				});
				return {
					$: {
						type: 'TestCase',
						methodname: testCase.name,
						fullname: testCase.fullname
					},
					'test-case': list
				}
			});
		}
	});
	callback(data);
}

function syncFile(config, parsedData, callback) {
	// if config is new
	if(!config.data)
		config.data = {};
	else
		config.data = JSON.parse(config.data);

	config.data.testTree = synchronizeTestTree(config.data.testTree, parsedData);
	config.data.testTree.$.name = "Root";

	callback(config);
}

function synchronizeTestTree(oldTree, newTree) {
	var testTree = newTree;
	selector.browseTree(testTree, {
		"TestCase": function(testcase) {
			selector.browseTree(oldTree, {
				"TestCase": function(oldTestCase) {
					if(oldTestCase.$.fullname === testcase.$.fullname)
					{
						testcase.$.checked = oldTestCase.$.checked;
						testcase['test-case'].forEach(test => {
							selector.searchTest(oldTestCase, "fullname", test.$.fullname, function(oldTest) {
								test.$.checked = oldTest.$.checked;
							});
						});
					}
				}
			});

		}
	});
	return testTree;
}

function getBrowserName(test) {
	var pattern = new RegExp(`${test.$['classname']}\\\(\"(\\w+)\"\\\)`, 'i');
	var output = test.$['fullname'].match(pattern);
	return output ? output[output.length-1] : "error";
}