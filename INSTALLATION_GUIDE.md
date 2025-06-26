# 🔧 Installation Guide

## ✅ Fixed Installation Issues

The infinite loop issue in npm scripts has been resolved for both backend and frontend! Here's how to properly install and run the project:

## 📦 Installation Methods

### Method 1: Individual Directory Installation (Recommended)

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### Method 2: Root Directory Installation

```bash
# From the root directory
npm run setup
# OR
npm run install:all
```

## 🚀 Running the Application

### Development Mode
```bash
# Option 1: Run both backend and frontend together (from root)
npm run dev

# Option 2: Run individually
# Backend (from backend directory)
cd backend
npm run dev

# Frontend (from frontend directory)  
cd frontend
npm run dev
```

### Production Mode
```bash
# Backend
cd backend
npm start

# Frontend build
cd frontend
npm run build
npm run preview
```

## 🐛 Issues Fixed

**Problem**: Infinite loop caused by `postinstall` scripts in multiple package.json files
**Solution**: Removed all problematic `postinstall` scripts from:
- ❌ Root `package.json` - Removed `"postinstall": "npm run install:all"`
- ❌ Backend `package.json` - Removed `"postinstall": "echo 'Backend dependencies installed successfully'"`
- ❌ Frontend `package.json` - Removed `"postinstall": "echo 'Frontend dependencies installed successfully'"`

## 📋 Available Scripts

### Root Directory Scripts
- `npm run setup` - Install all dependencies
- `npm run dev` - Run both backend and frontend in development
- `npm run build` - Build frontend for production
- `npm run clean` - Clean all node_modules

### Backend Scripts  
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run prod` - Start with production environment

### Frontend Scripts
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run serve` - Serve on port 4173

## ✅ Installation is Now Safe!

Both backend and frontend can now be installed without any infinite loops or circular dependency issues.

### Quick Setup Commands:
```bash
# Install everything at once
npm run setup

# Or install individually (safer)
cd backend && npm install
cd ../frontend && npm install
```
