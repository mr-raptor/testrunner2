var express = require('express');
var jsonfile = require('jsonfile');
var util = require('util');

var app = express();
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
	var file = 'output.json';
	jsonfile.readFile(file, function(err, obj) {
		res.render('pages/index', {fixtures: obj.fixtures});		
	});
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});