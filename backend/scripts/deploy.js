#!/usr/bin/env node

/**
 * Main deployment script
 * Entry point for deploying the backend to Render
 * 
 * Usage:
 *   npm run deploy                    # Deploy to development
 *   npm run deploy -- --env=staging   # Deploy to staging
 *   npm run deploy -- --env=production # Deploy to production
 *   npm run deploy -- --dry-run       # Simulate deployment
 *   npm run deploy -- --skip-validation # Skip validation checks
 */

const DeploymentManager = require('./deployment-manager');
const logger = require('./utils/logger');
const { EXIT_CODES, DEFAULTS } = require('./utils/constants');
const { getVersionString, displayVersion } = require('./utils/version');
const { displayRandomTip, displaySuggestions } = require('./utils/tips');

/**
 * Parses command-line arguments
 * @returns {Object} Parsed options
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    environment: DEFAULTS.DEPLOYMENT.DEFAULT_ENVIRONMENT,
    skipValidation: false,
    dryRun: false,
    verbose: false,
    help: false,
    ci: false
  };

  args.forEach(arg => {
    if (arg.startsWith('--env=')) {
      options.environment = arg.split('=')[1];
    } else if (arg === '--skip-validation') {
      options.skipValidation = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--validate-only') {
      options.validateOnly = true;
    } else if (arg === '--ci') {
      options.ci = true;
    } else if (arg === '--version' || arg === '-V') {
      options.version = true;
    }
  });

  return options;
}

/**
 * Displays help information
 */
function displayHelp() {
  logger.header(`Deployment Script ${getVersionString()}`);
  logger.newline();
  
  logger.info('Usage:');
  logger.bullet('npm run deploy                    # Deploy to development');
  logger.bullet('npm run deploy -- --env=staging   # Deploy to staging');
  logger.bullet('npm run deploy -- --env=production # Deploy to production');
  logger.newline();
  
  logger.info('Options:');
  logger.bullet('--env=<environment>    Target environment (development, staging, production)');
  logger.bullet('--dry-run              Simulate deployment without making changes');
  logger.bullet('--skip-validation      Skip pre-deployment validation checks');
  logger.bullet('--validate-only        Only run validation, do not deploy');
  logger.bullet('--ci                   Run in CI/CD mode (non-interactive)');
  logger.bullet('--verbose, -v          Enable verbose logging');
  logger.bullet('--version, -V          Display version information');
  logger.bullet('--help, -h             Display this help message');
  logger.newline();
  
  logger.info('Safety Features:');
  logger.bullet('Production deployments require explicit confirmation');
  logger.bullet('Deployment summary shown before execution (unless --ci mode)');
  logger.bullet('Dry-run mode simulates deployment without making changes');
  logger.bullet('Validate-only mode checks setup without deploying');
  logger.newline();
  
  logger.info('Examples:');
  logger.bullet('npm run deploy:dev                          # Deploy to development');
  logger.bullet('npm run deploy:staging                      # Deploy to staging');
  logger.bullet('npm run deploy:prod                         # Deploy to production');
  logger.bullet('npm run deploy -- --dry-run                 # Test deployment without changes');
  logger.bullet('npm run deploy -- --validate-only           # Check setup only');
  logger.bullet('npm run deploy -- --env=staging --dry-run   # Test staging deployment');
  logger.newline();
  
  logger.info('Environment-specific shortcuts:');
  logger.bullet('npm run deploy:dev     → npm run deploy -- --env=development');
  logger.bullet('npm run deploy:staging → npm run deploy -- --env=staging');
  logger.bullet('npm run deploy:prod    → npm run deploy -- --env=production');
  logger.newline();
}

/**
 * Displays deployment summary
 * @param {Object} result - Deployment result
 */
function displaySummary(result) {
  logger.newline();
  logger.divider();
  logger.header('Deployment Summary');
  logger.newline();

  if (result.success) {
    logger.success('✓ Deployment prepared successfully!');
    logger.newline();
    
    logger.table({
      'Deployment ID': result.deploymentId || 'N/A',
      'Environment': result.environment,
      'Timestamp': result.timestamp || new Date().toISOString(),
      'Status': result.dryRun ? 'Dry Run (Not Deployed)' : 'Ready to Deploy',
      'URL': result.deploymentUrl || 'N/A'
    });
  } else {
    logger.error('✗ Deployment failed');
    logger.newline();
    
    if (result.cancelled) {
      logger.warning('Deployment was cancelled by user');
    } else if (result.error) {
      logger.error(`Error: ${result.error}`);
    } else if (result.validationErrors && result.validationErrors.length > 0) {
      logger.error('Validation errors:');
      result.validationErrors.forEach(err => {
        logger.bullet(`${err.check}: ${err.message}`);
      });
    }
  }

  logger.newline();
  logger.divider();
}

/**
 * Main execution function
 */
async function main() {
  let options;
  
  try {
    // Parse command-line arguments
    options = parseArguments();

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

    // Display startup banner
    logger.newline();
    logger.header(`🚀 Trip Defender Backend Deployment ${getVersionString()}`);
    logger.newline();

    // Display mode information
    const modes = [];
    if (options.dryRun) modes.push('DRY RUN');
    if (options.validateOnly) modes.push('VALIDATE ONLY');
    if (options.ci) modes.push('CI/CD');
    if (options.skipValidation) modes.push('SKIP VALIDATION');
    if (options.verbose) modes.push('VERBOSE');

    if (modes.length > 0) {
      logger.warning(`Mode: ${modes.join(' + ')}`);
      logger.newline();
    }

    if (options.dryRun) {
      logger.info('Dry run will:');
      logger.bullet('Run all validation checks');
      logger.bullet('Prepare credentials');
      logger.bullet('Generate configuration (not saved)');
      logger.bullet('Show deployment instructions');
      logger.bullet('NOT make any actual changes');
      logger.newline();
    }

    if (options.validateOnly) {
      logger.info('Validation-only mode will:');
      logger.bullet('Check Firebase credentials');
      logger.bullet('Verify dependencies');
      logger.bullet('Validate environment configuration');
      logger.bullet('Check server configuration');
      logger.bullet('NOT prepare or deploy anything');
      logger.newline();
    }

    // Create deployment manager
    const deploymentManager = new DeploymentManager({
      dryRun: options.dryRun,
      verbose: options.verbose,
      ci: options.ci
    });

    // Handle validate-only mode
    if (options.validateOnly) {
      logger.info('Running validation checks only...');
      logger.newline();
      
      const { Validator } = require('./validator');
      const validator = new Validator();
      const validationResult = await validator.validateAll({
        environment: options.environment,
        skipCredentials: false
      });

      if (validationResult.success) {
        logger.newline();
        logger.success('✓ All validation checks passed!');
        logger.info('Ready to deploy');
        process.exit(EXIT_CODES.SUCCESS);
      } else {
        logger.newline();
        logger.error('✗ Validation failed');
        logger.error('Fix the errors above before deploying');
        process.exit(EXIT_CODES.VALIDATION_ERROR);
      }
    }

    // Execute deployment
    const result = await deploymentManager.deploy({
      environment: options.environment,
      skipValidation: options.skipValidation,
      dryRun: options.dryRun,
      ci: options.ci
    });

    // Display summary
    displaySummary(result);

    // Display suggestions
    if (!options.validateOnly) {
      displaySuggestions('deploy', result.success, { environment: options.environment });
    }

    // Display random tip
    if (result.success && !options.ci) {
      displayRandomTip('deployment');
    }

    // Exit with appropriate code
    const exitCode = result.exitCode || (result.success ? EXIT_CODES.SUCCESS : EXIT_CODES.DEPLOYMENT_ERROR);
    process.exit(exitCode);

  } catch (error) {
    logger.newline();
    logger.error('Unexpected error occurred:');
    logger.error(error.message);
    
    if (options && options.verbose) {
      logger.newline();
      logger.error('Stack trace:');
      logger.raw(error.stack);
    }

    logger.newline();
    logger.info('Need help? Check:');
    logger.bullet('Documentation: backend/docs/DEPLOYMENT.md');
    logger.bullet('Troubleshooting: backend/docs/TROUBLESHOOTING.md');
    logger.newline();

    process.exit(EXIT_CODES.UNKNOWN_ERROR);
  }
}

// Run main function
main();
