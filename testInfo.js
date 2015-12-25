var jsonfile	= require('jsonfile');

var config		= require('./config.json');
var Executor 	= require('./Executor');


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

var testInfo = {
	currentTestInfo: "",
	readFile: function(callback) {
		jsonfile.readFile(currentTestInfo, function(err, obj) {
			if(err != null) {
				console.log(err);
				
			} else {
				callback(obj);
			}
		});
	},
	sync: function() {
		jsonfile.readFile(config.parsedDLLFile, function(err, dll) {
			if(err != null) {
				console.log(err);
			} else {
				jsonfile.readFile(currentTestInfo, function(err, testInfo) {
					if(err != null) {
						console.log(err);
					} else {						
						// Delete all fixtures in testInfo what there isn't in parsedDLL						
						testInfo.fixtures = testInfo.fixtures.filter(fixture => {
							return searchFixture(fixture.name, dll.fixtures);
						});

						// Delete all tests in fixture in testInfo what there isn't in fixture in parsedDLL
						testInfo.fixtures.forEach(fixture => {
							var newFixture = searchFixture(fixture.name, dll.fixtures);							
							fixture.tests = fixture.tests.filter(test => { 
								return searchTest(test, newFixture.tests);
							});
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

						// Save result
						jsonfile.writeFile(currentTestInfo, testInfo, function(err) {
							console.error(err);
						});
					}					
				});
			}
		});
	},
	update: function(obj) {
		jsonfile.writeFile(currentTestInfo, obj, function(err) {
			console.error(err);
		});
	}
}

module.exports = testInfo;