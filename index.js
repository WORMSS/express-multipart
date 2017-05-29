const express = require("express");

const data = {};

loadImage("random")
.then(() => {
	const image = data.random;
	const width = 282;
	const height = 200;
	const app = express();
	
	app.all("/", base);
	app.get("/img", img);
	app.get("/clock.png", require("./timeimage")({ image, width, height,  }));
	
	app.listen(80, () => {
		console.log("server started");
	});
});

function base(req, res) {
	res.type("html").send(`root <a href="img">img page</a>`);
}

function img(req, res) {
	res.type("html").send(`<img src="clock.png">`);
}

function loadImage(name) {
	return new Promise((resolve, reject) => {
		require("fs").readFile(`${__dirname}/${name}.png`, (err, data) => err ? reject(err) : resolve(data));
	})
	.then(filedata => {
		data[name] = filedata;
	});
}