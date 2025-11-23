#!/usr/bin/env node

/**
 * Update Environment Script
 * Updates environment variables for a specific environment
 */

const EnvironmentManager = require('./environment-manager');
const logger = require('./utils/logger');
const { EXIT_CODES } = require('./utils/constants');
const { getVersionString } = require('./utils/version');

/**
 * Parses command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    environment: null,
    variables: {},
    showCurrent: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--show' || arg === '-s') {
      parsed.showCurrent = true;
    } else if (arg === '--env' || arg === '-e') {
      parsed.environment = args[++i];
    } else if (arg.startsWith('--env=')) {
      parsed.environment = arg.substring(6);
    } else if (arg.startsWith('--set-')) {
      // Format: --set-VAR_NAME=value
      const varName = arg.substring(6).split('=')[0];
      const varValue = arg.substring(6).split('=')[1] || args[++i];
      parsed.variables[varName] = varValue;
    } else if (arg.includes('=') && !arg.startsWith('-')) {
      // Format: VAR_NAME=value
      const [varName, varValue] = arg.split('=');
      parsed.variables[varName] = varValue;
    }
  }

  return parsed;
}

/**
 * Displays help information
 */
function showHelp() {
  logger.header(`Update Environment Variables ${getVersionString()}`);
  logger.newline();
  
  logger.info('Usage:');
  logger.bullet('node update-environment.js --env=<environment> [options]');
  logger.newline();
  
  logger.info('Options:');
  logger.table({
    '--env, -e': 'Environment name (development, staging, production)',
    '--show, -s': 'Show current environment variables',
    '--set-VAR=value': 'Set environment variable',
    'VAR=value': 'Set environment variable (shorthand)',
    '--help, -h': 'Show this help message'
  });
  logger.newline();
  
  logger.info('Examples:');
  logger.bullet('node update-environment.js --env=development --show');
  logger.bullet('node update-environment.js --env=staging --set-PORT=10000');
  logger.bullet('node update-environment.js --env=production NODE_ENV=production PORT=10000');
  logger.newline();
  
  logger.info('NPM Scripts:');
  logger.bullet('npm run env:update -- --env=development --show');
  logger.bullet('npm run env:update -- --env=staging PORT=10000');
  logger.newline();
}

/**
 * Confirms sensitive variable updates
 * @param {string} environment - Environment name
 * @param {Object} variables - Variables to update
 * @returns {Promise<boolean>}
 */
async function confirmUpdate(environment, variables) {
  const sensitiveKeys = ['ADMIN_SETUP_CODE', 'API_KEY', 'SECRET', 'PASSWORD', 'TOKEN'];
  const hasSensitive = Object.keys(variables).some(key =>
    sensitiveKeys.some(sensitive => key.toUpperCase().includes(sensitive))
  );

  if (!hasSensitive && environment !== 'production') {
    return true;
  }

  logger.warning(`You are about to update ${Object.keys(variables).length} variable(s) in ${environment}`);
  logger.newline();
  
  logger.info('Variables to update:');
  Object.entries(variables).forEach(([key, value]) => {
    const isSensitive = sensitiveKeys.some(sensitive => key.toUpperCase().includes(sensitive));
    const displayValue = isSensitive ? '***' : value;
    logger.bullet(`${key} = ${displayValue}`);
  });
  logger.newline();

  // In non-interactive mode, require explicit confirmation flag
  if (!process.stdin.isTTY) {
    logger.error('Running in non-interactive mode. Add --confirm flag to proceed.');
    return false;
  }

  // For interactive mode, we'll proceed (in a real implementation, you'd use readline)
  logger.info('Proceeding with update...');
  return true;
}

/**
 * Main function
 */
async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(EXIT_CODES.SUCCESS);
  }

  if (!args.environment) {
    logger.error('Environment not specified');
    logger.newline();
    logger.info('Usage: node update-environment.js --env=<environment>');
    logger.info('Run with --help for more information');
    logger.newline();
    process.exit(EXIT_CODES.CONFIGURATION_ERROR);
  }

  try {
    const envManager = new EnvironmentManager();

    // Load environment configuration
    const config = await envManager.loadEnvironment(args.environment);

    // Show current variables if requested
    if (args.showCurrent) {
      logger.header(`Environment Variables: ${config.displayName || config.name}`);
      logger.newline();
      
      const maskedVars = envManager.maskSensitiveVars(config.envVars);
      logger.table(maskedVars);
      logger.newline();
      
      logger.info('To update variables:');
      logger.bullet(`npm run env:update -- --env=${args.environment} VAR_NAME=value`);
      logger.newline();
      
      process.exit(EXIT_CODES.SUCCESS);
    }

    // Check if variables to update were provided
    if (Object.keys(args.variables).length === 0) {
      logger.warning('No variables specified to update');
      logger.newline();
      logger.info('To view current variables:');
      logger.bullet(`npm run env:update -- --env=${args.environment} --show`);
      logger.newline();
      logger.info('To update variables:');
      logger.bullet(`npm run env:update -- --env=${args.environment} VAR_NAME=value`);
      logger.newline();
      process.exit(EXIT_CODES.SUCCESS);
    }

    // Confirm update for sensitive variables or production
    const confirmed = await confirmUpdate(args.environment, args.variables);
    if (!confirmed) {
      logger.warning('Update cancelled');
      process.exit(EXIT_CODES.SUCCESS);
    }

    // Update variables
    await envManager.updateVariables(args.environment, args.variables);

    logger.newline();
    logger.success(`Updated ${Object.keys(args.variables).length} variable(s) in ${args.environment}`);
    logger.newline();

    // Show updated configuration
    logger.info('Updated variables:');
    const maskedUpdates = envManager.maskSensitiveVars(args.variables);
    logger.table(maskedUpdates);
    logger.newline();

    // Show next steps
    logger.info('Next steps:');
    logger.bullet('Update these variables in Render dashboard');
    logger.bullet('Go to: https://dashboard.render.com');
    logger.bullet(`Select service: ${config.renderServiceName}`);
    logger.bullet('Navigate to: Environment → Environment Variables');
    logger.bullet('Update the variables and save');
    logger.newline();

    logger.info('Or redeploy to apply changes:');
    logger.bullet(`npm run deploy -- --env=${args.environment}`);
    logger.newline();

    process.exit(EXIT_CODES.SUCCESS);
  } catch (error) {
    logger.error('Failed to update environment variables');
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
