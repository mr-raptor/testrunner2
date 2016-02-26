var express	= require('express');
var bodyParser = require('body-parser');
var path = require('path');

var c = require('./appConfig.json');
var db = require('./db');
var timeText = require('./util').timeText;

var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use('/configs', require('./controllers/configs'));
app.use('/testInfo', require('./controllers/testInfo'));

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
			console.log('Example app listening at http://'+host+':'+port);
		});
	}
});

app.get('/', function(req, res) {
	res.redirect('/configs');
});

app.get('/getFile', function(req, res) {
	res.sendFile(path.join(c.reportFilesFolder, req.query["name"]));
});

app.get('/lastresult', function(req, res) {
	res.redirect("/lastresult/Index");
});

app.get('/lastresult/:id', function(req, res) {
	res.render("testResults/"+req.params.id);
});
