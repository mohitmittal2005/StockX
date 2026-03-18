const fs = require('fs');

const html = fs.readFileSync('home.html', 'utf8');

const styleRegex = /<style>([\s\S]*?)<\/style>/i;
const scriptRegex = /<script>([\s\S]*?)<\/script>/i;

const cssMatch = html.match(styleRegex);
if (cssMatch) {
  fs.writeFileSync('style.css', cssMatch[1].trim());
}

const jsMatch = html.match(scriptRegex);
if (jsMatch) {
  fs.writeFileSync('raw.js', jsMatch[1].trim());
}

const finalHtml = html
  .replace(styleRegex, '<link rel="stylesheet" href="style.css">')
  .replace(scriptRegex, `
  <script src="api.js"></script>
  <script src="chart.js"></script>
  <script src="ui.js"></script>
  <script src="app.js"></script>
  `);

fs.writeFileSync('index.html', finalHtml);
console.log('done splitting HTML');
