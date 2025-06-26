#!/bin/bash

# Vercel Deployment Fix Script
echo "🚀 Preparing Canvas Builder for Vercel deployment..."

# Clean install to avoid dependency issues
echo "📦 Installing dependencies..."
npm ci

# Clear any existing build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# Build the project
echo "🏗️  Building project..."
npm run build

# Verify build output
if [ -d "dist" ]; then
    echo "✅ Build successful! Files created:"
    ls -la dist/
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Ready for Vercel deployment!"
