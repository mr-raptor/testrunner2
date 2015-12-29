var express		= require('express');
var bodyParser	= require('body-parser');

// My
var c		= require('./config.json');
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
	// get configs from database
	testInfo.getConfigList(function(list) {
		res.render('pages/configSelector', {
			configs: list
		});
	});
});

app.get('/config', function(req, res) {
	testInfo.currentTestInfo = req.query['name'];
	testInfo.readFile(function(obj) {
		res.render('pages/configPage', {
			fixtures: obj.fixtures,
			browsers: c.browsers
		});
	});
});

app.get('/parse', function(req, res) {
	parseDLL();
	testInfo.sync();
	res.redirect('/');
});

app.get('/runconfig', function(req, res) {
	testInfo.readFile(function(obj) {
		var testList = buildTestList(obj);
		runTests(testList, res);
	});
});

app.post('/run', function(req, res) {
	testInfo.update(req.body);
	res.redirect('/runconfig');
});

app.post('/save', function(req, res) {
	testInfo.update(req.body);
	res.end('Saved');
});

app.get('/saveas', function(req, res) {
	console.log(testInfo.getConfigList());
});

app.post('/addConfig', function(req, res) {
	res.end("Ok!");
});

app.get('/lastresult', function(req, res) {
	res.render("result");
});

function parseDLL() {
	new Executor({
		program: getPath(c.DLLParserApp),
		args: {
			inputFile: getPath(c.testAssemblyPath),
			outputFile: c.parsedDLLFile
		}
	});
}

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

function runTests(testlist, res) {
	new Executor({
		program: getPath(c.nunitApp),
		args: {
			tests: "/test:" + testlist,
			assembly: getPath(c.testAssemblyPath)
		},
		anywayAction: function() {
			generateReport(res);
		}
	});
}

function generateReport(res) {
	new Executor({
		program: getPath(c.HTMLReportApp),
		args: {
			inputFile: "TestResult.xml",
			outputFile: "result.html"
		},
		successAction: function() {
			moveReportToView(res);
		},
		errorAction: function(err) {
			console.log(err);
			res.send(err);
		}
	});
}

function moveReportToView(res) {
	new Executor({
		program: "MOVE",
		args: {
			rewrite: "/Y",
			fileLocation: "result.html",
			moveTo: "./views/result.ejs"
		},
		successAction: function() {
			res.send("<a href='/lastresult'>Test Results</a>");
		}
	});
}

//run app
var server = app.listen(c.PORT, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://'+host+':'+port);
});