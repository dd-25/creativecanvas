# Canvas Builder - Clean Production Ready

A minimal Canvas Builder application with React frontend and Node.js backend, optimized for Vercel deployment.

## 📁 Project Structure

```
copilot/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express backend  
├── FRONTEND_VERCEL_ENV.txt  # Frontend environment variables for Vercel
├── BACKEND_VERCEL_ENV.txt   # Backend environment variables for Vercel
└── README.md          # This file
```

## 🚀 Quick Deployment

### 1. Deploy Backend
1. Create new Vercel project from `backend/` folder
2. Copy environment variables from `BACKEND_VERCEL_ENV.txt` to Vercel Dashboard
3. Update `CORS_ORIGIN` with your actual frontend URL
4. Deploy

### 2. Deploy Frontend  
1. Create new Vercel project from `frontend/` folder
2. Copy environment variables from `FRONTEND_VERCEL_ENV.txt` to Vercel Dashboard
3. Update `VITE_API_BASE_URL` with your actual backend URL
4. Deploy

### 3. Update URLs
1. Update backend `CORS_ORIGIN` with frontend URL
2. Update frontend `VITE_API_BASE_URL` with backend URL
3. Redeploy both projects

## 🎯 Features

- **Canvas Builder**: Create and edit canvas elements
- **PDF Export**: Export canvas to PDF
- **Real-time Updates**: Live canvas editing
- **Responsive Design**: Works on all devices
- **Production Ready**: Optimized for Vercel deployment

## 💡 Environment Variables

All environment variables are provided in the `*_VERCEL_ENV.txt` files. Simply copy them to your Vercel Dashboard under Project Settings → Environment Variables.

## 🛠️ Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend  
cd backend
npm install
npm run dev
```

Both services will run locally with hot reload enabled.
