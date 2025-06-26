#!/bin/bash

# Vercel Build Script - Robust deployment with multiple fallbacks
set -e

echo "🚀 Starting Vercel build process..."

# Set environment variables to disable native modules
export DISABLE_ROLLUP_NATIVE=true
export ROLLUP_NO_NATIVE=true
export NODE_OPTIONS="--max_old_space_size=4096"

# Clean install with no optional packages to avoid native modules
echo "📦 Installing dependencies (no optional packages)..."
npm ci --no-optional --production=false

# Run prebuild cleanup
echo "🧹 Running prebuild cleanup..."
node prebuild-cleanup.js

# Attempt build with multiple fallbacks
echo "🔨 Building with multiple fallbacks..."

if npm run build:vite-safe; then
    echo "✅ Build successful with Vite (safe config)"
elif npm run build:webpack; then
    echo "✅ Build successful with Webpack"
elif npm run build:esbuild; then
    echo "✅ Build successful with esbuild"  
elif npm run build:complete-fallback; then
    echo "✅ Build successful with complete fallback"
else
    echo "❌ All build methods failed"
    exit 1
fi

echo "🎉 Build completed successfully!"

# Verify output directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found"
    exit 1
fi

echo "📂 Contents of dist directory:"
ls -la dist/

echo "✨ Build process completed successfully!"
