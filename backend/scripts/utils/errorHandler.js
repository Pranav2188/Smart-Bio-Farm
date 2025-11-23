/**
 * Centralized error handler for deployment system
 * Integrates error classes, logging, and formatting
 */

const { ErrorFormatter } = require('./errorFormatter');
const { DeploymentLogger, EVENT_TYPES } = require('./deploymentLogger');
const { isDeploymentError, wrapError } = require('./errors');
const { EXIT_CODES } = require('./constants');

class ErrorHandler {
  constructor(logger = null) {
    this.logger = logger || new DeploymentLogger();
    this.errorCount = 0;
    this.warningCount = 0;
  }

  /**
   * Handles an error with appropriate logging and formatting
   * @param {Error} error - Error to handle
   * @param {Object} context - Additional context
   * @param {boolean} fatal - Whether error is fatal (should exit)
   * @returns {number} Exit code
   */
  handleError(error, context = {}, fatal = false) {
    this.errorCount++;

    // Wrap standard errors in deployment errors
    const deploymentError = isDeploymentError(error) 
      ? error 
      : wrapError(error, context.errorCode || 'DEPLOYMENT_FAILED', context);

    // Log the error
    this.logger.error(
      deploymentError.message,
      deploymentError,
      {
        ...context,
        errorCode: deploymentError.code,
        remediation: deploymentError.remediation
      }
    );

    // Log error event
    this.logger.logEvent(EVENT_TYPES.ERROR_OCCURRED, {
      error: deploymentError.toJSON(),
      context,
      fatal
    });

    // Display formatted error
    if (context.displayError !== false) {
      this.displayError(deploymentError, context);
    }

    // Exit if fatal
    if (fatal) {
      this.logger.writeSessionSummary();
      const exitCode = this.getExitCode(deploymentError);
      process.exit(exitCode);
    }

    return this.getExitCode(deploymentError);
  }

  /**
   * Handles a validation error
   * @param {Error} error - Validation error
   * @param {Object} context - Additional context
   * @returns {number} Exit code
   */
  handleValidationError(error, context = {}) {
    return this.handleError(error, {
      ...context,
      errorType: 'validation',
      step: 'validation'
    }, false);
  }

  /**
   * Handles a configuration error
   * @param {Error} error - Configuration error
   * @param {Object} context - Additional context
   * @returns {number} Exit code
   */
  handleConfigurationError(error, context = {}) {
    return this.handleError(error, {
      ...context,
      errorType: 'configuration',
      step: 'configuration'
    }, false);
  }

  /**
   * Handles a deployment error
   * @param {Error} error - Deployment error
   * @param {Object} context - Additional context
   * @param {boolean} fatal - Whether error is fatal
   * @returns {number} Exit code
   */
  handleDeploymentError(error, context = {}, fatal = true) {
    return this.handleError(error, {
      ...context,
      errorType: 'deployment',
      step: context.step || 'deployment'
    }, fatal);
  }

  /**
   * Handles a health check error
   * @param {Error} error - Health check error
   * @param {Object} context - Additional context
   * @returns {number} Exit code
   */
  handleHealthCheckError(error, context = {}) {
    return this.handleError(error, {
      ...context,
      errorType: 'health_check',
      step: 'health_check'
    }, false);
  }

  /**
   * Handles a warning
   * @param {string} message - Warning message
   * @param {Object} context - Additional context
   */
  handleWarning(message, context = {}) {
    this.warningCount++;

    this.logger.warning(message, context);

    if (context.displayWarning !== false) {
      console.log(`\n⚠️  WARNING: ${message}\n`);
    }
  }

  /**
   * Displays formatted error
   * @param {Error} error - Error to display
   * @param {Object} context - Additional context
   */
  displayError(error, context = {}) {
    if (context.environment) {
      ErrorFormatter.displayDeploymentError(error, context);
    } else if (error.code && error.code.startsWith('E4')) {
      // Health check error
      ErrorFormatter.displayHealthCheckError({
        status: 'failed',
        url: context.url,
        errors: [error]
      });
    } else {
      // Generic error display
      console.error('\n' + '='.repeat(60));
      console.error(`❌ ERROR: ${error.message}`);
      
      if (error.code) {
        console.error(`Code: ${error.code}`);
      }
      
      if (error.remediation) {
        console.error('\n📋 How to fix:');
        console.error(error.remediation);
      }
      
      console.error('='.repeat(60) + '\n');
    }
  }

  /**
   * Gets appropriate exit code for error
   * @param {Error} error - Error object
   * @returns {number} Exit code
   */
  getExitCode(error) {
    if (!error.code) {
      return EXIT_CODES.UNKNOWN_ERROR;
    }

    const codePrefix = error.code.substring(0, 2);

    switch (codePrefix) {
      case 'E1': // Validation errors
        return EXIT_CODES.VALIDATION_ERROR;
      case 'E2': // Configuration errors
        return EXIT_CODES.CONFIGURATION_ERROR;
      case 'E3': // Deployment errors
        return EXIT_CODES.DEPLOYMENT_ERROR;
      case 'E4': // Health check errors
        return EXIT_CODES.HEALTH_CHECK_ERROR;
      default:
        return EXIT_CODES.UNKNOWN_ERROR;
    }
  }

  /**
   * Handles multiple errors
   * @param {Array} errors - Array of errors
   * @param {Object} context - Additional context
   * @returns {number} Exit code
   */
  handleMultipleErrors(errors, context = {}) {
    if (!errors || errors.length === 0) {
      return EXIT_CODES.SUCCESS;
    }

    errors.forEach(error => {
      this.handleError(error, context, false);
    });

    return this.getExitCode(errors[0]);
  }

  /**
   * Wraps a function with error handling
   * @param {Function} fn - Function to wrap
   * @param {Object} context - Error context
   * @returns {Function} Wrapped function
   */
  wrapFunction(fn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error, context, context.fatal || false);
        throw error;
      }
    };
  }

  /**
   * Creates a safe execution wrapper
   * @param {Function} fn - Function to execute
   * @param {Object} options - Execution options
   * @returns {Promise} Execution result
   */
  async safeExecute(fn, options = {}) {
    const {
      context = {},
      onError = null,
      onSuccess = null,
      fatal = false
    } = options;

    try {
      const result = await fn();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return { success: true, result };
    } catch (error) {
      const exitCode = this.handleError(error, context, fatal);
      
      if (onError) {
        onError(error, exitCode);
      }
      
      return { success: false, error, exitCode };
    }
  }

  /**
   * Gets error summary
   * @returns {Object} Error summary
   */
  getErrorSummary() {
    return {
      errorCount: this.errorCount,
      warningCount: this.warningCount,
      hasErrors: this.errorCount > 0,
      hasWarnings: this.warningCount > 0
    };
  }

  /**
   * Resets error counts
   */
  reset() {
    this.errorCount = 0;
    this.warningCount = 0;
  }

  /**
   * Displays error summary
   */
  displaySummary() {
    const summary = this.getErrorSummary();
    
    if (!summary.hasErrors && !summary.hasWarnings) {
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('ERROR SUMMARY');
    console.log('='.repeat(60));
    
    if (summary.hasErrors) {
      console.log(`❌ Errors: ${summary.errorCount}`);
    }
    
    if (summary.hasWarnings) {
      console.log(`⚠️  Warnings: ${summary.warningCount}`);
    }
    
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Sets up global error handlers
   */
  setupGlobalHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.critical('Uncaught exception', error);
      this.handleError(error, {
        errorType: 'uncaught_exception',
        displayError: true
      }, true);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.logger.critical('Unhandled promise rejection', error);
      this.handleError(error, {
        errorType: 'unhandled_rejection',
        displayError: true
      }, true);
    });

    // Handle process exit
    process.on('exit', (code) => {
      if (code !== 0) {
        this.logger.logEvent(EVENT_TYPES.DEPLOYMENT_FAILED, {
          exitCode: code,
          errorCount: this.errorCount,
          warningCount: this.warningCount
        });
      }
      this.logger.writeSessionSummary();
    });
  }
}

/**
 * Creates a global error handler instance
 * @param {DeploymentLogger} logger - Logger instance
 * @returns {ErrorHandler}
 */
function createErrorHandler(logger = null) {
  const handler = new ErrorHandler(logger);
  handler.setupGlobalHandlers();
  return handler;
}

module.exports = {
  ErrorHandler,
  createErrorHandler
};
