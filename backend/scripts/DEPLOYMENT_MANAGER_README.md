# Deployment Manager

The Deployment Manager orchestrates the full deployment workflow for the Trip Defender backend to Render.com.

## Features

- **Environment-specific deployments**: Deploy to development, staging, or production
- **Automated validation**: Pre-deployment checks for credentials, dependencies, and configuration
- **Credential management**: Automatic Firebase credential preparation and formatting
- **Render configuration generation**: Creates environment-specific render.yaml files
- **Deployment history**: Tracks all deployments with metadata
- **Dry-run mode**: Test deployments without making changes
- **Production safety**: Requires confirmation for production deployments

## Usage

### Basic Deployment

```bash
# Deploy to development (default)
npm run deploy

# Deploy to specific environment
npm run deploy -- --env=staging
npm run deploy -- --env=production

# Or use shortcuts
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod
```

### Advanced Options

```bash
# Dry run (simulate without changes)
npm run deploy -- --dry-run

# Skip validation checks
npm run deploy -- --skip-validation

# Validate only (don't deploy)
npm run deploy -- --validate-only

# Verbose output
npm run deploy -- --verbose

# Show help
npm run deploy -- --help
```

## Deployment Workflow

The deployment manager executes the following steps:

1. **Load Environment Configuration**: Loads environment-specific settings from `config/deployment-config.json`
2. **Confirm Production Deployment**: Requires user confirmation for production deployments
3. **Run Validation Checks**: Validates credentials, dependencies, environment, and server configuration
4. **Prepare Firebase Credentials**: Formats Firebase service account for Render
5. **Generate Render Configuration**: Creates/updates `render.yaml` with environment-specific settings
6. **Record Deployment**: Saves deployment metadata to history
7. **Display Instructions**: Shows next steps for completing deployment on Render

## Environment Configuration

Environments are configured in `backend/config/deployment-config.json`:

```json
{
  "development": {
    "name": "development",
    "renderServiceName": "trip-defender-backend-dev",
    "region": "oregon",
    "plan": "free",
    "envVars": {
      "NODE_ENV": "development",
      "PORT": "10000",
      "ADMIN_SETUP_CODE": "DEV_CODE_2025"
    },
    "healthCheckPath": "/",
    "autoDeployBranch": "develop"
  }
}
```

## Validation Checks

The deployment manager validates:

- **Dependencies**: All npm packages are installed
- **Firebase Credentials**: Service account file exists and is valid
- **Environment Configuration**: Target environment is properly configured
- **Server Configuration**: Required files (server.js, package.json) exist

## Render Configuration

The generated `render.yaml` includes:

- Service name (environment-specific)
- Region and plan
- Build and start commands
- Environment variables
- Health check path
- Auto-deploy branch (if configured)

## Deployment History

All deployments are recorded in `backend/config/deployment-history.json` with:

- Deployment ID and timestamp
- Environment and version
- Git commit and branch
- Deployment status and duration
- Configuration snapshot

View history:
```bash
npm run deployment-history
```

## Production Deployments

Production deployments require explicit confirmation:

```bash
npm run deploy:prod

# You will be prompted:
# ⚠️  You are about to deploy to PRODUCTION
# This will affect live users!
# Type "yes" to confirm deployment:
```

## Dry Run Mode

Test deployments without making changes:

```bash
npm run deploy -- --dry-run --verbose

# Shows what would happen:
# - Validation results
# - Generated render.yaml content
# - Deployment instructions
# - No files are written
# - No history is recorded
```

## Error Handling

The deployment manager provides detailed error messages with remediation steps:

```
✗ Deployment failed: Firebase service account file not found

📋 To fix this:
   Go to Firebase Console → Project Settings → Service Accounts
   Click "Generate new private key"
   Save as backend/serviceAccountKey.json
   
   Or run: npm run prepare-credentials
```

## Exit Codes

- `0`: Success
- `1`: Validation error
- `2`: Configuration error
- `3`: Deployment error
- `99`: Unknown error

## Integration with Other Scripts

The deployment manager integrates with:

- **Validator**: Pre-deployment validation checks
- **Credential Manager**: Firebase credential preparation
- **Environment Manager**: Environment configuration management
- **History Tracker**: Deployment history and rollback
- **Health Checker**: Post-deployment verification

## Examples

### Deploy to Development

```bash
npm run deploy:dev
```

### Deploy to Staging with Validation

```bash
npm run deploy:staging
```

### Deploy to Production

```bash
npm run deploy:prod
# Requires confirmation
```

### Test Deployment (Dry Run)

```bash
npm run deploy -- --env=staging --dry-run
```

### Validate Setup Only

```bash
npm run deploy -- --validate-only
```

### Skip Validation (Not Recommended)

```bash
npm run deploy -- --skip-validation
```

## Troubleshooting

### Validation Fails

Run validation only to see detailed errors:
```bash
npm run deploy -- --validate-only
```

### Credentials Not Found

Prepare credentials:
```bash
npm run prepare-credentials
```

### Environment Not Found

List available environments:
```bash
npm run env:list
```

### Deployment History Issues

Check history file exists:
```bash
ls backend/config/deployment-history.json
```

## Related Commands

- `npm run health` - Check backend health
- `npm run deployment-history` - View deployment history
- `npm run rollback` - Prepare rollback plan
- `npm run env:list` - List environments
- `npm run prepare-credentials` - Prepare Firebase credentials

## Documentation

- Deployment Guide: `backend/docs/DEPLOYMENT.md`
- Troubleshooting: `backend/docs/TROUBLESHOOTING.md`
- Requirements: `.kiro/specs/deployment-automation/requirements.md`
- Design: `.kiro/specs/deployment-automation/design.md`
