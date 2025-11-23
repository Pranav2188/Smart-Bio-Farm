const logger = require('./logger');
const { ERROR_CODES } = require('./constants');

/**
 * Error formatter for deployment validation and execution
 * Provides detailed error messages with remediation steps
 */
class ErrorFormatter {
  /**
   * Formats a validation error with remediation steps
   * @param {string} errorCode - Error code from ERROR_CODES
   * @param {Object} context - Additional context for the error
   * @returns {string} Formatted error message
   */
  static formatValidationError(errorCode, context = {}) {
    const error = ERROR_CODES[errorCode];
    
    if (!error) {
      return `Unknown error: ${errorCode}`;
    }

    let output = '\n' + '='.repeat(60) + '\n';
    output += `❌ ${error.code}: ${error.message}\n`;
    output += '='.repeat(60) + '\n';

    if (context.details) {
      output += `\nDetails: ${context.details}\n`;
    }

    if (error.remediation && error.remediation.length > 0) {
      output += '\n📋 How to fix this:\n\n';
      error.remediation.forEach((step, index) => {
        if (step === '') {
          output += '\n';
        } else if (step.startsWith('  ')) {
          output += `${step}\n`;
        } else {
          output += `  ${index + 1}. ${step}\n`;
        }
      });
    }

    if (context.helpUrl) {
      output += `\n📚 More info: ${context.helpUrl}\n`;
    }

    output += '\n' + '='.repeat(60) + '\n';

    return output;
  }

  /**
   * Formats multiple validation errors
   * @param {Array} errors - Array of error objects
   * @returns {string} Formatted error summary
   */
  static formatValidationErrors(errors) {
    if (!errors || errors.length === 0) {
      return '';
    }

    let output = '\n' + '='.repeat(60) + '\n';
    output += `❌ VALIDATION FAILED: ${errors.length} error(s) found\n`;
    output += '='.repeat(60) + '\n';

    errors.forEach((error, index) => {
      output += `\n${index + 1}. ${error.message}\n`;
      
      if (error.remediation) {
        output += `   → Fix: ${error.remediation}\n`;
      }
    });

    output += '\n' + '='.repeat(60) + '\n';

    return output;
  }

  /**
   * Displays a validation error to console
   * @param {string} errorCode - Error code from ERROR_CODES
   * @param {Object} context - Additional context for the error
   */
  static displayValidationError(errorCode, context = {}) {
    const formatted = this.formatValidationError(errorCode, context);
    console.log(formatted);
  }

  /**
   * Displays multiple validation errors to console
   * @param {Array} errors - Array of error objects
   */
  static displayValidationErrors(errors) {
    const formatted = this.formatValidationErrors(errors);
    console.log(formatted);
  }

  /**
   * Creates a validation summary display
   * @param {Object} results - Validation results object
   */
  static displayValidationSummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(60) + '\n');

    // Display each check
    for (const [checkName, checkResult] of Object.entries(results.checks)) {
      const icon = checkResult.passed ? '✓' : '✗';
      const label = this._formatCheckName(checkName);
      
      if (checkResult.skipped) {
        logger.warning(`⊘ ${label}: Skipped`);
      } else if (checkResult.passed) {
        logger.success(`${icon} ${label}: ${checkResult.message}`);
      } else {
        logger.error(`${icon} ${label}: ${checkResult.message}`);
      }

      // Show details if available
      if (checkResult.details && checkResult.passed) {
        const details = this._formatDetails(checkResult.details);
        if (details) {
          logger.info(`   ${details}`);
        }
      }
    }

    // Display warnings
    if (results.warnings && results.warnings.length > 0) {
      console.log('\n' + '-'.repeat(60));
      logger.warning('⚠️  WARNINGS:');
      results.warnings.forEach(warning => {
        logger.warning(`  • ${warning.message}`);
      });
    }

    // Display errors with remediation
    if (results.errors && results.errors.length > 0) {
      console.log('\n' + '-'.repeat(60));
      logger.error('❌ ERRORS FOUND:');
      results.errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.message}`);
        if (error.remediation) {
          logger.info(`   → ${error.remediation}`);
        }
      });
    }

    console.log('\n' + '='.repeat(60));
    
    if (results.success) {
      logger.success('✅ All validation checks passed!');
    } else {
      logger.error(`❌ Validation failed with ${results.errors.length} error(s)`);
      logger.info('\n💡 Tip: Fix the errors above and run validation again');
    }
    
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Formats a check name for display
   * @private
   * @param {string} checkName - Check name in camelCase
   * @returns {string} Formatted check name
   */
  static _formatCheckName(checkName) {
    return checkName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Formats check details for display
   * @private
   * @param {Object} details - Details object
   * @returns {string} Formatted details string
   */
  static _formatDetails(details) {
    if (!details || typeof details !== 'object') {
      return '';
    }

    const parts = [];
    
    if (details.projectId) {
      parts.push(`Project: ${details.projectId}`);
    }
    
    if (details.clientEmail) {
      parts.push(`Email: ${details.clientEmail}`);
    }
    
    if (details.serviceName) {
      parts.push(`Service: ${details.serviceName}`);
    }
    
    if (details.region) {
      parts.push(`Region: ${details.region}`);
    }
    
    if (details.totalDependencies) {
      parts.push(`Dependencies: ${details.totalDependencies}`);
    }

    return parts.join(', ');
  }

  /**
   * Creates an error template for a specific error type
   * @param {string} errorType - Type of error (validation, deployment, health, etc.)
   * @param {string} message - Error message
   * @param {Array<string>} remediationSteps - Steps to fix the error
   * @returns {Object} Error object
   */
  static createErrorTemplate(errorType, message, remediationSteps = []) {
    return {
      type: errorType,
      message,
      remediation: remediationSteps.join('\n'),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formats a deployment error
   * @param {Error} error - Error object
   * @param {Object} context - Deployment context
   */
  static displayDeploymentError(error, context = {}) {
    console.log('\n' + '='.repeat(60));
    logger.error('❌ DEPLOYMENT FAILED');
    console.log('='.repeat(60) + '\n');

    logger.error(`Error: ${error.message}`);

    if (context.environment) {
      logger.info(`Environment: ${context.environment}`);
    }

    if (context.step) {
      logger.info(`Failed at: ${context.step}`);
    }

    if (error.stack && context.verbose) {
      console.log('\nStack trace:');
      console.log(error.stack);
    }

    console.log('\n' + '='.repeat(60));
    logger.info('💡 Tip: Run with --verbose for more details');
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Formats a health check error
   * @param {Object} result - Health check result
   */
  static displayHealthCheckError(result) {
    console.log('\n' + '='.repeat(60));
    logger.error('❌ HEALTH CHECK FAILED');
    console.log('='.repeat(60) + '\n');

    logger.error(`Status: ${result.status}`);
    
    if (result.url) {
      logger.info(`URL: ${result.url}`);
    }

    if (result.errors && result.errors.length > 0) {
      console.log('\nErrors:');
      result.errors.forEach((error, index) => {
        logger.error(`  ${index + 1}. ${error.message || error}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    logger.info('💡 Troubleshooting:');
    logger.info('  • Check Render dashboard for service status');
    logger.info('  • View logs: https://dashboard.render.com');
    logger.info('  • Verify environment variables are set correctly');
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Displays a success message with details
   * @param {string} title - Success title
   * @param {Object} details - Success details
   */
  static displaySuccess(title, details = {}) {
    console.log('\n' + '='.repeat(60));
    logger.success(`✅ ${title}`);
    console.log('='.repeat(60) + '\n');

    if (details.environment) {
      logger.info(`Environment: ${details.environment}`);
    }

    if (details.url) {
      logger.success(`URL: ${details.url}`);
    }

    if (details.duration) {
      logger.info(`Duration: ${details.duration}ms`);
    }

    if (details.nextSteps && details.nextSteps.length > 0) {
      console.log('\n📋 Next steps:');
      details.nextSteps.forEach((step, index) => {
        logger.info(`  ${index + 1}. ${step}`);
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

module.exports = { ErrorFormatter };
