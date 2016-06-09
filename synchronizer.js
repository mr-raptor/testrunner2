var parseXml = require('xml2js').parseString;
var fs = require('fs');

var c = require('./appConfig.json');
var Executor = require('./Executor');
var getPath = require('./util').getPath;
var selector = require('./public/js/selector');

module.exports.synchronize = function(config, callback) {
	exploreDLL(function() {
		parseTests(function(data) {
			syncFile(config, data, callback);
		});
	});
}

function exploreDLL(callback) {
	new Executor({
		program: getPath(c.nunitApp),
		args: {
			input: getPath(c.testAssemblyPath),
			output: "-explore="+c.exploredTests
		},
		successAction: function() {
			callback();
		}
	});
}

function parseTests(callback) {
	fs.readFile(c.exploredTests, function(err, data) {
		parseXml(data, function(err, result) {
			callback(result["test-run"]["test-suite"][0]);
		});
	});
}

function syncFile(config, parsedData, callback) {
	// if config is new
	if(config.data === undefined)
		config.data = {};
	else
		config.data = JSON.parse(config.data);
	
	config.data.testTree = synchronizeTestTree(config.data.testTree, parsedData);
	callback(config);
}

function synchronizeTestTree(oldTree, newTree) {
	var testTree = newTree;
	selector.browseTree(testTree, function(test) {
		selector.searchTest(oldTree, test.$.fullname, "fullname", function(oldTest) {
			test.$.checked = oldTest.$.checked;
		});
	});
	return testTree;
}