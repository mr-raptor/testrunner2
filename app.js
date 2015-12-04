var express = require('express');
var jsonfile = require('jsonfile');
var util = require('util');
var exec = require('child_process').exec;
var config = require('./config.json');

var app = express();
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	var file = 'output.json';

	jsonfile.readFile(file, function(err, obj) {
		console.log(obj.fixtures);
		res.render('pages/index', {fixtures: obj.fixtures});		
	});
});

function getPath(value) {
	return "\"" + value + "\"";
}

function parseDLL() {
	var inputFile = getPath(config.testAssemblyPath);
	var outputFile = "parsed.json";
	var parse = getPath(config.DLLParserApp) + " " + inputFile + " " + outputFile;
	console.log(parse);
	exec(parse, function(err, data) {
		if(err != null) {
			console.log(err);
		} else {
			console.log(data);
		}
	});
}

function syncConfig() {
	var configFile = 'output.json'; //move to config
	var update = 'parsed.json';
	
	jsonfile.readFile(update, function(err, obj) {
		if(err != null) {
			console.log(err);
		} else {
			obj.fixtures.forEach(function(fixture) {
				fixture.tests.forEach(function(test) { test.active = true });		
			});
			jsonfile.writeFile(configFile, obj, function(err) {
				console.error(err);
			});
		}
	});
}

app.get('/parse', function(req, res) {
	parseDLL();
	syncConfig();
	res.redirect('/');
});

app.get('/run', function(req, res) {
	var checked_tests = Object.keys(req.query);
	var testlist = checked_tests.join();
	
	var configFile = 'output.json'; //move to config
	// move to .. somewhere
	jsonfile.readFile(configFile, function(err, obj) {
		if(err != null) {
			console.log(err);
		} else {

			obj.fixtures.forEach(function(fixture) {
				fixture.tests.forEach(function(test) {
					if(checked_tests.indexOf(test.fullname) == -1) {
						test.active = false;
					} else {
						test.active = true;
					}
				});
			});

			jsonfile.writeFile(configFile, obj, function(err) {
				console.error(err);
			});
		}
	});
	
	var runTests = getPath(config.nunitApp) + " /test:" + testlist + " " + getPath(config.testAssemblyPath);
	console.log(runTests);
	exec(runTests, function(err, data) {
		if(err != null) {
			console.log(err);
		} else {
			console.log(data);
		}

		var inputFile = "TestResult.xml";
		var outputFile = "result.html";
		var generateReport = getPath(config.HTMLReportApp) + " " + inputFile + " " + outputFile;
		console.log(generateReport);
		exec(generateReport, function(err, data) {
			if(err != null) {
				console.log(err);
				res.redirect("/");
			} else {
				exec("MOVE /Y result.html ./views/result.ejs", function(err, data) {
					if(err != null) {
						console.log(err);
					} else {
						res.redirect("lastresult");
					}
				});
			}
		});
	});
});

app.get('/lastresult', function(req, res) {
	res.render("result");
});

//run app
var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});