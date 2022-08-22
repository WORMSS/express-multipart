const Canvas = require('canvas-prebuilt');
const moment = require('moment');

const Image = Canvas.Image;
const multipartBoundary = '--326814d0-0061-4c2b-9ff4-154637b742bc';
const nl = '\r\n';
const a = EOL;

module.exports = middleware;

function middleware({ image, width, height }) {
  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');
  let buffer = null;
  let sInterval = 0;

  const img = new Image();
  img.src = image;

  ctx.font = '15px Arial bold';
  ctx.textAlign = 'right';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';

  const list = new Set();

  function register(res) {
    const len = list.size;
    if (len == 0) {
      draw();
    }
    init(res, () => console.log('init flushed'));
    send(res, () => console.log('first send'));

    console.log('registered');
    list.add(res);
    if (len == 0) {
      console.log('start interval');
      sInterval = setInterval(sendLoop, 1000);
    }
  }

  function init(res, cb) {
    res.writeHead(200, {
      'X-Accel-Buffering': 'no',
      'Cache-Control': 'no-cache, private',
      Connection: 'Close',
      Expires: '0',
      Pragma: 'no-cache',
      'Content-Type': `multipart/x-mixed-replace; boundary=${multipartBoundary}`,
    });
    res.write(`Content-Type: image/png` + nl);
    res.write(`Content-Length: ${buffer.length}` + nl + nl, cb);
  }

  function sendLoop() {
    draw();
    for (let res of list) {
      send(res, () => console.log('loop flushed'));
    }
  }

  function send(res, cb) {
    res.write(buffer);
    res.write(nl + multipartBoundary + nl + nl, cb);
  }

  function draw() {
    const text = moment().format('h:mm:ss a');
    ctx.drawImage(img, 0, 0, width, height);
    ctx.strokeText(text, width - 3, height - 5);
    ctx.fillText(text, width - 3, height - 5);
    buffer = canvas.toBuffer();
  }

  function unregister(res) {
    console.log('unregistered');
    list.delete(res);
    const len = list.size;
    if (len <= 0) {
      clearInterval(sInterval);
    }
  }

  return function (req, res) {
    register(res);
    req.on('aborted', () => unregister(res));
  };
}
