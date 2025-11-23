# 🚀 Smart Bio Farm - Deployment Guide

> **🎉 New Automated Deployment System Available!**
> 
> This project now includes automated deployment scripts that simplify the entire deployment process.
> 
> **Quick Start:**
> ```bash
> cd backend
> npm run prepare-credentials
> npm run deploy:dev
> ```
> 
> **For complete documentation, see:** [backend/docs/DEPLOYMENT.md](backend/docs/DEPLOYMENT.md)

---

## Automated Deployment Workflow (Recommended)

The new automated deployment system provides:

- ✅ **One-command deployment** - Deploy with a single npm command
- ✅ **Automatic validation** - Checks credentials, dependencies, and configuration
- ✅ **Multiple environments** - Separate configs for dev, staging, and production
- ✅ **Health checks** - Verify deployments automatically
- ✅ **Deployment history** - Track all deployments with rollback support
- ✅ **CI/CD integration** - GitHub Actions workflows included

### Quick Start with Automation

```bash
cd backend

# 1. Prepare Firebase credentials
npm run prepare-credentials

# 2. Validate your setup
npm run deploy:dev -- --validate-only

# 3. Deploy to development
npm run deploy:dev

# 4. Check deployment health
npm run health:dev
```

### Available Commands

```bash
# Deployment
npm run deploy:dev        # Deploy to development
npm run deploy:staging    # Deploy to staging
npm run deploy:prod       # Deploy to production (requires confirmation)

# Health Checks
npm run health:dev        # Check development backend
npm run health:staging    # Check staging backend
npm run health:prod       # Check production backend

# Environment Management
npm run env:list          # List all environments
npm run env:update        # Update environment variables

# History & Rollback
npm run deployment-history  # View deployment history
npm run rollback           # Prepare rollback to previous deployment

# CI/CD
npm run generate-cicd:github  # Generate GitHub Actions workflow
```

### Complete Documentation

For detailed documentation including:
- Environment setup
- Advanced deployment options
- CI/CD integration
- Troubleshooting
- FAQ

See: [backend/docs/DEPLOYMENT.md](backend/docs/DEPLOYMENT.md)

---

## Manual Deployment (Legacy)

If you prefer to deploy manually without the automated scripts, follow these steps:

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

### Using Automated Deployment Scripts

If you're using the new automated deployment system:

```bash
# Run validation to check setup
npm run deploy:dev -- --validate-only

# Check backend health
npm run health:prod

# View deployment history
npm run deployment-history
```

For detailed troubleshooting, see [backend/docs/TROUBLESHOOTING.md](backend/docs/TROUBLESHOOTING.md)

### Manual Deployment Issues

### Backend not starting?
- Check Render logs for errors
- Verify `FIREBASE_SERVICE_ACCOUNT` is set correctly
- Ensure it's valid JSON (no extra spaces or line breaks)
- Run health check: `npm run health:prod`

### Notifications not working?
- Test the health endpoint first
- Check frontend is using correct backend URL
- Verify FCM tokens are being saved to Firestore
- Check Render logs for error messages

### Need help?
- **Automated deployment docs**: [backend/docs/DEPLOYMENT.md](backend/docs/DEPLOYMENT.md)
- **Troubleshooting guide**: [backend/docs/TROUBLESHOOTING.md](backend/docs/TROUBLESHOOTING.md)
- Render docs: https://render.com/docs
- Firebase docs: https://firebase.google.com/docs

---

## 🔄 Migration Guide: Manual to Automated Deployment

### Why Migrate?

The automated deployment system provides:
- Faster deployments with validation
- Environment-specific configurations
- Deployment history and rollback
- CI/CD integration
- Health monitoring

### Migration Steps

1. **Ensure dependencies are installed**
   ```bash
   cd backend
   npm install
   ```

2. **Prepare credentials using new script**
   ```bash
   npm run prepare-credentials
   ```
   This replaces the old `npm run prepare-render` command.

3. **Validate your setup**
   ```bash
   npm run deploy:dev -- --validate-only
   ```
   This checks all prerequisites before deployment.

4. **Deploy using new commands**
   ```bash
   # Old way
   # Manual steps with prepare-render and manual Render configuration
   
   # New way
   npm run deploy:dev
   ```

5. **Verify deployment**
   ```bash
   npm run health:dev
   ```

6. **Set up CI/CD** (optional but recommended)
   ```bash
   npm run generate-cicd:github
   ```
   Follow the instructions to add secrets to GitHub.

### What Changed?

| Old Process | New Process |
|------------|-------------|
| `npm run prepare-render` | `npm run prepare-credentials` |
| Manual Render configuration | Automated with `npm run deploy:dev` |
| Manual health checks | `npm run health:dev` |
| No environment management | `npm run env:list`, `npm run env:update` |
| No deployment history | `npm run deployment-history` |
| Manual CI/CD setup | `npm run generate-cicd:github` |

### Backward Compatibility

The old manual process still works! The new scripts are additions, not replacements. You can:
- Continue using manual deployment
- Gradually adopt automated scripts
- Use both approaches as needed

### Getting Help

- Full documentation: [backend/docs/DEPLOYMENT.md](backend/docs/DEPLOYMENT.md)
- Troubleshooting: [backend/docs/TROUBLESHOOTING.md](backend/docs/TROUBLESHOOTING.md)
- CI/CD setup: [backend/docs/CICD_SETUP.md](backend/docs/CICD_SETUP.md)
