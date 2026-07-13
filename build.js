/**
 * Off-Chain Media — Build Script
 *
 * Usage:
 *   node build.js
 *
 * Output:
 *   dist/offchain-data.bundle.js  ← upload this to GitHub Pages
 *
 * What it does:
 *   - Bundles all src/ files via esbuild (fast, zero config)
 *   - Wraps in IIFE so no globals leak into Webflow's window
 *   - Outputs a single minified file ready for <script src="">
 *
 * Install once:
 *   npm install
 */

import { build } from 'esbuild';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

await build({
  entryPoints: ['src/main.js'],
  bundle:      true,
  minify:      true,
  format:      'iife',           // self-contained, no module system needed
  globalName:  'OCMData',        // exposes window.OCMData if needed for debugging
  outfile:     'dist/offchain-data.bundle.js',
  banner: {
    js: `/* Off-Chain Media — Bitcoin Data Library v${pkg.version} | offchain.media/data */`,
  },
  logLevel: 'info',
});
