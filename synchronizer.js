var parseXml = require('xml2js').parseString;
var fs = require('fs');

var c = require('./appConfig.json');
var Executor = require('./Executor');
var getPath = require('./util').getPath;
var select = require('./selector');

module.exports.synchronize = function(config, callback) {
	exploreDLL(function() {
		parseTests(function(data) {
			syncFile(config, data, callback);
		});
	});
}

function exploreDLL(callback) {
	new Executor({
		program: getPath(c.nunitApp),
		args: {
			input: getPath(c.testAssemblyPath),
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
			var testFixtures = [];
			
			select(result["test-run"], testFixtures, "test-suite", function(obj) {
				// if object has "test-case" collection
				return obj["test-case"]; 
			});
			
			var data = {
				fixtures: testFixtures.map(fixture => {
					return {
						name: fixture.$.name,
						tests: fixture['test-case'].map(test => {
							return {
								name: test.$.name,
								fullname: test.$.fullname
							}
						})
					}
				})
			};
			
			callback(data)
		});
	});
}

function syncFile(config, parsedData, callback) {
	// if config is new
	if(config.data === undefined) {
		config.data = {};
	}
	if(config.data.fixtures === undefined) {
		config.data.fixtures = [];
	}
	
	config.data = synchronizeTestInfo(config.data, parsedData);
	callback(config);
}

function synchronizeTestInfo(testInfo, parsedData) {	
	// Delete all fixtures in testInfo what there isn't in parsedData						
	testInfo.fixtures = testInfo.fixtures.filter(fixture => searchFixture(fixture.name, parsedData.fixtures));

	// Delete all tests in fixture in testInfo what there isn't in fixture in parsedData
	testInfo.fixtures.forEach(fixture => {
		var newFixture = searchFixture(fixture.name, parsedData.fixtures);							
		fixture.tests = fixture.tests.filter(test => searchTest(test, newFixture.tests));
	});

	// Add all new fixtures and tests from parsedData
	parsedData.fixtures.forEach(fixture => {
		var oldFixture = searchFixture(fixture.name, testInfo.fixtures);

		// If fixture is new, add whole fixture with tests							
		if(oldFixture === undefined) {
			testInfo.fixtures.push(fixture);
		} else {
			// If fixture exists, add new tests
			var newTests = fixture.tests.filter(test => !searchTest(test, oldFixture.tests));			
			oldFixture.tests = oldFixture.tests.concat(newTests);
		}
		
		fixture.tests.forEach(test => { 
			test.active = false;
			test.browsers = c.browsers;
		});
	});
	return testInfo;
}

function searchTest(test, source) {
	return source.find(currentTest => {
		return currentTest.name === test.name &&
			   currentTest.fullname === test.fullname;
	});
}

function searchFixture(fixtureName, source) {
	return source.find(fixture => {
		return fixtureName === fixture.name;
	});
}