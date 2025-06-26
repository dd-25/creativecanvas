# Environment Variables Setup Guide

## 📋 Overview

This project uses proper environment variable management with separate `.env` files for different environments. **Variable names now match exactly what the code expects.**

## 🔧 Fixed Variable Names

### Frontend Variables (Code expects these exact names):
- ✅ `VITE_API_BASE_URL` (used in `/src/services/api.js`)
- ✅ `VITE_APP_NAME`, `VITE_APP_VERSION` (app metadata)
- ✅ `NODE_ENV` (build environment)

### Backend Variables (Code expects these exact names):
- ✅ `NODE_ENV` (environment detection)
- ✅ `PORT` (server port)
- ✅ `CORS_ORIGIN` (CORS configuration)
- ✅ `UV_THREADPOOL_SIZE`, `NODE_OPTIONS` (performance)
- ✅ `CANVAS_PREBUILT_BINARY`, `SHARP_IGNORE_GLOBAL_LIBVIPS` (native deps)

## 🚀 Vercel Deployment Setup

### 1. Frontend Environment Variables (Vercel Dashboard)

**Project Settings → Environment Variables:**
```
VITE_API_BASE_URL = https://your-backend.vercel.app
VITE_APP_NAME = Canvas Builder
VITE_APP_VERSION = 1.0.0
VITE_DEBUG_MODE = false
NODE_ENV = production
```

### 2. Backend Environment Variables (Vercel Dashboard)

**Project Settings → Environment Variables:**
```
NODE_ENV = production
PORT = 3000
CORS_ORIGIN = https://your-frontend.vercel.app
MAX_FILE_SIZE = 52428800
UV_THREADPOOL_SIZE = 4
NODE_OPTIONS = --max_old_space_size=3008
CANVAS_PREBUILT_BINARY = false
CANVAS_FORCE_FALLBACK = true
SHARP_IGNORE_GLOBAL_LIBVIPS = true
DISABLE_OPENCOLLECTIVE = true
ADBLOCK = true
NPM_CONFIG_PRODUCTION = false
```

**Secrets (Backend - Vercel Dashboard):**
```
JWT_SECRET = your-secure-jwt-secret-here
DATABASE_URL = your-database-connection-string
```

## � Environment Loading Verification

### Frontend Loading (Vite automatically loads):
1. `.env.local` (highest priority, not committed)
2. `.env.production` (production builds)
3. `.env.development` (development builds)
4. Vercel Environment Variables (in production)

### Backend Loading (via dotenv):
1. Vercel Environment Variables (production)
2. `.env.local` (development)
3. `.env.production` / `.env.development`

## 🔍 Testing Environment Loading

### Frontend Test:
```javascript
// In browser console after running app
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
console.log('App Name:', import.meta.env.VITE_APP_NAME);
console.log('Debug Mode:', import.meta.env.VITE_DEBUG_MODE);
```

### Backend Test:
```javascript
// Add to any backend file temporarily
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);
console.log('CORS Origin:', process.env.CORS_ORIGIN);
console.log('Canvas Binary:', process.env.CANVAS_PREBUILT_BINARY);
```

## 📁 Local Development Setup

### 1. Create Local Environment Files:
```bash
# Frontend
cd frontend
cp .env.example .env.local
# Edit .env.local with your local API URL

# Backend
cd backend  
cp .env.example .env.local
# Edit .env.local with your local settings
```

### 2. Example .env.local files:

**Frontend `.env.local`:**
```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME="Canvas Builder (Local)"
VITE_DEBUG_MODE=true
NODE_ENV=development
```

**Backend `.env.local`:**
```bash
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=local-dev-secret-only
CANVAS_PREBUILT_BINARY=false
```

## �️ Build Scripts Environment Loading

### Frontend Build Script Updates:
```bash
# vercel-build.sh now loads .env.production
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi
```

### Backend Build Script Updates:
```bash
# vercel-build.sh now loads .env.production
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi
```

## 🔐 Security Best Practices

### ✅ Safe to Commit:
- `.env.example` - Template files
- `.env.development` - Dev config (no secrets)
- `.env.production` - Prod config (no secrets)

### ❌ Never Commit:
- `.env.local` - Local overrides
- `.env` - Generic file
- Any file with real API keys/secrets

### 🛡️ Secrets Management:
- **Local**: Use `.env.local` 
- **Production**: Use Vercel Dashboard Environment Variables
- **Never**: Put secrets in `.env.production` or vercel.json

## 📋 Quick Reference

### Required Variables for Deployment:

**Frontend (Vercel Dashboard):**
```
VITE_API_BASE_URL (required)
NODE_ENV=production (required)
```

**Backend (Vercel Dashboard):**
```
NODE_ENV=production (required)
CORS_ORIGIN (required)
PORT=3000 (required)
JWT_SECRET (required secret)
```

### Environment Priority Order:
1. **Vercel Environment Variables** (production)
2. **`.env.local`** (development)
3. **`.env.production`** / **`.env.development`**
4. **Default values in code**

This setup ensures proper environment variable loading across all deployment scenarios with correct variable names that match your codebase.
