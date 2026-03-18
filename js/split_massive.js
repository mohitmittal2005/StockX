const fs = require('fs');

const html = fs.readFileSync('home.html', 'utf8');

const jsMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
if (!jsMatch) {
  console.log('No script found');
  process.exit(1);
}

const fullJs = jsMatch[1];

// We will manually specify the line ranges to split it perfectly as requested
const lines = fullJs.split('\n');

function writeLines(start, end, filename) {
  const content = lines.slice(start, end).join('\n');
  fs.writeFileSync('js/' + filename, content.trim() + '\n');
  console.log('Wrote', filename);
}

// Ensure js directory exists
if (!fs.existsSync('js')) fs.mkdirSync('js');

// config.js (API keys, Config, Sim data, STOCK DB)
// Let's extract STOCK_DB and put it in config.js
const stockDbStart = lines.findIndex(l => l.includes('const STOCK_DB = ['));
const stockDbEnd = lines.findIndex((l, i) => i > stockDbStart && l.trim() === '];') + 1;
const stockDbLines = lines.slice(stockDbStart, stockDbEnd);

// Clear out STOCK_DB from original lines
for (let i = stockDbStart; i < stockDbEnd; i++) lines[i] = '';

let configJs = lines.slice(6, 52).join('\n') + '\n' + stockDbLines.join('\n');
fs.writeFileSync('js/config.js', configJs.trim() + '\n');

// api.js (Data engine, WebSocket, Fetch quotes)
// Starts from 66 or so // ── API Key ──
const apiStart = lines.findIndex(l => l.includes('// ── API Key ──'));
const apiEnd = lines.findIndex(l => l.includes('// ── UI Updates ──'));
writeLines(apiStart, apiEnd, 'api.js');

// ui.js (UI Updates, charts, portfolio, watchlist, flash price)
const uiStart = apiEnd;
const uiEnd = lines.findIndex(l => l.includes('// ── Nav ──'));
writeLines(uiStart, uiEnd, 'ui.js');

// search.js (Nav, search, history)
const searchStart = uiEnd;
const searchEnd = lines.findIndex(l => l.includes('//  STOCK DETAIL VIEW '));
writeLines(searchStart, searchEnd, 'search.js');

// stock-detail.js
const sdStart = searchEnd;
const sdEnd = lines.findIndex(l => l.includes('//  PAPER TRADING ENGINE'));
writeLines(sdStart, sdEnd, 'stock-detail.js');

// paper-trading.js 
const ptStart = sdEnd;
const ptEnd = lines.findIndex(l => l.includes('//  PROFILE PAGE'));
writeLines(ptStart, ptEnd, 'paper-trading.js');

// profile.js
const profStart = ptEnd;
const profEnd = lines.length;
writeLines(profStart, profEnd, 'profile.js');

// app.js (Init and Window onLoad)
const appStart = lines.findIndex(l => l.includes('// ── Init ──'));
const appEnd = apiStart;
writeLines(appStart, appEnd, 'app.js');

// Now update home.html
const newHtml = html
  .replace(/<style>[\s\S]*?<\/style>/i, `
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/stock-detail.css">
  <link rel="stylesheet" href="css/profile.css">
  `)
  .replace(/<script>[\s\S]*?<\/script>/i, `
  <script src="js/config.js"></script>
  <script src="js/api.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/search.js"></script>
  <script src="js/stock-detail.js"></script>
  <script src="js/paper-trading.js"></script>
  <script src="js/profile.js"></script>
  <script src="js/app.js"></script>
  `);

fs.writeFileSync('home.html', newHtml);
console.log('Finished splitting all JS logic.');
