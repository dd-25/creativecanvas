# Environment Variables Setup Guide

## 📋 Overview

This project now uses proper environment variable management with separate `.env` files for different environments. No sensitive data is stored in `vercel.json` files.

## 🔧 Environment Files Structure

### Frontend (`/frontend/`)
```
.env.example          # Template with all variables (committed)
.env.development      # Development config (committed)
.env.production       # Production config (committed) 
.env.local           # Local overrides (NOT committed)
```

### Backend (`/backend/`)
```
.env.example          # Template with all variables (committed)
.env.development      # Development config (committed)
.env.production       # Production config (committed)
.env.local           # Local overrides (NOT committed)
```

## 🚀 Setup Instructions

### 1. Local Development Setup

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your local values
```

**Backend:**
```bash
cd backend  
cp .env.example .env.local
# Edit .env.local with your local values
```

### 2. Vercel Environment Variables

For **production deployment**, set these in Vercel Dashboard:

#### Frontend Environment Variables:
```
VITE_API_URL = https://your-backend.vercel.app
VITE_APP_NAME = Canvas Builder
VITE_APP_VERSION = 1.0.0
VITE_DEBUG_MODE = false
NODE_ENV = production
```

#### Backend Environment Variables:
```
NODE_ENV = production
PORT = 3000
CORS_ORIGIN = https://your-frontend.vercel.app
MAX_FILE_SIZE = 52428800
UV_THREADPOOL_SIZE = 4
NODE_OPTIONS = --max_old_space_size=3008
CANVAS_PREBUILT_BINARY = false
SHARP_IGNORE_GLOBAL_LIBVIPS = true
DISABLE_OPENCOLLECTIVE = true
```

#### Sensitive Variables (Backend):
```
JWT_SECRET = your-secure-jwt-secret-here
# Add other secrets as needed
```

## 🔐 Security Best Practices

### ✅ What's Safe to Commit:
- `.env.example` - Template files with placeholder values
- `.env.development` - Development configuration (no secrets)
- `.env.production` - Production configuration (no secrets)

### ❌ Never Commit:
- `.env.local` - Local overrides with real values
- `.env` - Generic environment file
- Any file with actual API keys, secrets, or tokens

### 🛡️ Secrets Management:
1. **Local Development**: Use `.env.local` files
2. **Production**: Use Vercel Dashboard Environment Variables
3. **Staging**: Use separate Vercel project with staging vars

## 📁 File Examples

### Frontend `.env.local` (Local Development):
```bash
# Local frontend environment - DO NOT COMMIT
VITE_API_URL=http://localhost:5000
VITE_APP_NAME="Canvas Builder (Local)"
VITE_DEBUG_MODE=true
VITE_ENABLE_DEVTOOLS=true
```

### Backend `.env.local` (Local Development):
```bash
# Local backend environment - DO NOT COMMIT  
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=local-dev-secret-not-for-production
DATABASE_URL=mongodb://localhost:27017/canvas_builder_dev
```

## 🚀 Deployment Workflow

### 1. Development:
```bash
# Uses .env.development automatically
npm run dev
```

### 2. Local Production Build:
```bash
# Uses .env.production
npm run build
```

### 3. Vercel Deployment:
- Environment variables loaded from Vercel Dashboard
- Build scripts automatically use production settings
- No sensitive data in vercel.json files

## 🔧 Environment Variable Priority

Vite loads environment variables in this order (highest priority first):

1. `.env.local` (always loaded)
2. `.env.development` / `.env.production` (based on NODE_ENV)
3. `.env` (default)

Node.js (backend) loads:
1. Vercel Environment Variables (in production)
2. `.env.local` (in development)
3. `.env.development` / `.env.production`

## 🛠️ Troubleshooting

### Frontend Issues:
```bash
# Check which variables are loaded
console.log(import.meta.env)

# Variables must start with VITE_
VITE_API_URL=http://localhost:5000  ✅
API_URL=http://localhost:5000       ❌ (won't work)
```

### Backend Issues:
```bash
# Check environment variables
console.log(process.env.NODE_ENV)
console.log(process.env.CORS_ORIGIN)

# Verify .env file loading
require('dotenv').config({ path: '.env.local' })
```

### Vercel Deployment:
1. Check Vercel Dashboard → Project → Settings → Environment Variables
2. Ensure all required variables are set
3. Redeploy after adding/changing variables

## 📋 Quick Reference

### Required Frontend Variables:
- `VITE_API_URL` - Backend API URL

### Required Backend Variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `CORS_ORIGIN` - Frontend URL for CORS

### Optional Variables:
- `JWT_SECRET` - For authentication
- `DATABASE_URL` - If using database
- `MAX_FILE_SIZE` - File upload limit
- Performance tuning variables

This setup ensures secure, flexible environment management across all deployment scenarios.
