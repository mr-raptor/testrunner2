var express	= require('express');
var path = require('path');
var bodyParser = require('body-parser');

var c = require('./server/appConfig.json');
var db = require('./server/db');
var timeText = require('./server/util').timeText;

var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', require('./server/routes/configs'));
app.use('/api', require('./server/routes/results'));
app.use('/testInfo', require('./server/routes/status'));
app.use('/api', require('./server/routes/grid'));

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
    res.sendFile(path.join(__dirname, 'dist/index.html'));
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
			console.log(`API running on localhost:${this.address().port}`);
		});
	}
});