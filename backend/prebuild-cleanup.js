#!/usr/bin/env node

/**
 * Backend pre-build script for Vercel deployment
 * Handles native dependencies and potential build issues
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Backend pre-build cleanup started...');

// Environment setup for Vercel
process.env.DISABLE_OPENCOLLECTIVE = 'true';
process.env.ADBLOCK = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Check for problematic native dependencies
const problematicDeps = [
  'canvas',
  'sharp'
];

const nodeModulesPath = 'node_modules';

console.log('📦 Checking native dependencies...');

problematicDeps.forEach(dep => {
  const depPath = path.join(nodeModulesPath, dep);
  if (fs.existsSync(depPath)) {
    console.log(`✅ Found ${dep} - ensuring Linux compatibility`);
    
    // For canvas, ensure it uses system libraries on Linux
    if (dep === 'canvas') {
      try {
        // Set environment variables for canvas to use system libraries
        process.env.CANVAS_PREBUILT_BINARY = 'false';
        process.env.CANVAS_FORCE_FALLBACK = 'true';
        console.log('🎨 Canvas configured for Linux environment');
      } catch (error) {
        console.warn(`⚠️ Canvas configuration warning:`, error.message);
      }
    }
    
    // For sharp, ensure it uses the correct platform binaries
    if (dep === 'sharp') {
      try {
        process.env.SHARP_IGNORE_GLOBAL_LIBVIPS = 'true';
        console.log('🖼️ Sharp configured for serverless environment');
      } catch (error) {
        console.warn(`⚠️ Sharp configuration warning:`, error.message);
      }
    }
  } else {
    console.log(`⚠️ ${dep} not found - will be installed during build`);
  }
});

// Clean any cached binary files that might cause issues
const cachePaths = [
  path.join(nodeModulesPath, '.cache'),
  path.join(nodeModulesPath, 'canvas', 'build'),
  path.join(nodeModulesPath, 'sharp', 'build'),
];

cachePaths.forEach(cachePath => {
  if (fs.existsSync(cachePath)) {
    try {
      fs.rmSync(cachePath, { recursive: true, force: true });
      console.log(`🗑️ Cleaned cache: ${path.basename(cachePath)}`);
    } catch (error) {
      console.warn(`⚠️ Could not clean ${cachePath}:`, error.message);
    }
  }
});

// Set optimal memory and performance settings
process.env.NODE_OPTIONS = '--max_old_space_size=3008 --max-semi-space-size=128';
process.env.UV_THREADPOOL_SIZE = '4';

console.log('🔧 Environment variables set for Vercel deployment');
console.log('🏁 Backend pre-build cleanup completed');

// Verify critical files exist
const criticalFiles = ['server.js', 'package.json'];
criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`❌ Critical file missing: ${file}`);
    process.exit(1);
  }
});

console.log('✅ All critical files verified');
