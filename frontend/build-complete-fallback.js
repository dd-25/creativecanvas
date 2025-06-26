#!/usr/bin/env node

/**
 * Complete build fallback using esbuild + manual HTML/CSS processing
 * This bypasses all Vite/Rollup native module issues
 */

import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outdir = 'dist';
const srcDir = 'src';

// Clean and create dist directory
if (existsSync(outdir)) {
  import('rimraf').then(({ rimraf }) => rimraf(outdir));
}
mkdirSync(outdir, { recursive: true });

console.log('🔧 Building with esbuild fallback...');

try {
  // Build JavaScript
  await build({
    entryPoints: [join(srcDir, 'main.jsx')],
    bundle: true,
    outfile: join(outdir, 'assets', 'index.js'),
    format: 'esm',
    target: ['es2020'],
    minify: true,
    sourcemap: false,
    jsx: 'automatic',
    define: {
      'process.env.NODE_ENV': '"production"',
      'global': 'globalThis'
    },
    loader: {
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.svg': 'dataurl',
      '.gif': 'file',
      '.woff': 'file',
      '.woff2': 'file',
      '.ttf': 'file',
      '.eot': 'file'
    },
    external: [],
    platform: 'browser',
    splitting: false,
    chunkNames: '[name]-[hash]',
  });

  // Build CSS
  await build({
    entryPoints: [join(srcDir, 'index.css')],
    bundle: true,
    outfile: join(outdir, 'assets', 'index.css'),
    minify: true,
    sourcemap: false,
    loader: {
      '.css': 'css'
    }
  });

  // Process HTML template
  const htmlTemplate = readFileSync('index.html', 'utf-8');
  const processedHtml = htmlTemplate
    .replace(/\/src\/main\.jsx/, './assets/index.js')
    .replace(/\/src\/index\.css/, './assets/index.css')
    // Remove Vite-specific scripts/imports
    .replace(/<script type="module" crossorigin.*?>.*?<\/script>/gs, '')
    .replace(/@import.*?;/g, '')
    // Add our bundled assets
    .replace('</head>', `  <link rel="stylesheet" href="./assets/index.css">\n</head>`)
    .replace('</body>', `  <script type="module" src="./assets/index.js"></script>\n</body>`);

  writeFileSync(join(outdir, 'index.html'), processedHtml);

  // Copy static assets if they exist
  const staticDirs = ['public', 'assets'];
  staticDirs.forEach(dir => {
    if (existsSync(dir)) {
      try {
        // Use a simple recursive copy
        const copyRecursive = (src, dest) => {
          import('fs').then(({ readdirSync, statSync, mkdirSync, copyFileSync }) => {
            if (statSync(src).isDirectory()) {
              mkdirSync(dest, { recursive: true });
              readdirSync(src).forEach(item => {
                copyRecursive(join(src, item), join(dest, item));
              });
            } else {
              copyFileSync(src, dest);
            }
          });
        };
        copyRecursive(dir, join(outdir, dir));
      } catch (e) {
        console.warn(`⚠️ Could not copy ${dir}:`, e.message);
      }
    }
  });

  console.log('✅ esbuild fallback build completed successfully!');
  console.log(`📦 Output directory: ${outdir}`);

} catch (error) {
  console.error('❌ esbuild fallback build failed:', error);
  process.exit(1);
}
