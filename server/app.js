var express	= require('express');
var path = require('path');
var bodyParser = require('body-parser');

var c = require('./appConfig.json');
var db = require('./db');
var timeText = require('./util').timeText;

var app = express();
app.use(express.static(path.join(__dirname, '../node_modules')));
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../views')));

app.set('view engine', 'ejs');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use('/api', require('./routes/configs'));
app.use('/api', require('./routes/results'));
app.use('/testInfo', require('./routes/status'));

app.get('/results/page/:name/:page', function(req, res) {
	res.render('testResults/'+req.params.name+'/html/'+req.params.page, {}, function(err,html) {
		return res.send(html);
	});
});

app.get('/results/page/:name', function(req, res) {
    res.redirect('/results/page/'+req.params.name+'/FirstPhase');
});

app.get('/getFile', function(req, res) {
	res.sendFile(path.join(c.reportFilesFolder, req.query["name"]));
});

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

var oldLog = console.log;
console.log = function(message) {
	oldLog(timeText()+": "+message);
}

db.connect(c.dbConnection, function(err) {
	if(err) {
		console.log(err);
		process.exit(1);
	} else {
		app.listen(c.PORT, function () {
			var host = this.address().address;
			var port = this.address().port;
			console.log('TestRunner app listening at http://'+host+':'+port);
		});
	}
});