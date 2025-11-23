/**
 * Environment Manager
 * Manages environment-specific configurations for deployment
 */

const { readJSON, writeJSON, fileExists } = require('./utils/fileUtils');
const { PATHS, ERROR_CODES, DEFAULTS, ENVIRONMENT_TYPES } = require('./utils/constants');
const logger = require('./utils/logger');

class EnvironmentManager {
  constructor() {
    this.configPath = PATHS.DEPLOYMENT_CONFIG;
    this.currentEnvironment = null;
    this.config = null;
  }

  /**
   * Loads configuration for specified environment
   * @param {string} environment - Environment name (development, staging, production)
   * @returns {Promise<Object>} Environment configuration
   * @throws {Error} If environment is invalid or config not found
   */
  async loadEnvironment(environment) {
    // Validate environment name
    if (!this.isValidEnvironment(environment)) {
      const error = new Error(ERROR_CODES.INVALID_ENVIRONMENT.message);
      error.code = ERROR_CODES.INVALID_ENVIRONMENT.code;
      error.remediation = ERROR_CODES.INVALID_ENVIRONMENT.remediation;
      throw error;
    }

    // Check if config file exists
    const configExists = await fileExists(this.configPath);
    if (!configExists) {
      const error = new Error(ERROR_CODES.MISSING_ENV_CONFIG.message);
      error.code = ERROR_CODES.MISSING_ENV_CONFIG.code;
      error.remediation = ERROR_CODES.MISSING_ENV_CONFIG.remediation;
      throw error;
    }

    // Load configuration
    try {
      const allConfigs = await readJSON(this.configPath);
      
      if (!allConfigs[environment]) {
        throw new Error(`Environment "${environment}" not found in configuration`);
      }

      const envConfig = allConfigs[environment];
      
      // Validate configuration structure
      this.validateConfigStructure(envConfig);
      
      this.currentEnvironment = environment;
      this.config = envConfig;
      
      return envConfig;
    } catch (error) {
      if (error.code === ERROR_CODES.INVALID_ENVIRONMENT.code) {
        throw error;
      }
      
      const configError = new Error(ERROR_CODES.CONFIG_READ_ERROR.message);
      configError.code = ERROR_CODES.CONFIG_READ_ERROR.code;
      configError.remediation = ERROR_CODES.CONFIG_READ_ERROR.remediation;
      configError.originalError = error.message;
      throw configError;
    }
  }

  /**
   * Lists all available environments
   * @returns {Promise<Array>} Array of environment objects with details
   */
  async listEnvironments() {
    try {
      const configExists = await fileExists(this.configPath);
      if (!configExists) {
        return [];
      }

      const allConfigs = await readJSON(this.configPath);
      
      return Object.keys(allConfigs).map(envName => ({
        name: envName,
        displayName: allConfigs[envName].displayName || envName,
        serviceName: allConfigs[envName].renderServiceName,
        region: allConfigs[envName].region,
        plan: allConfigs[envName].plan,
        branch: allConfigs[envName].autoDeployBranch,
        requiresConfirmation: allConfigs[envName].requiresConfirmation || false
      }));
    } catch (error) {
      logger.error(`Failed to list environments: ${error.message}`);
      return [];
    }
  }

  /**
   * Creates new environment configuration
   * @param {string} environment - Environment name
   * @param {Object} config - Configuration object
   * @returns {Promise<void>}
   */
  async createEnvironment(environment, config) {
    // Validate environment name
    if (!environment || typeof environment !== 'string') {
      throw new Error('Environment name must be a non-empty string');
    }

    // Validate configuration structure
    this.validateConfigStructure(config);

    try {
      let allConfigs = {};
      
      // Load existing configs if file exists
      const configExists = await fileExists(this.configPath);
      if (configExists) {
        allConfigs = await readJSON(this.configPath);
      }

      // Check if environment already exists
      if (allConfigs[environment]) {
        throw new Error(`Environment "${environment}" already exists. Use updateVariables() to modify it.`);
      }

      // Add new environment
      allConfigs[environment] = {
        name: environment,
        ...config
      };

      // Save updated configuration
      await writeJSON(this.configPath, allConfigs);
      
      logger.success(`Environment "${environment}" created successfully`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        throw error;
      }
      
      const configError = new Error(ERROR_CODES.CONFIG_WRITE_ERROR.message);
      configError.code = ERROR_CODES.CONFIG_WRITE_ERROR.code;
      configError.remediation = ERROR_CODES.CONFIG_WRITE_ERROR.remediation;
      configError.originalError = error.message;
      throw configError;
    }
  }

  /**
   * Updates environment variables for an environment
   * @param {string} environment - Environment name
   * @param {Object} variables - Variables to update (key-value pairs)
   * @returns {Promise<void>}
   */
  async updateVariables(environment, variables) {
    // Validate environment name
    if (!this.isValidEnvironment(environment)) {
      const error = new Error(ERROR_CODES.INVALID_ENVIRONMENT.message);
      error.code = ERROR_CODES.INVALID_ENVIRONMENT.code;
      error.remediation = ERROR_CODES.INVALID_ENVIRONMENT.remediation;
      throw error;
    }

    // Validate variables object
    if (!variables || typeof variables !== 'object') {
      throw new Error('Variables must be an object with key-value pairs');
    }

    try {
      const configExists = await fileExists(this.configPath);
      if (!configExists) {
        const error = new Error(ERROR_CODES.MISSING_ENV_CONFIG.message);
        error.code = ERROR_CODES.MISSING_ENV_CONFIG.code;
        error.remediation = ERROR_CODES.MISSING_ENV_CONFIG.remediation;
        throw error;
      }

      const allConfigs = await readJSON(this.configPath);
      
      if (!allConfigs[environment]) {
        throw new Error(`Environment "${environment}" not found in configuration`);
      }

      // Update environment variables
      if (!allConfigs[environment].envVars) {
        allConfigs[environment].envVars = {};
      }

      Object.entries(variables).forEach(([key, value]) => {
        allConfigs[environment].envVars[key] = value;
      });

      // Save updated configuration
      await writeJSON(this.configPath, allConfigs);
      
      logger.success(`Environment variables updated for "${environment}"`);
    } catch (error) {
      if (error.code === ERROR_CODES.INVALID_ENVIRONMENT.code || 
          error.code === ERROR_CODES.MISSING_ENV_CONFIG.code) {
        throw error;
      }
      
      const configError = new Error(ERROR_CODES.CONFIG_WRITE_ERROR.message);
      configError.code = ERROR_CODES.CONFIG_WRITE_ERROR.code;
      configError.remediation = ERROR_CODES.CONFIG_WRITE_ERROR.remediation;
      configError.originalError = error.message;
      throw configError;
    }
  }

  /**
   * Gets current active environment
   * @returns {string|null} Current environment name or null if none loaded
   */
  getCurrentEnvironment() {
    return this.currentEnvironment;
  }

  /**
   * Gets the configuration for the current environment
   * @returns {Object|null} Current environment config or null if none loaded
   */
  getCurrentConfig() {
    return this.config;
  }

  /**
   * Validates if environment name is valid
   * @param {string} environment - Environment name to validate
   * @returns {boolean}
   */
  isValidEnvironment(environment) {
    return DEFAULTS.ENVIRONMENTS.includes(environment);
  }

  /**
   * Validates configuration structure
   * @param {Object} config - Configuration to validate
   * @throws {Error} If configuration is invalid
   */
  validateConfigStructure(config) {
    const requiredFields = [
      'name',
      'renderServiceName',
      'region',
      'plan',
      'envVars',
      'healthCheckPath'
    ];

    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      const error = new Error(ERROR_CODES.INVALID_CONFIG_STRUCTURE.message);
      error.code = ERROR_CODES.INVALID_CONFIG_STRUCTURE.code;
      error.remediation = ERROR_CODES.INVALID_CONFIG_STRUCTURE.remediation;
      error.missingFields = missingFields;
      throw error;
    }

    // Validate envVars is an object
    if (typeof config.envVars !== 'object') {
      throw new Error('envVars must be an object');
    }

    // Validate required environment variables
    const requiredEnvVars = DEFAULTS.REQUIRED_ENV_VARS;
    const missingEnvVars = requiredEnvVars.filter(varName => !config.envVars[varName]);
    
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
  }

  /**
   * Gets environment variable value
   * @param {string} key - Variable key
   * @returns {string|null} Variable value or null if not found
   */
  getEnvVar(key) {
    if (!this.config || !this.config.envVars) {
      return null;
    }
    return this.config.envVars[key] || null;
  }

  /**
   * Gets all environment variables for current environment
   * @returns {Object} Environment variables object
   */
  getAllEnvVars() {
    if (!this.config || !this.config.envVars) {
      return {};
    }
    return { ...this.config.envVars };
  }

  /**
   * Masks sensitive environment variables for display
   * @param {Object} envVars - Environment variables to mask
   * @returns {Object} Masked environment variables
   */
  maskSensitiveVars(envVars) {
    const sensitiveKeys = [
      'ADMIN_SETUP_CODE',
      'API_KEY',
      'SECRET',
      'PASSWORD',
      'TOKEN',
      'PRIVATE_KEY',
      'FIREBASE_SERVICE_ACCOUNT'
    ];

    const masked = {};
    
    Object.entries(envVars).forEach(([key, value]) => {
      const isSensitive = sensitiveKeys.some(sensitiveKey => 
        key.toUpperCase().includes(sensitiveKey)
      );
      
      if (isSensitive && value) {
        // Show first 4 and last 4 characters
        if (value.length > 8) {
          masked[key] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
        } else {
          masked[key] = '***';
        }
      } else {
        masked[key] = value;
      }
    });

    return masked;
  }

  /**
   * Displays environment configuration
   * @param {Object} config - Configuration to display
   */
  displayConfig(config) {
    logger.header(`Environment: ${config.displayName || config.name}`);
    logger.newline();
    
    logger.info('Service Configuration:');
    logger.table({
      'Service Name': config.renderServiceName,
      'Region': config.region,
      'Plan': config.plan,
      'Health Check': config.healthCheckPath,
      'Auto Deploy Branch': config.autoDeployBranch || 'N/A',
      'Requires Confirmation': config.requiresConfirmation ? 'Yes' : 'No'
    });
    
    logger.newline();
    logger.info('Environment Variables:');
    const maskedVars = this.maskSensitiveVars(config.envVars);
    logger.table(maskedVars);
  }
}

module.exports = EnvironmentManager;
