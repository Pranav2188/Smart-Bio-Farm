#!/usr/bin/env node

/**
 * Test script for error handling and logging system
 * Demonstrates usage of custom errors, structured logging, and log management
 */

const { 
  ValidationError, 
  ConfigurationError,
  DeploymentExecutionError,
  HealthCheckError,
  createError 
} = require('./utils/errors');
const { DeploymentLogger, EVENT_TYPES, LOG_LEVELS } = require('./utils/deploymentLogger');
const { ErrorHandler, createErrorHandler } = require('./utils/errorHandler');
const { LogManager } = require('./utils/logManager');
const logger = require('./utils/logger');

/**
 * Test custom error classes
 */
function testCustomErrors() {
  logger.header('Testing Custom Error Classes');

  try {
    // Test ValidationError
    logger.step('Testing ValidationError');
    throw new ValidationError(
      'Firebase credentials are missing',
      'MISSING_CREDENTIALS',
      { path: 'backend/serviceAccountKey.json' }
    );
  } catch (error) {
    logger.info(`Caught ${error.name}: ${error.message}`);
    logger.info(`Error code: ${error.code}`);
    logger.info(`Has remediation: ${!!error.remediation}`);
  }

  try {
    // Test ConfigurationError
    logger.step('Testing ConfigurationError');
    throw new ConfigurationError(
      'Deployment config not found',
      'CONFIG_READ_ERROR',
      'backend/config/deployment-config.json'
    );
  } catch (error) {
    logger.info(`Caught ${error.name}: ${error.message}`);
    logger.info(`Config path: ${error.configPath}`);
  }

  try {
    // Test DeploymentExecutionError
    logger.step('Testing DeploymentExecutionError');
    throw new DeploymentExecutionError(
      'Failed to generate render.yaml',
      'DEPLOYMENT_FAILED',
      'generate_config',
      { environment: 'production' }
    );
  } catch (error) {
    logger.info(`Caught ${error.name}: ${error.message}`);
    logger.info(`Failed at step: ${error.step}`);
    logger.info(`Context: ${JSON.stringify(error.context)}`);
  }

  try {
    // Test HealthCheckError
    logger.step('Testing HealthCheckError');
    throw new HealthCheckError(
      'Backend is not responding',
      'SERVICE_UNREACHABLE',
      'https://trip-defender-backend.onrender.com',
      null
    );
  } catch (error) {
    logger.info(`Caught ${error.name}: ${error.message}`);
    logger.info(`URL: ${error.url}`);
  }

  // Test error factory
  logger.step('Testing error factory');
  const error = createError('INVALID_ENVIRONMENT', null, { environment: 'invalid' });
  logger.info(`Created error: ${error.name}`);
  logger.info(`Error code: ${error.code}`);

  logger.success('Custom error classes test completed\n');
}

/**
 * Test structured logging
 */
async function testStructuredLogging() {
  logger.header('Testing Structured Logging');

  const deployLogger = new DeploymentLogger({
    enableFileLogging: true,
    logLevel: LOG_LEVELS.DEBUG
  });

  logger.info(`Session ID: ${deployLogger.sessionId}`);
  logger.info(`Log file: ${deployLogger.logFile}\n`);

  // Log various events
  logger.step('Logging deployment events');
  
  deployLogger.logEvent(EVENT_TYPES.DEPLOYMENT_START, {
    environment: 'development',
    user: 'test-user'
  });

  deployLogger.step('Validating prerequisites');
  deployLogger.debug('Checking Firebase credentials', { path: 'serviceAccountKey.json' });
  deployLogger.info('Credentials validated successfully');

  deployLogger.step('Loading environment configuration');
  deployLogger.logEvent(EVENT_TYPES.ENVIRONMENT_LOADED, {
    environment: 'development',
    serviceName: 'trip-defender-backend-dev'
  });

  deployLogger.step('Preparing credentials');
  deployLogger.logEvent(EVENT_TYPES.CREDENTIAL_PREPARED, {
    credentialType: 'firebase',
    outputFile: 'firebase-credentials-for-render.txt'
  });

  deployLogger.warning('This is a test warning', { component: 'test' });

  try {
    throw new Error('Simulated deployment error');
  } catch (error) {
    deployLogger.error('Deployment failed', error, {
      step: 'deploy',
      environment: 'development'
    });
  }

  deployLogger.logEvent(EVENT_TYPES.DEPLOYMENT_COMPLETE, {
    environment: 'development',
    duration: deployLogger.getSessionDuration()
  });

  // Display session summary
  logger.step('Session summary');
  const summary = deployLogger.getSessionSummary();
  logger.table({
    'Session ID': summary.sessionId,
    'Duration': `${summary.duration}ms`,
    'Total Events': summary.totalEvents,
    'Errors': summary.errors,
    'Warnings': summary.warnings
  });

  deployLogger.writeSessionSummary();

  logger.success('Structured logging test completed\n');
  return deployLogger;
}

/**
 * Test error handler
 */
async function testErrorHandler() {
  logger.header('Testing Error Handler');

  const deployLogger = new DeploymentLogger({ enableFileLogging: true });
  const errorHandler = new ErrorHandler(deployLogger);

  // Test validation error handling
  logger.step('Testing validation error handling');
  try {
    throw new ValidationError('Invalid credentials', 'INVALID_CREDENTIALS');
  } catch (error) {
    errorHandler.handleValidationError(error, {
      displayError: false // Don't display to keep output clean
    });
  }

  // Test configuration error handling
  logger.step('Testing configuration error handling');
  try {
    throw new ConfigurationError('Config not found', 'CONFIG_READ_ERROR');
  } catch (error) {
    errorHandler.handleConfigurationError(error, {
      displayError: false
    });
  }

  // Test warning handling
  logger.step('Testing warning handling');
  errorHandler.handleWarning('This is a test warning', {
    displayWarning: false
  });

  // Test safe execution
  logger.step('Testing safe execution wrapper');
  const result = await errorHandler.safeExecute(
    async () => {
      // Simulate successful operation
      return { status: 'success', data: 'test data' };
    },
    {
      context: { operation: 'test' },
      onSuccess: (result) => {
        logger.success(`Operation succeeded: ${result.status}`);
      }
    }
  );

  logger.info(`Safe execution result: ${result.success}`);

  // Test error summary
  logger.step('Error summary');
  const summary = errorHandler.getErrorSummary();
  logger.table({
    'Total Errors': summary.errorCount,
    'Total Warnings': summary.warningCount,
    'Has Errors': summary.hasErrors,
    'Has Warnings': summary.hasWarnings
  });

  logger.success('Error handler test completed\n');
}

/**
 * Test log management
 */
async function testLogManagement() {
  logger.header('Testing Log Management');

  const logManager = new LogManager();

  // Get log files
  logger.step('Getting log files');
  const files = logManager.getLogFiles();
  logger.info(`Found ${files.length} log file(s)`);

  if (files.length > 0) {
    logger.info('\nRecent log files:');
    files.slice(0, 3).forEach(file => {
      logger.bullet(`${file.name} (${file.sizeFormatted}) - ${file.modified.toISOString()}`);
    });
  }

  // Display statistics
  logger.step('Log statistics');
  logManager.displayStatistics();

  // Analyze most recent log file
  if (files.length > 0) {
    logger.step('Analyzing most recent log file');
    try {
      const analysis = logManager.analyzeLogFile(files[0].name);
      
      logger.info('\nLog Analysis:');
      logger.table({
        'Total Entries': analysis.totalEntries,
        'Sessions': analysis.sessions,
        'Errors': analysis.errors.length,
        'Warnings': analysis.warnings.length
      });

      if (Object.keys(analysis.byLevel).length > 0) {
        logger.info('\nEntries by level:');
        logger.table(analysis.byLevel);
      }

      if (Object.keys(analysis.byEventType).length > 0) {
        logger.info('\nEntries by event type:');
        logger.table(analysis.byEventType);
      }
    } catch (error) {
      logger.warning(`Could not analyze log file: ${error.message}`);
    }
  }

  // Test cleanup (with very high retention to avoid deleting logs)
  logger.step('Testing log cleanup (dry run)');
  const cleanupResults = logManager.cleanupOldLogs(365); // Keep logs for 1 year
  logger.info(`Would delete: ${cleanupResults.deleted.length} file(s)`);
  logger.info(`Would keep: ${cleanupResults.kept.length} file(s)`);

  logger.success('Log management test completed\n');
}

/**
 * Main test function
 */
async function main() {
  logger.header('Error Handling and Logging System Test');
  logger.info('This script tests the error handling and logging components\n');

  try {
    // Run tests
    testCustomErrors();
    await testStructuredLogging();
    await testErrorHandler();
    await testLogManagement();

    logger.header('All Tests Completed Successfully');
    logger.success('✅ Error handling and logging system is working correctly');
    
    logger.info('\nNext steps:');
    logger.bullet('Check backend/logs/ directory for log files');
    logger.bullet('Review log entries in JSON format');
    logger.bullet('Integrate error handling into deployment scripts');
    
  } catch (error) {
    logger.error(`Test failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  main();
}

module.exports = { main };
