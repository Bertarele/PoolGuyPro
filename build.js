#!/usr/bin/env node
'use strict';
/**
 * PoolGuyPro build script
 * Compiles all .jsx files → plain .js (React.createElement calls)
 * Generates dist/ with:
 *   - Compiled JS files (no Babel needed at runtime)
 *   - Patched index.html (Babel removed, scripts reference .js)
 *   - All static assets copied
 *
 * Run: node build.js
 * Vercel runs this automatically before deployment.
 */

const babel = require('@babel/core');
const fs    = require('fs');
const path  = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// ── JSX source files (order matters — dependencies first) ──────
const JSX_FILES = [
  'ios-frame.jsx',
  'tweaks-panel.jsx',
  'components.jsx',
  'brand.jsx',
  'data.jsx',
  'screens/login.jsx',
  'screens/home.jsx',
  'screens/marketplace.jsx',
  'screens/quickpools.jsx',
  'screens/post.jsx',
  'screens/work.jsx',
  'screens/profile.jsx',
  'screens/overlays.jsx',
  'app.jsx',
];

// ── Static files to copy as-is ─────────────────────────────────
const STATIC_GLOBS = [
  'tokens.css',
  'logo.png',
  'pgx-logo.png',
  'admin.html',
  'sw.js',
  'manifest.json',
];

// ── Babel config: JSX → React.createElement ───────────────────
const BABEL_OPTS = {
  plugins: [[
    '@babel/plugin-transform-react-jsx',
    { pragma: 'React.createElement', pragmaFrag: 'React.Fragment' },
  ]],
  parserOpts: { allowReturnOutsideFunction: true, allowSuperOutsideMethod: true },
  compact: false,
};

// ── Setup dist directory ───────────────────────────────────────
fs.mkdirSync(DIST, { recursive: true });
fs.mkdirSync(path.join(DIST, 'screens'), { recursive: true });

// ── Compile JSX files ──────────────────────────────────────────
let compiled = 0, errors = 0;
console.log('\n📦 Compiling JSX → JS...');

for (const file of JSX_FILES) {
  const srcPath = path.join(ROOT, file);
  const outFile = file.replace(/\.jsx$/, '.js');
  const outPath = path.join(DIST, outFile);

  try {
    const src  = fs.readFileSync(srcPath, 'utf8');
    const { code } = babel.transformSync(src, { ...BABEL_OPTS, filename: file });
    fs.writeFileSync(outPath, code, 'utf8');
    console.log(`  ✓ ${file}`);
    compiled++;
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`);
    errors++;
    process.exitCode = 1;
  }
}

// ── Copy static assets ─────────────────────────────────────────
console.log('\n📂 Copying static assets...');
for (const file of STATIC_GLOBS) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST, path.basename(file)));
    console.log(`  ✓ ${file}`);
  }
}

// Copy memory/ dir if present
const memDir = path.join(ROOT, 'memory');
if (fs.existsSync(memDir)) {
  const memDist = path.join(DIST, 'memory');
  fs.mkdirSync(memDist, { recursive: true });
  fs.readdirSync(memDir).forEach(f => {
    fs.copyFileSync(path.join(memDir, f), path.join(memDist, f));
  });
}

// Copy any PNG/JPG/SVG/ICO images in root (always overwrite to pick up new/updated images)
fs.readdirSync(ROOT).filter(f => /\.(png|jpg|jpeg|svg|ico|webp)$/i.test(f)).forEach(f => {
  fs.copyFileSync(path.join(ROOT, f), path.join(DIST, f));
});

// ── Generate dist/index.html ───────────────────────────────────
console.log('\n📄 Generating dist/index.html...');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// 1. Remove Babel preload hint
html = html.replace(
  /\s*<link rel="preload" href="[^"]*babel[^"]*"[^>]*>\s*/gi,
  '\n'
);

// 2. Remove Babel script tag (CDN)
//    Use [^>]* instead of [^/]* so the integrity SHA (which contains '/') doesn't break the match
html = html.replace(
  /\s*<script[^>]*src="[^"]*babel\.min\.js[^"]*"[^>]*><\/script>\s*/gi,
  '\n'
);

// 3. Remove the Babel compile-cache IIFE block
//    Anchored on the unique opening line: (function() {\n    if (!window.Babel)
//    Uses a negative lookahead to never cross a </script> boundary — prevents
//    accidentally eating the Supabase SDK or React CDN scripts that also use IIFEs.
const babelCacheRx = /\s*<script>\s*\(function\(\)\s*\{\s*if\s*\(!window\.Babel\)(?:(?!<\/script>)[\s\S])*?<\/script>/g;
html = html.replace(babelCacheRx, '');

// 4. Convert type="text/babel" script tags → plain <script src="...js?v=BUILD_VER">
//    Build version is a short timestamp hash so each deploy gets a unique URL,
//    breaking browser immutable cache from previous deploys automatically.
//    e.g. <script type="text/babel" src="screens/overlays.jsx?v=133">
//      →  <script src="screens/overlays.js?v=1x2y3z4"></script>
const BUILD_VER = Date.now().toString(36); // e.g. "lx4k2j9" — unique per build

// 4a. Also bust the CSS cache with the same version hash
html = html.replace(
  /(<link\s+rel="stylesheet"\s+href="tokens\.css)(?:\?[^"]*)?(")/g,
  `$1?v=${BUILD_VER}$2`
);

html = html.replace(
  /<script\s+type="text\/babel"\s+src="([^"?]+)\.jsx(?:\?[^"]*)?"\s*><\/script>/g,
  (_, file) => `<script src="${file}.js?v=${BUILD_VER}"></script>`
);

fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');
console.log('  ✓ index.html (Babel removed, .jsx → .js)');

// ── Summary ────────────────────────────────────────────────────
console.log(`\n✅ Build complete: ${compiled} compiled, ${errors} errors\n`);
if (errors) {
  console.error('Build had errors — check output above.');
  process.exit(1);
}
