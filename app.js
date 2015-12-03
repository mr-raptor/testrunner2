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

app.get('/run', function(req, res) {
	// delete custom separator and move assembly full name to json
	testlist = "AdoramaAutoTests.Tests.CartItem." + Object.keys(req.query).join(",AdoramaAutoTests.Tests.CartItem.");
	var command = "\"" + config.nunitPath + "\"" + " /test:" + testlist + " " + config.testAssemblyPath;
	exec(command, function(err, data) {
		console.log(err);
		console.log(data);
		res.redirect("/");
	});
});

//run app
var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});