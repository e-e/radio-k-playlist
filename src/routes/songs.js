const fs = require('fs');
const path = require('path');
const http = require('http');

const express = require('express');

const utils = require('../utils');
const playlistParser = require('../playlistParser');
const config = require('../../config');


const router = express.Router();


// http://www.radiok.org/playlist/?date=06%2F15%2F2016
// scrape songs from radio-k playlist page for given date
router.get('/:date', (req, res) => {
	let options = {
		host: 'www.radiok.org',
		path: `/playlist/?date=${req.params.date.replace(/_/g, '%2F')}`
	};
	let today = utils.getDate();
	let cachePath = path.join(config.basepath, `./cache/${req.params.date}.json`);

	if (req.params.date === today) {
		utils.log('is today');
		http.get(options, function(http_res) {
			let data = '';
			http_res.on('data', function(chunk) {
				data += chunk;
			});
			http_res.on('end', function() {
				let songs = playlistParser.songs(data);
				res.json(songs);
			});
		});
	} else {
		utils.log('not today');
		fs.stat(cachePath, function(err, state) {
			// file exists
			if (err == null) {
				utils.log('cache file exists');
				fs.readFile(cachePath, 'utf8', function(err, contents) {
					utils.log('read cache file: ', cachePath);
					if (err) throw err;
					contents = JSON.parse(contents);
					res.json(contents);
				});
			// file does not exist
			} else if (err.code == 'ENOENT') {
				utils.log('cache file does not exist');
				http.get(options, function(http_res) {
					utils.log('got page');
					let data = '';
					http_res.on('data', function(chunk) {
						data += chunk;
					});
					http_res.on('end', function() {
						let songs = playlistParser.songs(data);
						// songs = songs.filter(song => song.time.trim().length);
						utils.log('writing cache file');
						fs.writeFile(cachePath, JSON.stringify(songs), 'utf8', function(err) {
							utils.log('wrote cache file');
							utils.log(`cached data for ${req.params.date.replace(/_/g, '/')}`);
							res.json(songs);
						});
					});
				});
			}
		});
	}	
});


module.exports = router;