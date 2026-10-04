// Builds the web app for https://salmanagwan.github.io/sahani-boutique/v2/
// Usage: node scripts/build-v2.js <output folder>
// It exports a single-page web build under the /sahani-boutique/v2 path, then gives it the
// home-screen head (title, icons, manifest, background) used by the live preview.
// app.json is changed only for the build and put back afterwards.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const out = path.resolve(process.argv[2] || 'dist-v2');
const root = path.resolve(__dirname, '..');
const appJsonPath = path.join(root, 'app.json');
const original = fs.readFileSync(appJsonPath, 'utf8');
const BASE = '/sahani-boutique/v2';

try {
  const cfg = JSON.parse(original);
  cfg.expo.web.output = 'single';
  cfg.expo.experiments.baseUrl = BASE;
  fs.writeFileSync(appJsonPath, JSON.stringify(cfg, null, 2));
  fs.rmSync(out, { recursive: true, force: true });
  execSync(`npx expo export -p web --clear --output-dir "${out}"`, { cwd: root, stdio: 'inherit', env: { ...process.env, CI: '1' } });
} finally {
  fs.writeFileSync(appJsonPath, original);
}

const head = `<link rel="icon" href="${BASE}/favicon.ico" /><meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="Sahani v2" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="theme-color" content="#FFFFFF" />
<link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png" />
<link rel="manifest" href="${BASE}/manifest.json" />
<style>html,body{background:#FFFFFF;overscroll-behavior:none;-webkit-tap-highlight-color:transparent}@media (min-width:520px){html,body{background:#F5F4F1}}</style>
`;
const indexPath = path.join(out, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />').replace(/<title>[^<]*<\/title>/, '<title>Sahani v2</title>').replace(/<link rel="icon"[^>]*>\s*/, '').replace('</head>', head + '</head>');
fs.writeFileSync(indexPath, html);

const manifest = {
  name: 'Sahani v2',
  short_name: 'Sahani v2',
  start_url: `${BASE}/`,
  scope: `${BASE}/`,
  display: 'standalone',
  background_color: '#FFFFFF',
  theme_color: '#FFFFFF',
  icons: [
    { src: `${BASE}/icon-192.png`, sizes: '192x192', type: 'image/png' },
    { src: `${BASE}/icon-512.png`, sizes: '512x512', type: 'image/png' },
  ],
};
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest));
console.log('Built', out);
