# Configuration Files

This directory contains configuration files for the deployment automation system.

## Files

### deployment-config.json
Environment-specific deployment configurations for development, staging, and production environments.

**Structure:**
```json
{
  "environment_name": {
    "name": "environment_name",
    "renderServiceName": "service-name",
    "region": "oregon",
    "plan": "free",
    "envVars": {
      "NODE_ENV": "environment_name",
      "PORT": "10000"
    },
    "healthCheckPath": "/",
    "autoDeployBranch": "branch-name",
    "requiresConfirmation": true
  }
}
```

### deployment-history.json
Records of all deployments for tracking and rollback purposes.

**Structure:**
```json
{
  "version": "1.0.0",
  "deployments": [
    {
      "id": "deploy_1234567890",
      "timestamp": "2025-11-23T03:53:03.668Z",
      "environment": "production",
      "version": "1.0.0",
      "gitCommit": "a1b2c3d4e5f6",
      "gitBranch": "main",
      "deployedBy": "developer@example.com",
      "configuration": {
        "renderServiceName": "service-name",
        "region": "oregon",
        "plan": "free"
      },
      "status": "success",
      "deploymentUrl": "https://service.onrender.com",
      "duration": 180000,
      "notes": "Optional deployment notes"
    }
  ]
}
```

## Deployment Record Schema

### Required Fields
- `id` (string): Unique deployment identifier (format: `deploy_<timestamp>`)
- `timestamp` (string): ISO 8601 timestamp of deployment
- `environment` (string): Target environment (development, staging, production)
- `status` (string): Deployment status (pending, in_progress, success, failed, rolled_back)

### Optional Fields
- `version` (string): Application version from package.json
- `gitCommit` (string): Git commit hash
- `gitBranch` (string): Git branch name
- `deployedBy` (string): Email of person who deployed
- `configuration` (object): Environment configuration used
- `deploymentUrl` (string): URL of deployed service
- `duration` (number): Deployment duration in milliseconds
- `notes` (string): Additional notes about the deployment

## History Management

### Automatic Cleanup
The history tracker automatically manages the deployment history:

- **Maximum Records**: 50 deployments (configurable)
- **Retention Period**: 90 days (configurable)
- **Cleanup Trigger**: On each new deployment

### Manual Management
You can manually manage the history file:

```bash
# View deployment history
npm run deployment-history

# View history for specific environment
npm run deployment-history -- --env=production

# View last N deployments
npm run deployment-history -- --limit=10
```

## Rollback Support

The deployment history enables rollback functionality:

```bash
# View rollback plan for a deployment
npm run rollback -- --deployment=deploy_1234567890

# List recent deployments to find ID
npm run deployment-history -- --limit=5
```

## File Locations

- Configuration files: `backend/config/`
- Deployment scripts: `backend/scripts/`
- Documentation: `backend/docs/`

## Security Notes

- Deployment history is tracked in git for audit purposes
- Sensitive data (credentials, API keys) should never be stored in history
- Configuration objects in history should only contain non-sensitive settings
- Use environment variables for sensitive configuration

## Backup Recommendations

While deployment history is tracked in git, consider:

1. Regular backups of the config directory
2. Exporting history before major changes
3. Keeping deployment history in sync across team members

## Troubleshooting

### History file corrupted
If the deployment-history.json file becomes corrupted:

1. Restore from git: `git checkout backend/config/deployment-history.json`
2. Or reset: `echo '{"version":"1.0.0","deployments":[]}' > backend/config/deployment-history.json`

### History not updating
Check file permissions and ensure the scripts have write access to the config directory.

### Too many records
Adjust cleanup settings in `backend/scripts/utils/constants.js`:
```javascript
HISTORY: {
  MAX_RECORDS: 50,      // Reduce this number
  RETENTION_DAYS: 90    // Or reduce retention period
}
```
