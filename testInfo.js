var jsonfile = require('jsonfile');

var c = require('./appConfig.json');
var Executor = require('./Executor');
var getPath = require('./util').getPath;

var testInfo = {
	sync: function(config, callback) {
		parseDLL();
		jsonfile.readFile(c.parsedDLLFile, function(err, dll) {
			if(err != null) {
				console.log(err);
			} else {
				// if config is new
				if(config.data === undefined) {
					config.data = {};
				}
				if(config.data.fixtures === undefined) {
					config.data.fixtures = [];
				}				
				config.data = synchronizeTestInfo(config.data, dll);
				callback(config);
			}
		});
	}
}

function parseDLL() {
	new Executor({
		program: getPath(c.DLLParserApp),
		args: {
			inputFile: getPath(c.testAssemblyPath),
			outputFile: c.parsedDLLFile
		}
	});
}

function synchronizeTestInfo(testInfo, dll) {	
	// Delete all fixtures in testInfo what there isn't in parsedDLL						
	testInfo.fixtures = testInfo.fixtures.filter(fixture => searchFixture(fixture.name, dll.fixtures));

	// Delete all tests in fixture in testInfo what there isn't in fixture in parsedDLL
	testInfo.fixtures.forEach(fixture => {
		var newFixture = searchFixture(fixture.name, dll.fixtures);							
		fixture.tests = fixture.tests.filter(test => searchTest(test, newFixture.tests));
	});

	// Add all new fixtures and tests from parsedDLL
	dll.fixtures.forEach(fixture => {
		var oldFixture = searchFixture(fixture.name, testInfo.fixtures);

		// If fixture is new, add whole fixture with tests							
		if(oldFixture === undefined) {
			testInfo.fixtures.push(fixture);
		} else {
			// If fixture exists, add new tests
			var newTests = fixture.tests.filter(test => {
				return !searchTest(test, oldFixture.tests);
			});								
			oldFixture.tests = oldFixture.tests.concat(newTests);
		}
		
		fixture.tests.forEach(test => { 
			test.active = false;
			test.browsers = [];
		});
	});
	return testInfo;
}

function searchTest(test, source) {
	return source.find(currentTest => {
		return currentTest.name === test.name &&
			   currentTest.assembly === test.assembly;
	});
}

function searchFixture(fixtureName, source) {
	return source.find(fixture => {
		return fixtureName === fixture.name;
	});
}

module.exports = testInfo;