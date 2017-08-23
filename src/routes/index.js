const fs = require('fs');
const path = require('path');

const config = require("../../config");

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	fs.readFile(path.join(config.basePath, './views/index.html'), 'utf8', (err, html) => {
		if (err) throw err;
		else {
			res.send(html);
		}
	});
});

module.exports = router;