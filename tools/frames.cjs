// Resumable frame render: node frames.cjs <dir> [fps=25] [tEnd=T_END]. Writes f00000.jpg ... and skips frames already on disk.
// Relaunches the browser after a crash and carries on from the next missing frame.
const puppeteer = require('puppeteer-core'), fs = require('fs'), path = require('path');
const { pathToFileURL } = require('url');
const [, , dir, fpsArg, tEndArg] = process.argv, FPS = +(fpsArg || 25);
fs.mkdirSync(dir, { recursive: true });
const ARGS = ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-gpu-watchdog', '--disable-hang-monitor', '--disable-gpu-process-crash-limit'];
const name = i => path.join(dir, 'f' + String(i).padStart(5, '0') + '.jpg');
async function pass() {
  const b = await puppeteer.launch({ executablePath: process.env.BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new', protocolTimeout: 600000, args: ARGS });
  try {
    const p = await b.newPage(); await p.setViewport({ width: 1280, height: 720 });
    p.on('pageerror', e => console.log('PAGEERROR', e.message));
    await p.goto(pathToFileURL(path.resolve(__dirname, 'film.html')).href);
    await p.waitForFunction('window.ready', { timeout: 180000 });
    const tEnd = tEndArg ? +tEndArg : await p.evaluate(() => window.T_END || 89), n = Math.round(tEnd * FPS), t0 = Date.now(); let done = 0;
    for (let i = 0; i < n; i++) {
      if (fs.existsSync(name(i))) continue;
      const d = await p.evaluate((t) => window.frameAt(t, 'image/jpeg', 0.95), i / FPS);
      fs.writeFileSync(name(i), Buffer.from(d.split(',')[1], 'base64')); done++;
      if (i % 50 === 0) console.log(`${i}/${n} ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    return n;
  } finally { await b.close().catch(() => {}); }
}
(async () => {
  const crashes = [];
  for (let attempt = 1; attempt <= 40; attempt++) {
    try { const n = await pass(); console.log('ALLDONE', n); return; }
    catch (e) {
      const now = Date.now(); crashes.push(now); const recent = crashes.filter(c => now - c < 600000).length;
      console.log('CRASH', attempt, 'recent', recent, new Date(now).toTimeString().slice(0, 8), e.message.slice(0, 120));
      if (recent > 3) { console.log('STOP more than 3 browser losses in 10 min'); process.exit(3); }
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.log('GAVEUP');
})();
