#!/usr/bin/env node

/**
 * Rollback Script
 * Prepares rollback plan for a previous deployment
 */

const HistoryTracker = require('./history-tracker');
const logger = require('./utils/logger');
const { EXIT_CODES } = require('./utils/constants');
const readline = require('readline');
const { getVersionString } = require('./utils/version');
const { displaySuggestions } = require('./utils/tips');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    deploymentId: null,
    interactive: true,
    showRecent: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--deployment' || arg === '-d') {
      options.deploymentId = args[++i];
    } else if (arg === '--recent' || arg === '-r') {
      options.showRecent = true;
    } else if (arg === '--yes' || arg === '-y') {
      options.interactive = false;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(EXIT_CODES.SUCCESS);
    }
  }

  return options;
}

// Show help message
function showHelp() {
  logger.header(`Rollback Preparation ${getVersionString()}`);
  logger.newline();
  
  logger.info('Prepare a rollback plan for a previous deployment');
  logger.newline();
  
  logger.step('Usage:');
  logger.bullet('npm run rollback [options]');
  logger.newline();
  
  logger.step('Options:');
  logger.bullet('--deployment, -d <id>      Deployment ID to rollback to (required)');
  logger.bullet('--recent, -r               Show recent deployments to choose from');
  logger.bullet('--yes, -y                  Skip confirmation prompts');
  logger.bullet('--help, -h                 Show this help message');
  logger.newline();
  
  logger.step('Examples:');
  logger.bullet('npm run rollback -- --recent');
  logger.bullet('npm run rollback -- --deployment=deploy_1234567890');
  logger.bullet('npm run rollback -- -d deploy_1234567890 -y');
  logger.newline();
  
  logger.step('Workflow:');
  logger.bullet('1. View recent deployments: npm run rollback -- --recent');
  logger.bullet('2. Choose a deployment ID from the list');
  logger.bullet('3. Prepare rollback: npm run rollback -- --deployment=<id>');
  logger.bullet('4. Follow the displayed rollback steps');
}

// Show recent deployments
async function showRecentDeployments(tracker) {
  logger.header('Recent Deployments');
  logger.newline();
  
  const history = await tracker.getHistory({ limit: 10 });
  
  if (history.length === 0) {
    logger.warning('No deployment history found');
    logger.info('Deploy at least once to create history');
    return;
  }
  
  tracker.displayHistory(history);
  
  logger.newline();
  logger.info('To prepare rollback for a deployment, use:');
  logger.bullet('npm run rollback -- --deployment=<deployment-id>');
}

// Prompt user for confirmation
function promptConfirmation(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`${question} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// Main function
async function main() {
  try {
    const options = parseArgs();
    const tracker = new HistoryTracker();
    
    // Show recent deployments if requested
    if (options.showRecent) {
      await showRecentDeployments(tracker);
      process.exit(EXIT_CODES.SUCCESS);
    }
    
    // Check if deployment ID provided
    if (!options.deploymentId) {
      logger.error('Deployment ID is required');
      logger.newline();
      logger.info('View recent deployments:');
      logger.bullet('npm run rollback -- --recent');
      logger.newline();
      logger.info('Or specify deployment ID:');
      logger.bullet('npm run rollback -- --deployment=<deployment-id>');
      logger.newline();
      logger.info('Run with --help for more information');
      process.exit(EXIT_CODES.CONFIGURATION_ERROR);
    }
    
    logger.header('Preparing Rollback');
    logger.newline();
    
    logger.step(`Looking up deployment: ${options.deploymentId}`);
    
    // Prepare rollback plan
    const rollbackPlan = await tracker.prepareRollback(options.deploymentId);
    
    logger.success('Rollback plan prepared');
    logger.newline();
    
    // Display rollback plan
    tracker.displayRollbackPlan(rollbackPlan);
    
    // Confirm if interactive
    if (options.interactive && rollbackPlan.targetDeployment.environment === 'production') {
      logger.newline();
      logger.warning('This rollback targets PRODUCTION environment');
      
      const confirmed = await promptConfirmation('Do you want to proceed with the rollback steps?');
      
      if (!confirmed) {
        logger.info('Rollback cancelled');
        process.exit(EXIT_CODES.SUCCESS);
      }
    }
    
    // Show next steps
    logger.newline();
    logger.header('Next Steps');
    logger.newline();
    
    logger.info('Follow the rollback steps above to restore the previous deployment');
    logger.newline();
    
    logger.step('Important Notes:');
    logger.bullet('Review all warnings before proceeding');
    logger.bullet('Ensure you have necessary permissions');
    logger.bullet('Backup current state if needed');
    logger.bullet('Test thoroughly after rollback');
    logger.bullet('Update team members about the rollback');
    logger.newline();
    
    logger.step('After Rollback:');
    logger.bullet('Verify deployment: npm run health');
    logger.bullet('Check application logs');
    logger.bullet('Test critical functionality');
    logger.bullet('Monitor for errors');
    
    // Display suggestions
    displaySuggestions('rollback', true);
    
    process.exit(EXIT_CODES.SUCCESS);
  } catch (error) {
    logger.error(`Failed to prepare rollback: ${error.message}`);
    logger.newline();
    
    if (error.message.includes('Deployment not found')) {
      logger.info('View available deployments:');
      logger.bullet('npm run rollback -- --recent');
      logger.bullet('npm run deployment-history');
    } else {
      logger.info('Run with --help for usage information');
    }
    
    process.exit(EXIT_CODES.UNKNOWN_ERROR);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = { main, parseArgs };
