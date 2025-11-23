#!/usr/bin/env node

/**
 * Health Check Script
 * Entry point for checking backend deployment health
 * 
 * Usage:
 *   node health-check.js
 *   node health-check.js --env=production
 *   node health-check.js --url=https://custom-url.com
 *   node health-check.js --env=staging --timeout=60000
 */

const HealthChecker = require('./health-checker');
const logger = require('./utils/logger');
const { EXIT_CODES } = require('./utils/constants');
const { getVersionString, displayVersion } = require('./utils/version');
const { displayRandomTip, displaySuggestions } = require('./utils/tips');

/**
 * Parses command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    environment: null,
    url: null,
    timeout: null,
    help: false
  };

  args.forEach(arg => {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--version' || arg === '-V') {
      options.version = true;
    } else if (arg.startsWith('--env=')) {
      options.environment = arg.split('=')[1];
    } else if (arg.startsWith('--url=')) {
      options.url = arg.split('=')[1];
    } else if (arg.startsWith('--timeout=')) {
      options.timeout = parseInt(arg.split('=')[1], 10);
    }
  });

  return options;
}

/**
 * Displays help information
 */
function displayHelp() {
  logger.header(`Health Check Script ${getVersionString()}`);
  logger.newline();
  
  logger.info('Usage:');
  logger.bullet('node health-check.js [options]');
  logger.newline();
  
  logger.info('Options:');
  logger.bullet('--env=<environment>    Environment to check (development, staging, production)');
  logger.bullet('--url=<url>            Custom URL to check');
  logger.bullet('--timeout=<ms>         Request timeout in milliseconds (default: 30000)');
  logger.bullet('--version, -V          Display version information');
  logger.bullet('--help, -h             Display this help message');
  logger.newline();
  
  logger.info('Examples:');
  logger.bullet('node health-check.js --env=production');
  logger.bullet('node health-check.js --url=https://my-backend.onrender.com');
  logger.bullet('node health-check.js --env=staging --timeout=60000');
  logger.newline();
  
  logger.info('NPM Scripts:');
  logger.bullet('npm run health              # Check default environment');
  logger.bullet('npm run health:dev          # Check development');
  logger.bullet('npm run health:staging      # Check staging');
  logger.bullet('npm run health:prod         # Check production');
  logger.newline();
}

/**
 * Main execution function
 */
async function main() {
  try {
    const options = parseArgs();

    // Display version if requested
    if (options.version) {
      displayVersion();
      process.exit(EXIT_CODES.SUCCESS);
    }

    // Display help if requested
    if (options.help) {
      displayHelp();
      process.exit(EXIT_CODES.SUCCESS);
    }

    // Validate options
    if (!options.environment && !options.url) {
      logger.error('Either --env or --url must be specified');
      logger.newline();
      logger.info('Use --help for usage information');
      process.exit(EXIT_CODES.VALIDATION_ERROR);
    }

    // Display header
    logger.header(`Backend Health Check ${getVersionString()}`);
    logger.newline();

    if (options.environment) {
      logger.info(`Environment: ${options.environment}`);
    }
    if (options.url) {
      logger.info(`URL: ${options.url}`);
    }
    logger.newline();

    // Create health checker
    const healthChecker = new HealthChecker({
      timeout: options.timeout
    });

    // Perform health check
    const result = await healthChecker.checkHealth({
      environment: options.environment,
      url: options.url,
      timeout: options.timeout
    });

    // Display results
    healthChecker.displayResults(result);

    // Display suggestions
    displaySuggestions('health-check', result.status === 'healthy');

    // Display random tip
    if (result.status === 'healthy') {
      displayRandomTip('healthCheck');
    }

    // Exit with appropriate code
    if (result.status === 'healthy') {
      logger.success('Health check passed!');
      process.exit(EXIT_CODES.SUCCESS);
    } else {
      logger.error('Health check failed!');
      process.exit(EXIT_CODES.HEALTH_CHECK_ERROR);
    }

  } catch (error) {
    logger.newline();
    logger.error('Health check error:');
    logger.error(error.message);
    
    if (error.remediation) {
      logger.newline();
      logger.warning('To fix this:');
      error.remediation.forEach(step => {
        logger.bullet(step);
      });
    }

    logger.newline();
    process.exit(EXIT_CODES.HEALTH_CHECK_ERROR);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = { parseArgs, displayHelp };
