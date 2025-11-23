# Deployment Guide

*Last updated: November 23, 2025*

## Overview

This guide covers the automated deployment workflow for the Trip Defender backend. The deployment system provides CLI tools to deploy to multiple environments (development, staging, production) with validation, health checks, and deployment history tracking.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Safety Features](#safety-features)
- [Environment Setup](#environment-setup)
- [Deployment Commands](#deployment-commands)
- [Health Checks](#health-checks)
- [Environment Management](#environment-management)
- [Deployment History & Rollback](#deployment-history--rollback)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Quick Start

### First-Time Setup

1. **Prepare Firebase Credentials**
   ```bash
   cd backend
   npm run prepare-credentials
   ```
   This will format your Firebase service account credentials for Render.

2. **Verify Setup**
   ```bash
   npm run deploy:dev -- --validate-only
   ```
   This validates your configuration without deploying.

3. **Deploy to Development**
   ```bash
   npm run deploy:dev
   ```

### Subsequent Deployments

```bash
# Deploy to development
npm run deploy:dev

# Deploy to staging
npm run deploy:staging

# Deploy to production (requires confirmation)
npm run deploy:prod
```

---

## Prerequisites

### Required Files

- `backend/serviceAccountKey.json` - Firebase service account credentials
- `backend/.env` - Environment variables
- `backend/config/deployment-config.json` - Environment configurations

### Required Tools

- Node.js 18+ installed
- npm installed
- Git repository initialized
- Render.com account (for deployment)

### Required Environment Variables

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=10000
ADMIN_SETUP_CODE=your_admin_code
FIREBASE_SERVICE_ACCOUNT=<will be set by deployment script>
```

---

## Safety Features

The deployment system includes multiple safety features to prevent errors and ensure safe deployments:

### 1. Validation-Only Mode
Check your setup without deploying:
```bash
npm run deploy -- --validate-only
```

### 2. Dry-Run Mode
Simulate deployment without making changes:
```bash
npm run deploy -- --dry-run
npm run deploy:prod -- --dry-run  # Test production deployment
```

### 3. Deployment Summary
Before each deployment, you'll see a summary of:
- Target environment and configuration
- Environment variables (sensitive values masked)
- Actions that will be performed
- Deployment URL

You must confirm before proceeding.

### 4. Production Confirmation
Production deployments require explicit confirmation:
```
⚠️  You are about to deploy to PRODUCTION
⚠️  This will affect live users!

Type "yes" to confirm deployment:
```

### 5. Skip Validation (Use with Caution)
For rapid iteration, you can skip validation:
```bash
npm run deploy:dev -- --skip-validation
```

**📚 For detailed information about safety features, see [SAFETY_FEATURES.md](./SAFETY_FEATURES.md)**

---

## Environment Setup

### Available Environments

The deployment system supports three environments:

| Environment | Service Name | Branch | Confirmation Required |
|------------|--------------|--------|----------------------|
| Development | trip-defender-backend-dev | develop | No |
| Staging | trip-defender-backend-staging | staging | No |
| Production | trip-defender-backend | main | Yes |

### Environment Configuration

Environment configurations are stored in `backend/config/deployment-config.json`:

```json
{
  "development": {
    "name": "development",
    "renderServiceName": "trip-defender-backend-dev",
    "region": "oregon",
    "plan": "free",
    "envVars": { ... },
    "healthCheckPath": "/",
    "autoDeployBranch": "develop"
  }
}
```

### List Available Environments

```bash
npm run env:list
```

Output:
```
📋 Available Environments:

✓ development
  Service: trip-defender-backend-dev
  Region: oregon
  Branch: develop

✓ staging
  Service: trip-defender-backend-staging
  Region: oregon
  Branch: staging

✓ production
  Service: trip-defender-backend
  Region: oregon
  Branch: main
  ⚠️  Requires confirmation
```

### Update Environment Variables

```bash
npm run env:update
```

This interactive command allows you to:
- Select an environment
- Add or update environment variables
- View current configuration

---

## Deployment Commands

### Basic Deployment

```bash
# Deploy to default environment (development)
npm run deploy

# Deploy to specific environment
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod
```

### Advanced Options

```bash
# Validate setup without deploying
npm run deploy:dev -- --validate-only

# Skip validation checks (not recommended)
npm run deploy:dev -- --skip-validation

# Dry run (show what would happen)
npm run deploy:dev -- --dry-run

# Combine options
npm run deploy:staging -- --validate-only --dry-run
```

### Deployment Workflow

When you run a deployment command, the system:

1. **Loads Environment Configuration**
   - Reads settings from `deployment-config.json`
   - Validates environment exists

2. **Runs Validation Checks**
   - Verifies Firebase credentials exist
   - Checks npm dependencies installed
   - Validates environment configuration
   - Confirms server files present

3. **Prepares Credentials**
   - Formats Firebase service account JSON
   - Saves to `firebase-credentials-for-render.txt`

4. **Generates Render Configuration**
   - Creates/updates `render.yaml`
   - Includes environment-specific settings

5. **Records Deployment**
   - Saves deployment metadata
   - Updates deployment history

6. **Displays Instructions**
   - Shows next steps for Render.com
   - Provides deployment URL
   - Lists verification steps

### Production Deployment Safety

Production deployments require explicit confirmation:

```bash
npm run deploy:prod
```

You'll see:
```
⚠️  Production Deployment Confirmation

You are about to deploy to PRODUCTION environment.

Service: trip-defender-backend
Region: oregon
Branch: main

Are you sure you want to continue? (yes/no):
```

Type `yes` to proceed.

---

## Health Checks

### Check Backend Status

```bash
# Check default environment
npm run health

# Check specific environment
npm run health:dev
npm run health:staging
npm run health:prod
```

### Health Check Output

```
🏥 Health Check: production

✓ Backend is healthy
  URL: https://trip-defender-backend.onrender.com
  Status: 200 OK
  Response Time: 245ms
  Environment: production
  Version: 1.0.0

Endpoints:
  ✓ GET / - 200 OK (245ms)
  ✓ POST /validate-admin-code - 400 Bad Request (180ms)

Last checked: 2025-11-23T03:53:03.668Z
```

### Health Check Timeout

Health checks timeout after 30 seconds. If the backend is sleeping (free tier), the first request may take longer.

### Custom Health Check

```bash
# Check custom URL
npm run health -- --url=https://custom-backend.onrender.com

# Increase timeout
npm run health -- --timeout=60000
```

---

## Environment Management

### View Current Environment

```bash
npm run env:list
```

### Update Environment Variables

```bash
npm run env:update
```

Interactive prompts will guide you through:
1. Selecting environment
2. Choosing variable to update
3. Entering new value
4. Confirming changes

### Add New Environment

Edit `backend/config/deployment-config.json`:

```json
{
  "new-environment": {
    "name": "new-environment",
    "displayName": "New Environment",
    "renderServiceName": "trip-defender-backend-new",
    "region": "oregon",
    "plan": "free",
    "envVars": {
      "NODE_ENV": "new-environment",
      "PORT": "10000"
    },
    "healthCheckPath": "/",
    "autoDeployBranch": "feature-branch",
    "requiresConfirmation": false
  }
}
```

---

## Deployment History & Rollback

### View Deployment History

```bash
npm run deployment-history
```

Output:
```
📜 Deployment History

Recent Deployments:

1. deploy_1732334003668
   Environment: production
   Timestamp: 2025-11-23 03:53:03
   Status: success
   URL: https://trip-defender-backend.onrender.com
   Duration: 3m 0s
   Deployed by: developer@example.com
   Commit: a1b2c3d (main)

2. deploy_1732330403668
   Environment: staging
   Timestamp: 2025-11-23 02:53:03
   Status: success
   URL: https://trip-defender-backend-staging.onrender.com
   Duration: 2m 45s
```

### Prepare Rollback

```bash
npm run rollback
```

This command:
1. Shows recent deployments
2. Lets you select a deployment to rollback to
3. Generates rollback instructions
4. Provides configuration to restore

**Note**: Rollback prepares the configuration but doesn't execute it automatically. You'll need to manually apply the changes on Render.com.

### Rollback Process

1. Run `npm run rollback`
2. Select deployment to rollback to
3. Follow displayed instructions
4. Update environment variables on Render
5. Trigger manual deploy on Render
6. Verify with health check

---

## CI/CD Integration

### GitHub Actions

#### Generate Workflow

```bash
npm run generate-cicd:github
```

This creates `.github/workflows/deploy.yml` with:
- Automatic deployment on push
- Manual deployment trigger
- Environment-specific jobs
- Validation and health checks

#### Required Secrets

Add these secrets in GitHub repository settings:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase credentials (single-line JSON) | Run `npm run prepare-credentials` |
| `RENDER_API_KEY` | Render.com API key | Get from Render dashboard → Account Settings → API Keys |

#### Setup Steps

1. **Generate workflow file**
   ```bash
   npm run generate-cicd:github
   ```

2. **Add secrets to GitHub**
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Add `FIREBASE_SERVICE_ACCOUNT` and `RENDER_API_KEY`

3. **Push workflow file**
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add deployment workflow"
   git push
   ```

4. **Trigger deployment**
   - Push to `main`, `staging`, or `develop` branch
   - Or use "Actions" tab → "Deploy Backend" → "Run workflow"

#### Workflow Triggers

```yaml
on:
  push:
    branches:
      - main        # Deploys to production
      - staging     # Deploys to staging
      - develop     # Deploys to development
  workflow_dispatch:  # Manual trigger
```

### GitLab CI

```bash
npm run generate-cicd:gitlab
```

Creates `.gitlab-ci.yml` with similar functionality.

### Other CI/CD Platforms

The deployment scripts work with any CI/CD platform that supports:
- Node.js runtime
- Environment variables
- Shell commands

Set these environment variables in your CI/CD platform:
- `FIREBASE_SERVICE_ACCOUNT`
- `RENDER_API_KEY` (optional, for automated deployments)

---

## Troubleshooting

### Common Issues

#### 1. Missing Firebase Credentials

**Error:**
```
❌ Validation Failed: MISSING_CREDENTIALS
Firebase service account file not found
```

**Solution:**
```bash
# Download from Firebase Console
# Save as backend/serviceAccountKey.json
npm run prepare-credentials
```

#### 2. Invalid Environment

**Error:**
```
❌ Deployment Failed: INVALID_ENVIRONMENT
Invalid environment specified: prod
```

**Solution:**
Use correct environment name:
```bash
npm run deploy:production  # Not deploy:prod
# Or
npm run deploy -- --env=production
```

#### 3. Validation Failed

**Error:**
```
❌ Validation Failed
- Dependencies not installed
- Environment configuration missing
```

**Solution:**
```bash
# Install dependencies
npm install

# Check environment config
npm run env:list

# Run validation only
npm run deploy:dev -- --validate-only
```

#### 4. Health Check Failed

**Error:**
```
❌ Health Check Failed
Backend is unreachable
```

**Solutions:**
- Check if backend is deployed on Render
- Verify service is running (not sleeping)
- Check Render logs for errors
- Verify URL is correct
- Wait 30 seconds if backend is waking up

#### 5. Production Confirmation Timeout

**Error:**
```
❌ Deployment cancelled: No confirmation received
```

**Solution:**
Type `yes` when prompted for production deployment.

### Debug Mode

Enable verbose logging:

```bash
DEBUG=true npm run deploy:dev
```

### Check Logs

View deployment logs:
```bash
# Local logs
cat backend/logs/deployment.log

# Render logs
# Go to Render dashboard → Your service → Logs
```

### Validation Only Mode

Test your setup without deploying:

```bash
npm run deploy:dev -- --validate-only
```

This checks:
- ✓ Firebase credentials
- ✓ Dependencies installed
- ✓ Environment configuration
- ✓ Server files present

---

## FAQ

### How do I deploy for the first time?

1. Run `npm run prepare-credentials`
2. Run `npm run deploy:dev -- --validate-only`
3. Fix any validation errors
4. Run `npm run deploy:dev`
5. Follow the displayed instructions on Render.com

### Can I deploy without validation?

Yes, but not recommended:
```bash
npm run deploy:dev -- --skip-validation
```

### How do I switch environments?

Just use the appropriate command:
```bash
npm run deploy:dev      # Development
npm run deploy:staging  # Staging
npm run deploy:prod     # Production
```

### What happens during deployment?

The script:
1. Validates your setup
2. Prepares credentials
3. Generates Render configuration
4. Records deployment history
5. Shows you next steps

**Note**: The script prepares everything but doesn't automatically deploy to Render. You need to manually trigger deployment on Render.com or use CI/CD.

### How do I automate deployments?

Use GitHub Actions:
```bash
npm run generate-cicd:github
```

Then add required secrets and push the workflow file.

### Can I rollback a deployment?

Yes:
```bash
npm run rollback
```

Select a previous deployment and follow the instructions.

### How do I check if my backend is running?

```bash
npm run health:prod
```

### What if the health check times out?

Free tier backends sleep after 15 minutes. The first request takes ~30 seconds to wake up. Wait and try again.

### How do I update environment variables?

```bash
npm run env:update
```

Or edit `backend/config/deployment-config.json` directly.

### Can I deploy to custom environments?

Yes, add your environment to `backend/config/deployment-config.json` and use:
```bash
npm run deploy -- --env=your-environment
```

### Where are deployment records stored?

In `backend/config/deployment-history.json`

### How do I see deployment history?

```bash
npm run deployment-history
```

### What files should I commit to Git?

**Commit:**
- `backend/config/deployment-config.json`
- `backend/scripts/*`
- `.github/workflows/deploy.yml`

**Don't commit:**
- `backend/serviceAccountKey.json`
- `backend/firebase-credentials-for-render.txt`
- `backend/.env`
- `backend/config/deployment-history.json` (optional)

### How do I get help?

1. Check this documentation
2. Check `backend/docs/TROUBLESHOOTING.md`
3. Run validation: `npm run deploy:dev -- --validate-only`
4. Check Render logs
5. Review deployment history: `npm run deployment-history`

---

## Next Steps

After successful deployment:

1. **Verify deployment**
   ```bash
   npm run health:prod
   ```

2. **Set up CI/CD**
   ```bash
   npm run generate-cicd:github
   ```

3. **Monitor your backend**
   - Check Render dashboard
   - Set up uptime monitoring
   - Configure alerts

4. **Update frontend**
   - Update backend URL in frontend configuration
   - Test end-to-end functionality

---

## Additional Resources

- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [CI/CD Setup Guide](./CICD_SETUP.md)
- [Render Documentation](https://render.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

*For issues or questions, check the troubleshooting guide or review deployment logs.*
