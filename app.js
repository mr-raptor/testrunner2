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

var getPath = function(value) {
	return "\"" + value + "\"";
}

var parseDLL = function() {
	var inputFile = getPath(config.testAssemblyPath);
	var outputFile = "D:\\Selenium\\TestRunner\\parsed.json";
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

var syncConfig = function() {
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
	testlist = Object.keys(req.query).join();
	var runTests = getPath(config.nunitApp) + " /test:" + testlist + " " + getPath(config.testAssemblyPath);
	console.log(runTests);
	exec(runTests, function(err, data) {
		if(err != null) {
			console.log(err);
		} else {
			console.log(data);
		}

		var inputFile = "TestResult.xml";
		var outputFile = "./views/result.ejs";
		var generateReport = config.HTMLReportApp + " " + inputFile + " " + outputFile;
		console.log(generateReport);
		exec(generateReport, function(err, data) {
			if(err != null) {
				console.log(err);
				res.redirect("/");
			} else {
				res.render("result");
			}
		});
	});
});

//run app
var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
//"dll_parser/parser.exe" "D:\Selenium\AdoramaAutoTests\AdoramaAutoTests\bin\Debug\AdoramaAutoTests.dll" parsed.json
//parser.exe "D:\Selenium\AdoramaAutoTests\AdoramaAutoTests\bin\Debug\AdoramaAutoTests.dll" parsed.json