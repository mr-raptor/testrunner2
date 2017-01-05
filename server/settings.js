var fs = require('fs');
var xml2js = require('xml2js');

var c = require('./appConfig.json');

function substituteSettings(settings, callback) {
	if(settings && settings.length > 0) {
		var dllConfigFilePath = c.testAssemblyPath+'.config';
		fs.readFile(dllConfigFilePath, function(err, xmlData) {
			xml2js.parseString(xmlData, function(err, xml) {
				var config = xml['configuration']['appSettings'][0]['add'];

				for(var setting of settings) {
					var obj = config.find(config_item => {
						return setting.name === config_item.$.key;
					});
					if(obj) {
						obj.$.value = setting.value;
					}
				}
				
				var xmlBuilder = new xml2js.Builder();
				fs.writeFile(dllConfigFilePath, xmlBuilder.buildObject(xml), function(err) {
					if(err) {
						return console.log(err);
					}
					callback();
				});
			});
		});
	} else {
		callback();
	}
}

module.exports.substituteSettings = substituteSettings;