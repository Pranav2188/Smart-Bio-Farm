#!/usr/bin/env node

/**
 * List Environments Script
 * Displays all available deployment environments
 */

const EnvironmentManager = require('./environment-manager');
const logger = require('./utils/logger');
const { EXIT_CODES } = require('./utils/constants');
const { getVersionString } = require('./utils/version');

async function main() {
  try {
    logger.header(`Available Deployment Environments ${getVersionString()}`);
    logger.newline();

    const envManager = new EnvironmentManager();
    const environments = await envManager.listEnvironments();

    if (environments.length === 0) {
      logger.warning('No environments configured');
      logger.newline();
      logger.info('To create an environment, add it to:');
      logger.bullet('backend/config/deployment-config.json');
      logger.newline();
      process.exit(EXIT_CODES.SUCCESS);
    }

    environments.forEach((env, index) => {
      if (index > 0) {
        logger.divider();
      }

      logger.info(`${env.displayName} (${env.name})`);
      logger.table({
        'Service Name': env.serviceName,
        'Region': env.region,
        'Plan': env.plan,
        'Deploy Branch': env.branch || 'N/A',
        'Requires Confirmation': env.requiresConfirmation ? 'Yes' : 'No'
      });
    });

    logger.newline();
    logger.info('Usage:');
    logger.bullet(`npm run deploy:dev     - Deploy to development`);
    logger.bullet(`npm run deploy:staging - Deploy to staging`);
    logger.bullet(`npm run deploy:prod    - Deploy to production`);
    logger.newline();

    process.exit(EXIT_CODES.SUCCESS);
  } catch (error) {
    logger.error('Failed to list environments');
    logger.error(error.message);
    
    if (error.remediation) {
      logger.newline();
      logger.info('To fix this:');
      error.remediation.forEach(step => logger.bullet(step));
    }
    
    logger.newline();
    process.exit(EXIT_CODES.CONFIGURATION_ERROR);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = main;
