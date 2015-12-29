var jsonfile	= require('jsonfile');
var MongoClient = require('mongodb').MongoClient;

var c		= require('./config.json');

// -- DataBase

var conn = c.dbConnection;

var insertDocuments = function(db, callback) {
	var collection = db.collection('documents');
	collection.insertMany([ {a:1}, {a:3}, {a:2} ], function(err, result) {
		console.log("Inserted = " + result.result.n);
		callback(result);
	});
}

var findDocuments = function(db, callback) {
	var collection = db.collection('documents');
	collection.find({}).toArray(function(err, docs) {
		console.log(docs);
		console.dir(docs);
		callback(docs);
	});
}

MongoClient.connect(conn, function(err, db) {
	console.log("connected");
	findDocuments(db, function() {
		db.close();
	});
});

// --

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

function synchronizeTestInfo(testInfo, dll) {
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
}

var testInfo = {
	currentTestInfo: "",
	readFile: function(callback) {
		jsonfile.readFile(this.currentTestInfo, function(err, obj) {
			if(err != null) {
				console.log(err);				
			} else {
				callback(obj);
			}
		});
	},
	sync: function() {
		jsonfile.readFile(c.parsedDLLFile, function(err, dll) {
			if(err != null) {
				console.log(err);
			} else {
				jsonfile.readFile(this.currentTestInfo, function(err, testInfo) {
					if(err != null) {
						console.log(err);
					} else {						
						synchronizeTestInfo(testInfo, dll);

						// Save result
						jsonfile.writeFile(this.currentTestInfo, testInfo, function(err) {
							console.error(err);
						});
					}					
				});
			}
		});
	},
	update: function(obj) {
		jsonfile.writeFile(this.currentTestInfo, obj, function(err) {
			console.error(err);
		});
		var info = {
			name: this.currentTestInfo,
			data: obj
			//lastUpdate: new Date().toJSON()
		};
		MongoClient.connect(conn, function(err, db) {
			var configs = db.collection('configs');
			configs.updateOne(
				{ name: this.currentTestInfo },
				info,
				{ upsert: true }
			).then(db.close);
		});
	},
	getConfigList: function(callback) {
		MongoClient.connect(conn, function(err, db) {
			var configs = db.collection('configs');
				configs.find({}).toArray(function(err, docs) {
					var list = docs.map(doc => {
						return doc.name;
					});
					console.dir(docs);
					console.log(list);
					callback(list);
					db.close();
					
				});
		});
	}
}

module.exports = testInfo;