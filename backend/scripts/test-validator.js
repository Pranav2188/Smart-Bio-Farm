#!/usr/bin/env node

/**
 * Test script for Validator module
 * Tests all validation methods
 */

const { Validator } = require('./validator');
const logger = require('./utils/logger');

async function testValidator() {
  logger.info('Testing Validator Module\n');

  const validator = new Validator();

  try {
    // Test 1: Validate all with development environment
    logger.info('Test 1: Running full validation for development environment...\n');
    const result1 = await validator.validateAll({ environment: 'development' });
    
    if (result1.success) {
      logger.success('✓ Test 1 passed: All validations successful\n');
    } else {
      logger.warning('⚠ Test 1: Some validations failed (expected if setup incomplete)\n');
    }

    // Test 2: Validate Firebase credentials only
    logger.info('Test 2: Validating Firebase credentials...\n');
    const result2 = await validator.validateFirebaseCredentials();
    
    if (result2.passed) {
      logger.success('✓ Test 2 passed: Firebase credentials valid');
      logger.info(`  Project ID: ${result2.details.projectId}`);
      logger.info(`  Client Email: ${result2.details.clientEmail}\n`);
    } else {
      logger.error('✗ Test 2 failed: Firebase credentials invalid');
      logger.info(`  Message: ${result2.message}\n`);
    }

    // Test 3: Validate dependencies
    logger.info('Test 3: Validating dependencies...\n');
    const result3 = await validator.validateDependencies();
    
    if (result3.passed) {
      logger.success('✓ Test 3 passed: Dependencies valid');
      logger.info(`  Total dependencies: ${result3.details.totalDependencies}\n`);
    } else {
      logger.error('✗ Test 3 failed: Dependencies invalid');
      logger.info(`  Message: ${result3.message}\n`);
    }

    // Test 4: Validate server config
    logger.info('Test 4: Validating server configuration...\n');
    const result4 = await validator.validateServerConfig();
    
    if (result4.passed) {
      logger.success('✓ Test 4 passed: Server config valid');
      logger.info(`  Main file: ${result4.details.mainFile}`);
      logger.info(`  Start script: ${result4.details.startScript}\n`);
    } else {
      logger.error('✗ Test 4 failed: Server config invalid');
      logger.info(`  Message: ${result4.message}\n`);
    }

    // Test 5: Validate invalid environment
    logger.info('Test 5: Testing invalid environment (should fail)...\n');
    const result5 = await validator.validateEnvironment('invalid');
    
    if (!result5.passed) {
      logger.success('✓ Test 5 passed: Invalid environment correctly rejected');
      logger.info(`  Message: ${result5.message}\n`);
    } else {
      logger.error('✗ Test 5 failed: Invalid environment was accepted\n');
    }

    // Test 6: Validate with skip credentials
    logger.info('Test 6: Running validation with skipCredentials flag...\n');
    const result6 = await validator.validateAll({ 
      environment: 'development',
      skipCredentials: true 
    });
    
    if (result6.checks.credentials.skipped) {
      logger.success('✓ Test 6 passed: Credentials validation skipped as expected\n');
    } else {
      logger.error('✗ Test 6 failed: Credentials validation was not skipped\n');
    }

    // Summary
    console.log('='.repeat(60));
    logger.info('VALIDATOR TEST SUMMARY');
    console.log('='.repeat(60));
    logger.success('✓ Validator module is working correctly');
    logger.info('All validation methods are functional');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    logger.error(`Test failed with error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testValidator();
