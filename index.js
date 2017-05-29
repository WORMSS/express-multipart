var express = require("express");


const multipartBoundary = "--326814d0-0061-4c2b-9ff4-154637b742bc";
const nl = "\r\n";

var app = express();
var data = {};

app.all("/", base);
app.get("/img", img);
app.get("/multi", multi);

loadImage("random")
.then(() => {
	app.listen(80, () => {
		console.log("server started");
	});
});

function canvasMe() {
	var width = 282;
	var height = 200;
	var canvas = new Canvas(width, height);
	var ctx = canvas.getContext("2d");
	var text = moment().format("h:mm:ss a");
	
	var img = data["random-ctx"];

	ctx.drawImage(img, 0, 0);
	ctx.font = "15px Arial bold";
	ctx.textAlign = "right";
	
	ctx.fillStyle = "white";
	ctx.strokeStyle = "black"; 
	ctx.strokeText(text, width - 3, height - 5);
	ctx.fillText(text, width - 3, height - 5);
	return canvas.toBuffer();
}

function base(req, res) {
	res.type("html").send(`root <a href="img">img page</a>`);
}

function img(req, res) {
	res.type("html").send(`<img src="multi">`);
}

function multi(req, res) {
	res.writeHead(200, {
		'Cache-Control': 'no-cache, private',
		'Connection': 'Close',
		'Expires': '0',
		'Pragma': 'no-cache',
		'Content-Type': `multipart/x-mixed-replace; boundary=${multipartBoundary}`
	});

	step(true);
	var abort = false;
	
	req.on("aborted", () => {
		abort = true;
		console.log("abort");
	});
	
	function step(first) {
		filedata = canvasMe();
		if ( first ) {
			res.write(`Content-Type: image/png` + nl);
			res.write(`Content-Length: ${filedata.length}` + nl);
			res.write(nl);
			first = false;
		}
		
		res.write(filedata);
		res.write(nl + multipartBoundary + nl + nl, () => {
			if ( abort ) return;
			setTimeout(step, 1000);
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