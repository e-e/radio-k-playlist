/*todo

*/

const http = require('http');
const path = require('path');
const fs = require('fs');

const express = require('express');

const utils = require('./src/utils');
const config = require('./config');

const app = express();
const routes = {
	songs: require('./src/routes/songs'),
	song: require('./src/routes/song'),
	index: require('./src/routes/index'),
};


// app.use('/assets', express.static(path.join(__dirname, './assets')));
app.use('/radio-k/assets', express.static(path.join(__dirname, './assets')));

// routes
app.use('/songs', routes.songs);
app.use('/song', routes.song);
app.use('/', routes.index);

function start() {
	app.listen(config.port, () => utils.log(`listening on http://localhost:${config.port}/`));
}

// make sure we have a cache file for song data
fs.stat('./cache/songs.json', function(err, stats) {
	if (!err) {
		start();
	// file does not exist
	} else if (err.code == 'ENOENT') {
		fs.writeFile('./cache/songs.json', '{}', 'utf8', (err) => {
			if (err) {
				utils.log(err);
				return;
			}
			start();
		});
	}
});
