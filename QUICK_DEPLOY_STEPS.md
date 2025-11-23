# 🚀 Quick Deploy Steps - Smart Bio Farm Backend

> **Note**: This project now includes automated deployment scripts! For the new automated workflow, see [backend/docs/DEPLOYMENT.md](backend/docs/DEPLOYMENT.md)

## Automated Deployment (Recommended)

### Quick Start with Automation

```bash
cd backend

# 1. Prepare Firebase credentials
npm run prepare-credentials

# 2. Validate setup
npm run deploy:dev -- --validate-only

# 3. Deploy to development
npm run deploy:dev
```

For complete documentation, see [Deployment Guide](backend/docs/DEPLOYMENT.md)

---

## Manual Deployment (Legacy)

If you prefer manual deployment, follow these steps:

## ✅ What's Already Done

1. ✅ Code pushed to GitHub
2. ✅ Firebase credentials prepared
3. ✅ Render configuration file created
4. ✅ Backend updated for production deployment

## 📋 Next Steps (5 minutes)

### Step 1: Sign Up for Render.com

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account (Pranav2188)

### Step 2: Create Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect GitHub"** and authorize Render
3. Select repository: **"Pranav2188/Smart-Bio-Farm"**
4. Render will auto-detect `render.yaml` configuration
5. Click **"Apply"** or **"Create Web Service"**

### Step 3: Add Firebase Credentials

1. In your new service, go to **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add this variable:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Open `backend/firebase-credentials-for-render.txt` and copy the ENTIRE content
4. Click **"Save Changes"**

### Step 4: Deploy

1. Render will automatically start deploying
2. Wait 2-3 minutes for first deployment
3. You'll get a URL like: `https://smart-bio-farm-backend.onrender.com`

### Step 5: Test Your Backend

Open your browser or use curl:
```
https://smart-bio-farm-backend.onrender.com/
```

You should see:
```json
{
  "status": "Server is running",
  "timestamp": "..."
}
```

### Step 6: Update Frontend

1. Copy your Render URL (e.g., `https://smart-bio-farm-backend.onrender.com`)

2. Create `.env` file in project root:
   ```env
   REACT_APP_BACKEND_URL=https://smart-bio-farm-backend.onrender.com
   ```

3. Deploy frontend:
   ```bash
   npm run deploy
   ```

## 🎉 Done!

Your backend is now:
- ✅ Live and accessible 24/7
- ✅ Auto-deploys on every GitHub push
- ✅ Free (no credit card needed)
- ✅ HTTPS enabled
- ✅ Professional and scalable

## 📱 Test Notifications

1. Open your deployed app: https://Pranav2188.github.io/Smart-Bio-Farm/
2. Sign up as a farmer
3. Create an alert
4. Check browser console - should see "Alert notification sent to X farmers"
5. No more connection errors!

## 🔄 Future Updates

Every time you push code to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render automatically:
1. Detects the push
2. Rebuilds the backend
3. Deploys new version
4. Zero downtime!

## 💡 Pro Tips

### Keep Backend Awake (Optional)
Free tier sleeps after 15 min of inactivity. To keep it awake:

1. **Option A**: Use UptimeRobot (free)
   - Sign up at https://uptimerobot.com
   - Add monitor for your Render URL
   - Ping every 5 minutes

2. **Option B**: Upgrade to Render paid plan ($7/month)
   - Always-on
   - No cold starts
   - Better performance

### Monitor Your Backend

In Render dashboard:
- View real-time logs
- Check deployment history
- Monitor resource usage
- Set up email alerts

## 🆘 Troubleshooting

### Backend not starting?
- Check Render logs for errors
- Verify `FIREBASE_SERVICE_ACCOUNT` is set correctly
- Make sure it's a single line (no line breaks)
- Run health check: `npm run health:prod`

### Still getting connection errors?
- Verify `.env` file has correct Render URL
- Rebuild frontend: `npm run deploy`
- Clear browser cache
- Check Render service is "Live" (green status)

### Need Help?
- Check Render logs first
- Review automated deployment guide: [backend/docs/DEPLOYMENT.md](backend/docs/DEPLOYMENT.md)
- Check troubleshooting guide: [backend/docs/TROUBLESHOOTING.md](backend/docs/TROUBLESHOOTING.md)
- Render support: https://render.com/docs

---

## 🚀 Migrating to Automated Deployment

The project now includes automated deployment scripts that simplify the deployment process:

### Benefits of Automated Deployment

- ✅ One-command deployment
- ✅ Automatic validation before deployment
- ✅ Environment-specific configurations (dev, staging, prod)
- ✅ Health checks to verify deployments
- ✅ Deployment history and rollback support
- ✅ CI/CD integration with GitHub Actions

### Migration Steps

1. **Install dependencies** (if not already done)
   ```bash
   cd backend
   npm install
   ```

2. **Prepare credentials**
   ```bash
   npm run prepare-credentials
   ```

3. **Validate setup**
   ```bash
   npm run deploy:dev -- --validate-only
   ```

4. **Deploy using automation**
   ```bash
   npm run deploy:dev
   ```

5. **Set up CI/CD** (optional)
   ```bash
   npm run generate-cicd:github
   ```

For complete migration guide, see [backend/docs/DEPLOYMENT.md](backend/docs/DEPLOYMENT.md)
