/**
 * Deployment Manager
 * Orchestrates the full deployment workflow
 */

const { Validator } = require('./validator');
const CredentialManager = require('./credential-manager');
const EnvironmentManager = require('./environment-manager');
const HistoryTracker = require('./history-tracker');
const logger = require('./utils/logger');
const { PATHS, ERROR_CODES, DEFAULTS, DEPLOYMENT_STATUS, EXIT_CODES } = require('./utils/constants');
const { writeText, fileExists } = require('./utils/fileUtils');
const { ProgressIndicator } = require('./utils/progressIndicator');
const readline = require('readline');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

class DeploymentManager {
  constructor(options = {}) {
    this.validator = new Validator();
    this.credentialManager = new CredentialManager();
    this.environmentManager = new EnvironmentManager();
    this.historyTracker = new HistoryTracker();
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.ci = options.ci || false;
  }

  /**
   * Executes full deployment workflow
   * @param {Object} options - Deployment options
   * @param {string} options.environment - Target environment
   * @param {boolean} options.skipValidation - Skip validation step
   * @param {boolean} options.dryRun - Simulate deployment without executing
   * @returns {Promise<DeploymentResult>}
   */
  async deploy(options = {}) {
    const startTime = Date.now();
    const environment = options.environment || DEFAULTS.DEPLOYMENT.DEFAULT_ENVIRONMENT;
    
    try {
      logger.header(`Deploying to ${environment.toUpperCase()}`);
      logger.newline();

      // Step 1: Load environment configuration
      const spinner = new ProgressIndicator();
      spinner.start('Loading environment configuration');
      const envConfig = await this.environmentManager.loadEnvironment(environment);
      spinner.succeed(`Loaded configuration for "${environment}"`);
      logger.newline();

      // Step 2: Confirm production deployment
      if (envConfig.requiresConfirmation && !this.dryRun && !this.ci) {
        const confirmed = await this.confirmProductionDeployment(environment);
        if (!confirmed) {
          logger.warning('Deployment cancelled by user');
          return {
            success: false,
            cancelled: true,
            environment,
            message: 'Deployment cancelled'
          };
        }
        logger.newline();
      } else if (envConfig.requiresConfirmation && this.ci) {
        logger.info('Running in CI mode - skipping production confirmation');
        logger.newline();
      }

      // Step 3: Run validation checks
      if (!options.skipValidation) {
        const validationSpinner = new ProgressIndicator();
        validationSpinner.start('Running validation checks');
        const validationResult = await this.validator.validateAll({
          environment,
          skipCredentials: false
        });

        if (!validationResult.success) {
          validationSpinner.fail('Validation failed');
          logger.error('Fix errors before deploying.');
          return {
            success: false,
            environment,
            validationErrors: validationResult.errors,
            exitCode: EXIT_CODES.VALIDATION_ERROR
          };
        }
        validationSpinner.succeed('All validation checks passed');
        logger.newline();
      } else {
        logger.warning('Skipping validation checks');
        logger.newline();
      }

      // Step 3.5: Display deployment summary and get confirmation
      if (!this.dryRun && !this.ci) {
        const shouldProceed = await this.displayDeploymentSummary(environment, envConfig);
        if (!shouldProceed) {
          logger.warning('Deployment cancelled by user');
          return {
            success: false,
            cancelled: true,
            environment,
            message: 'Deployment cancelled after reviewing summary'
          };
        }
        logger.newline();
      }

      // Step 4: Prepare Firebase credentials
      const credSpinner = new ProgressIndicator();
      credSpinner.start('Preparing Firebase credentials');
      const credentialResult = await this.credentialManager.prepareCredentials();
      credSpinner.succeed('Credentials prepared');
      logger.newline();

      // Step 5: Generate render.yaml
      const configSpinner = new ProgressIndicator();
      configSpinner.start('Generating Render configuration');
      const renderConfigPath = await this.generateRenderConfig(environment, envConfig);
      configSpinner.succeed(`Render configuration saved to: ${renderConfigPath}`);
      logger.newline();

      // Step 6: Record deployment
      const deploymentId = await this.recordDeployment({
        environment,
        configuration: envConfig,
        status: this.dryRun ? DEPLOYMENT_STATUS.PENDING : DEPLOYMENT_STATUS.SUCCESS,
        duration: Date.now() - startTime,
        notes: this.dryRun ? 'Dry run - not deployed' : null
      });

      logger.success(`Deployment prepared successfully! (ID: ${deploymentId})`);
      logger.newline();

      // Step 7: Display instructions
      const deployment = {
        id: deploymentId,
        environment,
        config: envConfig,
        credentialPath: credentialResult.outputPath,
        renderConfigPath,
        dryRun: this.dryRun
      };

      this.displayInstructions(deployment);

      return {
        success: true,
        deploymentId,
        environment,
        timestamp: new Date().toISOString(),
        deploymentUrl: this._getDeploymentUrl(envConfig),
        dryRun: this.dryRun,
        exitCode: EXIT_CODES.SUCCESS
      };

    } catch (error) {
      logger.error(`Deployment failed: ${error.message}`);
      
      if (error.remediation) {
        logger.newline();
        logger.raw('📋 To fix this:');
        if (Array.isArray(error.remediation)) {
          error.remediation.forEach(step => logger.raw(`   ${step}`));
        } else {
          logger.raw(`   ${error.remediation}`);
        }
      }

      // Record failed deployment
      try {
        await this.recordDeployment({
          environment,
          status: DEPLOYMENT_STATUS.FAILED,
          duration: Date.now() - startTime,
          notes: error.message
        });
      } catch (recordError) {
        if (this.verbose) {
          logger.warning(`Failed to record deployment: ${recordError.message}`);
        }
      }

      return {
        success: false,
        environment,
        error: error.message,
        exitCode: EXIT_CODES.DEPLOYMENT_ERROR
      };
    }
  }

  /**
   * Generates Render configuration file
   * @param {string} environment - Target environment
   * @param {Object} envConfig - Environment configuration
   * @returns {Promise<string>} Path to generated render.yaml
   */
  async generateRenderConfig(environment, envConfig) {
    const rootDir = path.resolve(PATHS.BACKEND_ROOT, '..');
    const renderYamlPath = path.join(rootDir, 'render.yaml');

    // Create render.yaml structure
    const renderConfig = {
      services: [
        {
          type: 'web',
          name: envConfig.renderServiceName,
          env: 'node',
          region: envConfig.region || DEFAULTS.DEPLOYMENT.DEFAULT_REGION,
          plan: envConfig.plan || DEFAULTS.DEPLOYMENT.DEFAULT_PLAN,
          buildCommand: envConfig.buildCommand || DEFAULTS.RENDER.DEFAULT_BUILD_COMMAND,
          startCommand: envConfig.startCommand || DEFAULTS.RENDER.DEFAULT_START_COMMAND,
          envVars: this._formatEnvVarsForRender(envConfig.envVars),
          healthCheckPath: envConfig.healthCheckPath || DEFAULTS.RENDER.DEFAULT_HEALTH_CHECK_PATH
        }
      ]
    };

    // Add auto-deploy branch if specified
    if (envConfig.autoDeployBranch) {
      renderConfig.services[0].branch = envConfig.autoDeployBranch;
    }

    // Convert to YAML
    const yamlContent = yaml.dump(renderConfig, {
      indent: 2,
      lineWidth: -1,
      noRefs: true
    });

    // Save to file
    if (!this.dryRun) {
      await writeText(renderYamlPath, yamlContent);
    } else {
      if (this.verbose) {
        logger.info('Dry run - render.yaml not written');
        logger.info(`Would write to: ${renderYamlPath}`);
        logger.info('Content:');
        logger.raw(yamlContent);
      }
    }

    return renderYamlPath;
  }

  /**
   * Records deployment in history
   * @param {Object} deployment - Deployment metadata
   * @returns {Promise<string>} Deployment ID
   */
  async recordDeployment(deployment) {
    if (this.dryRun) {
      if (this.verbose) {
        logger.info('Dry run - deployment not recorded');
      }
      return `deploy_dryrun_${Date.now()}`;
    }

    return await this.historyTracker.recordDeployment(deployment);
  }

  /**
   * Displays deployment instructions
   * @param {Object} deployment - Deployment details
   */
  displayInstructions(deployment) {
    logger.divider();
    logger.header('Next Steps');
    logger.newline();

    if (deployment.dryRun) {
      logger.warning('This was a DRY RUN - no changes were made');
      logger.info('Remove --dry-run flag to perform actual deployment');
      logger.newline();
    }

    logger.step('1. Copy Firebase credentials to Render');
    logger.bullet(`Credentials file: ${deployment.credentialPath}`);
    logger.bullet('Go to: https://dashboard.render.com');
    logger.bullet(`Select service: ${deployment.config.renderServiceName}`);
    logger.bullet('Navigate to: Environment → Environment Variables');
    logger.bullet('Add/Update variable: FIREBASE_SERVICE_ACCOUNT');
    logger.bullet('Paste the contents from the credentials file');
    logger.newline();

    logger.step('2. Deploy to Render');
    
    if (deployment.config.autoDeployBranch) {
      logger.bullet(`Push to branch: ${deployment.config.autoDeployBranch}`);
      logger.bullet('Render will automatically deploy');
    } else {
      logger.bullet('Go to Render dashboard');
      logger.bullet('Click "Manual Deploy" → "Deploy latest commit"');
    }
    logger.newline();

    logger.step('3. Verify deployment');
    const envShorthand = deployment.config.name === 'production' ? 'prod' : deployment.config.name;
    logger.bullet(`Run: npm run health:${envShorthand}`);
    logger.bullet(`Or visit: ${this._getDeploymentUrl(deployment.config)}`);
    logger.newline();

    logger.divider();
    logger.newline();

    logger.info('📚 Documentation:');
    logger.bullet('Deployment guide: backend/docs/DEPLOYMENT.md');
    logger.bullet('Troubleshooting: backend/docs/TROUBLESHOOTING.md');
    logger.newline();

    logger.info('🔍 Useful commands:');
    logger.bullet(`View history: npm run deployment-history`);
    logger.bullet(`Health check: npm run health:${envShorthand}`);
    logger.bullet(`Rollback: npm run rollback`);
    logger.newline();
  }

  /**
   * Confirms production deployment with user
   * @param {string} environment - Environment name
   * @returns {Promise<boolean>} True if confirmed
   */
  async confirmProductionDeployment(environment) {
    logger.warning(`⚠️  You are about to deploy to ${environment.toUpperCase()}`);
    logger.warning('This will affect live users!');
    logger.newline();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Type "yes" to confirm deployment: ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      });
    });
  }

  /**
   * Displays deployment summary and asks for confirmation
   * @param {string} environment - Target environment
   * @param {Object} envConfig - Environment configuration
   * @returns {Promise<boolean>} True if user confirms
   */
  async displayDeploymentSummary(environment, envConfig) {
    logger.divider();
    logger.header('Deployment Summary');
    logger.newline();

    // Display environment details
    logger.info('Target Environment:');
    logger.table({
      'Environment': environment,
      'Service Name': envConfig.renderServiceName,
      'Region': envConfig.region || DEFAULTS.DEPLOYMENT.DEFAULT_REGION,
      'Plan': envConfig.plan || DEFAULTS.DEPLOYMENT.DEFAULT_PLAN,
      'Auto-Deploy Branch': envConfig.autoDeployBranch || 'Manual deployment'
    });
    logger.newline();

    // Display environment variables (masked)
    logger.info('Environment Variables:');
    const envVarsList = Object.entries(envConfig.envVars).map(([key, value]) => {
      // Mask sensitive values
      const sensitiveKeys = ['CODE', 'SECRET', 'KEY', 'PASSWORD', 'TOKEN'];
      const isSensitive = sensitiveKeys.some(k => key.toUpperCase().includes(k));
      const displayValue = isSensitive ? '***' : value;
      return `  ${key}: ${displayValue}`;
    });
    envVarsList.forEach(line => logger.raw(line));
    logger.raw('  FIREBASE_SERVICE_ACCOUNT: *** (from file)');
    logger.newline();

    // Display deployment URL
    logger.info('Deployment URL:');
    logger.bullet(this._getDeploymentUrl(envConfig));
    logger.newline();

    // Display what will happen
    logger.info('Actions to be performed:');
    logger.bullet('Validate Firebase credentials');
    logger.bullet('Prepare credentials for Render');
    logger.bullet('Generate/update render.yaml configuration');
    logger.bullet('Record deployment in history');
    logger.bullet('Display next steps for manual deployment');
    logger.newline();

    logger.divider();
    logger.newline();

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Proceed with deployment? (yes/no): ', (answer) => {
        rl.close();
        const confirmed = answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
        resolve(confirmed);
      });
    });
  }

  /**
   * Formats environment variables for Render YAML
   * @param {Object} envVars - Environment variables
   * @returns {Array} Formatted env vars for Render
   * @private
   */
  _formatEnvVarsForRender(envVars) {
    const formatted = [];

    Object.entries(envVars).forEach(([key, value]) => {
      formatted.push({
        key,
        value: String(value)
      });
    });

    // Add FIREBASE_SERVICE_ACCOUNT with sync: false
    formatted.push({
      key: 'FIREBASE_SERVICE_ACCOUNT',
      sync: false
    });

    return formatted;
  }

  /**
   * Gets deployment URL for environment
   * @param {Object} config - Environment configuration
   * @returns {string} Deployment URL
   * @private
   */
  _getDeploymentUrl(config) {
    // Render URLs follow pattern: https://service-name.onrender.com
    return `https://${config.renderServiceName}.onrender.com`;
  }
}

module.exports = DeploymentManager;
