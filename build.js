/**
 * Chingu production build script.
 * Run: node build.js
 * Output: chingu-v<version>.zip  (ready to upload to Chrome Web Store)
 *
 * Strips:
 *  - localhost host_permissions from manifest.json
 *  - Dev auto-reload polling from background.js
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// Files/folders to include in the zip (relative to ROOT)
const INCLUDE = [
  'manifest.json',
  'background.js',
  'content.js',
  'autopilot.js',
  'polish.js',
  'popup.html',
  'popup.js',
  'viewer.html',
  'viewer.js',
  'icons',
  'illustrations',
  'lib',
];

// Clean dist
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
fs.mkdirSync(DIST, { recursive: true });

// ── Copy files ────────────────────────────────────────────────────────────────
function copyItem(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyItem(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

for (const item of INCLUDE) {
  const src  = path.join(ROOT, item);
  const dest = path.join(DIST, item);
  if (fs.existsSync(src)) {
    copyItem(src, dest);
    console.log(`  copied  ${item}`);
  } else {
    console.warn(`  MISSING ${item} — skipped`);
  }
}

// ── Patch manifest.json — remove localhost host_permissions ───────────────────
const manifestPath = path.join(DIST, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.host_permissions) {
  manifest.host_permissions = manifest.host_permissions.filter(
    hp => !hp.includes('localhost')
  );
  if (manifest.host_permissions.length === 0) {
    delete manifest.host_permissions;
  }
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('  patched manifest.json (removed localhost)');

// ── Patch background.js — strip dev auto-reload block ────────────────────────
const bgPath = path.join(DIST, 'background.js');
let bgSrc = fs.readFileSync(bgPath, 'utf8');

// Remove the dev reload block (between the two comment markers)
bgSrc = bgSrc.replace(
  /\/\/ Dev auto-reload[\s\S]*?setInterval\(_devPoll, 1000\);\n?/,
  ''
);

fs.writeFileSync(bgPath, bgSrc);
console.log('  patched background.js (removed dev auto-reload)');

// ── Zip ───────────────────────────────────────────────────────────────────────
const version = manifest.version || '0.0.0';
const zipName = `chingu-v${version}.zip`;
const zipPath = path.join(ROOT, zipName);

if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

// Use PowerShell Compress-Archive (Windows built-in)
execSync(
  `powershell -Command "Compress-Archive -Path '${DIST}\\*' -DestinationPath '${zipPath}'"`,
  { stdio: 'inherit' }
);

console.log(`\n✓ Built: ${zipName}`);
console.log(`  Upload this to: https://chrome.google.com/webstore/devconsole/`);
