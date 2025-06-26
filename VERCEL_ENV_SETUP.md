# Vercel Environment Variables Setup Guide

This guide explains how to properly configure environment variables for your Canvas Builder application on Vercel.

## 🎯 Quick Setup for Vercel Deployment

### 1. Frontend Environment Variables

On your **Vercel Dashboard** for the frontend project, set these environment variables:

```
VITE_API_BASE_URL=https://your-backend.vercel.app
NODE_ENV=production
```

**IMPORTANT**: Replace `https://your-backend.vercel.app` with your actual backend Vercel deployment URL.

### 2. Backend Environment Variables

On your **Vercel Dashboard** for the backend project, set these environment variables:

```
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
PORT=3000
```

**IMPORTANT**: Replace `https://your-frontend.vercel.app` with your actual frontend Vercel deployment URL.

## 📋 Environment Variables Reference

### Frontend Variables Used in Code

| Variable | Used In | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `src/services/api.js` | Backend API endpoint |
| `NODE_ENV` | Build process | Environment detection |

### Backend Variables Used in Code

| Variable | Used In | Purpose |
|----------|---------|---------|
| `CORS_ORIGIN` | `api/index.js`, `server.js` | CORS configuration |
| `NODE_ENV` | Multiple files | Environment detection |
| `PORT` | `api/index.js`, `server.js` | Server port |

## 🔄 Environment Variable Loading Process

### During Build (Vercel)

1. **Frontend**: Vite loads `VITE_*` variables at build time and bundles them into the static files
2. **Backend**: Node.js loads variables at runtime using `dotenv`

### Local Development

- Frontend: Uses `.env.development` or `.env.local`
- Backend: Uses `.env.development` or `.env.local`

## ⚙️ How to Configure on Vercel Dashboard

1. Go to your project on Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with:
   - **Name**: The exact variable name (e.g., `VITE_API_BASE_URL`)
   - **Value**: The actual value (e.g., `https://your-backend.vercel.app`)
   - **Environment**: Select "Production" (and optionally Preview/Development)

## 🚨 Common Issues & Solutions

### Issue: Frontend can't connect to backend
**Solution**: Ensure `VITE_API_BASE_URL` in frontend matches your backend's Vercel URL

### Issue: CORS errors
**Solution**: Ensure `CORS_ORIGIN` in backend matches your frontend's Vercel URL

### Issue: Environment variables not loading
**Solution**: 
- Check variable names match exactly (case-sensitive)
- Frontend variables MUST start with `VITE_`
- Redeploy after changing environment variables

## 🔧 Troubleshooting

### Check if variables are loaded correctly:

**Frontend** (in browser console):
```javascript
console.log(import.meta.env.VITE_API_BASE_URL);
```

**Backend** (in logs):
```javascript
console.log(process.env.CORS_ORIGIN);
```

### Deployment Order

1. Deploy backend first and note the URL
2. Update frontend's `VITE_API_BASE_URL` with backend URL
3. Deploy frontend and note the URL
4. Update backend's `CORS_ORIGIN` with frontend URL
5. Redeploy backend

## 📝 File Structure

```
frontend/
├── .env.example          # Template for environment variables
├── .env.development      # Local development variables
├── .env.production       # Production variables (for reference)
└── src/services/api.js   # Uses VITE_API_BASE_URL

backend/
├── .env.example          # Template for environment variables
├── .env.development      # Local development variables
├── .env.production       # Production variables (for reference)
├── api/index.js          # Uses CORS_ORIGIN, NODE_ENV, PORT
└── server.js             # Uses CORS_ORIGIN, NODE_ENV, PORT
```

**Note**: The `.env.production` files are for reference only. On Vercel, all environment variables should be set through the Vercel Dashboard for security.
