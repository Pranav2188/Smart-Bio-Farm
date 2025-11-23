const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const { readJSONSync, fileExistsSync } = require('./utils/fileUtils');
const { ERROR_CODES, PATHS } = require('./utils/constants');
const { ErrorFormatter } = require('./utils/errorFormatter');

/**
 * Validator class for deployment prerequisites
 * Validates credentials, dependencies, environment, and server configuration
 */
class Validator {
  constructor() {
    this.backendRoot = path.join(__dirname, '..');
  }

  /**
   * Validates all deployment prerequisites
   * @param {Object} options - Validation options
   * @param {string} options.environment - Target environment
   * @param {boolean} options.skipCredentials - Skip credential validation
   * @returns {Promise<ValidationResult>}
   */
  async validateAll(options = {}) {
    logger.info('Starting deployment validation...\n');

    const results = {
      success: true,
      checks: {},
      errors: [],
      warnings: []
    };

    try {
      // Run validation checks in parallel for better performance
      const validationPromises = [];
      
      // Always validate dependencies and server config
      validationPromises.push(
        this.validateDependencies().then(result => ({ name: 'dependencies', result })),
        this.validateServerConfig().then(result => ({ name: 'serverConfig', result }))
      );
      
      // Conditionally validate credentials
      if (!options.skipCredentials) {
        validationPromises.push(
          this.validateFirebaseCredentials().then(result => ({ name: 'credentials', result }))
        );
      } else {
        results.checks.credentials = { passed: true, message: 'Skipped', skipped: true };
      }

      // Conditionally validate environment
      if (options.environment) {
        validationPromises.push(
          this.validateEnvironment(options.environment).then(result => ({ name: 'environment', result }))
        );
      }

      // Wait for all validations to complete
      const validationResults = await Promise.all(validationPromises);
      
      // Collect results
      validationResults.forEach(({ name, result }) => {
        results.checks[name] = result;
      });

      // Collect errors and warnings
      for (const [checkName, checkResult] of Object.entries(results.checks)) {
        if (!checkResult.passed && !checkResult.skipped) {
          results.success = false;
          results.errors.push({
            check: checkName,
            message: checkResult.message,
            remediation: checkResult.remediation
          });
        }
        if (checkResult.warning) {
          results.warnings.push({
            check: checkName,
            message: checkResult.warning
          });
        }
      }

      // Display summary using ErrorFormatter
      ErrorFormatter.displayValidationSummary(results);

      return results;
    } catch (error) {
      logger.error(`Validation failed: ${error.message}`);
      results.success = false;
      results.errors.push({
        check: 'general',
        message: error.message,
        remediation: 'Check the error message and try again'
      });
      return results;
    }
  }

  /**
   * Validates Firebase service account file
   * @returns {Promise<CheckResult>}
   */
  async validateFirebaseCredentials() {
    const credentialPath = path.join(this.backendRoot, 'serviceAccountKey.json');

    try {
      // Check if file exists
      if (!fileExistsSync(credentialPath)) {
        return {
          passed: false,
          message: 'Firebase service account file not found',
          remediation: ERROR_CODES.MISSING_CREDENTIALS.remediation
        };
      }

      // Read and parse JSON
      let credentials;
      try {
        credentials = readJSONSync(credentialPath);
      } catch (error) {
        return {
          passed: false,
          message: 'Firebase service account file contains invalid JSON',
          remediation: 'Ensure serviceAccountKey.json is valid JSON. Download a new file from Firebase Console if needed.'
        };
      }

      // Validate required fields
      const requiredFields = [
        'type',
        'project_id',
        'private_key_id',
        'private_key',
        'client_email',
        'client_id',
        'auth_uri',
        'token_uri'
      ];

      const missingFields = requiredFields.filter(field => !credentials[field]);

      if (missingFields.length > 0) {
        return {
          passed: false,
          message: `Firebase credentials missing required fields: ${missingFields.join(', ')}`,
          remediation: 'Download a new service account key from Firebase Console → Project Settings → Service Accounts'
        };
      }

      // Validate field formats
      if (credentials.type !== 'service_account') {
        return {
          passed: false,
          message: 'Invalid credential type. Expected "service_account"',
          remediation: 'Ensure you downloaded a service account key, not an API key or OAuth client'
        };
      }

      if (!credentials.private_key.includes('BEGIN PRIVATE KEY')) {
        return {
          passed: false,
          message: 'Invalid private key format',
          remediation: 'The private_key field should contain a PEM-formatted private key'
        };
      }

      if (!credentials.client_email.includes('@') || !credentials.client_email.includes('.iam.gserviceaccount.com')) {
        return {
          passed: false,
          message: 'Invalid client_email format',
          remediation: 'The client_email should be a service account email ending with .iam.gserviceaccount.com'
        };
      }

      logger.success('✓ Firebase credentials validated');
      return {
        passed: true,
        message: 'Firebase credentials are valid',
        details: {
          projectId: credentials.project_id,
          clientEmail: credentials.client_email
        }
      };
    } catch (error) {
      return {
        passed: false,
        message: `Error validating Firebase credentials: ${error.message}`,
        remediation: 'Check file permissions and ensure the file is readable'
      };
    }
  }

  /**
   * Validates npm dependencies are installed
   * @returns {Promise<CheckResult>}
   */
  async validateDependencies() {
    const packageJsonPath = path.join(this.backendRoot, 'package.json');
    const nodeModulesPath = path.join(this.backendRoot, 'node_modules');

    try {
      // Check if package.json exists
      if (!fileExistsSync(packageJsonPath)) {
        return {
          passed: false,
          message: 'package.json not found',
          remediation: 'Ensure you are in the backend directory'
        };
      }

      // Check if node_modules exists
      if (!fileExistsSync(nodeModulesPath)) {
        return {
          passed: false,
          message: 'node_modules directory not found',
          remediation: 'Run: npm install'
        };
      }

      // Read package.json
      const packageJson = readJSONSync(packageJsonPath);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check critical dependencies
      const criticalDeps = ['express', 'firebase-admin', 'cors', 'dotenv'];
      const missingDeps = [];

      for (const dep of criticalDeps) {
        const depPath = path.join(nodeModulesPath, dep);
        if (!fileExistsSync(depPath)) {
          missingDeps.push(dep);
        }
      }

      if (missingDeps.length > 0) {
        return {
          passed: false,
          message: `Missing critical dependencies: ${missingDeps.join(', ')}`,
          remediation: 'Run: npm install'
        };
      }

      logger.success('✓ Dependencies validated');
      return {
        passed: true,
        message: 'All dependencies are installed',
        details: {
          totalDependencies: Object.keys(dependencies).length,
          criticalDependencies: criticalDeps
        }
      };
    } catch (error) {
      return {
        passed: false,
        message: `Error validating dependencies: ${error.message}`,
        remediation: 'Run: npm install'
      };
    }
  }

  /**
   * Validates environment configuration
   * @param {string} environment - Environment name
   * @returns {Promise<CheckResult>}
   */
  async validateEnvironment(environment) {
    try {
      // For now, validate basic environment values
      const validEnvironments = ['development', 'staging', 'production'];
      
      if (!validEnvironments.includes(environment)) {
        return {
          passed: false,
          message: `Invalid environment: ${environment}`,
          remediation: `Valid environments are: ${validEnvironments.join(', ')}`
        };
      }

      // Check if deployment config exists (will be created in later tasks)
      const configPath = path.join(this.backendRoot, 'config', 'deployment-config.json');
      
      if (fileExistsSync(configPath)) {
        const config = readJSONSync(configPath);
        
        if (!config[environment]) {
          return {
            passed: false,
            message: `Environment "${environment}" not found in deployment config`,
            remediation: `Add configuration for "${environment}" in config/deployment-config.json`
          };
        }

        // Validate environment config structure
        const envConfig = config[environment];
        const requiredFields = ['name', 'renderServiceName', 'envVars'];
        const missingFields = requiredFields.filter(field => !envConfig[field]);

        if (missingFields.length > 0) {
          return {
            passed: false,
            message: `Environment config missing fields: ${missingFields.join(', ')}`,
            remediation: `Update config/deployment-config.json to include: ${missingFields.join(', ')}`
          };
        }

        logger.success(`✓ Environment "${environment}" validated`);
        return {
          passed: true,
          message: `Environment "${environment}" is properly configured`,
          details: {
            serviceName: envConfig.renderServiceName,
            region: envConfig.region || 'default'
          }
        };
      } else {
        // Config doesn't exist yet, just validate environment name
        logger.success(`✓ Environment "${environment}" is valid`);
        return {
          passed: true,
          message: `Environment "${environment}" is valid`,
          warning: 'Deployment config file not found. Will be created during deployment.'
        };
      }
    } catch (error) {
      return {
        passed: false,
        message: `Error validating environment: ${error.message}`,
        remediation: 'Check environment configuration and try again'
      };
    }
  }

  /**
   * Validates backend server configuration
   * @returns {Promise<CheckResult>}
   */
  async validateServerConfig() {
    try {
      const criticalFiles = [
        { path: 'server.js', description: 'Main server file' },
        { path: 'package.json', description: 'Package configuration' }
      ];

      const missingFiles = [];

      for (const file of criticalFiles) {
        const filePath = path.join(this.backendRoot, file.path);
        if (!fileExistsSync(filePath)) {
          missingFiles.push(file);
        }
      }

      if (missingFiles.length > 0) {
        return {
          passed: false,
          message: `Missing critical files: ${missingFiles.map(f => f.path).join(', ')}`,
          remediation: 'Ensure you are in the correct backend directory with all required files'
        };
      }

      // Validate server.js has required content
      const serverPath = path.join(this.backendRoot, 'server.js');
      const serverContent = fs.readFileSync(serverPath, 'utf8');

      const requiredPatterns = [
        { pattern: /require.*express/, description: 'Express import' },
        { pattern: /require.*firebase-admin/, description: 'Firebase Admin import' },
        { pattern: /app\.listen/, description: 'Server listener' }
      ];

      const missingPatterns = requiredPatterns.filter(p => !p.pattern.test(serverContent));

      if (missingPatterns.length > 0) {
        return {
          passed: false,
          message: `server.js missing required code: ${missingPatterns.map(p => p.description).join(', ')}`,
          remediation: 'Ensure server.js is properly configured with Express and Firebase Admin'
        };
      }

      // Check package.json scripts
      const packageJson = readJSONSync(path.join(this.backendRoot, 'package.json'));
      
      if (!packageJson.scripts || !packageJson.scripts.start) {
        return {
          passed: false,
          message: 'package.json missing "start" script',
          remediation: 'Add "start": "node server.js" to package.json scripts'
        };
      }

      logger.success('✓ Server configuration validated');
      return {
        passed: true,
        message: 'Server configuration is valid',
        details: {
          mainFile: 'server.js',
          startScript: packageJson.scripts.start
        }
      };
    } catch (error) {
      return {
        passed: false,
        message: `Error validating server config: ${error.message}`,
        remediation: 'Check server.js and package.json files'
      };
    }
  }


}

module.exports = { Validator };
