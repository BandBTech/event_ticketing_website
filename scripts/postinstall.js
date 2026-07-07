const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/next/dist/client/components/router-reducer/fetch-server-response.js',
  'node_modules/next/dist/esm/client/components/router-reducer/fetch-server-response.js',
];

const oldBlock = `        return {
            flightData: url.toString(),
            canonicalUrl: undefined,
            couldBeIntercepted: false,
            prerendered: false,
            postponed: false,
            staleTime: -1
        };`;

const newBlock = `        return doMpaNavigation(url.toString());`;

let patched = 0;
for (const file of files) {
  const fp = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(fp)) {
    console.log(`[postinstall] SKIP: ${file} not found`);
    continue;
  }
  const content = fs.readFileSync(fp, 'utf8');
  if (!content.includes(oldBlock)) {
    console.log(`[postinstall] SKIP: ${file} already patched or pattern not found`);
    continue;
  }
  const updated = content.replace(oldBlock, newBlock);
  fs.writeFileSync(fp, updated, 'utf8');
  console.log(`[postinstall] PATCHED: ${file}`);
  patched++;
}

if (patched === 0) {
  console.log('[postinstall] No files needed patching');
} else {
  console.log(`[postinstall] Patched ${patched} file(s) - RSC .txt navigation fix applied`);
}
