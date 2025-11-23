/**
 * Custom error classes for deployment system
 * Provides specific error types with remediation guidance
 */

const { ERROR_CODES } = require('./constants');

/**
 * Base deployment error class
 */
class DeploymentError extends Error {
  constructor(message, code, remediation = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.remediation = remediation;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts error to JSON format
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      remediation: this.remediation,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }

  /**
   * Gets formatted error message with remediation
   * @returns {string}
   */
  getFormattedMessage() {
    let msg = `[${this.code}] ${this.message}`;
    if (this.remediation) {
      msg += `\n\nRemediation:\n${this.remediation}`;
    }
    return msg;
  }
}

/**
 * Validation error - thrown when pre-deployment validation fails
 */
class ValidationError extends DeploymentError {
  constructor(message, errorCode = 'VALIDATION_FAILED', details = null) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.VALIDATION_FAILED;
    const remediation = Array.isArray(errorInfo.remediation) 
      ? errorInfo.remediation.join('\n') 
      : errorInfo.remediation;
    
    super(message || errorInfo.message, errorInfo.code, remediation);
    this.errorCode = errorCode;
    this.details = details;
  }
}

/**
 * Configuration error - thrown when configuration is invalid or missing
 */
class ConfigurationError extends DeploymentError {
  constructor(message, errorCode = 'CONFIG_READ_ERROR', configPath = null) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.CONFIG_READ_ERROR;
    const remediation = Array.isArray(errorInfo.remediation) 
      ? errorInfo.remediation.join('\n') 
      : errorInfo.remediation;
    
    super(message || errorInfo.message, errorInfo.code, remediation);
    this.errorCode = errorCode;
    this.configPath = configPath;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      configPath: this.configPath
    };
  }
}

/**
 * Credential error - thrown when credentials are missing or invalid
 */
class CredentialError extends DeploymentError {
  constructor(message, errorCode = 'MISSING_CREDENTIALS', credentialType = null) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.MISSING_CREDENTIALS;
    const remediation = Array.isArray(errorInfo.remediation) 
      ? errorInfo.remediation.join('\n') 
      : errorInfo.remediation;
    
    super(message || errorInfo.message, errorInfo.code, remediation);
    this.errorCode = errorCode;
    this.credentialType = credentialType;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      credentialType: this.credentialType
    };
  }
}

/**
 * Deployment execution error - thrown during deployment process
 */
class DeploymentExecutionError extends DeploymentError {
  constructor(message, errorCode = 'DEPLOYMENT_FAILED', step = null, context = {}) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.DEPLOYMENT_FAILED;
    const remediation = Array.isArray(errorInfo.remediation) 
      ? errorInfo.remediation.join('\n') 
      : errorInfo.remediation;
    
    super(message || errorInfo.message, errorInfo.code, remediation);
    this.errorCode = errorCode;
    this.step = step;
    this.context = context;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      step: this.step,
      context: this.context
    };
  }
}

/**
 * Health check error - thrown when health checks fail
 */
class HealthCheckError extends DeploymentError {
  constructor(message, errorCode = 'HEALTH_CHECK_FAILED', url = null, statusCode = null) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.HEALTH_CHECK_FAILED;
    const remediation = Array.isArray(errorInfo.remediation) 
      ? errorInfo.remediation.join('\n') 
      : errorInfo.remediation;
    
    super(message || errorInfo.message, errorInfo.code, remediation);
    this.errorCode = errorCode;
    this.url = url;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      url: this.url,
      statusCode: this.statusCode
    };
  }
}

/**
 * Network error - thrown when network operations fail
 */
class NetworkError extends DeploymentError {
  constructor(message, errorCode = 'TIMEOUT_ERROR', url = null, timeout = null) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.TIMEOUT_ERROR;
    const remediation = Array.isArray(errorInfo.remediation) 
      ? errorInfo.remediation.join('\n') 
      : errorInfo.remediation;
    
    super(message || errorInfo.message, errorInfo.code, remediation);
    this.errorCode = errorCode;
    this.url = url;
    this.timeout = timeout;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      url: this.url,
      timeout: this.timeout
    };
  }
}

/**
 * History error - thrown when deployment history operations fail
 */
class HistoryError extends DeploymentError {
  constructor(message, errorCode = 'HISTORY_READ_ERROR', historyPath = null) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.HISTORY_READ_ERROR;
    const remediation = Array.isArray(errorInfo.remediation) 
      ? errorInfo.remediation.join('\n') 
      : errorInfo.remediation;
    
    super(message || errorInfo.message, errorInfo.code, remediation);
    this.errorCode = errorCode;
    this.historyPath = historyPath;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      historyPath: this.historyPath
    };
  }
}

/**
 * Rollback error - thrown when rollback operations fail
 */
class RollbackError extends DeploymentError {
  constructor(message, errorCode = 'ROLLBACK_NOT_AVAILABLE', deploymentId = null) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.ROLLBACK_NOT_AVAILABLE;
    const remediation = Array.isArray(errorInfo.remediation) 
      ? errorInfo.remediation.join('\n') 
      : errorInfo.remediation;
    
    super(message || errorInfo.message, errorInfo.code, remediation);
    this.errorCode = errorCode;
    this.deploymentId = deploymentId;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      deploymentId: this.deploymentId
    };
  }
}

/**
 * Environment error - thrown when environment operations fail
 */
class EnvironmentError extends DeploymentError {
  constructor(message, errorCode = 'INVALID_ENVIRONMENT', environment = null) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.INVALID_ENVIRONMENT;
    const remediation = Array.isArray(errorInfo.remediation) 
      ? errorInfo.remediation.join('\n') 
      : errorInfo.remediation;
    
    super(message || errorInfo.message, errorInfo.code, remediation);
    this.errorCode = errorCode;
    this.environment = environment;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      environment: this.environment
    };
  }
}

/**
 * Factory function to create appropriate error from error code
 * @param {string} errorCode - Error code from ERROR_CODES
 * @param {string} message - Optional custom message
 * @param {Object} context - Additional context
 * @returns {DeploymentError}
 */
function createError(errorCode, message = null, context = {}) {
  const errorInfo = ERROR_CODES[errorCode];
  
  if (!errorInfo) {
    return new DeploymentError(
      message || `Unknown error: ${errorCode}`,
      'E9999',
      'Check error code and try again'
    );
  }

  // Determine error type based on error code prefix
  const codePrefix = errorInfo.code.substring(0, 2);
  
  switch (codePrefix) {
    case 'E1': // Validation errors
      return new ValidationError(message, errorCode, context.details);
    
    case 'E2': // Configuration errors
      return new ConfigurationError(message, errorCode, context.configPath);
    
    case 'E3': // Deployment errors
      return new DeploymentExecutionError(message, errorCode, context.step, context);
    
    case 'E4': // Health check errors
      return new HealthCheckError(message, errorCode, context.url, context.statusCode);
    
    case 'E5': // History/Rollback errors
      if (errorCode.includes('ROLLBACK')) {
        return new RollbackError(message, errorCode, context.deploymentId);
      }
      return new HistoryError(message, errorCode, context.historyPath);
    
    default:
      return new DeploymentError(
        message || errorInfo.message,
        errorInfo.code,
        Array.isArray(errorInfo.remediation) 
          ? errorInfo.remediation.join('\n') 
          : errorInfo.remediation
      );
  }
}

/**
 * Checks if an error is a deployment error
 * @param {Error} error - Error to check
 * @returns {boolean}
 */
function isDeploymentError(error) {
  return error instanceof DeploymentError;
}

/**
 * Wraps a standard error in a deployment error
 * @param {Error} error - Standard error
 * @param {string} errorCode - Error code to use
 * @param {Object} context - Additional context
 * @returns {DeploymentError}
 */
function wrapError(error, errorCode = 'DEPLOYMENT_FAILED', context = {}) {
  if (isDeploymentError(error)) {
    return error;
  }
  
  return createError(errorCode, error.message, {
    ...context,
    originalError: error.name,
    originalStack: error.stack
  });
}

module.exports = {
  DeploymentError,
  ValidationError,
  ConfigurationError,
  CredentialError,
  DeploymentExecutionError,
  HealthCheckError,
  NetworkError,
  HistoryError,
  RollbackError,
  EnvironmentError,
  createError,
  isDeploymentError,
  wrapError
};
