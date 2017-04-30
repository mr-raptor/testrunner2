const fs = require('fs');

const c = require('../../server/appConfig');
const Executor = require('../../server/Executor');

const BACKUP_FOLDER = "./backups";

function backupDataBase() {
	createNewBackup();
	cleanOldBackups();
}

function createNewBackup() {
	let now = new Date();
	let prettyTimestamp = (now.toDateString()+" "+now.toTimeString().substr(0,8)).replace(/[\s:]/g, "-");
	let backupPath = `${BACKUP_FOLDER}/dump_${prettyTimestamp}`;
	new Executor({
		program: "mongodump",
		args: {
			database: "--db testrunner",
			gzip: "--gzip",
			output: "--out "+backupPath
		},
		successAction: function() {
			console.log("Backup has been created on path: "+backupPath);
		}
	});
}

function cleanOldBackups() {
	getOldBackups(backups => {
		backups.forEach(backup => {
			deleteBackup(backup);
		})
	})
}

function getOldBackups(callback) {
	fs.readdir(BACKUP_FOLDER, (err, files) => {
		if(err) return console.log(err);

		files.map(filename => {
			fs.stat(`${BACKUP_FOLDER}/${filename}`)
		})
	})
}

module.exports = backupDataBase;