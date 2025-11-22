# 🚀 Smart Bio Farm - Deployment Guide

## Automatic Backend Deployment with Render.com

Your backend will be automatically deployed to Render.com (free tier) and stay online 24/7.

### Step 1: Prepare Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/project/smartbiofarm/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Download the JSON file
4. Open the file and copy its entire contents (it's a JSON object)

### Step 2: Deploy to Render.com

1. **Sign up/Login to Render.com**
   - Go to https://render.com
   - Sign up with your GitHub account (recommended for auto-deploy)

2. **Connect Your GitHub Repository**
   - Push your code to GitHub if you haven't already:
     ```bash
     git add .
     git commit -m "Add backend deployment config"
     git push origin main
     ```

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Pranav2188/Smart-Bio-Farm`
   - Render will automatically detect the `render.yaml` file

4. **Configure Environment Variables**
   - In the Render dashboard, go to your service
   - Click "Environment" tab
   - Add the following environment variable:
     - **Key**: `FIREBASE_SERVICE_ACCOUNT`
     - **Value**: Paste the entire JSON content from Step 1
   - The other variables are already set in `render.yaml`

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your backend
   - Wait 2-3 minutes for the first deployment

### Step 3: Update Frontend Configuration

Once deployed, Render will give you a URL like: `https://smart-bio-farm-backend.onrender.com`

Update your frontend to use this URL:

1. Create a `.env` file in your project root (if it doesn't exist):
   ```env
   REACT_APP_BACKEND_URL=https://smart-bio-farm-backend.onrender.com
   ```

2. Or update `src/services/pushNotificationService.js` directly:
   ```javascript
   const BACKEND_URL = "https://smart-bio-farm-backend.onrender.com";
   ```

3. Rebuild and redeploy your frontend:
   ```bash
   npm run deploy
   ```

### Step 4: Test Your Backend

Test the health endpoint:
```bash
curl https://smart-bio-farm-backend.onrender.com/
```

You should see:
```json
{
  "status": "Server is running",
  "timestamp": "2024-..."
}
```

## 🎉 Done!

Your backend is now:
- ✅ Deployed and running 24/7
- ✅ Automatically redeploys when you push to GitHub
- ✅ Free tier (no credit card required)
- ✅ HTTPS enabled by default
- ✅ Professional and scalable

## 📝 Important Notes

### Free Tier Limitations
- Backend may sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- 750 hours/month free (enough for one service running 24/7)

### Keeping Backend Awake (Optional)
To prevent sleeping, you can:
1. Upgrade to paid plan ($7/month for always-on)
2. Use a service like UptimeRobot to ping your backend every 10 minutes
3. Accept the 30-second wake-up time (most users won't notice)

### Monitoring
- View logs in Render dashboard
- Set up email alerts for deployment failures
- Monitor uptime and performance

## 🔄 Automatic Deployments

Every time you push to GitHub:
1. Render detects the changes
2. Automatically rebuilds the backend
3. Deploys the new version
4. Zero downtime deployment

## 🛠️ Troubleshooting

### Backend not starting?
- Check Render logs for errors
- Verify `FIREBASE_SERVICE_ACCOUNT` is set correctly
- Ensure it's valid JSON (no extra spaces or line breaks)

### Notifications not working?
- Test the health endpoint first
- Check frontend is using correct backend URL
- Verify FCM tokens are being saved to Firestore
- Check Render logs for error messages

### Need help?
- Render docs: https://render.com/docs
- Firebase docs: https://firebase.google.com/docs
