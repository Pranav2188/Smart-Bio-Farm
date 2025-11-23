# Deployment Troubleshooting Guide

This guide helps you diagnose and fix common issues with the automated deployment system.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Validation Errors](#validation-errors)
- [Deployment Errors](#deployment-errors)
- [Health Check Issues](#health-check-issues)
- [Environment Configuration Issues](#environment-configuration-issues)
- [CI/CD Issues](#cicd-issues)
- [Render.com Issues](#rendercom-issues)
- [Firebase Issues](#firebase-issues)
- [Debugging Tips](#debugging-tips)
- [Log Analysis](#log-analysis)
- [Getting Help](#getting-help)

---

## Quick Diagnostics

Run these commands to quickly identify issues:

```bash
# 1. Validate your setup
npm run deploy:dev -- --validate-only

# 2. Check environment configuration
npm run env:list

# 3. Test health endpoint
npm run health:dev

# 4. View recent deployments
npm run deployment-history
```

---

## Validation Errors

### Error: MISSING_CREDENTIALS

**Full Error:**
```
❌ Validation Failed: MISSING_CREDENTIALS
Firebase service account file not found
```

**Cause:** The `serviceAccountKey.json` file is missing from the backend directory.

**Solution:**

1. Download Firebase service account key:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

2. Save the file:
   ```bash
   # Save as backend/serviceAccountKey.json
   # Make sure the filename is exact
   ```

3. Prepare credentials:
   ```bash
   npm run prepare-credentials
   ```

4. Verify:
   ```bash
   npm run deploy:dev -- --validate-only
   ```

---

### Error: INVALID_CREDENTIALS

**Full Error:**
```
❌ Validation Failed: INVALID_CREDENTIALS
Firebase service account file is not valid JSON
```

**Cause:** The service account file is corrupted or not valid JSON.

**Solutions:**

1. **Check file format:**
   ```bash
   # On Windows
   type backend\serviceAccountKey.json
   
   # Should show valid JSON starting with {
   ```

2. **Re-download the file:**
   - Download a fresh copy from Firebase Console
   - Don't edit the file manually
   - Save with UTF-8 encoding

3. **Verify JSON structure:**
   ```bash
   node -e "console.log(JSON.parse(require('fs').readFileSync('backend/serviceAccountKey.json')))"
   ```

---

### Error: MISSING_CREDENTIAL_FIELDS

**Full Error:**
```
❌ Validation Failed: MISSING_CREDENTIAL_FIELDS
Required fields missing: private_key, client_email
```

**Cause:** The service account file is missing required fields.

**Solution:**

1. Download a new service account key from Firebase Console
2. Ensure you're downloading the **Admin SDK** key, not a web API key
3. The file should contain these fields:
   - `type`
   - `project_id`
   - `private_key_id`
   - `private_key`
   - `client_email`
   - `client_id`
   - `auth_uri`
   - `token_uri`

---

### Error: DEPENDENCIES_NOT_INSTALLED

**Full Error:**
```
❌ Validation Failed: DEPENDENCIES_NOT_INSTALLED
npm dependencies are not installed
```

**Cause:** Node modules are missing or incomplete.

**Solution:**

```bash
cd backend
npm install
```

If that doesn't work:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

### Error: INVALID_ENVIRONMENT

**Full Error:**
```
❌ Deployment Failed: INVALID_ENVIRONMENT
Invalid environment specified: prod
```

**Cause:** Using incorrect environment name.

**Solution:**

Use correct environment names:
- `development` (not `dev`)
- `staging`
- `production` (not `prod`)

```bash
# Correct
npm run deploy:dev          # Uses 'development'
npm run deploy:staging      # Uses 'staging'
npm run deploy:prod         # Uses 'production'

# Or explicit
npm run deploy -- --env=development
```

---

### Error: ENVIRONMENT_CONFIG_NOT_FOUND

**Full Error:**
```
❌ Validation Failed: ENVIRONMENT_CONFIG_NOT_FOUND
Environment configuration not found for: development
```

**Cause:** Missing or corrupted `deployment-config.json`.

**Solution:**

1. **Check if file exists:**
   ```bash
   dir backend\config\deployment-config.json
   ```

2. **Verify JSON is valid:**
   ```bash
   node -e "console.log(JSON.parse(require('fs').readFileSync('backend/config/deployment-config.json')))"
   ```

3. **Restore from template:**
   If file is missing or corrupted, create it with this structure:
   ```json
   {
     "development": {
       "name": "development",
       "displayName": "Development",
       "renderServiceName": "your-app-backend-dev",
       "region": "oregon",
       "plan": "free",
       "envVars": {
         "NODE_ENV": "development",
         "PORT": "10000"
       },
       "healthCheckPath": "/",
       "autoDeployBranch": "develop",
       "requiresConfirmation": false
     }
   }
   ```

---

## Deployment Errors

### Error: PRODUCTION_CONFIRMATION_REQUIRED

**Full Error:**
```
❌ Deployment cancelled: No confirmation received
```

**Cause:** Production deployment requires explicit confirmation.

**Solution:**

When prompted, type `yes` and press Enter:
```
⚠️  Production Deployment Confirmation

You are about to deploy to PRODUCTION environment.

Are you sure you want to continue? (yes/no): yes
```

To skip confirmation (not recommended):
```bash
npm run deploy:prod -- --skip-confirmation
```

---

### Error: RENDER_CONFIG_GENERATION_FAILED

**Full Error:**
```
❌ Deployment Failed: RENDER_CONFIG_GENERATION_FAILED
Failed to generate render.yaml
```

**Cause:** Unable to create or update render.yaml file.

**Solutions:**

1. **Check file permissions:**
   ```bash
   # Ensure you have write permissions in the backend directory
   ```

2. **Check disk space:**
   ```bash
   # Ensure you have available disk space
   ```

3. **Manual creation:**
   Create `backend/render.yaml` manually:
   ```yaml
   services:
     - type: web
       name: your-service-name
       env: node
       region: oregon
       plan: free
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 10000
   ```

---

## Health Check Issues

### Error: BACKEND_UNREACHABLE

**Full Error:**
```
❌ Health Check Failed
Backend is unreachable
Connection timeout after 30 seconds
```

**Causes & Solutions:**

1. **Backend is sleeping (Free tier)**
   - Free tier backends sleep after 15 minutes of inactivity
   - First request takes ~30 seconds to wake up
   - **Solution:** Wait 30 seconds and try again
   ```bash
   npm run health:prod -- --timeout=60000
   ```

2. **Backend not deployed**
   - Check Render dashboard
   - Verify service is created and deployed
   - **Solution:** Deploy the backend first

3. **Wrong URL**
   - Check environment configuration
   - **Solution:** Verify URL in deployment-config.json

4. **Service is down**
   - Check Render logs for errors
   - **Solution:** Fix errors and redeploy

---

### Error: HEALTH_CHECK_TIMEOUT

**Full Error:**
```
❌ Health Check Failed
Request timeout after 30000ms
```

**Solutions:**

1. **Increase timeout:**
   ```bash
   npm run health:prod -- --timeout=60000
   ```

2. **Check if backend is waking up:**
   ```bash
   # Try multiple times with delays
   npm run health:prod
   # Wait 30 seconds
   npm run health:prod
   ```

3. **Check Render status:**
   - Go to Render dashboard
   - Check if service is "Live" (green)
   - Review recent logs

---

### Error: UNHEALTHY_RESPONSE

**Full Error:**
```
❌ Health Check Failed
Backend returned unhealthy status
Status: 500 Internal Server Error
```

**Solutions:**

1. **Check Render logs:**
   - Go to Render dashboard → Your service → Logs
   - Look for error messages

2. **Common causes:**
   - Missing environment variables
   - Firebase credentials not set
   - Database connection issues
   - Code errors

3. **Verify environment variables:**
   ```bash
   # Check what's configured
   npm run env:list
   
   # Update if needed
   npm run env:update
   ```

4. **Test locally:**
   ```bash
   cd backend
   npm start
   # Visit http://localhost:10000
   ```

---

## Environment Configuration Issues

### Error: ENVIRONMENT_VARIABLE_MISSING

**Full Error:**
```
❌ Validation Failed: ENVIRONMENT_VARIABLE_MISSING
Required environment variable not found: ADMIN_SETUP_CODE
```

**Solution:**

1. **Update environment configuration:**
   ```bash
   npm run env:update
   ```

2. **Or edit manually:**
   Edit `backend/config/deployment-config.json`:
   ```json
   {
     "production": {
       "envVars": {
         "NODE_ENV": "production",
         "PORT": "10000",
         "ADMIN_SETUP_CODE": "your_code_here"
       }
     }
   }
   ```

---

### Error: DUPLICATE_ENVIRONMENT

**Full Error:**
```
❌ Configuration Error: DUPLICATE_ENVIRONMENT
Environment 'production' is defined multiple times
```

**Solution:**

Edit `backend/config/deployment-config.json` and ensure each environment is defined only once.

---

## CI/CD Issues

### GitHub Actions: Secret Not Found

**Error in GitHub Actions:**
```
Error: Secret FIREBASE_SERVICE_ACCOUNT not found
```

**Solution:**

1. **Add secret to GitHub:**
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Run `npm run prepare-credentials` and copy the output

2. **Verify secret name matches workflow:**
   Check `.github/workflows/deploy.yml`:
   ```yaml
   env:
     FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
   ```

---

### GitHub Actions: Workflow Not Triggering

**Cause:** Workflow file not in correct location or branch.

**Solution:**

1. **Check file location:**
   ```
   .github/workflows/deploy.yml  ✓ Correct
   .github/workflow/deploy.yml   ✗ Wrong (missing 's')
   github/workflows/deploy.yml   ✗ Wrong (missing '.')
   ```

2. **Check branch:**
   - Workflow file must be in the branch you're pushing to
   - Push workflow file to main/staging/develop branches

3. **Check workflow syntax:**
   ```bash
   # Validate YAML syntax
   npm run generate-cicd:github
   ```

---

### GitHub Actions: Permission Denied

**Error:**
```
Error: Resource not accessible by integration
```

**Solution:**

1. **Update workflow permissions:**
   Add to `.github/workflows/deploy.yml`:
   ```yaml
   permissions:
     contents: read
     deployments: write
   ```

2. **Check repository settings:**
   - Settings → Actions → General
   - Workflow permissions → Read and write permissions

---

## Render.com Issues

### Service Not Starting

**Symptoms:**
- Service shows "Deploy failed"
- Logs show startup errors

**Solutions:**

1. **Check build logs:**
   - Render dashboard → Your service → Logs
   - Look for npm install errors

2. **Verify start command:**
   Should be: `npm start` or `node server.js`

3. **Check environment variables:**
   - Ensure `FIREBASE_SERVICE_ACCOUNT` is set
   - Verify it's a single-line JSON string
   - Check for typos in variable names

4. **Verify Node version:**
   Add to `package.json`:
   ```json
   {
     "engines": {
       "node": "18.x"
     }
   }
   ```

---

### Environment Variable Not Working

**Symptoms:**
- Backend starts but features don't work
- Logs show "undefined" for environment variables

**Solutions:**

1. **Check variable format on Render:**
   - Go to service → Environment tab
   - Verify variable names match exactly (case-sensitive)
   - For `FIREBASE_SERVICE_ACCOUNT`, ensure it's single-line JSON

2. **Redeploy after adding variables:**
   - Render doesn't auto-redeploy when you add variables
   - Click "Manual Deploy" → "Deploy latest commit"

3. **Check for quotes:**
   - Don't add extra quotes around values
   - Render handles this automatically

---

### Deployment Stuck

**Symptoms:**
- Deployment shows "In progress" for >10 minutes
- No logs appearing

**Solutions:**

1. **Cancel and retry:**
   - Click "Cancel Deploy"
   - Wait 1 minute
   - Click "Manual Deploy"

2. **Check Render status:**
   - Visit https://status.render.com
   - Check for ongoing incidents

3. **Contact Render support:**
   - If issue persists >30 minutes
   - Use Render dashboard support chat

---

## Firebase Issues

### Invalid Service Account

**Error in Render logs:**
```
Error: The provided service account is invalid
```

**Solutions:**

1. **Regenerate service account:**
   - Go to Firebase Console
   - Project Settings → Service Accounts
   - Generate new private key

2. **Format correctly:**
   ```bash
   npm run prepare-credentials
   ```

3. **Update on Render:**
   - Copy the single-line JSON
   - Update `FIREBASE_SERVICE_ACCOUNT` variable
   - Redeploy

---

### Permission Denied

**Error in Render logs:**
```
Error: Permission denied for resource
```

**Solutions:**

1. **Check Firebase rules:**
   - Ensure service account has necessary permissions
   - Check Firestore security rules

2. **Verify project ID:**
   - Ensure service account is for correct Firebase project
   - Check `project_id` in serviceAccountKey.json

---

## Debugging Tips

### Enable Debug Mode

```bash
# Set debug environment variable
DEBUG=true npm run deploy:dev
```

### Check File Existence

```bash
# Check if files exist
dir backend\serviceAccountKey.json
dir backend\config\deployment-config.json
dir backend\server.js
```

### Validate JSON Files

```bash
# Validate serviceAccountKey.json
node -e "console.log(JSON.parse(require('fs').readFileSync('backend/serviceAccountKey.json')))"

# Validate deployment-config.json
node -e "console.log(JSON.parse(require('fs').readFileSync('backend/config/deployment-config.json')))"
```

### Test Locally First

```bash
cd backend
npm install
npm start

# In another terminal
curl http://localhost:10000
```

### Check Network Connectivity

```bash
# Test if you can reach Render
curl https://api.render.com

# Test your deployed backend
curl https://your-backend.onrender.com
```

---

## Log Analysis

### Reading Deployment Logs

Local deployment logs are stored in:
```
backend/logs/deployment.log
```

View recent logs:
```bash
type backend\logs\deployment.log
```

### Reading Render Logs

1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. Look for:
   - Build errors (during npm install)
   - Start errors (during npm start)
   - Runtime errors (after service starts)

### Common Log Patterns

**Successful deployment:**
```
==> Building...
==> Installing dependencies
==> Build successful
==> Starting service
Server is running on port 10000
```

**Missing environment variable:**
```
Error: FIREBASE_SERVICE_ACCOUNT is not defined
```

**Invalid credentials:**
```
Error: Could not load the default credentials
```

**Port binding error:**
```
Error: listen EADDRINUSE: address already in use :::10000
```

---

## Getting Help

### Self-Service Resources

1. **Run diagnostics:**
   ```bash
   npm run deploy:dev -- --validate-only
   npm run health:dev
   npm run deployment-history
   ```

2. **Check documentation:**
   - [Deployment Guide](./DEPLOYMENT.md)
   - [CI/CD Setup](./CICD_SETUP.md)
   - This troubleshooting guide

3. **Review logs:**
   - Local: `backend/logs/deployment.log`
   - Render: Dashboard → Service → Logs

### Still Need Help?

1. **Gather information:**
   - Error message (full text)
   - Command you ran
   - Environment (dev/staging/prod)
   - Recent changes made
   - Relevant log excerpts

2. **Check external resources:**
   - [Render Documentation](https://render.com/docs)
   - [Firebase Documentation](https://firebase.google.com/docs)
   - [Node.js Documentation](https://nodejs.org/docs)

3. **Community support:**
   - Render Community Forum
   - Stack Overflow (tag: render.com, firebase-admin)

---

## Common Error Codes Reference

| Error Code | Meaning | Quick Fix |
|-----------|---------|-----------|
| `MISSING_CREDENTIALS` | Service account file not found | Run `npm run prepare-credentials` |
| `INVALID_CREDENTIALS` | Service account JSON is invalid | Re-download from Firebase Console |
| `MISSING_CREDENTIAL_FIELDS` | Required fields missing | Download Admin SDK key, not web key |
| `DEPENDENCIES_NOT_INSTALLED` | node_modules missing | Run `npm install` |
| `INVALID_ENVIRONMENT` | Wrong environment name | Use: development, staging, production |
| `ENVIRONMENT_CONFIG_NOT_FOUND` | Config file missing | Check `backend/config/deployment-config.json` |
| `VALIDATION_FAILED` | Pre-deployment checks failed | Run with `--validate-only` to see details |
| `HEALTH_CHECK_FAILED` | Backend not responding | Check Render logs, wait for wake-up |
| `BACKEND_UNREACHABLE` | Cannot connect to backend | Verify URL, check if service is running |
| `PRODUCTION_CONFIRMATION_REQUIRED` | Need to confirm prod deploy | Type `yes` when prompted |

---

## Prevention Tips

### Before Deploying

1. ✅ Run validation: `npm run deploy:dev -- --validate-only`
2. ✅ Test locally: `npm start`
3. ✅ Check environment config: `npm run env:list`
4. ✅ Verify credentials: `npm run prepare-credentials`

### After Deploying

1. ✅ Run health check: `npm run health:prod`
2. ✅ Check Render logs for errors
3. ✅ Test critical endpoints
4. ✅ Record deployment: Automatic with deployment system

### Regular Maintenance

1. ✅ Review deployment history monthly
2. ✅ Update dependencies regularly
3. ✅ Rotate Firebase credentials periodically
4. ✅ Monitor Render service health
5. ✅ Keep documentation updated

---

*Last updated: November 23, 2025*
