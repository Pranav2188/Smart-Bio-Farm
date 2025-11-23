#!/usr/bin/env node

/**
 * Test script for DeploymentManager
 * Tests core functionality without actually deploying
 */

const DeploymentManager = require('./deployment-manager');
const logger = require('./utils/logger');

async function runTests() {
  logger.header('Testing DeploymentManager');
  logger.newline();

  try {
    // Test 1: Create DeploymentManager instance
    logger.step('Test 1: Creating DeploymentManager instance');
    const manager = new DeploymentManager({ dryRun: true, verbose: true });
    logger.success('✓ DeploymentManager created successfully');
    logger.newline();

    // Test 2: Test deployment URL generation
    logger.step('Test 2: Testing deployment URL generation');
    const testConfig = {
      renderServiceName: 'test-service'
    };
    const url = manager._getDeploymentUrl(testConfig);
    if (url === 'https://test-service.onrender.com') {
      logger.success('✓ Deployment URL generated correctly');
    } else {
      logger.error(`✗ Expected https://test-service.onrender.com, got ${url}`);
    }
    logger.newline();

    // Test 3: Test environment variable formatting
    logger.step('Test 3: Testing environment variable formatting');
    const envVars = {
      NODE_ENV: 'development',
      PORT: '10000',
      ADMIN_SETUP_CODE: 'TEST_CODE'
    };
    const formatted = manager._formatEnvVarsForRender(envVars);
    
    if (formatted.length === 4) { // 3 vars + FIREBASE_SERVICE_ACCOUNT
      logger.success('✓ Environment variables formatted correctly');
      logger.bullet(`Generated ${formatted.length} environment variables`);
      
      // Check FIREBASE_SERVICE_ACCOUNT has sync: false
      const firebaseVar = formatted.find(v => v.key === 'FIREBASE_SERVICE_ACCOUNT');
      if (firebaseVar && firebaseVar.sync === false) {
        logger.success('✓ FIREBASE_SERVICE_ACCOUNT has sync: false');
      } else {
        logger.error('✗ FIREBASE_SERVICE_ACCOUNT missing or incorrect');
      }
    } else {
      logger.error(`✗ Expected 4 variables, got ${formatted.length}`);
    }
    logger.newline();

    // Test 4: Test dry-run deployment
    logger.step('Test 4: Testing dry-run deployment');
    const result = await manager.deploy({
      environment: 'development',
      skipValidation: false,
      dryRun: true
    });

    if (result.success) {
      logger.success('✓ Dry-run deployment completed successfully');
      logger.bullet(`Deployment ID: ${result.deploymentId}`);
      logger.bullet(`Environment: ${result.environment}`);
      logger.bullet(`Dry Run: ${result.dryRun}`);
    } else {
      logger.error('✗ Dry-run deployment failed');
      if (result.error) {
        logger.error(`Error: ${result.error}`);
      }
    }
    logger.newline();

    // Summary
    logger.divider();
    logger.success('All tests completed!');
    logger.newline();

  } catch (error) {
    logger.error(`Test failed: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runTests();
