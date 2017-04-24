var fs = require('fs');
var xml2js = require('xml2js');

var c = require('./appConfig.json');

function substituteSettings(settings, callback) {
	if(settings) {
		let requests = Object.keys(settings).map(settingFile => {
			return new Promise((resolve, reject) => {
				var dllConfigFilePath = c.testAssemblies[settingFile]+'.config';
				fs.readFile(dllConfigFilePath, function(err, xmlData) {
					xml2js.parseString(xmlData, function(err, xml) {
						var config = xml['configuration']['appSettings'][0]['add'];

						for(var setting of settings[settingFile]) {
							var obj = config.find(config_item => {
								return setting.name === config_item.$.key;
							});
							if(obj) {
								obj.$.value = setting.value;
							}
						}
						
						var xmlBuilder = new xml2js.Builder();
						fs.writeFile(dllConfigFilePath, xmlBuilder.buildObject(xml), function(err) {
							if(err)
								reject(err);
							resolve();
						});
					});
				});
			});
		});

		Promise.all(requests)
			.then(callback)
			.catch(err => console.log(err));
	} else {
		callback();
	}
}

module.exports.substituteSettings = substituteSettings;