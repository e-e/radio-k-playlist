const crypto = require("crypto");
const config = require('../config');
function getDate() {
	let today = new Date();
	return `${today.getMonth() + 1}_${today.getDate()}_${today.getFullYear()}`;
}

function getSongHash(name, artist, album) {
	return crypto.createHash('md5').update(`${name}${artist}${album}`).digest('hex');
}

function log() {
	if (config.debug) {
		console.log.apply(null, arguments);
	}
}

module.exports = {
	getDate,
	getSongHash,
	log
};