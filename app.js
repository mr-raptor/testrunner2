var express = require('express');
var jsonfile = require('jsonfile');

// My
var config = require('./config.json');
var getPath = require('./util').getPath;
var Executor = require('./Executor');

var app = express();
app.set('view engine', 'ejs');

var oldLog = console.log;
console.log = function(message) {
	oldLog("["+(new Date()).toTimeString().substr(0,8)+"]: "+message);
}

app.get('/', function(req, res) {
	//res.redirect('/parse');
	jsonfile.readFile(config.testInfoFile, function(err, obj) {
		res.render('pages/index', {
			fixtures: obj.fixtures,
			browsers: config.browsers
		});
	});
});

function parseDLL() {
	new Executor({
		program: getPath(config.DLLParserApp),
		args: {
			inputFile: getPath(config.testAssemblyPath),
			outputFile: config.parsedDLLFile
		}
	});
}

function syncConfig() {
	jsonfile.readFile(config.parsedDLLFile, function(err, obj) {
		if(err != null) {
			console.log(err);
		} else {
			obj.fixtures.forEach(fixture => {
				fixture.tests.forEach(test => { 
					test.active = true;
					test.browsers = ["chrome"]; // need to fix it
				});		
			});
			jsonfile.writeFile(config.testInfoFile, obj, function(err) {
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

function moveReportToView(res) {
	new Executor({
		program: "MOVE",
		args: {
			param: "/Y",
			fileLocation: "result.html",
			moveTo: "./views/result.ejs"
		},
		successAction: function() {
			res.redirect("lastresult");
		}
	});
}

function generateReport(res) {
	new Executor({
		program: getPath(config.HTMLReportApp),
		args: {
			inputFile: "TestResult.xml",
			outputFile: "result.html"
		},
		successAction: function() {
			moveReportToView(res);
		},
		errorAction: function(err) {
			console.log(err);
			res.redirect('/');
		}
	});
}

function runTests(testlist, res) {
	new Executor({
		program: getPath(config.nunitApp),
		args: {
			tests: "/test:" + testlist,
			assembly: getPath(config.testAssemblyPath)
		},
		anywayAction: function() {
			generateReport(res);
		}
	});
}

app.get('/run', function(req, res) {
	var checked_tests = Object.keys(req.query);
	var testlist = checked_tests.join();

	// move to .. somewhere
	jsonfile.readFile(config.testInfoFile, function(err, obj) {
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

			jsonfile.writeFile(config.testInfoFile, obj, function(err) {
				console.error(err);
			});
		}
	});
	
	runTests(testlist, res);
});

app.get('/lastresult', function(req, res) {
	res.render("result");
});

//run app
var server = app.listen(config.PORT, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://'+host+':'+port);
});