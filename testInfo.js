var jsonfile	= require('jsonfile');

var config		= require('./config.json');
var Executor 	= require('./Executor');


function contains(test, tests) {
	return tests.find(currentTest => {
		return currentTest.name === test.name &&
			   currentTest.assembly === test.assembly;
	});
}

var testInfo = {
	readFile: function(callback) {
		jsonfile.readFile(config.testInfoFile, function(err, obj) {
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
				jsonfile.readFile(config.testInfoFile, function(err, testInfo) {
					if(err != null) {
						console.log(err);
					} else {						
						var newFixtureNames = dll.fixtures.map(fixture => {
							return fixture.name;
						});
						
						// Delete all fixtures in testInfo what there isn't in parsedDLL
						testInfo.fixtures.forEach(fixture => {
							if(newFixtureNames.indexOf(fixture.name) === -1) {
								delete fixture;
								return;
							}
							
							var newFixture = dll.fixtures.find(n_fixture => {
								return n_fixture.name === fixture.name;
							});

							//Delete all tests in fixture in testInfo what there isn't in fixture in parsedDLL
							fixture.tests.filter(test => { 
								return !contains(test, newFixture.tests) 
							}).forEach(test => {
								delete test; 
							});
							fixture.tests.forEach(test => {
								if(!contains(test, newFixture.tests)) {
									delete test;
								}
								var t = newFixture.tests.find(newTest => {
									return newTest.name === test.name &&
										   newTest.assembly === test.assembly;
								});
								if(t === undefined) {
									delete test;
								}
							});
						});

						// Add all new fixtures and tests from parsedDLL
						dll.fixtures.forEach(fixture => {
							var oldFixture = testInfo.fixtures.find(o_fixture => {
								return o_fixture.name === fixture.name;
							});
							// If fixture is new, add whole fixture with tests							
							if(oldFixture === undefined) {
								testInfo.fixtures.push(fixture);
							} else {
								// If fixture exists, but test is new - add new test
								fixture.tests.forEach(test => {
									var t = contains(test, oldFixture.tests);
									if(t === undefined) {
										oldFixture.tests.push(test);
									}
								});
							}
							
							fixture.tests.forEach(test => { 
								test.active = false;
								test.browsers = [];
							});
						});

						// Save result
						jsonfile.writeFile(config.testInfoFile, testInfo, function(err) {
							console.error(err);
						});						
					}					
				});
			}
		});
	},
	update: function(obj) {
		jsonfile.writeFile(config.testInfoFile, obj, function(err) {
			console.error(err);
		});
	}
}

module.exports = testInfo;