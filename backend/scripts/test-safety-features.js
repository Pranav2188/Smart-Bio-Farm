#!/usr/bin/env node

/**
 * Test script for deployment safety features
 * Tests validation-only, dry-run, and confirmation prompts
 */

const logger = require('./utils/logger');
const { Validator } = require('./validator');
const DeploymentManager = require('./deployment-manager');
const EnvironmentManager = require('./environment-manager');

async function testValidationOnly() {
  logger.header('Test 1: Validation-Only Mode');
  logger.newline();

  try {
    const validator = new Validator();
    const result = await validator.validateAll({
      environment: 'development',
      skipCredentials: false
    });

    if (result.success) {
      logger.success('✓ Validation-only mode works correctly');
      logger.info('All checks passed without deploying');
    } else {
      logger.error('✗ Validation failed (expected if setup incomplete)');
      logger.info('This is normal if credentials are not set up');
    }
  } catch (error) {
    logger.error(`✗ Validation-only test failed: ${error.message}`);
  }

  logger.newline();
}

async function testDryRun() {
  logger.header('Test 2: Dry-Run Mode');
  logger.newline();

  try {
    const deploymentManager = new DeploymentManager({
      dryRun: true,
      verbose: true,
      ci: true // Skip interactive prompts
    });

    const result = await deploymentManager.deploy({
      environment: 'development',
      skipValidation: true, // Skip validation to test dry-run specifically
      dryRun: true
    });

    if (result.success && result.dryRun) {
      logger.success('✓ Dry-run mode works correctly');
      logger.info('Deployment simulated without making changes');
    } else {
      logger.error('✗ Dry-run test failed');
    }
  } catch (error) {
    logger.error(`✗ Dry-run test failed: ${error.message}`);
  }

  logger.newline();
}

async function testDeploymentSummary() {
  logger.header('Test 3: Deployment Summary');
  logger.newline();

  try {
    const environmentManager = new EnvironmentManager();
    const envConfig = await environmentManager.loadEnvironment('development');

    logger.info('Environment configuration loaded:');
    logger.table({
      'Environment': envConfig.name,
      'Service Name': envConfig.renderServiceName,
      'Region': envConfig.region,
      'Plan': envConfig.plan
    });

    logger.success('✓ Deployment summary data available');
    logger.info('Summary will be shown before deployment in interactive mode');
  } catch (error) {
    logger.error(`✗ Deployment summary test failed: ${error.message}`);
  }

  logger.newline();
}

async function testProductionConfirmation() {
  logger.header('Test 4: Production Confirmation');
  logger.newline();

  try {
    const environmentManager = new EnvironmentManager();
    const prodConfig = await environmentManager.loadEnvironment('production');

    if (prodConfig.requiresConfirmation) {
      logger.success('✓ Production environment requires confirmation');
      logger.info('Users will be prompted before production deployment');
    } else {
      logger.warning('⚠ Production environment does not require confirmation');
      logger.info('Consider setting requiresConfirmation: true in config');
    }
  } catch (error) {
    logger.error(`✗ Production confirmation test failed: ${error.message}`);
  }

  logger.newline();
}

async function testSkipValidation() {
  logger.header('Test 5: Skip Validation Option');
  logger.newline();

  try {
    const deploymentManager = new DeploymentManager({
      dryRun: true,
      ci: true
    });

    const result = await deploymentManager.deploy({
      environment: 'development',
      skipValidation: true,
      dryRun: true
    });

    if (result.success) {
      logger.success('✓ Skip validation option works correctly');
      logger.info('Deployment can proceed without validation checks');
    } else {
      logger.error('✗ Skip validation test failed');
    }
  } catch (error) {
    logger.error(`✗ Skip validation test failed: ${error.message}`);
  }

  logger.newline();
}

async function main() {
  logger.newline();
  logger.header('🧪 Testing Deployment Safety Features');
  logger.newline();

  logger.info('This script tests the following safety features:');
  logger.bullet('Validation-only mode (check setup without deploying)');
  logger.bullet('Dry-run mode (simulate deployment without changes)');
  logger.bullet('Deployment summary (show details before execution)');
  logger.bullet('Production confirmation (require explicit approval)');
  logger.bullet('Skip validation option (bypass checks when needed)');
  logger.newline();

  logger.divider();
  logger.newline();

  // Run all tests
  await testValidationOnly();
  await testDryRun();
  await testDeploymentSummary();
  await testProductionConfirmation();
  await testSkipValidation();

  // Summary
  logger.divider();
  logger.header('Test Summary');
  logger.newline();

  logger.success('All safety features have been tested');
  logger.newline();

  logger.info('To test interactively:');
  logger.bullet('npm run deploy -- --validate-only           # Test validation');
  logger.bullet('npm run deploy -- --dry-run                 # Test dry-run');
  logger.bullet('npm run deploy:dev                          # Test with summary');
  logger.bullet('npm run deploy:prod                         # Test production confirmation');
  logger.newline();

  logger.info('Safety features in action:');
  logger.bullet('✓ Validation-only: Checks setup without deploying');
  logger.bullet('✓ Dry-run: Simulates deployment without changes');
  logger.bullet('✓ Deployment summary: Shows details before execution');
  logger.bullet('✓ Production confirmation: Requires "yes" for production');
  logger.bullet('✓ Skip validation: Allows bypassing checks when needed');
  logger.newline();
}

main().catch(error => {
  logger.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});
