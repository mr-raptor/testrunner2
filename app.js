var express		= require('express');
var bodyParser	= require('body-parser');

// My
var config		= require('./config.json');
var getPath		= require('./util').getPath;
var Executor 	= require('./Executor');
var testInfo 	= require('./testInfo');

var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

var oldLog = console.log;
console.log = function(message) {
	oldLog("["+(new Date()).toTimeString().substr(0,8)+"]: "+message);
}

app.get('/', function(req, res) {
	testInfo.readFile(function(obj) {
		res.render('pages/index', {
			fixtures: obj.fixtures,
			browsers: config.browsers
		});
	});
});

app.get('/parse', function(req, res) {
	parseDLL();
	testInfo.sync();
	res.redirect('/');
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

app.get('/runconfig', function(req, res) {
	testInfo.readFile(function(obj) {
		var testList = buildTestList(obj);
		runTests(testList);
		res.end("Ok!");
	});
});

app.post('/run', function(req, res) {
	testInfo.update(req.body);
	res.redirect('/runconfig');
});

function buildTestList(obj) {
	var testList = [];
	obj.fixtures.forEach(fixture => {
		fixture.tests.filter(test => {
			return test.active === true;
		}).forEach(test => {
			test.browsers.forEach(browser => {
				testList.push(test.assembly + "(\\\"" + browser + "\\\")." + test.name);
			});
		});
	});
	return testList.join();
}

function runTests(testlist) {
	new Executor({
		program: getPath(config.nunitApp),
		args: {
			tests: "/test:" + testlist,
			assembly: getPath(config.testAssemblyPath)
		},
		anywayAction: function() {
			generateReport();
		}
	});
}

function generateReport() {
	new Executor({
		program: getPath(config.HTMLReportApp),
		args: {
			inputFile: "TestResult.xml",
			outputFile: "result.html"
		},
		successAction: function() {
			moveReportToView();
		},
		errorAction: function(err) {
			console.log(err);
		}
	});
}

function moveReportToView() {
	new Executor({
		program: "MOVE",
		args: {
			rewrite: "/Y",
			fileLocation: "result.html",
			moveTo: "./views/result.ejs"
		},
		successAction: function() {
			console.log("Done!");
		}
	});
}

app.post('/save', function(req, res) {
	testInfo.update(req.body);
	res.end('Saved');
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