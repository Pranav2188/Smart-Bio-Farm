#!/usr/bin/env node

/**
 * CI/CD Configuration Generator
 * 
 * Generates CI/CD workflow configurations for various platforms
 * and provides documentation for required secrets.
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('./utils/logger');

class CICDConfigGenerator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.workflowsDir = path.join(this.projectRoot, '.github', 'workflows');
  }

  /**
   * Generate GitHub Actions workflow
   */
  async generateGitHubActions() {
    logger.info('Generating GitHub Actions workflow...');

    const workflow = `name: Deploy Backend to Render

on:
  push:
    branches:
      - main
      - staging
      - develop
    paths:
      - 'backend/**'
      - '.github/workflows/deploy.yml'
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        options:
          - development
          - staging
          - production
      skip_validation:
        description: 'Skip validation checks'
        required: false
        type: boolean
        default: false
      dry_run:
        description: 'Dry run (simulate deployment)'
        required: false
        type: boolean
        default: false

env:
  NODE_VERSION: '18'

jobs:
  determine-environment:
    name: Determine Environment
    runs-on: ubuntu-latest
    outputs:
      environment: \${{ steps.set-env.outputs.environment }}
    steps:
      - name: Set environment based on branch
        id: set-env
        run: |
          if [ "\${{ github.event_name }}" == "workflow_dispatch" ]; then
            echo "environment=\${{ github.event.inputs.environment }}" >> $GITHUB_OUTPUT
          elif [ "\${{ github.ref }}" == "refs/heads/main" ]; then
            echo "environment=production" >> $GITHUB_OUTPUT
          elif [ "\${{ github.ref }}" == "refs/heads/staging" ]; then
            echo "environment=staging" >> $GITHUB_OUTPUT
          elif [ "\${{ github.ref }}" == "refs/heads/develop" ]; then
            echo "environment=development" >> $GITHUB_OUTPUT
          else
            echo "environment=development" >> $GITHUB_OUTPUT
          fi

  validate:
    name: Validate Deployment Setup
    runs-on: ubuntu-latest
    needs: determine-environment
    if: github.event.inputs.skip_validation != 'true'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Create Firebase credentials file
        run: |
          cd backend
          echo '\${{ secrets.FIREBASE_SERVICE_ACCOUNT }}' > serviceAccountKey.json

      - name: Run validation checks
        run: |
          cd backend
          node scripts/validator.js --environment=\${{ needs.determine-environment.outputs.environment }}

      - name: Clean up credentials
        if: always()
        run: |
          cd backend
          rm -f serviceAccountKey.json

  deploy:
    name: Deploy to \${{ needs.determine-environment.outputs.environment }}
    runs-on: ubuntu-latest
    needs: [determine-environment, validate]
    if: always() && (needs.validate.result == 'success' || needs.validate.result == 'skipped')
    environment:
      name: \${{ needs.determine-environment.outputs.environment }}
      url: \${{ steps.deploy.outputs.deployment_url }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Create Firebase credentials file
        run: |
          cd backend
          echo '\${{ secrets.FIREBASE_SERVICE_ACCOUNT }}' > serviceAccountKey.json

      - name: Prepare deployment
        id: deploy
        run: |
          cd backend
          
          # Build deployment flags
          FLAGS="--env=\${{ needs.determine-environment.outputs.environment }}"
          
          if [ "\${{ github.event.inputs.skip_validation }}" == "true" ]; then
            FLAGS="$FLAGS --skip-validation"
          fi
          
          if [ "\${{ github.event.inputs.dry_run }}" == "true" ]; then
            FLAGS="$FLAGS --dry-run"
          fi
          
          # Run deployment script
          node scripts/deploy.js $FLAGS --ci
          
          # Set deployment URL based on environment
          if [ "\${{ needs.determine-environment.outputs.environment }}" == "production" ]; then
            echo "deployment_url=https://trip-defender-backend.onrender.com" >> $GITHUB_OUTPUT
          elif [ "\${{ needs.determine-environment.outputs.environment }}" == "staging" ]; then
            echo "deployment_url=https://trip-defender-backend-staging.onrender.com" >> $GITHUB_OUTPUT
          else
            echo "deployment_url=https://trip-defender-backend-dev.onrender.com" >> $GITHUB_OUTPUT
          fi

      - name: Clean up credentials
        if: always()
        run: |
          cd backend
          rm -f serviceAccountKey.json

      - name: Upload deployment artifacts
        if: success()
        uses: actions/upload-artifact@v4
        with:
          name: deployment-config-\${{ needs.determine-environment.outputs.environment }}
          path: |
            backend/config/deployment-history.json
            backend/firebase-credentials-for-render.txt
          retention-days: 30

  health-check:
    name: Health Check
    runs-on: ubuntu-latest
    needs: [determine-environment, deploy]
    if: success() && github.event.inputs.dry_run != 'true'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Wait for deployment to stabilize
        run: sleep 30

      - name: Run health check
        id: health
        run: |
          cd backend
          node scripts/health-check.js --env=\${{ needs.determine-environment.outputs.environment }}

      - name: Health check failed
        if: failure()
        run: |
          echo "::error::Health check failed for \${{ needs.determine-environment.outputs.environment }} environment"
          echo "Please check the Render dashboard and logs for more information"
          exit 1

  notify:
    name: Notify Deployment Status
    runs-on: ubuntu-latest
    needs: [determine-environment, validate, deploy, health-check]
    if: always()
    steps:
      - name: Deployment Summary
        run: |
          echo "## Deployment Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "- **Environment**: \${{ needs.determine-environment.outputs.environment }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Branch**: \${{ github.ref_name }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Commit**: \${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Triggered by**: \${{ github.actor }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "### Job Status" >> $GITHUB_STEP_SUMMARY
          echo "- Validation: \${{ needs.validate.result }}" >> $GITHUB_STEP_SUMMARY
          echo "- Deployment: \${{ needs.deploy.result }}" >> $GITHUB_STEP_SUMMARY
          echo "- Health Check: \${{ needs.health-check.result }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          
          if [ "\${{ needs.health-check.result }}" == "success" ]; then
            echo "✅ Deployment completed successfully!" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ Deployment encountered issues. Please review the logs." >> $GITHUB_STEP_SUMMARY
          fi
`;

    try {
      // Ensure .github/workflows directory exists
      await fs.mkdir(this.workflowsDir, { recursive: true });

      // Write workflow file
      const workflowPath = path.join(this.workflowsDir, 'deploy.yml');
      await fs.writeFile(workflowPath, workflow, 'utf8');

      logger.success(`GitHub Actions workflow created: ${workflowPath}`);
      return workflowPath;
    } catch (error) {
      logger.error('Failed to generate GitHub Actions workflow', error);
      throw error;
    }
  }

  /**
   * Generate GitLab CI configuration
   */
  async generateGitLabCI() {
    logger.info('Generating GitLab CI configuration...');

    const config = `# GitLab CI/CD Configuration for Trip Defender Backend

stages:
  - validate
  - deploy
  - health-check

variables:
  NODE_VERSION: "18"

.node_setup: &node_setup
  image: node:\${NODE_VERSION}
  before_script:
    - cd backend
    - npm ci
    - echo "$FIREBASE_SERVICE_ACCOUNT" > serviceAccountKey.json

# Validation Job
validate:
  stage: validate
  <<: *node_setup
  script:
    - node scripts/validator.js --environment=$CI_ENVIRONMENT_NAME
  after_script:
    - rm -f backend/serviceAccountKey.json
  only:
    - main
    - staging
    - develop
  except:
    variables:
      - $SKIP_VALIDATION == "true"

# Deploy to Development
deploy:development:
  stage: deploy
  <<: *node_setup
  environment:
    name: development
    url: https://trip-defender-backend-dev.onrender.com
  script:
    - node scripts/deploy.js --env=development --ci
  after_script:
    - rm -f backend/serviceAccountKey.json
  artifacts:
    paths:
      - backend/config/deployment-history.json
      - backend/firebase-credentials-for-render.txt
    expire_in: 30 days
  only:
    - develop

# Deploy to Staging
deploy:staging:
  stage: deploy
  <<: *node_setup
  environment:
    name: staging
    url: https://trip-defender-backend-staging.onrender.com
  script:
    - node scripts/deploy.js --env=staging --ci
  after_script:
    - rm -f backend/serviceAccountKey.json
  artifacts:
    paths:
      - backend/config/deployment-history.json
      - backend/firebase-credentials-for-render.txt
    expire_in: 30 days
  only:
    - staging

# Deploy to Production
deploy:production:
  stage: deploy
  <<: *node_setup
  environment:
    name: production
    url: https://trip-defender-backend.onrender.com
  script:
    - node scripts/deploy.js --env=production --ci
  after_script:
    - rm -f backend/serviceAccountKey.json
  artifacts:
    paths:
      - backend/config/deployment-history.json
      - backend/firebase-credentials-for-render.txt
    expire_in: 30 days
  only:
    - main
  when: manual

# Health Check
health-check:
  stage: health-check
  <<: *node_setup
  script:
    - sleep 30
    - node scripts/health-check.js --env=$CI_ENVIRONMENT_NAME
  after_script:
    - rm -f backend/serviceAccountKey.json
  only:
    - main
    - staging
    - develop
`;

    try {
      const configPath = path.join(this.projectRoot, '.gitlab-ci.yml');
      await fs.writeFile(configPath, config, 'utf8');

      logger.success(`GitLab CI configuration created: ${configPath}`);
      return configPath;
    } catch (error) {
      logger.error('Failed to generate GitLab CI configuration', error);
      throw error;
    }
  }

  /**
   * Generate secrets documentation
   */
  generateSecretsDocumentation() {
    return `# Required CI/CD Secrets

## GitHub Actions Secrets

To set up GitHub Actions, add the following secrets to your repository:

### Repository Settings → Secrets and variables → Actions → New repository secret

1. **FIREBASE_SERVICE_ACCOUNT**
   - Description: Firebase service account JSON (single-line format)
   - How to get:
     1. Go to Firebase Console → Project Settings → Service Accounts
     2. Click "Generate new private key"
     3. Run: \`cd backend && npm run prepare-credentials\`
     4. Copy the single-line JSON from \`firebase-credentials-for-render.txt\`
   - Format: Single-line JSON string
   - Example: \`{"type":"service_account","project_id":"your-project",...}\`

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
2. Create environments: \`development\`, \`staging\`, \`production\`
3. Add environment-specific secrets if needed

### Branch Protection Rules

Recommended branch protection for production deployments:

1. Go to Repository Settings → Branches → Add rule
2. Branch name pattern: \`main\`
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
   - Value: \`true\` or \`false\`

### Environment-Specific Variables

Create environment-specific variables for each deployment target:

1. Go to Settings → CI/CD → Variables
2. Add variables with environment scope:
   - \`development\`
   - \`staging\`
   - \`production\`

## Security Best Practices

1. **Never commit secrets to version control**
   - Always use CI/CD secrets/variables
   - Add \`serviceAccountKey.json\` to \`.gitignore\`

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
`;
  }

  /**
   * Generate complete CI/CD setup
   */
  async generate(platform = 'github') {
    logger.info(`Generating CI/CD configuration for ${platform}...`);

    try {
      let workflowPath;

      if (platform === 'github') {
        workflowPath = await this.generateGitHubActions();
      } else if (platform === 'gitlab') {
        workflowPath = await this.generateGitLabCI();
      } else {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      // Generate secrets documentation
      const docsDir = path.join(this.projectRoot, 'backend', 'docs');
      await fs.mkdir(docsDir, { recursive: true });

      const docsPath = path.join(docsDir, 'CICD_SECRETS.md');
      await fs.writeFile(docsPath, this.generateSecretsDocumentation(), 'utf8');

      logger.success(`Secrets documentation created: ${docsPath}`);

      // Display summary
      console.log('');
      logger.info('CI/CD Configuration Generated Successfully!');
      console.log('');
      logger.info('Next Steps:');
      console.log('  1. Review the generated workflow file');
      console.log(`     ${workflowPath}`);
      console.log('');
      console.log('  2. Set up required secrets in your repository');
      console.log(`     See: ${docsPath}`);
      console.log('');
      console.log('  3. Commit and push the workflow file');
      console.log(`     git add ${workflowPath}`);
      console.log('     git commit -m "Add CI/CD workflow"');
      console.log('     git push');
      console.log('');
      console.log('  4. Trigger a deployment');
      console.log('     - Push to main/staging/develop branch');
      console.log('     - Or use manual workflow dispatch in GitHub Actions');
      console.log('');

      return {
        workflowPath,
        docsPath,
        platform
      };
    } catch (error) {
      logger.error('Failed to generate CI/CD configuration', error);
      throw error;
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const platform = args.find(arg => arg.startsWith('--platform='))?.split('=')[1] || 'github';

  const generator = new CICDConfigGenerator();

  try {
    await generator.generate(platform);
    process.exit(0);
  } catch (error) {
    logger.error('CI/CD configuration generation failed', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = CICDConfigGenerator;
