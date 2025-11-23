# CI/CD Setup Guide

This guide explains how to set up automated deployments using GitHub Actions or GitLab CI/CD.

## Quick Start

### Generate CI/CD Configuration

```bash
cd backend

# Generate GitHub Actions workflow (default)
npm run generate-cicd

# Or specify platform explicitly
npm run generate-cicd:github
npm run generate-cicd:gitlab
```

This will create:
- `.github/workflows/deploy.yml` (GitHub Actions) or `.gitlab-ci.yml` (GitLab)
- `backend/docs/CICD_SECRETS.md` (secrets documentation)

## GitHub Actions Setup

### 1. Add Required Secrets

Go to your repository settings and add these secrets:

**Repository Settings → Secrets and variables → Actions → New repository secret**

1. **FIREBASE_SERVICE_ACCOUNT**
   - Run: `cd backend && npm run prepare-credentials`
   - Copy the single-line JSON from `firebase-credentials-for-render.txt`
   - Paste as the secret value

2. **RENDER_API_KEY** (Optional - for future use)
   - Get from Render Dashboard → Account Settings → API Keys
   - Not currently used, but reserved for future automation

### 2. Configure Environments (Optional)

Create GitHub environments for better control:

**Repository Settings → Environments → New environment**

Create three environments:
- `development`
- `staging`
- `production`

For production, enable:
- Required reviewers (recommended)
- Wait timer (optional)
- Deployment branches: `main` only

### 3. Trigger Deployments

The workflow triggers automatically on:
- Push to `main` branch → deploys to production
- Push to `staging` branch → deploys to staging
- Push to `develop` branch → deploys to development

Or trigger manually:
1. Go to Actions tab
2. Select "Deploy Backend to Render" workflow
3. Click "Run workflow"
4. Choose environment and options

## GitLab CI/CD Setup

### 1. Add Required Variables

Go to your project settings and add these variables:

**Settings → CI/CD → Variables → Add variable**

1. **FIREBASE_SERVICE_ACCOUNT**
   - Type: Variable
   - Protected: Yes
   - Masked: Yes
   - Value: Single-line Firebase service account JSON

### 2. Configure Environments

GitLab automatically creates environments based on the CI configuration.

### 3. Trigger Deployments

The pipeline triggers automatically on:
- Push to `main` branch → deploys to production (manual approval required)
- Push to `staging` branch → deploys to staging
- Push to `develop` branch → deploys to development

## Workflow Features

### Automatic Environment Detection

The workflow automatically determines the target environment based on the branch:
- `main` → production
- `staging` → staging
- `develop` → development

### Validation Step

Before deployment, the workflow:
- Validates Firebase credentials
- Checks npm dependencies
- Verifies environment configuration
- Validates server setup

Skip validation with the `skip_validation` input (manual trigger only).

### Deployment Step

The deployment step:
- Prepares Firebase credentials
- Generates Render configuration
- Records deployment history
- Provides deployment instructions

### Health Check Step

After deployment, the workflow:
- Waits 30 seconds for deployment to stabilize
- Checks backend health endpoint
- Verifies the service is responding
- Reports any errors

### Deployment Summary

At the end, the workflow generates a summary showing:
- Target environment
- Branch and commit
- Triggered by (user)
- Status of each job
- Overall deployment result

## Workflow Options

When triggering manually, you can configure:

- **environment**: Choose development, staging, or production
- **skip_validation**: Skip pre-deployment validation checks
- **dry_run**: Simulate deployment without making changes

## CI Mode

The deployment scripts support a special `--ci` flag for CI/CD environments:

```bash
node scripts/deploy.js --env=production --ci
```

In CI mode:
- Skips interactive prompts (like production confirmation)
- Uses environment variables for credentials
- Exits with appropriate status codes
- Optimized for automated execution

## Troubleshooting

### Workflow fails with "Secret not found"

1. Verify secret name matches exactly: `FIREBASE_SERVICE_ACCOUNT`
2. Check secret is set at repository level (not environment level)
3. Ensure secret has been saved (not just created)

### Validation fails in CI

1. Check the Firebase service account JSON is properly formatted
2. Verify all required fields are present in the secret
3. Ensure the service account has necessary Firebase permissions

### Health check fails

1. Check Render logs for backend errors
2. Verify the backend is actually deployed and running
3. Check the health check URL is correct for your environment
4. Increase the wait time if deployment takes longer

### Deployment succeeds but backend not updated

1. Verify you're pushing to the correct branch
2. Check Render auto-deploy is enabled for your service
3. Review Render deployment logs
4. Ensure the render.yaml is properly configured

## Best Practices

1. **Use branch protection**
   - Require pull request reviews for `main`
   - Require status checks to pass
   - Prevent force pushes

2. **Test in development first**
   - Always deploy to development before staging
   - Test thoroughly in staging before production

3. **Monitor deployments**
   - Review GitHub Actions logs
   - Check Render deployment logs
   - Monitor backend health after deployment

4. **Rotate secrets regularly**
   - Generate new Firebase service account keys periodically
   - Update CI/CD secrets after rotation

5. **Use environment protection**
   - Require manual approval for production
   - Limit who can approve production deployments

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Render Deployment Documentation](https://render.com/docs)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)

## Related Documentation

- [CICD_SECRETS.md](./CICD_SECRETS.md) - Detailed secrets setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Manual deployment guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
