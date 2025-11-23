#!/usr/bin/env node

/**
 * Deployment History Script
 * Displays deployment history with filtering options
 */

const HistoryTracker = require('./history-tracker');
const logger = require('./utils/logger');
const { EXIT_CODES } = require('./utils/constants');
const { getVersionString } = require('./utils/version');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    environment: null,
    status: null,
    limit: 10
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--env' || arg === '-e') {
      options.environment = args[++i];
    } else if (arg === '--status' || arg === '-s') {
      options.status = args[++i];
    } else if (arg === '--limit' || arg === '-l') {
      options.limit = parseInt(args[++i], 10);
    } else if (arg === '--all' || arg === '-a') {
      options.limit = null;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(EXIT_CODES.SUCCESS);
    }
  }

  return options;
}

// Show help message
function showHelp() {
  logger.header(`Deployment History ${getVersionString()}`);
  logger.newline();
  
  logger.info('View deployment history with filtering options');
  logger.newline();
  
  logger.step('Usage:');
  logger.bullet('npm run deployment-history [options]');
  logger.newline();
  
  logger.step('Options:');
  logger.bullet('--env, -e <environment>    Filter by environment (development, staging, production)');
  logger.bullet('--status, -s <status>      Filter by status (success, failed, pending, etc.)');
  logger.bullet('--limit, -l <number>       Limit number of results (default: 10)');
  logger.bullet('--all, -a                  Show all deployments (no limit)');
  logger.bullet('--help, -h                 Show this help message');
  logger.newline();
  
  logger.step('Examples:');
  logger.bullet('npm run deployment-history');
  logger.bullet('npm run deployment-history -- --env=production');
  logger.bullet('npm run deployment-history -- --limit=5');
  logger.bullet('npm run deployment-history -- --env=staging --status=success');
  logger.bullet('npm run deployment-history -- --all');
}

// Main function
async function main() {
  try {
    const options = parseArgs();
    
    logger.header(`Deployment History ${getVersionString()}`);
    logger.newline();
    
    // Show filters if any
    if (options.environment || options.status || options.limit) {
      logger.step('Filters:');
      if (options.environment) {
        logger.bullet(`Environment: ${options.environment}`);
      }
      if (options.status) {
        logger.bullet(`Status: ${options.status}`);
      }
      if (options.limit) {
        logger.bullet(`Limit: ${options.limit} records`);
      } else {
        logger.bullet('Showing all records');
      }
      logger.newline();
    }
    
    // Create history tracker
    const tracker = new HistoryTracker();
    
    // Get history
    const history = await tracker.getHistory(options);
    
    if (history.length === 0) {
      logger.warning('No deployment history found');
      
      if (options.environment || options.status) {
        logger.info('Try removing filters or deploy to create history');
      } else {
        logger.info('Deploy at least once to create history');
        logger.newline();
        logger.step('Deploy commands:');
        logger.bullet('npm run deploy:dev');
        logger.bullet('npm run deploy:staging');
        logger.bullet('npm run deploy:prod');
      }
      
      process.exit(EXIT_CODES.SUCCESS);
    }
    
    // Display history
    tracker.displayHistory(history);
    
    // Show rollback hint
    logger.newline();
    logger.info('To prepare a rollback, use:');
    logger.bullet('npm run rollback -- --deployment=<deployment-id>');
    
    process.exit(EXIT_CODES.SUCCESS);
  } catch (error) {
    logger.error(`Failed to retrieve deployment history: ${error.message}`);
    logger.newline();
    logger.info('Run with --help for usage information');
    process.exit(EXIT_CODES.UNKNOWN_ERROR);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = { main, parseArgs };
