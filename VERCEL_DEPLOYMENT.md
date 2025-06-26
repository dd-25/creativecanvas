# Vercel Deployment Guide

This project consists of two separate deployments: Frontend (React + Vite) and Backend (Node.js + Express).

## 📋 Prerequisites

1. Vercel account: [Sign up at vercel.com](https://vercel.com)
2. Git repository with your code
3. Vercel CLI (optional): `npm i -g vercel`

## 🚀 Backend Deployment

### Step 1: Deploy Backend First

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```
   Or use the Vercel dashboard:
   - Connect your Git repository
   - Select the `backend` folder as root directory
   - Deploy

3. **Note your backend URL** (e.g., `https://your-backend-abc123.vercel.app`)

### Backend Configuration:
- ✅ `vercel.json` configured for Node.js serverless functions
- ✅ CORS properly configured for frontend domain
- ✅ 30-second timeout for PDF generation
- ✅ Environment variables support

## 🎨 Frontend Deployment

### Step 2: Update Environment Variables

1. **Update `.env.production`:**
   ```env
   VITE_API_BASE_URL=https://your-backend-abc123.vercel.app
   VITE_NODE_ENV=production
   ```

2. **Deploy Frontend:**
   ```bash
   cd ../frontend
   vercel --prod
   ```

3. **Note your frontend URL** (e.g., `https://your-frontend-xyz789.vercel.app`)

### Frontend Configuration:
- ✅ `vercel.json` configured for Vite build
- ✅ SPA routing support
- ✅ Asset caching optimization
- ✅ Security headers included

## 🔗 Final Configuration

### Step 3: Update CORS Origins

1. **Update backend environment variables in Vercel dashboard:**
   - Go to your backend project settings
   - Add environment variable:
     ```
     CORS_ORIGIN=https://your-frontend-xyz789.vercel.app
     ```

2. **Redeploy backend** to apply CORS changes

## 📁 Project Structure for Deployment

```
rocketium_assignment/
├── backend/
│   ├── vercel.json          ✅ Backend config
│   ├── .env.production      ✅ Backend env vars
│   ├── server.js           ✅ Entry point
│   └── package.json        ✅ Dependencies
├── frontend/
│   ├── vercel.json         ✅ Frontend config
│   ├── .env.production     ✅ Frontend env vars
│   ├── package.json        ✅ Dependencies
│   └── src/                ✅ React app
```

## 🛠️ Environment Variables Summary

### Backend (.env.production):
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-deployment.vercel.app
```

### Frontend (.env.production):
```env
VITE_API_BASE_URL=https://your-backend-deployment.vercel.app
VITE_NODE_ENV=production
```

## 🚨 Common Issues & Solutions

### 1. CORS Errors
- Ensure backend `CORS_ORIGIN` matches exact frontend domain
- Include `https://` protocol in URLs

### 2. API Not Found (404)
- Verify `VITE_API_BASE_URL` in frontend environment
- Check backend deployment logs in Vercel dashboard

### 3. Build Failures
- **Backend**: Check Node.js version compatibility
- **Frontend**: Ensure all Vite dependencies are installed

### 4. Function Timeout
- PDF generation might take time
- Backend configured with 30s timeout
- Consider optimizing large canvas operations

## 📊 Performance Optimizations

### Frontend:
- ✅ Asset caching (1 year for static assets)
- ✅ Gzip compression
- ✅ Tree shaking via Vite

### Backend:
- ✅ Response compression
- ✅ Security headers (Helmet)
- ✅ Memory-efficient image processing

## 🔄 Deployment Commands

### Quick Deploy (after initial setup):
```bash
# Backend
cd backend && vercel --prod

# Frontend  
cd frontend && vercel --prod
```

### Environment Updates:
```bash
# Update environment variables via CLI
vercel env add CORS_ORIGIN
vercel env add VITE_API_BASE_URL
```

## 📝 Post-Deployment Checklist

- [ ] Backend API responding at `/api/health`
- [ ] Frontend loads without console errors
- [ ] Canvas creation works
- [ ] PDF export functionality works
- [ ] Image upload functionality works
- [ ] CORS properly configured
- [ ] Environment variables set correctly

## 🆘 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check browser network tab for failed requests

---

**🎉 Your Canvas Builder app should now be live on Vercel!**
