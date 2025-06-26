# 🚨 URGENT: Fix Environment Variable Error

You're getting the error because `import.meta.env.VITE_API_BASE_URL` is undefined. Here's how to fix it:

## 🎯 IMMEDIATE SOLUTION

### Step 1: Set Environment Variables in Vercel Dashboard

1. Go to your **frontend project** on Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```
Name: VITE_API_BASE_URL
Value: https://your-backend.vercel.app
Environments: Production, Preview
```

```
Name: NODE_ENV
Value: production
Environments: Production, Preview
```

### Step 2: Get Your Backend URL

1. If you haven't deployed your backend yet:
   - Deploy backend first
   - Copy the URL (e.g., `https://canvas-backend-abc123.vercel.app`)
   
2. If backend is already deployed:
   - Go to your backend project on Vercel
   - Copy the URL from the project overview

### Step 3: Update Frontend Environment Variable

1. In your frontend Vercel Dashboard
2. Update `VITE_API_BASE_URL` with your actual backend URL
3. **Important**: Remove `https://your-backend.vercel.app` and use the real URL

### Step 4: Redeploy Frontend

1. After setting the environment variables
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Or push a new commit to trigger a new deployment

## 🔍 DEBUGGING STEPS

I've added a debug component that will show you what environment variables are available. After you redeploy:

1. Open your frontend URL
2. Look for a red debug box in the top-right corner
3. It will show you exactly what environment variables are loaded
4. The debug box will disappear once `VITE_API_BASE_URL` is properly set

## 📋 CHECKLIST

- [ ] Backend is deployed and URL is copied
- [ ] `VITE_API_BASE_URL` is set in Vercel Dashboard (frontend project)
- [ ] `NODE_ENV` is set to `production` in Vercel Dashboard (frontend project)
- [ ] Frontend is redeployed after setting environment variables
- [ ] Debug box shows `VITE_API_BASE_URL` is loaded correctly

## 🚨 COMMON MISTAKES TO AVOID

1. **Don't** set environment variables in `vercel.json` - use Vercel Dashboard
2. **Don't** forget the `VITE_` prefix for frontend variables
3. **Don't** use placeholder URLs like `your-backend.vercel.app` - use actual URLs
4. **Don't** forget to redeploy after changing environment variables

## 🔧 BACKUP SOLUTION

If you're still having issues, the code now includes a fallback that will:
1. Try to read `import.meta.env.VITE_API_BASE_URL`
2. If that fails and you're on Vercel, it will show an error message
3. This helps identify the exact problem

## 📞 NEED HELP?

If you're still getting errors after following these steps:
1. Check the debug box information
2. Verify the environment variables are set correctly in Vercel Dashboard
3. Make sure you redeployed after setting the variables
4. Check the browser console for any additional error messages

The error will be fixed once `VITE_API_BASE_URL` is properly set in Vercel Dashboard!
