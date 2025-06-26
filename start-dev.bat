@echo off
REM Canvas Builder - Development Startup Script for Windows
REM This script starts both backend and frontend in development mode

echo 🎨 Canvas Builder - Development Setup
echo ======================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ and try again.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version
echo.

echo 📦 Installing dependencies...

REM Backend dependencies
echo Installing backend dependencies...
cd backend
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Backend dependencies already installed
)

REM Frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Frontend dependencies already installed
)

cd ..

REM Check for environment files
echo.
echo 🔧 Checking environment configuration...

if not exist "backend\.env" (
    echo ⚠️  Creating backend .env from template...
    copy "backend\.env.development" "backend\.env"
)

if not exist "frontend\.env" (
    echo ⚠️  Creating frontend .env from template...
    copy "frontend\.env.development" "frontend\.env"
)

echo ✅ Environment files configured
echo.

echo 🚀 Starting Canvas Builder...
echo.
echo Backend will start on: http://localhost:5000
echo Frontend will start on: http://localhost:5173
echo.
echo Press Ctrl+C to stop the servers
echo.

REM Start backend
start "Canvas Builder Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
start "Canvas Builder Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo 🌟 Canvas Builder is starting up!
echo Check the opened terminal windows for server status.
echo.
pause
