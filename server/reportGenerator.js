var fs = require('fs');

var status = require('./status');
var c = require('./appConfig.json');
var Executor = require('./Executor');
var db = require('./db');
var util = require('./util');

//don't do that!
var now;
var newFolderName;

function prepareReportFolders(configName, callback) {
	now = new Date();
	newFolderName = "Result-"+(now.toDateString()+" "+now.toTimeString().substr(0,8)).replace(/[\s:]/g, "-")+"-"+configName;
	var newFolderPath = c.reportFolder+"/"+newFolderName;
	createDirectory(newFolderPath);
	createDirectory(newFolderPath+"/xml");
	createDirectory(newFolderPath+"/html");
	
	callback(newFolderPath);
}

function generateReport(reportFolder) {
	status.end();

	new Executor({
		program: util.getPath(c.HTMLReportApp),
		args: {
			inputFolder: reportFolder+"/xml",
			outputFolder: reportFolder+"/html"
		},
		errorAction: function(err) {
			console.log(err);
		},
		successAction: function() {
			fs.readdir(reportFolder+"/html", function(err, files) {
				if (err)
					return console.log(err);
				
				files.forEach(fileName => {
					replaceTextInFile(reportFolder+"/html" + '/' + fileName, c.reportFilesFolder, "/getFile?name=");
				});
			});
			
			var results = db.get().collection("results");
			results.insert({
				folder: newFolderName,
				time: now,
				status: status.get().message
			});			
		}
	});	
}

function replaceTextInFile(filePath, fromPattern, toPattern) {
	fs.readFile(filePath, 'utf8', function(err,data) {
		if(err) {
			return console.log(err);
		}
		var regex = new RegExp(fromPattern.replace(/\\/g,'\\\\'), 'gi');
		data = data.replace(regex, toPattern);
		fs.writeFile(filePath, data, function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("Replaced "+filePath);
		});
	});
}

/*function cleanFolder(path) {
	new Executor({
		program: "del",
		args: {
			path: path,
			mode: "/Q"
		},
		errorAction: function(err) {
			console.log(err);
		}
	});
}*/

function createDirectory(name) {
	if (!fs.existsSync(name)){
		fs.mkdirSync(name);
	}
}

module.exports.prepareReportFolders = prepareReportFolders;
module.exports.generateReport = generateReport;