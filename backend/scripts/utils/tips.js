/**
 * Tips and Suggestions Utility
 * Provides helpful tips and suggestions throughout the deployment process
 */

const logger = require('./logger');

/**
 * Tips database organized by context
 */
const TIPS = {
  deployment: [
    'Use --dry-run to test your deployment configuration without making changes',
    'Always deploy to staging before production to catch issues early',
    'Check deployment history with "npm run deployment-history" to track changes',
    'Use environment-specific shortcuts: deploy:dev, deploy:staging, deploy:prod',
    'Enable verbose mode with --verbose to see detailed deployment logs'
  ],
  
  validation: [
    'Run "npm run deploy -- --validate-only" to check your setup without deploying',
    'Keep your Firebase credentials secure and never commit them to version control',
    'Ensure all dependencies are installed with "npm install" before deploying',
    'Check that your .env file has all required variables for the target environment'
  ],
  
  healthCheck: [
    'Health checks timeout after 30 seconds - ensure your backend responds quickly',
    'Use health checks after deployment to verify everything is working',
    'Check multiple endpoints with detailed health checks for thorough verification',
    'Set up monitoring alerts based on health check results'
  ],
  
  environment: [
    'Use separate environments (dev, staging, prod) to isolate changes',
    'Production deployments require explicit confirmation for safety',
    'Update environment variables with "npm run env:update" command',
    'List all environments with "npm run env:list" to see configurations'
  ],
  
  troubleshooting: [
    'Check backend/docs/TROUBLESHOOTING.md for common issues and solutions',
    'Use --verbose flag to see detailed error information',
    'Review Render logs if deployment succeeds but health check fails',
    'Verify Firebase credentials are correctly formatted as single-line JSON'
  ],
  
  cicd: [
    'Generate CI/CD configuration with "npm run generate-cicd"',
    'Store sensitive credentials in GitHub Secrets, not in workflow files',
    'Use --ci flag for non-interactive deployments in CI/CD pipelines',
    'Test CI/CD workflows with manual triggers before enabling automatic deployment'
  ],
  
  rollback: [
    'View recent deployments with "npm run rollback -- --recent"',
    'Always test rollback procedures in staging before using in production',
    'Document the reason for rollback in your deployment notes',
    'Verify the rollback was successful with health checks'
  ],
  
  general: [
    'Keep your deployment documentation up to date',
    'Communicate with your team before deploying to production',
    'Monitor application logs after deployment for any issues',
    'Have a rollback plan ready before deploying critical changes'
  ]
};

/**
 * Gets a random tip from a specific context
 * @param {string} context - Context name (deployment, validation, etc.)
 * @returns {string}
 */
function getRandomTip(context = 'general') {
  const tips = TIPS[context] || TIPS.general;
  const randomIndex = Math.floor(Math.random() * tips.length);
  return tips[randomIndex];
}

/**
 * Gets all tips for a context
 * @param {string} context - Context name
 * @returns {string[]}
 */
function getTips(context) {
  return TIPS[context] || TIPS.general;
}

/**
 * Displays a random tip
 * @param {string} context - Context name
 */
function displayRandomTip(context = 'general') {
  const tip = getRandomTip(context);
  logger.newline();
  logger.info('💡 Tip: ' + tip);
}

/**
 * Displays all tips for a context
 * @param {string} context - Context name
 */
function displayTips(context) {
  const tips = getTips(context);
  logger.newline();
  logger.info(`💡 Tips for ${context}:`);
  tips.forEach(tip => logger.bullet(tip));
}

/**
 * Displays contextual suggestions based on operation result
 * @param {string} operation - Operation name
 * @param {boolean} success - Whether operation succeeded
 * @param {Object} details - Additional details
 */
function displaySuggestions(operation, success, details = {}) {
  logger.newline();
  logger.info('💡 Suggestions:');
  
  switch (operation) {
    case 'deploy':
      if (success) {
        logger.bullet('Verify deployment with: npm run health');
        logger.bullet('Check application logs in Render dashboard');
        logger.bullet('Test critical functionality manually');
        if (details.environment === 'production') {
          logger.bullet('Monitor error rates and performance metrics');
          logger.bullet('Notify team members about the deployment');
        }
      } else {
        logger.bullet('Review error messages above for specific issues');
        logger.bullet('Check troubleshooting guide: backend/docs/TROUBLESHOOTING.md');
        logger.bullet('Verify all prerequisites with: npm run deploy -- --validate-only');
        logger.bullet('Try with verbose mode: npm run deploy -- --verbose');
      }
      break;
      
    case 'validation':
      if (success) {
        logger.bullet('All checks passed! Ready to deploy');
        logger.bullet('Deploy with: npm run deploy');
        logger.bullet('Or test first: npm run deploy -- --dry-run');
      } else {
        logger.bullet('Fix validation errors before deploying');
        logger.bullet('Check that all required files exist');
        logger.bullet('Verify Firebase credentials are valid');
        logger.bullet('Run npm install if dependencies are missing');
      }
      break;
      
    case 'health-check':
      if (success) {
        logger.bullet('Backend is healthy and responding');
        logger.bullet('Check application logs for any warnings');
        logger.bullet('Test critical endpoints manually');
      } else {
        logger.bullet('Check if the service is running in Render dashboard');
        logger.bullet('Review backend logs for errors');
        logger.bullet('Verify environment variables are set correctly');
        logger.bullet('Check if recent deployment completed successfully');
      }
      break;
      
    case 'rollback':
      logger.bullet('Review the rollback plan carefully before proceeding');
      logger.bullet('Backup current configuration if needed');
      logger.bullet('Test in staging environment first if possible');
      logger.bullet('Verify rollback with health checks after completion');
      logger.bullet('Document the reason for rollback');
      break;
      
    default:
      logger.bullet('Check documentation for more information');
      logger.bullet('Use --help flag to see available options');
  }
}

/**
 * Displays quick start guide
 */
function displayQuickStart() {
  logger.header('Quick Start Guide');
  logger.newline();
  
  logger.step('1. Validate your setup');
  logger.bullet('npm run deploy -- --validate-only');
  logger.newline();
  
  logger.step('2. Prepare Firebase credentials');
  logger.bullet('npm run prepare-credentials');
  logger.newline();
  
  logger.step('3. Deploy to development');
  logger.bullet('npm run deploy:dev');
  logger.newline();
  
  logger.step('4. Verify deployment');
  logger.bullet('npm run health:dev');
  logger.newline();
  
  logger.step('5. Deploy to production');
  logger.bullet('npm run deploy:prod');
  logger.newline();
  
  logger.info('For more information:');
  logger.bullet('Documentation: backend/docs/DEPLOYMENT.md');
  logger.bullet('Troubleshooting: backend/docs/TROUBLESHOOTING.md');
  logger.bullet('Help: npm run deploy -- --help');
}

/**
 * Displays best practices
 */
function displayBestPractices() {
  logger.header('Deployment Best Practices');
  logger.newline();
  
  logger.step('Before Deployment:');
  logger.bullet('Test changes locally and in development environment');
  logger.bullet('Review code changes and get peer review');
  logger.bullet('Update documentation if needed');
  logger.bullet('Check for breaking changes');
  logger.newline();
  
  logger.step('During Deployment:');
  logger.bullet('Use staging environment before production');
  logger.bullet('Deploy during low-traffic periods when possible');
  logger.bullet('Monitor deployment progress and logs');
  logger.bullet('Have rollback plan ready');
  logger.newline();
  
  logger.step('After Deployment:');
  logger.bullet('Verify with health checks');
  logger.bullet('Test critical functionality');
  logger.bullet('Monitor error rates and performance');
  logger.bullet('Keep team informed of deployment status');
}

module.exports = {
  getRandomTip,
  getTips,
  displayRandomTip,
  displayTips,
  displaySuggestions,
  displayQuickStart,
  displayBestPractices,
  TIPS
};
