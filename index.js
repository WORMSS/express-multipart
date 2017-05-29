var express = require("express");
var canvas = require("canvas-prebuilt");

const multipartBoundary = "--326814d0-0061-4c2b-9ff4-154637b742bc";
const nl = "\r\n";

var app = express();
var data = {};

app.all("/", base);
app.get("/img", img);
app.get("/multi", multi);

loadImage("img1")
.then(() => loadImage("img2"))
.then(() => {
	app.listen(80, () => {
		console.log("server started");
	});
});


function base(req, res) {
	res.type("html").send(`root <a href="img">img page</a>`);
}

function img(req, res) {
	res.type("html").send(`Hello<br><img src="multi">`);
}

function multi(req, res) {
	res.type(`multipart/x-mixed-replace; boundary=${multipartBoundary}`);
	let first = true;
	step("img1");
	
	function step(name) {
		let filedata = data[name];
		if ( first ) {
			res.write(`Content-Type: image/png` + nl);
			res.write(`Content-Length: ${filedata.length}` + nl);
			res.write(nl);
			first = false;
		}
		
		res.write(filedata);
		res.write(nl + multipartBoundary + nl + nl, () => {
			setTimeout(step, 2000, name == "img1" ? "img2" : "img1");
		});
	}
}

function loadImage(name) {
	return new Promise((resolve, reject) => {
		require("fs").readFile(`./${name}.png`, (err, data) => err ? reject(err) : resolve(data));
	})
	.then(filedata => {
		data[name] = filedata;
	});
}