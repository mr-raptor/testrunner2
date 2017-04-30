const CronJob = require('cron').CronJob;

const c = require('../server/appConfig');
const db = require('../server/db');
const timeText = require('../server/util').timeText;
const syncConfigs = require('./tasks/syncConfigs');
const backupDataBase = require('./tasks/backupDataBase');

let oldLog = console.log;
console.log = function(message) {
	oldLog(timeText()+": "+message);
}

new CronJob({
	cronTime: '*/10 * * * * *', // every 10 sec
	onTick: syncConfigs,
	start: true
});

new CronJob({
	cronTime: '*/20 * * * * *', // every weekday at 22:00
	onTick: backupDataBase,
	start: true
});
//new CronJob('00 00 22 * * 1-5', backupDataBase, null, true, 'America/Los_Angeles');

db.connect(c.dbConnection, function(err) {
	if(err) {
		console.log(err);
		process.exit(1);
	} else {
		console.log('Cron Start!');
	}
});

//obsolete
function fixLegacySettings() {
	let configs = db.get().collection('configs');

	const keys = Object.keys(c.testAssemblies);
	const key = keys[0];
	console.log(key);

	function isInKeysArray(item) {
		return keys.indexOf(item) !== -1;
	}

	configs.find().toArray(function(err, docs) {
		docs.map(config => {
			let data = JSON.parse(config.data);
			let settings = data.settings;
			console.dir(settings);
			if(!settings)
				return;

			if(Array.isArray(settings)) {
				if(!settings.every(isInKeysArray)) {
					let temp = settings;
					settings = {};
					settings[key] = temp;
				}
			} else {
				// for lp
				let temp = settings;
				settings = {};
				settings[key] = Object.keys(temp).map(item => { 
					return {
						name: item,
						value: temp[item]
					}
				});
			}
			console.dir(settings);
			data.settings = settings;
			config.data = JSON.stringify(data);
			saveConfig(config, (status) => {
				if(status.result.ok && status.result.ok === 1) {
					console.log(`${config.name} updated`);
				} else {
					console.log(`Error on ${config.name} update`);
					console.dir(status);
				}
			});
		});
	});
}