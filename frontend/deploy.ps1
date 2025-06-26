# Vercel Deployment Fix Script for Windows
Write-Host "🚀 Preparing Canvas Builder for Vercel deployment..." -ForegroundColor Green

# Clean install to avoid dependency issues
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci

# Clear any existing build artifacts
Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "node_modules\.vite") { Remove-Item -Recurse -Force "node_modules\.vite" }
if (Test-Path "node_modules\.cache") { Remove-Item -Recurse -Force "node_modules\.cache" }

# Build the project
Write-Host "🏗️ Building project..." -ForegroundColor Yellow
npm run build

# Verify build output
if (Test-Path "dist") {
    Write-Host "✅ Build successful! Files created:" -ForegroundColor Green
    Get-ChildItem "dist" | Format-Table Name, Length
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Ready for Vercel deployment!" -ForegroundColor Green
