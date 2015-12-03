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
		res.render('pages/index', {fixtures: obj.fixtures});		
	});
});

getPath = function(value) {
	return "\"" + value + "\"";
}

app.get('/run', function(req, res) {
	// delete custom separator and move assembly full name to json
	testlist = "AdoramaAutoTests.Tests.CartItem." + Object.keys(req.query).join(",AdoramaAutoTests.Tests.CartItem.");
	var runTests = getPath(config.nunitPath) + " /test:" + testlist + " " + getPath(config.testAssemblyPath);
	console.log(runTests);
	exec(runTests, function(err, data) {
		if(err != null) {
			console.log(err);
		} else {
			console.log(data);
		}
		var projectPath = "D:\\Selenium\\TestRunner\\";
		var inputFile = "TestResult.xml";
		var outputFile = "./views/result.ejs";
		var generateReport = config.HTMLReportApp + " " + inputFile + " " + outputFile;
		console.log(generateReport);
		exec(generateReport, function(err, data) {
			if(err != null) {
				console.log(err);
				res.redirect("/");
			} else {
				res.render("result"); //to test results
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