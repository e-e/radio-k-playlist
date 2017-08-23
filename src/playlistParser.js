const cheerio = require("cheerio");

function to24hour(t) {
	t = t.trim();
	let pm = false;
	if (t.replace(/pm$/, "").length < t.length) {
		let parts = t.split(":");
		let hour = parseInt(parts[0], 10);
		hour += 12;
		parts[0] = hour.toString();
		t = parts.join(":");
	}
	t = t.replace(/\s*(pm|am)$/, "");
	return t;
}

function parseSongData($, $song) {
	let data = {
		time: to24hour($(".time", $song).text()),
		artist: $("span strong", $song).text().trim(),
		name: $("span", $song).contents().last().text(),
		album: $("em", $song).text().trim(),
	};
	return data;
}
function getSongs(html) {
	// console.log("html", html);
	let $ = cheerio.load(html);
	let $songs = $(".songblock");
	let data = [];
	$songs.each((index, song) => {
		let $song = $(song);
		data.push(parseSongData($, $song));
	});
	return data;
}


module.exports ={
	getSongs,
}