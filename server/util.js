module.exports = {
	getPath: function(value) {
		return "\"" + value + "\"";
	},
	timeText: function() {
		return "["+(new Date()).toTimeString().substr(0,8)+"]";
	}
}