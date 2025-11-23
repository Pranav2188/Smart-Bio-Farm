# Integration Example: Error Handling and Logging

This document shows how to integrate the new error handling and logging system into existing deployment scripts.

## Before and After Examples

### Example 1: Validator Integration

#### Before (without error handling system)

```javascript
class Validator {
  async validateFirebaseCredentials() {
    const credentialPath = path.join(this.backendRoot, 'serviceAccountKey.json');
    
    if (!fs.existsSync(credentialPath)) {
      console.error('Firebase service account file not found');
      return { passed: false, message: 'File not found' };
    }
    
    try {
      const credentials = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
      return { passed: true, message: 'Valid' };
    } catch (error) {
      console.error('Error reading credentials:', error.message);
      return { passed: false, message: error.message };
    }
  }
}
```

#### After (with error handling system)

```javascript
const { CredentialError } = require('./utils/errors');
const { DeploymentLogger, EVENT_TYPES } = require('./utils/deploymentLogger');

class Validator {
  constructor() {
    this.logger = new DeploymentLogger();
  }

  async validateFirebaseCredentials() {
    const credentialPath = path.join(this.backendRoot, 'serviceAccountKey.json');
    
    this.logger.step('Validating Firebase credentials');
    
    if (!fs.existsSync(credentialPath)) {
      throw new CredentialError(
        'Firebase service account file not found',
        'MISSING_CREDENTIALS',
        'firebase'
      );
    }
    
    try {
      const credentials = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
      
      this.logger.success('Firebase credentials validated');
      this.logger.logEvent(EVENT_TYPES.CREDENTIAL_PREPARED, {
        projectId: credentials.project_id,
        clientEmail: credentials.client_email
      });
      
      return { passed: true, message: 'Valid', details: credentials };
    } catch (error) {
      throw new CredentialError(
        'Invalid Firebase credentials format',
        'INVALID_CREDENTIALS',
        'firebase'
      );
    }
  }
}
```

### Example 2: Deployment Manager Integration

#### Before (without error handling system)

```javascript
class DeploymentManager {
  async deploy(options) {
    console.log('Starting deployment...');
    
    try {
      // Validate
      const validation = await this.validator.validateAll(options);
      if (!validation.success) {
        console.error('Validation failed');
        process.exit(1);
      }
      
      // Deploy
      console.log('Deploying...');
      // ... deployment logic
      
      console.log('Deployment complete!');
    } catch (error) {
      console.error('Deployment failed:', error.message);
      process.exit(1);
    }
  }
}
```

#### After (with error handling system)

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
        // Validate
        this.logger.step('Validating prerequisites');
        const validation = await this.validator.validateAll(options);
        
        if (!validation.success) {
          throw new DeploymentExecutionError(
            'Pre-deployment validation failed',
            'VALIDATION_FAILED',
            'validation',
            { errors: validation.errors }
          );
        }

        // Deploy
        this.logger.step('Executing deployment');
        const deployResult = await this.executeDeploy(options);

        this.logger.logEvent(EVENT_TYPES.DEPLOYMENT_COMPLETE, {
          environment: options.environment,
          duration: this.logger.getSessionDuration(),
          url: deployResult.url
        });

        return deployResult;
      },
      {
        context: {
          environment: options.environment,
          step: 'deployment'
        },
        onSuccess: (result) => {
          this.logger.success(`Deployment completed: ${result.url}`);
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

### Example 3: Health Checker Integration

#### Before (without error handling system)

```javascript
class HealthChecker {
  async checkHealth(url) {
    console.log(`Checking health: ${url}`);
    
    try {
      const response = await fetch(url, { timeout: 30000 });
      
      if (response.ok) {
        console.log('✓ Health check passed');
        return { status: 'healthy' };
      } else {
        console.error('✗ Health check failed');
        return { status: 'unhealthy' };
      }
    } catch (error) {
      console.error('✗ Service unreachable:', error.message);
      return { status: 'unreachable' };
    }
  }
}
```

#### After (with error handling system)

```javascript
const { HealthCheckError, NetworkError } = require('./utils/errors');
const { DeploymentLogger, EVENT_TYPES } = require('./utils/deploymentLogger');

class HealthChecker {
  constructor() {
    this.logger = new DeploymentLogger();
  }

  async checkHealth(url, options = {}) {
    this.logger.logEvent(EVENT_TYPES.HEALTH_CHECK_START, {
      url,
      timeout: options.timeout || 30000
    });

    try {
      const startTime = Date.now();
      const response = await fetch(url, { 
        timeout: options.timeout || 30000 
      });
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const result = {
          status: 'healthy',
          url,
          responseTime,
          statusCode: response.status
        };

        this.logger.logEvent(EVENT_TYPES.HEALTH_CHECK_COMPLETE, result);
        this.logger.success(`Health check passed (${responseTime}ms)`);

        return result;
      } else {
        throw new HealthCheckError(
          `Health check failed with status ${response.status}`,
          'HEALTH_CHECK_FAILED',
          url,
          response.status
        );
      }
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new NetworkError(
          'Health check timed out',
          'TIMEOUT_ERROR',
          url,
          options.timeout || 30000
        );
      }

      if (error instanceof HealthCheckError) {
        throw error;
      }

      throw new HealthCheckError(
        'Service is unreachable',
        'SERVICE_UNREACHABLE',
        url,
        null
      );
    }
  }
}
```

## Step-by-Step Integration Guide

### Step 1: Import Required Modules

```javascript
// At the top of your script
const { 
  ValidationError, 
  ConfigurationError,
  DeploymentExecutionError 
} = require('./utils/errors');
const { DeploymentLogger, EVENT_TYPES } = require('./utils/deploymentLogger');
const { createErrorHandler } = require('./utils/errorHandler');
```

### Step 2: Initialize Logger and Error Handler

```javascript
class YourClass {
  constructor() {
    this.logger = new DeploymentLogger({
      enableFileLogging: true,
      logLevel: LOG_LEVELS.INFO
    });
    this.errorHandler = createErrorHandler(this.logger);
  }
}
```

### Step 3: Replace Console Logs with Structured Logging

```javascript
// Before
console.log('Starting operation...');

// After
this.logger.step('Starting operation');
this.logger.logEvent(EVENT_TYPES.DEPLOYMENT_START, { 
  environment: 'production' 
});
```

### Step 4: Replace Generic Errors with Custom Errors

```javascript
// Before
throw new Error('Validation failed');

// After
throw new ValidationError(
  'Pre-deployment validation failed',
  'VALIDATION_FAILED',
  { errors: validationErrors }
);
```

### Step 5: Use Safe Execution Wrapper

```javascript
// Before
try {
  await someOperation();
} catch (error) {
  console.error('Operation failed:', error.message);
  process.exit(1);
}

// After
await this.errorHandler.safeExecute(
  async () => await someOperation(),
  {
    context: { operation: 'someOperation' },
    fatal: true
  }
);
```

### Step 6: Log Important Events

```javascript
// Log key milestones
this.logger.logEvent(EVENT_TYPES.VALIDATION_COMPLETE, { 
  checks: validationResults 
});

this.logger.logEvent(EVENT_TYPES.DEPLOYMENT_COMPLETE, { 
  duration: this.logger.getSessionDuration() 
});
```

### Step 7: Write Session Summary

```javascript
// At the end of your script
this.logger.writeSessionSummary();
```

## Quick Reference

### Common Error Types

```javascript
// Validation errors
throw new ValidationError(message, 'MISSING_CREDENTIALS');
throw new ValidationError(message, 'INVALID_CREDENTIALS');
throw new ValidationError(message, 'VALIDATION_FAILED');

// Configuration errors
throw new ConfigurationError(message, 'CONFIG_READ_ERROR', configPath);
throw new ConfigurationError(message, 'INVALID_CONFIG_STRUCTURE');

// Deployment errors
throw new DeploymentExecutionError(message, 'DEPLOYMENT_FAILED', step, context);

// Health check errors
throw new HealthCheckError(message, 'HEALTH_CHECK_FAILED', url, statusCode);
throw new HealthCheckError(message, 'SERVICE_UNREACHABLE', url);

// Network errors
throw new NetworkError(message, 'TIMEOUT_ERROR', url, timeout);
```

### Common Log Events

```javascript
// Deployment lifecycle
this.logger.logEvent(EVENT_TYPES.DEPLOYMENT_START, { environment });
this.logger.logEvent(EVENT_TYPES.DEPLOYMENT_COMPLETE, { duration });
this.logger.logEvent(EVENT_TYPES.DEPLOYMENT_FAILED, { error });

// Validation
this.logger.logEvent(EVENT_TYPES.VALIDATION_START, { environment });
this.logger.logEvent(EVENT_TYPES.VALIDATION_COMPLETE, { checks });
this.logger.logEvent(EVENT_TYPES.VALIDATION_FAILED, { errors });

// Health checks
this.logger.logEvent(EVENT_TYPES.HEALTH_CHECK_START, { url });
this.logger.logEvent(EVENT_TYPES.HEALTH_CHECK_COMPLETE, { status });
this.logger.logEvent(EVENT_TYPES.HEALTH_CHECK_FAILED, { error });

// Other events
this.logger.logEvent(EVENT_TYPES.CREDENTIAL_PREPARED, { type });
this.logger.logEvent(EVENT_TYPES.ENVIRONMENT_LOADED, { environment });
this.logger.logEvent(EVENT_TYPES.CONFIG_UPDATED, { config });
```

### Common Log Messages

```javascript
// Steps
this.logger.step('Validating prerequisites');
this.logger.step('Loading environment configuration');
this.logger.step('Preparing credentials');

// Info
this.logger.info('Configuration loaded successfully');
this.logger.info(`Deploying to ${environment}`);

// Success
this.logger.success('Validation completed');
this.logger.success('Deployment successful');

// Warnings
this.logger.warning('Configuration file not found, using defaults');
this.logger.warning('Some optional checks were skipped');

// Errors
this.logger.error('Validation failed', error);
this.logger.error('Deployment failed', error, { step: 'deploy' });
```

## Benefits of Integration

1. **Consistent Error Handling**: All scripts handle errors the same way
2. **Better Debugging**: Structured logs make it easy to trace issues
3. **Automated Remediation**: Users get clear instructions on how to fix errors
4. **Audit Trail**: Complete history of all operations in log files
5. **Production Ready**: Proper error handling for production deployments
6. **Easy Troubleshooting**: Analyze logs to identify patterns and issues

## Testing Your Integration

After integrating the error handling system:

1. Run your script normally to verify it works
2. Trigger error conditions to verify error handling
3. Check log files in `backend/logs/`
4. Verify error messages include remediation steps
5. Test with different log levels
6. Verify session summaries are written

## Maintenance

Remember to:

- Clean up old logs periodically: `logManager.cleanupOldLogs(30)`
- Rotate large log files: `logManager.rotateLogFile(file, 10)`
- Analyze logs for patterns: `logManager.analyzeLogFile(file)`
- Export logs for archival: `logManager.exportLogs(outputPath)`
