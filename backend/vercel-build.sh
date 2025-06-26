#!/bin/bash

# Vercel Backend Build Script - Handles native dependencies and deployment
set -e

echo "🚀 Starting backend build for Vercel..."

# Set environment variables for native modules
export NODE_ENV=production
export DISABLE_OPENCOLLECTIVE=true
export ADBLOCK=true
export NODE_OPTIONS="--max_old_space_size=3008 --max-semi-space-size=128"
export UV_THREADPOOL_SIZE=4
export CANVAS_PREBUILT_BINARY=false
export CANVAS_FORCE_FALLBACK=true
export SHARP_IGNORE_GLOBAL_LIBVIPS=true
export NPM_CONFIG_PRODUCTION=false

echo "🔧 Environment configured for native dependencies"

# Run prebuild cleanup
echo "🧹 Running prebuild cleanup..."
node prebuild-cleanup.js

# Install dependencies with retries for native modules
echo "📦 Installing dependencies..."

# First attempt - normal install
if npm ci --production=false; then
    echo "✅ Dependencies installed successfully"
else
    echo "⚠️ First install attempt failed, trying fallback methods..."
    
    # Second attempt - clean install without optional deps
    echo "🔄 Attempting install without optional dependencies..."
    if npm ci --production=false --no-optional; then
        echo "✅ Dependencies installed (without optional)"
    else
        echo "🔄 Attempting fresh install..."
        rm -rf node_modules package-lock.json
        if npm install --production=false; then
            echo "✅ Fresh install successful"
        else
            echo "❌ All install methods failed"
            exit 1
        fi
    fi
fi

# Verify critical dependencies
echo "🔍 Verifying critical dependencies..."

# Check if Express is available
if node -e "require('express')" 2>/dev/null; then
    echo "✅ Express verified"
else
    echo "❌ Express not found"
    exit 1
fi

# Check server.js exists and is valid
if node -c server.js; then
    echo "✅ Server.js syntax valid"
else
    echo "❌ Server.js has syntax errors"
    exit 1
fi

# Test native dependencies (optional)
echo "🧪 Testing native dependencies..."

# Test canvas (if available)
if node -e "try { require('canvas'); console.log('Canvas available'); } catch(e) { console.log('Canvas not available:', e.message); }" 2>/dev/null; then
    echo "🎨 Canvas dependency status checked"
fi

# Test sharp (if available)
if node -e "try { require('sharp'); console.log('Sharp available'); } catch(e) { console.log('Sharp not available:', e.message); }" 2>/dev/null; then
    echo "🖼️ Sharp dependency status checked"
fi

echo "✅ Backend build completed successfully!"
echo "🎯 Ready for Vercel deployment"
