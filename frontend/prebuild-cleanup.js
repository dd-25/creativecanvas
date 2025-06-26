#!/usr/bin/env node

/**
 * Pre-build script to remove problematic native modules
 * Run this before the main build to avoid rollup native module issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeModulesPath = 'node_modules';

// List of problematic native modules to remove
const problematicModules = [
  '@rollup/rollup-linux-x64-gnu',
  '@rollup/rollup-darwin-x64',
  '@rollup/rollup-darwin-arm64',
  '@rollup/rollup-win32-x64-msvc',
  '@rollup/rollup-linux-x64-musl',
  '@rollup/rollup-linux-arm64-gnu',
  '@rollup/rollup-linux-arm64-musl'
];

console.log('🧹 Cleaning problematic native modules...');

problematicModules.forEach(moduleName => {
  const modulePath = path.join(nodeModulesPath, moduleName);
  if (fs.existsSync(modulePath)) {
    try {
      fs.rmSync(modulePath, { recursive: true, force: true });
      console.log(`✅ Removed ${moduleName}`);
    } catch (error) {
      console.warn(`⚠️ Could not remove ${moduleName}:`, error.message);
    }
  }
});

// Also patch rollup's native.js to disable native loading
const rollupNativePath = path.join(nodeModulesPath, 'rollup', 'dist', 'native.js');
if (fs.existsSync(rollupNativePath)) {
  try {
    let nativeContent = fs.readFileSync(rollupNativePath, 'utf-8');
    
    // Replace the native module loading with a fallback
    const patchedContent = nativeContent.replace(
      /throw new Error\(/g,
      'console.warn('
    ).replace(
      /requireWithFriendlyError\([^)]+\)/g,
      'null'
    );
    
    fs.writeFileSync(rollupNativePath, patchedContent);
    console.log('✅ Patched rollup native.js');
  } catch (error) {
    console.warn('⚠️ Could not patch rollup native.js:', error.message);
  }
}

console.log('🏁 Pre-build cleanup completed');
