// Run this while developing: node dev-server.js
// Extension auto-reloads within ~1 second of any file change.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9988;
let version = Date.now();

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify({ version }));
});

server.listen(PORT, () => {
  console.log(`\n Chingu dev server on http://localhost:${PORT}`);
  console.log(` Watching for file changes...\n`);
});

const WATCH_EXTS = new Set(['.js', '.html', '.css', '.json']);
let debounce;

fs.watch(__dirname, { recursive: true }, (event, filename) => {
  if (!filename) return;
  if (!WATCH_EXTS.has(path.extname(filename))) return;
  if (filename.startsWith('.') || filename === 'dev-server.js') return;

  clearTimeout(debounce);
  debounce = setTimeout(() => {
    version = Date.now();
    console.log(` ${filename} changed -> reloading extension...`);
  }, 200);
});
