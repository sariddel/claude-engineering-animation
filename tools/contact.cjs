// Contact sheet from film frames, no browser: node contact.cjs <frames dir> <out.png> <cols> <cellW> <t1,t2,...> [fps=25]
// Each cell is the film frame at that time (caption bar included), box-downscaled; thin rules between cells.
const fs = require('fs'), path = require('path'), jpeg = require('jpeg-js'), { PNG } = require('pngjs');
const [, , dir, out, colsA, cellA, times, fpsA] = process.argv, cols = +colsA, cw = +cellA, fps = +(fpsA || 25);
const T = times.split(',').map(Number), rows = Math.ceil(T.length / cols), SW = 1280, SH = 720, ch = Math.round(cw * SH / SW), gap = 10, m = 16;
const W = m * 2 + cols * cw + (cols - 1) * gap, H = m * 2 + rows * ch + (rows - 1) * gap;
const png = new PNG({ width: W, height: H }); png.data.fill(255);
T.forEach((t, k) => {
  const f = path.join(dir, 'f' + String(Math.round(t * fps)).padStart(5, '0') + '.jpg'), img = jpeg.decode(fs.readFileSync(f), { useTArray: true });
  const ox = m + (k % cols) * (cw + gap), oy = m + Math.floor(k / cols) * (ch + gap), sx = img.width / cw, sy = img.height / ch;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    let r = 0, g = 0, b = 0, n = 0;
    for (let yy = Math.floor(y * sy); yy < Math.floor((y + 1) * sy); yy++) for (let xx = Math.floor(x * sx); xx < Math.floor((x + 1) * sx); xx++) { const i = (yy * img.width + xx) * 4; r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; n++; }
    const o = ((oy + y) * W + ox + x) * 4; png.data[o] = r / n; png.data[o + 1] = g / n; png.data[o + 2] = b / n; png.data[o + 3] = 255;
  }
  for (let x = -1; x <= cw; x++) for (const y of [-1, ch]) { const o = ((oy + y) * W + ox + x) * 4; png.data[o] = png.data[o + 1] = png.data[o + 2] = 201; }
  for (let y = -1; y <= ch; y++) for (const x of [-1, cw]) { const o = ((oy + y) * W + ox + x) * 4; png.data[o] = png.data[o + 1] = png.data[o + 2] = 201; }
});
fs.writeFileSync(out, PNG.sync.write(png)); console.log('contact sheet', out, W + 'x' + H);
