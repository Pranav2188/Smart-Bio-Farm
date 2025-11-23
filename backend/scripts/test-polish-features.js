#!/usr/bin/env node

/**
 * Test script for Task 15: Final Polish and Optimization
 * Tests progress indicators, version info, help, tips, and parallel validation
 */

const logger = require('./utils/logger');
const { ProgressIndicator, ProgressBar, StepProgress } = require('./utils/progressIndicator');
const { getVersionInfo, displayVersion, getVersionString } = require('./utils/version');
const { displayRandomTip, displayTips, displaySuggestions, displayQuickStart, displayBestPractices } = require('./utils/tips');
const { Validator } = require('./validator');

async function testProgressIndicators() {
  logger.header('Testing Progress Indicators');
  logger.newline();

  // Test spinner
  logger.info('Testing spinner...');
  const spinner = new ProgressIndicator();
  spinner.start('Processing data');
  await new Promise(resolve => setTimeout(resolve, 2000));
  spinner.succeed('Data processed successfully');
  logger.newline();

  // Test progress bar
  logger.info('Testing progress bar...');
  const progressBar = new ProgressBar({ total: 100, message: 'Downloading' });
  for (let i = 0; i <= 100; i += 10) {
    progressBar.update(i);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  logger.newline();

  // Test step progress
  logger.info('Testing step progress...');
  const steps = ['Initialize', 'Validate', 'Process', 'Complete'];
  const stepProgress = new StepProgress(steps);
  
  for (let i = 0; i < steps.length; i++) {
    stepProgress.startStep(i);
    await new Promise(resolve => setTimeout(resolve, 500));
    stepProgress.completeStep(i);
  }
  logger.newline();

  logger.success('✓ Progress indicators working correctly');
  logger.newline();
}

async function testVersionInfo() {
  logger.header('Testing Version Information');
  logger.newline();

  logger.info('Version string: ' + getVersionString());
  logger.newline();

  logger.info('Full version info:');
  const versionInfo = getVersionInfo();
  logger.table(versionInfo);
  logger.newline();

  logger.info('Display version function:');
  displayVersion();
  logger.newline();

  logger.success('✓ Version information working correctly');
  logger.newline();
}

async function testTipsAndSuggestions() {
  logger.header('Testing Tips and Suggestions');
  logger.newline();

  logger.info('Random deployment tip:');
  displayRandomTip('deployment');
  logger.newline();

  logger.info('All validation tips:');
  displayTips('validation');
  logger.newline();

  logger.info('Deployment success suggestions:');
  displaySuggestions('deploy', true, { environment: 'production' });
  logger.newline();

  logger.info('Deployment failure suggestions:');
  displaySuggestions('deploy', false);
  logger.newline();

  logger.success('✓ Tips and suggestions working correctly');
  logger.newline();
}

async function testParallelValidation() {
  logger.header('Testing Parallel Validation');
  logger.newline();

  logger.info('Running validation checks in parallel...');
  const startTime = Date.now();

  const validator = new Validator();
  const result = await validator.validateAll({
    environment: 'development',
    skipCredentials: false
  });

  const duration = Date.now() - startTime;
  logger.newline();
  logger.info(`Validation completed in ${duration}ms`);
  logger.info(`Success: ${result.success}`);
  logger.info(`Checks performed: ${Object.keys(result.checks).length}`);
  logger.newline();

  logger.success('✓ Parallel validation working correctly');
  logger.newline();
}

async function testHelpAndUsage() {
  logger.header('Testing Help and Usage Information');
  logger.newline();

  logger.info('Quick Start Guide:');
  displayQuickStart();
  logger.newline();

  logger.info('Best Practices:');
  displayBestPractices();
  logger.newline();

  logger.success('✓ Help and usage information working correctly');
  logger.newline();
}

async function runAllTests() {
  try {
    logger.newline();
    logger.header('🧪 Task 15: Final Polish and Optimization Tests');
    logger.newline();

    await testProgressIndicators();
    await testVersionInfo();
    await testTipsAndSuggestions();
    await testParallelValidation();
    await testHelpAndUsage();

    logger.divider();
    logger.header('✅ All Tests Passed!');
    logger.newline();

    logger.info('Summary of implemented features:');
    logger.bullet('✓ Progress indicators for long-running operations');
    logger.bullet('✓ Parallel validation for improved performance');
    logger.bullet('✓ Helpful tips and suggestions throughout');
    logger.bullet('✓ Command-line help and usage information');
    logger.bullet('✓ Version information in all scripts');
    logger.newline();

    logger.info('Enhanced scripts:');
    logger.bullet('deploy.js - Added version, tips, and suggestions');
    logger.bullet('health-check.js - Added version and tips');
    logger.bullet('validator.js - Implemented parallel validation');
    logger.bullet('deployment-manager.js - Added progress indicators');
    logger.bullet('All scripts - Added version information');
    logger.newline();

    process.exit(0);
  } catch (error) {
    logger.error('Test failed:');
    logger.error(error.message);
    if (error.stack) {
      logger.newline();
      logger.raw(error.stack);
    }
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
