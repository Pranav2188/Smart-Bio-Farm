#!/usr/bin/env node

/**
 * Test script for Health Checker
 * Tests the health checker functionality
 */

const HealthChecker = require('./health-checker');
const logger = require('./utils/logger');

async function testHealthChecker() {
  logger.header('Testing Health Checker');
  logger.newline();

  const healthChecker = new HealthChecker();

  // Test 1: Test with a known good URL (Google)
  logger.step('Test 1: Testing with a reachable URL');
  try {
    const result1 = await healthChecker.checkHealth({
      url: 'https://www.google.com',
      timeout: 10000
    });
    logger.success('Test 1 completed');
    healthChecker.displayResults(result1);
  } catch (error) {
    logger.error(`Test 1 failed: ${error.message}`);
  }

  logger.newline();
  logger.divider();
  logger.newline();

  // Test 2: Test with an unreachable URL
  logger.step('Test 2: Testing with an unreachable URL');
  try {
    const result2 = await healthChecker.checkHealth({
      url: 'https://this-domain-does-not-exist-12345.com',
      timeout: 5000
    });
    logger.success('Test 2 completed');
    healthChecker.displayResults(result2);
  } catch (error) {
    logger.error(`Test 2 failed: ${error.message}`);
  }

  logger.newline();
  logger.divider();
  logger.newline();

  // Test 3: Test endpoint directly
  logger.step('Test 3: Testing testEndpoint method');
  try {
    const result3 = await healthChecker.testEndpoint('https://www.google.com', {
      timeout: 5000
    });
    logger.success('Test 3 completed');
    logger.info('Endpoint test result:');
    logger.table({
      'Success': result3.success,
      'Status Code': result3.statusCode,
      'Response Time': `${result3.responseTime}ms`,
      'Error': result3.error || 'None'
    });
  } catch (error) {
    logger.error(`Test 3 failed: ${error.message}`);
  }

  logger.newline();
  logger.success('All tests completed!');
}

// Run tests
testHealthChecker().catch(error => {
  logger.error('Test suite failed:');
  logger.error(error.message);
  process.exit(1);
});
