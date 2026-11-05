// Bundles a browser entry (film, viewer or stills) with esbuild.
// usage: node tools/build.mjs <entry.js> <out.bundle.js>
// Optional assets, not in the public repo:
//   fonts/Azonix.otf          the logo wordmark font (licence your own copy); without it the wordmark uses Bahnschrift
//   scene/sled75_cad.bin      SpaceDIRT's SLED75 CAD mesh; without it a placeholder rover of the same size is drawn
import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [, , entry, out] = process.argv;
const empty = path.join(root, 'assets', 'empty.bin');
const font = path.join(root, 'fonts', 'Azonix.otf');
const optional = {
  name: 'optional-assets',
  setup(b) {
    b.onResolve({ filter: /^azonix-font$/ }, () => ({ path: fs.existsSync(font) ? font : empty }));
    b.onResolve({ filter: /sled75_cad\.bin$/ }, a => { const p = path.join(a.resolveDir, a.path); return { path: fs.existsSync(p) ? p : empty }; });
  },
};
await esbuild.build({
  entryPoints: [entry], bundle: true, outfile: out, format: 'iife', target: 'es2020', minify: true, legalComments: 'none',
  nodePaths: [path.join(root, 'node_modules')], loader: { '.bin': 'binary', '.otf': 'binary' }, plugins: [optional], logLevel: 'warning',
});
console.log('built', out);
