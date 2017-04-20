var CronJob = require('cron').CronJob;
var fs = require('fs');
var crypto = require('crypto');

var c = require('../server/appConfig');
var db = require('../server/db');
var sync = require('../server/synchronizer');
var timeText = require('../server/util').timeText;

new CronJob('*/10 * * * * *', function() {
	console.log("Run process");
	checkUpdates();
	
}, null, true, 'America/Los_Angeles');

console.log(process.env.PORT);

function checkUpdates() {
	var dllPath = c.testAssemblies[0];
	fs.access(dllPath, fs.constants.R_OK, (err) => {
		if (!err) {
			getFileHash(dllPath, (fileHash) => {
				console.log(`File hash = ${fileHash}`);
				
				var configs = db.get().collection('configs');
				configs.find().sort({updated: -1}).limit(1).toArray(function(err, docs) {
					console.log(`Last hash = ${docs[0].hash}`);
					if(!docs[0].hash || docs[0].hash !== fileHash) {
						console.log("Hashes are different. Will update configs");
						updateConfigs(fileHash);
					} else {
						console.log("Nothing to update. Exit");
					}
				});		
			});
		} else {
			return console.log("File not found!");
		}
	});
}

function getFileHash(filepath, callback) {
	var hash = crypto.createHash('md5');
	var stream = fs.createReadStream(filepath);

	stream.on('data', function(data) {
		hash.update(data, 'utf8');
	});

	stream.on('end', function() {
		callback(hash.digest('hex'));
	});
	
}

function updateConfigs(fileHash) {
	var configs = db.get().collection('configs');
	configs.find({$or : [{hash:undefined}, {hash:{$ne: fileHash }}]}).toArray(function(err, docs) {
		if(!docs)
			return console.log("Configs not found!");
		
		console.log("Configs to update count = "+docs.length);
		
		if(docs.length > 0) {
			sync.getExploredData(data => {
				docs.forEach(doc => {
					syncConfig(doc, data, fileHash);
				});
			});
		}
	});
}

function syncConfig(config, testData, fileHash) {
	sync.synchronize(config, testData, (updatedConfig) => {
		updatedConfig.data = JSON.stringify(updatedConfig.data);
		updatedConfig.hash = fileHash;
		updatedConfig.updated = new Date();
		
		saveConfig(updatedConfig, (status) => {
			if(status.result.ok && status.result.ok === 1) {
				console.log(`${updatedConfig.name} updated`);
			} else {
				console.log(`Error on ${updatedConfig.name} update`);
				console.dir(status);
			}
		});
	});
}

function saveConfig(config, callback) {
	var configs = db.get().collection('configs');
	
	configs.update(
		{name: config.name},
		config,
		{upsert: true},
		function(err, status) {
			if(err) 
				return console.log(err);
			callback(status);
		}
	);
}

var oldLog = console.log;
console.log = function(message) {
	oldLog(timeText()+": "+message);
}

db.connect(c.dbConnection, function(err) {
	if(err) {
		console.log(err);
		process.exit(1);
	} else {
		console.log('Cron Start!');
	}
});