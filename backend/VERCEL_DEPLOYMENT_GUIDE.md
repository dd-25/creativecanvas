# Backend Vercel Deployment Guide - Canvas Builder API

## 🚨 CRITICAL BACKEND DEPLOYMENT SOLUTION

### Problem
Node.js backends on Vercel face several challenges:
1. **Native Dependencies**: Canvas, Sharp, and other binary modules
2. **Function Constraints**: Memory limits, timeout restrictions
3. **File System**: Serverless limitations for file operations
4. **Build Complexity**: Native module compilation on Linux

### ✅ COMPREHENSIVE BACKEND SOLUTION

This solution provides **robust error handling and fallbacks** for seamless deployment:

#### Architecture Changes:
1. **Serverless-Optimized Entry Point** - `api/index.js` designed for Vercel functions
2. **Graceful Dependency Handling** - Fallbacks when native modules fail
3. **Enhanced Error Handling** - Service degradation instead of complete failure
4. **Memory & Performance Optimization** - Tuned for Vercel's constraints

#### Files Created/Modified:

**1. Backend Package.json Updates:**
- Specified Node 18.x engine
- Added optional dependencies for canvas/sharp
- Pre-build cleanup scripts
- Vercel-specific build commands

**2. Vercel Configuration (`vercel.json`):**
```json
{
  "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
  "functions": {
    "api/index.js": {
      "maxDuration": 60,
      "memory": 3008,
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "NODE_OPTIONS": "--max_old_space_size=3008",
    "CANVAS_PREBUILT_BINARY": "false",
    "SHARP_IGNORE_GLOBAL_LIBVIPS": "true"
  }
}
```

**3. Serverless Entry Point (`api/index.js`):**
- Graceful native dependency loading
- Fallback routes when services unavailable
- Comprehensive health checking
- CORS optimized for production

**4. Pre-build System:**
- `prebuild-cleanup.js` - Configures native dependencies
- `vercel-build.sh` - Handles complex build scenarios
- Environment optimization for memory/performance

#### Key Features:

**🔧 Native Dependency Management:**
```javascript
// Graceful canvas/sharp loading
try {
  canvasRoutes = require('./routes/canvasRoutes');
} catch (error) {
  // Fallback route that returns service unavailable
  canvasRoutes = createFallbackRoute();
}
```

**🚀 Performance Optimization:**
- 3GB memory allocation
- 60-second timeout limit
- Optimized thread pool settings
- Memory space optimization

**🛡️ Error Resilience:**
- Service degradation vs. complete failure
- Health endpoint for monitoring
- Fallback responses for unavailable features
- Comprehensive error logging

**🌐 Production CORS:**
- Dynamic origin validation
- Support for Vercel deployment URLs
- Regex pattern matching for subdomains
- Development/production environment handling

### 🔧 Deployment Process

**1. Automated Deployment:**
```bash
git add .
git commit -m "Backend Vercel deployment with native dependency handling"
git push origin main
```

**2. Vercel Process:**
- Detects `api/index.js` as serverless function
- Runs prebuild cleanup for native deps
- Installs dependencies with Linux binaries
- Deploys with enhanced memory/timeout settings

**3. Expected Outcomes:**
- ✅ Basic API endpoints work immediately
- ✅ Health endpoint provides service status
- ⚠️ Canvas/PDF features may degrade gracefully if native deps fail
- ✅ CORS configured for frontend integration

### 🛠️ Service Availability Matrix

| Feature | No Native Deps | With Canvas | With Sharp | Full Stack |
|---------|----------------|-------------|------------|------------|
| Health Check | ✅ | ✅ | ✅ | ✅ |
| Basic API | ✅ | ✅ | ✅ | ✅ |
| Element Management | ✅ | ✅ | ✅ | ✅ |
| PDF Export | ❌ | ✅ | ✅ | ✅ |
| Image Processing | ❌ | ⚠️ | ✅ | ✅ |
| Canvas Rendering | ❌ | ✅ | ⚠️ | ✅ |

### 🔍 Testing & Verification

**Health Check Endpoint:**
```bash
curl https://your-backend.vercel.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "dependencies": {
    "canvas": "available|unavailable",
    "sharp": "available|unavailable"
  },
  "environment": "production"
}
```

### 🎯 Fallback Strategies

**If Native Dependencies Fail:**
1. **Canvas Features**: Return "service unavailable" with 503 status
2. **Image Processing**: Use web-safe alternatives
3. **PDF Generation**: Provide download links or client-side generation
4. **Core API**: Continues working normally

**Alternative Deployment Options:**
- Railway.app (better native dependency support)
- DigitalOcean App Platform
- Heroku (with buildpacks)
- Docker container deployment

### 📋 Environment Variables

**Required for Production:**
```env
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

**Optional for Enhanced Performance:**
```env
UV_THREADPOOL_SIZE=4
NODE_OPTIONS=--max_old_space_size=3008
CANVAS_PREBUILT_BINARY=false
SHARP_IGNORE_GLOBAL_LIBVIPS=true
```

### 🚀 Expected Results

**Immediate Benefits:**
- ✅ API deploys successfully to Vercel
- ✅ Basic endpoints functional
- ✅ CORS configured for frontend
- ✅ Health monitoring available

**Service Resilience:**
- Graceful degradation of advanced features
- Clear error messages when services unavailable
- Continued operation of core functionality
- Easy monitoring of feature availability

This backend solution ensures that **deployment succeeds** regardless of native dependency issues, with clear indicators of which features are available in the current environment.
