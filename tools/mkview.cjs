// node mkview.cjs <tmpl.html> <viewer.bundle.js> <out.html>
const fs = require('fs');
const [, , tmpl, bundle, out] = process.argv;
const t = fs.readFileSync(tmpl, 'utf8'), b = fs.readFileSync(bundle, 'utf8').split('</script').join('<\\/script');
fs.writeFileSync(out, t.replace('__BUNDLE__', () => b)); console.log('viewer bytes', fs.statSync(out).size);
