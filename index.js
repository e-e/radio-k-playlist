/*todo
	+	return song youtube info for songs that are cached
*/




const express = require("express");
const cheerio = require("cheerio");
const http = require("http");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const youtubeSongCachePath = path.join(__dirname, "./cache/songs.json");
const playlistParser = require("./lib/playlistParser");
const app = express();

app.use("/assets", express.static(path.join(__dirname, "./assets")), );


function getDate() {
	let today = new Date();
	return `${today.getMonth() + 1}_${today.getDate()}_${today.getFullYear()}`;
}

function getSongHash(name, artist, album) {
	return crypto.createHash('md5').update(`${name}${artist}${album}`).digest('hex');
}

// http://www.radiok.org/playlist/?date=06%2F15%2F2016
app.get("/songs/:date", (req, res) => {
	let options = {
		host: "www.radiok.org",
		path: `/playlist/?date=${req.params.date.replace(/_/g, "%2F")}`
	};
	let today = getDate();
	let isToday = req.params.date === today;
	let date = req.params.date;
	let cachePath = path.join(__dirname, `./cache/${date}.json`);

	if (isToday) {
		console.log("is today");
		http.get(options, function(http_res) {
			let data = "";
			http_res.on("data", function(chunk) {
				data += chunk;
			});
			http_res.on("end", function() {
				let songs = playlistParser.getSongs(data);
				res.json(songs);
			});
		});
	} else {
		console.log("not today");
		fs.stat(cachePath, function(err, state) {
			// file exists
			if (err == null) {
				console.log("cache file exists");
				fs.readFile(cachePath, "utf8", function(err, contents) {
					console.log("read cache file: ", cachePath);
					if (err) throw err;
					contents = JSON.parse(contents);
					res.json(contents);
				});
			// file does not exist
			} else if (err.code == "ENOENT") {
				console.log("cache file does not exist");
				http.get(options, function(http_res) {
					console.log("got page");
					let data = "";
					http_res.on("data", function(chunk) {
						data += chunk;
					});
					http_res.on("end", function() {
						let songs = playlistParser.getSongs(data);
						console.log("writing cache file");
						fs.writeFile(path.join(__dirname, `./cache/${date}.json`), JSON.stringify(songs), "utf8", function(err) {
							console.log("wrote cache file");
							console.log(`cached data for ${date.replace(/_/g, "/")}`);
							res.json(songs);
						});
					});
				});
			}
		});
	}	
});

app.get("/song/:name/:artist/:album", (req, res) => {
	res.send("");
});


// save song youtube info so we don't have to get it again
app.post("/song", jsonParser, (req, res) => {
	let result = {
		sent: false,
		success: true,
		message: "",
		data: null,
		done() {
			if (!this.sent) {
				this.sent = true;
				res.send({
					success: this.success,
					message: this.message,
					data: this.data,
				});
			}
		}
	};
	console.log("/song" , req.body);
	const key = getSongHash(req.body.song.name, req.body.song.artist, req.body.song.album);
	console.log("key: ", key);
	fs.readFile(youtubeSongCachePath, "utf8", function(err, json) {
		if (err) throw err;
		const data = JSON.parse(json);
		if (!data.hasOwnProperty(key)) {
			data[key] = req.body;
			fs.writeFile(youtubeSongCachePath, JSON.stringify(data), "utf8", function(err) {
				if (err) {
					result.success = false;
					result.message = err;
				}
				result.done();
			});
		} else {
			result.done();
		}
	});
	console.log("song hash: ", key);
});



app.get("/", (req, res) => {
	fs.readFile(path.join(__dirname, "./views/index.html"), "utf8", (err, html) => {
		if (err) throw err;
		else {
			res.send(html);
		}
	})
	
});

app.listen(8888, () => console.log("listening on http://localhost:8888/"));