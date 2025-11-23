# Required CI/CD Secrets

## GitHub Actions Secrets

To set up GitHub Actions, add the following secrets to your repository:

### Repository Settings → Secrets and variables → Actions → New repository secret

1. **FIREBASE_SERVICE_ACCOUNT**
   - Description: Firebase service account JSON (single-line format)
   - How to get:
     1. Go to Firebase Console → Project Settings → Service Accounts
     2. Click "Generate new private key"
     3. Run: `cd backend && npm run prepare-credentials`
     4. Copy the single-line JSON from `firebase-credentials-for-render.txt`
   - Format: Single-line JSON string
   - Example: `{"type":"service_account","project_id":"your-project",...}`

2. **RENDER_API_KEY** (Optional - for automated deployments)
   - Description: Render.com API key for programmatic deployments
   - How to get:
     1. Go to Render Dashboard → Account Settings → API Keys
     2. Click "Create API Key"
     3. Copy the generated key
   - Format: String
   - Note: Currently not used, but reserved for future Render API integration

### Environment-Specific Secrets

For each environment (development, staging, production), you may want to configure:

1. Go to Repository Settings → Environments
2. Create environments: `development`, `staging`, `production`
3. Add environment-specific secrets if needed

### Branch Protection Rules

Recommended branch protection for production deployments:

1. Go to Repository Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging

## GitLab CI/CD Variables

To set up GitLab CI/CD, add the following variables:

### Settings → CI/CD → Variables → Add variable

1. **FIREBASE_SERVICE_ACCOUNT**
   - Type: Variable
   - Protected: Yes
   - Masked: Yes
   - Environment scope: All
   - Value: Single-line Firebase service account JSON

2. **SKIP_VALIDATION** (Optional)
   - Type: Variable
   - Protected: No
   - Masked: No
   - Environment scope: All
   - Value: `true` or `false`

### Environment-Specific Variables

Create environment-specific variables for each deployment target:

1. Go to Settings → CI/CD → Variables
2. Add variables with environment scope:
   - `development`
   - `staging`
   - `production`

## Security Best Practices

1. **Never commit secrets to version control**
   - Always use CI/CD secrets/variables
   - Add `serviceAccountKey.json` to `.gitignore`

2. **Rotate secrets regularly**
   - Generate new Firebase service account keys periodically
   - Update CI/CD secrets after rotation

3. **Use environment-specific credentials**
   - Different Firebase projects for dev/staging/prod
   - Separate service accounts per environment

4. **Limit secret access**
   - Only grant access to team members who need it
   - Use environment protection rules for production

5. **Monitor secret usage**
   - Review CI/CD logs for unauthorized access
   - Enable audit logging in Firebase Console

## Troubleshooting

### Secret not found error

If you see "Secret not found" errors:

1. Verify secret name matches exactly (case-sensitive)
2. Check secret is available in the correct scope (repository vs environment)
3. Ensure secret has been saved (not just created)

### Invalid Firebase credentials

If Firebase authentication fails:

1. Verify the JSON is properly formatted (single-line)
2. Check all required fields are present
3. Ensure the service account has necessary permissions
4. Verify the Firebase project ID matches your configuration

### Permission denied errors

If deployment fails with permission errors:

1. Check the service account has required Firebase roles
2. Verify GitHub Actions has write permissions to repository
3. Ensure environment protection rules allow the deployment

## Additional Resources

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitLab CI/CD Variables Documentation](https://docs.gitlab.com/ee/ci/variables/)
- [Firebase Service Account Documentation](https://firebase.google.com/docs/admin/setup)
- [Render Deployment Documentation](https://render.com/docs)
