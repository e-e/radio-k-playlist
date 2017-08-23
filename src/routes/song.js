const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const utils = require('../utils');
const playlistParser = require('../playlistParser');
const config = require('../../config');
const Result = require("../Result");

const jsonParser = bodyParser.json();
const songCachePath = path.join(config.basepath, './cache/songs.json');
const router = express.Router();


router.get('/:name/:artist/:album', (req, res) => {
	utils.log(`getting song info for [${req.params.name} - ${req.params.artist} - ${req.params.album}]`);

	let uri = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${config.youtubeAPIKey}&q=${encodeURIComponent(`${req.params.name} ${req.params.artist} ${req.params.album}`)}`;
	let songKey = utils.getSongHash(req.params.name, req.params.artist, req.params.album);
	let song = {
		song: {
			name: req.params.name,
			artist: req.params.artist,
			album: req.params.album
		},
		video: {},
		// save the index taht we are saving so we can ask to try again, getting the next result
		index: 0,
	};


	// check if song is cached
	fs.readFile(songCachePath, "utf8", (err, data) => {
		if (err) {
			throw err;
			return;
		}

		let songs = JSON.parse(data);

		if (songs.hasOwnProperty(songKey)) {
			return res.json(songs[songKey].video);
		}
		// otherwise, get the info from youtube
		request(uri, (err, response, body) => {
			if (err) {
				utils.log(err);
				return;
			}
			let data = JSON.parse(body);
			song.video = data.items[0];
			res.json(song.video);
			songs[songKey] = song;
			fs.writeFile(songCachePath, JSON.stringify(songs), "utf8", (err) => {
				if (err) {
					utils.log(`Trouble writing cache file for [${req.params.name} - ${req.params.artist} - ${req.params.album}]`);
					return;
				}
				utils.log(`Wrote cache for [${req.params.name} - ${req.params.artist} - ${req.params.album}]`);
			});
		});

	});
	
});

module.exports = router;