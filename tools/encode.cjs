// node encode.cjs <frames dir> <out.mp4> <frame count>
const puppeteer = require('puppeteer-core'), fs = require('fs'), path = require('path');
const { pathToFileURL } = require('url');
(async () => {
  const [, , dir, out, nArg] = process.argv, n = +nArg;
  for (let i = 0; i < n; i++) if (!fs.existsSync(path.join(dir, 'f' + String(i).padStart(5, '0') + '.jpg'))) throw new Error('missing frame ' + i);
  const b = await puppeteer.launch({ executablePath: process.env.BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new', protocolTimeout: 3600000,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-gpu-watchdog'] });
  const p = await b.newPage(); p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto(pathToFileURL(path.resolve(__dirname, 'encode.html')).href); await p.waitForFunction('window.ready');
  if (!(await p.evaluate(() => window.start()))) throw new Error('H.264 encoder not available');
  for (let i = 0; i < n; i++) {
    const b64 = fs.readFileSync(path.join(dir, 'f' + String(i).padStart(5, '0') + '.jpg')).toString('base64');
    await p.evaluate(x => window.add(x), b64); if (i % 250 === 0) console.log('encoded', i);
  }
  const r = await p.evaluate(() => window.finish());
  fs.writeFileSync(out, Buffer.from(r.data, 'base64')); console.log('WROTE', out, (fs.statSync(out).size / 1e6).toFixed(1), 'MB frames', r.frames, 'error', r.err);
  await b.close();
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
