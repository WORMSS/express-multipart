const express = require('express');
const path = require('path');
const fs = require('fs');
const timeimage = require('./timeimage');

const data = {
  random: fs.readFileSync(path.join(__dirname, 'random.png')),
};

const image = data.random;
const width = 282;
const height = 200;
const app = express();

app.all('/', base);
app.get('/img', img);
app.get('/clock.png', timeimage({ image, width, height }));

app.listen(3000, () => {
  console.log('server started');
});

function base(req, res) {
  res.type('html').send(`root <a href="img">img</a>`);
}

function img(req, res) {
  res.type('html').send(`<img src="clock.png">`);
}
