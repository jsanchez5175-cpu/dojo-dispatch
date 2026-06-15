// Swaps the SenseiTab function in src/app/page.tsx with the one in newsensei.txt
// Run from your project root:  node swap_sensei.js
const fs = require('fs');
const path = require('path');

const PAGE = path.join('src', 'app', 'page.tsx');
const NEW  = 'newsensei.txt';

if (!fs.existsSync(PAGE)) {
  console.error('ERROR: src/app/page.tsx not found. Run this from your project root (C:\\Users\\jsanc\\dojo-dispatch).');
  process.exit(1);
}
if (!fs.existsSync(NEW)) {
  console.error('ERROR: newsensei.txt not found. Put it in the project root next to this script.');
  process.exit(1);
}

const src = fs.readFileSync(PAGE, 'utf8');
const newFn = fs.readFileSync(NEW, 'utf8').replace(/\s+$/, '') + '\n';

const start = src.indexOf('function SenseiTab() {');
if (start === -1) { console.error('ERROR: could not find "function SenseiTab() {" in page.tsx'); process.exit(1); }

const end = src.indexOf('function MetaTab()', start);
if (end === -1) { console.error('ERROR: could not find "function MetaTab()" after SenseiTab'); process.exit(1); }

fs.copyFileSync(PAGE, PAGE + '.bak');

const before = src.slice(0, start);
const after  = src.slice(end);
const result = before + newFn + '\n' + after;
fs.writeFileSync(PAGE, result, 'utf8');
console.log('SUCCESS: SenseiTab replaced. Backup saved as page.tsx.bak');
