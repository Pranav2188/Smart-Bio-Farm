# Error Handling and Logging System

This document describes the error handling and logging system for the deployment automation scripts.

## Overview

The error handling and logging system provides:

- **Custom Error Classes**: Specific error types for different failure scenarios
- **Structured Logging**: JSON-based logging with event tracking
- **Log Management**: Automated log rotation, cleanup, and analysis
- **Error Remediation**: Built-in guidance for fixing common errors
- **Centralized Error Handling**: Consistent error handling across all scripts

## Components

### 1. Custom Error Classes (`errors.js`)

Provides specialized error classes for different error types:

#### Base Error Class

```javascript
const { DeploymentError } = require('./utils/errors');

throw new DeploymentError(
  'Something went wrong',
  'E9999',
  'Check the logs and try again'
);
```

#### Specialized Error Classes

- **ValidationError**: Pre-deployment validation failures
- **ConfigurationError**: Configuration file issues
- **CredentialError**: Missing or invalid credentials
- **DeploymentExecutionError**: Deployment process failures
- **HealthCheckError**: Health check failures
- **NetworkError**: Network operation failures
- **HistoryError**: Deployment history issues
- **RollbackError**: Rollback operation failures
- **EnvironmentError**: Environment configuration issues

#### Usage Example

```javascript
const { ValidationError, createError } = require('./utils/errors');

// Using specific error class
throw new ValidationError(
  'Firebase credentials not found',
  'MISSING_CREDENTIALS',
  { path: 'serviceAccountKey.json' }
);

// Using error factory
const error = createError('INVALID_ENVIRONMENT', null, {
  environment: 'invalid-env'
});
```

### 2. Structured Logging (`deploymentLogger.js`)

Provides structured logging with file output and event tracking:

#### Basic Usage

```javascript
const { DeploymentLogger, EVENT_TYPES } = require('./utils/deploymentLogger');

const logger = new DeploymentLogger({
  enableFileLogging: true,
  logLevel: LOG_LEVELS.INFO
});

// Log events
logger.logEvent(EVENT_TYPES.DEPLOYMENT_START, {
  environment: 'production',
  user: 'developer@example.com'
});

// Log messages
logger.info('Starting deployment');
logger.warning('Configuration file not found');
logger.error('Deployment failed', error);
logger.success('Deployment completed');

// Log steps
logger.step('Validating credentials');
logger.step('Preparing configuration');
```

#### Event Types

- `DEPLOYMENT_START` / `DEPLOYMENT_COMPLETE` / `DEPLOYMENT_FAILED`
- `VALIDATION_START` / `VALIDATION_COMPLETE` / `VALIDATION_FAILED`
- `HEALTH_CHECK_START` / `HEALTH_CHECK_COMPLETE` / `HEALTH_CHECK_FAILED`
- `CREDENTIAL_PREPARED`
- `ENVIRONMENT_LOADED`
- `CONFIG_UPDATED`
- `HISTORY_RECORDED`
- `ROLLBACK_INITIATED` / `ROLLBACK_COMPLETE`
- `ERROR_OCCURRED`

#### Session Management

```javascript
// Get session summary
const summary = logger.getSessionSummary();
console.log(`Session: ${summary.sessionId}`);
console.log(`Duration: ${summary.duration}ms`);
console.log(`Errors: ${summary.errors}`);

// Write session summary to log file
logger.writeSessionSummary();
```

#### Log File Format

Logs are written in JSON format, one entry per line:

```json
{"timestamp":"2025-11-23T10:30:00.000Z","sessionId":"session_123","level":"INFO","message":"Starting deployment","eventType":"deployment_start","environment":"production"}
{"timestamp":"2025-11-23T10:30:05.000Z","sessionId":"session_123","level":"ERROR","message":"Deployment failed","error":{"name":"ValidationError","message":"Credentials not found"}}
```

### 3. Log Management (`logManager.js`)

Provides log file management capabilities:

#### Basic Usage

```javascript
const { LogManager } = require('./utils/logManager');

const logManager = new LogManager();

// Get log files
const files = logManager.getLogFiles();
console.log(`Found ${files.length} log files`);

// Display statistics
logManager.displayStatistics();

// Analyze log file
const analysis = logManager.analyzeLogFile('deployment-2025-11-23.log');
console.log(`Total entries: ${analysis.totalEntries}`);
console.log(`Errors: ${analysis.errors.length}`);

// Cleanup old logs
const results = logManager.cleanupOldLogs(30); // Keep 30 days
console.log(`Deleted ${results.deleted.length} old log files`);

// Search logs
const errors = logManager.searchAllLogs({
  level: 'ERROR',
  startDate: '2025-11-01',
  endDate: '2025-11-30'
});

// Export logs
logManager.exportLogs('deployment-logs.json', {
  level: 'ERROR'
});
```

### 4. Error Handler (`errorHandler.js`)

Provides centralized error handling:

#### Basic Usage

```javascript
const { createErrorHandler } = require('./utils/errorHandler');

// Create error handler with global handlers
const errorHandler = createErrorHandler();

// Handle specific error types
try {
  // ... validation code
} catch (error) {
  errorHandler.handleValidationError(error, {
    environment: 'production'
  });
}

// Handle warnings
errorHandler.handleWarning('Configuration file not found', {
  configPath: 'deployment-config.json'
});

// Safe execution wrapper
const result = await errorHandler.safeExecute(
  async () => {
    // Your deployment code here
    return await deploy();
  },
  {
    context: { environment: 'production' },
    onError: (error, exitCode) => {
      console.log(`Deployment failed with code ${exitCode}`);
    },
    onSuccess: (result) => {
      console.log('Deployment succeeded');
    },
    fatal: true // Exit on error
  }
);

// Get error summary
const summary = errorHandler.getErrorSummary();
console.log(`Errors: ${summary.errorCount}`);
console.log(`Warnings: ${summary.warningCount}`);
```

## Integration with Deployment Scripts

### Example: Validator Integration

```javascript
const { ValidationError } = require('./utils/errors');
const { DeploymentLogger, EVENT_TYPES } = require('./utils/deploymentLogger');
const { createErrorHandler } = require('./utils/errorHandler');

class Validator {
  constructor() {
    this.logger = new DeploymentLogger();
    this.errorHandler = createErrorHandler(this.logger);
  }

  async validateAll(options = {}) {
    this.logger.logEvent(EVENT_TYPES.VALIDATION_START, options);

    try {
      // Validation logic
      const results = await this.runValidations(options);

      if (!results.success) {
        throw new ValidationError(
          'Validation failed',
          'VALIDATION_FAILED',
          results.errors
        );
      }

      this.logger.logEvent(EVENT_TYPES.VALIDATION_COMPLETE, {
        checks: results.checks
      });

      return results;
    } catch (error) {
      this.logger.logEvent(EVENT_TYPES.VALIDATION_FAILED, {
        error: error.message
      });
      
      this.errorHandler.handleValidationError(error, {
        environment: options.environment
      });
      
      throw error;
    }
  }
}
```

### Example: Deployment Manager Integration

```javascript
const { DeploymentExecutionError } = require('./utils/errors');
const { DeploymentLogger, EVENT_TYPES } = require('./utils/deploymentLogger');
const { createErrorHandler } = require('./utils/errorHandler');

class DeploymentManager {
  constructor() {
    this.logger = new DeploymentLogger();
    this.errorHandler = createErrorHandler(this.logger);
  }

  async deploy(options) {
    this.logger.logEvent(EVENT_TYPES.DEPLOYMENT_START, {
      environment: options.environment,
      timestamp: new Date().toISOString()
    });

    const result = await this.errorHandler.safeExecute(
      async () => {
        // Step 1: Validate
        this.logger.step('Validating prerequisites');
        await this.validator.validateAll(options);

        // Step 2: Prepare credentials
        this.logger.step('Preparing credentials');
        await this.credentialManager.prepareCredentials();

        // Step 3: Generate config
        this.logger.step('Generating configuration');
        await this.generateRenderConfig(options.environment);

        // Step 4: Record deployment
        this.logger.step('Recording deployment');
        await this.historyTracker.recordDeployment({
          environment: options.environment,
          timestamp: new Date().toISOString()
        });

        return { success: true };
      },
      {
        context: {
          environment: options.environment,
          step: 'deployment'
        },
        onSuccess: (result) => {
          this.logger.logEvent(EVENT_TYPES.DEPLOYMENT_COMPLETE, {
            environment: options.environment,
            duration: this.logger.getSessionDuration()
          });
        },
        onError: (error, exitCode) => {
          this.logger.logEvent(EVENT_TYPES.DEPLOYMENT_FAILED, {
            environment: options.environment,
            error: error.message,
            exitCode
          });
        },
        fatal: true
      }
    );

    return result;
  }
}
```

## Error Codes

Error codes follow a structured format:

- **E1xxx**: Validation errors
  - E1001: Missing credentials
  - E1002: Invalid credentials
  - E1003: Missing dependencies
  - E1004: Invalid environment
  - E1005: Missing environment config
  - E1006: Missing server file
  - E1007: Validation failed

- **E2xxx**: Configuration errors
  - E2001: Config read error
  - E2002: Config write error
  - E2003: Invalid config structure

- **E3xxx**: Deployment errors
  - E3001: Deployment failed
  - E3002: Render API error
  - E3003: Timeout error

- **E4xxx**: Health check errors
  - E4001: Health check failed
  - E4002: Service unreachable

- **E5xxx**: History/Rollback errors
  - E5001: History read error
  - E5002: No deployment history
  - E5003: Rollback not available

## Log Files

### Location

Logs are stored in: `backend/logs/`

### File Naming

- Format: `deployment-YYYY-MM-DD.log`
- Example: `deployment-2025-11-23.log`

### Retention

- Default retention: 30 days
- Configurable via `LogManager.cleanupOldLogs(retentionDays)`

### Rotation

- Logs rotate daily (new file per day)
- Large files can be rotated manually: `LogManager.rotateLogFile(file, maxSizeMB)`

## Testing

Run the test script to verify the error handling and logging system:

```bash
cd backend
node scripts/test-error-logging.js
```

This will:
1. Test all custom error classes
2. Test structured logging with file output
3. Test error handler functionality
4. Test log management features
5. Display results and create sample log files

## Best Practices

### 1. Always Use Structured Logging

```javascript
// Good
logger.logEvent(EVENT_TYPES.DEPLOYMENT_START, {
  environment: 'production',
  user: 'developer@example.com'
});

// Avoid
console.log('Starting deployment for production');
```

### 2. Use Appropriate Error Classes

```javascript
// Good
throw new ValidationError('Credentials not found', 'MISSING_CREDENTIALS');

// Avoid
throw new Error('Credentials not found');
```

### 3. Provide Context

```javascript
// Good
errorHandler.handleError(error, {
  environment: 'production',
  step: 'validation',
  user: 'developer@example.com'
});

// Avoid
errorHandler.handleError(error);
```

### 4. Log Important Events

```javascript
// Log key milestones
logger.logEvent(EVENT_TYPES.DEPLOYMENT_START, { environment });
logger.logEvent(EVENT_TYPES.VALIDATION_COMPLETE, { checks });
logger.logEvent(EVENT_TYPES.DEPLOYMENT_COMPLETE, { duration });
```

### 5. Clean Up Logs Regularly

```javascript
// In maintenance scripts
const logManager = new LogManager();
logManager.cleanupOldLogs(30); // Keep 30 days
```

## Troubleshooting

### Logs Not Being Created

1. Check log directory exists: `backend/logs/`
2. Verify file permissions
3. Check `enableFileLogging` is not set to `false`

### Large Log Files

1. Rotate logs manually: `logManager.rotateLogFile(file, maxSizeMB)`
2. Reduce log level: `new DeploymentLogger({ logLevel: LOG_LEVELS.WARNING })`
3. Clean up old logs: `logManager.cleanupOldLogs(7)`

### Missing Error Remediation

1. Check error code exists in `constants.js`
2. Verify error code format (E1xxx, E2xxx, etc.)
3. Use error factory: `createError(errorCode, message, context)`

## Future Enhancements

- Log compression for old files
- Remote log shipping (e.g., to CloudWatch, Datadog)
- Real-time log streaming
- Log aggregation across multiple deployments
- Automated error analysis and alerting
