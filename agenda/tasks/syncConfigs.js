const fs = require('fs');
const crypto = require('crypto');

const c = require('../../server/appConfig');
const db = require('../../server/db');
const sync = require('../../server/synchronizer');

function syncConfigs() {
	checkUpdates();
}

function checkUpdates() {
	//console.log("Checking DLL for updates...");
	var dllPath = Object.keys(c.testAssemblies).map(key => {
				return c.testAssemblies[key];
			})[0];
	fs.access(dllPath, fs.constants.R_OK, (err) => {
		if (err)
			return console.log("File not found!");

		getFileHash(dllPath, (fileHash) => {
			//console.log(`File hash = ${fileHash}`);
			
			var configs = db.get().collection('configs');
			configs.find().sort({updated: -1}).limit(1).toArray(function(err, docs) {
				//console.log(`Last hash = ${docs[0].hash}`);
				if(!docs[0].hash || docs[0].hash !== fileHash) {
					console.log("Hashes are different. Will update configs");
					updateConfigs(fileHash);
				} else {
					//console.log("Nothing to update. Exit");
				}
			});		
		});
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
		if(!docs || docs.length === 0)
			return console.log("Configs not found!");
		
		console.log("Configs to update count = "+docs.length);
		
		sync.getExploredData(data => {
			docs.forEach(doc => {
				syncConfig(doc, data, fileHash);
			});
		});
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

module.exports = syncConfigs;