/**
 * History Tracker
 * Manages deployment history and rollback functionality
 */

const { readJSON, writeJSON, fileExists } = require('./utils/fileUtils');
const logger = require('./utils/logger');
const { PATHS, ERROR_CODES, DEFAULTS, DEPLOYMENT_STATUS } = require('./utils/constants');
const { execSync } = require('child_process');

class HistoryTracker {
  constructor(options = {}) {
    this.historyFile = options.historyFile || PATHS.DEPLOYMENT_HISTORY;
    this.maxRecords = options.maxRecords || DEFAULTS.HISTORY.MAX_RECORDS;
    this.retentionDays = options.retentionDays || DEFAULTS.HISTORY.RETENTION_DAYS;
  }

  /**
   * Records a new deployment
   * @param {Object} deployment - Deployment details
   * @returns {Promise<string>} Deployment ID
   */
  async recordDeployment(deployment) {
    try {
      // Generate deployment ID
      const deploymentId = `deploy_${Date.now()}`;
      
      // Get git information
      const gitInfo = this._getGitInfo();
      
      // Create deployment record
      const record = {
        id: deploymentId,
        timestamp: new Date().toISOString(),
        environment: deployment.environment,
        version: deployment.version || this._getPackageVersion(),
        gitCommit: gitInfo.commit,
        gitBranch: gitInfo.branch,
        deployedBy: deployment.deployedBy || this._getDeployedBy(),
        configuration: deployment.configuration || {},
        status: deployment.status || DEPLOYMENT_STATUS.SUCCESS,
        deploymentUrl: deployment.deploymentUrl || null,
        duration: deployment.duration || null,
        notes: deployment.notes || null
      };
      
      // Load existing history
      const history = await this._loadHistory();
      
      // Add new record at the beginning
      history.deployments.unshift(record);
      
      // Clean up old records
      this._cleanupHistory(history);
      
      // Save updated history
      await this._saveHistory(history);
      
      return deploymentId;
    } catch (error) {
      logger.error(`Failed to record deployment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets deployment history
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of records to return
   * @param {string} options.environment - Filter by environment
   * @param {string} options.status - Filter by status
   * @returns {Promise<Array>} Deployment records
   */
  async getHistory(options = {}) {
    try {
      const history = await this._loadHistory();
      let deployments = history.deployments;
      
      // Filter by environment
      if (options.environment) {
        deployments = deployments.filter(d => d.environment === options.environment);
      }
      
      // Filter by status
      if (options.status) {
        deployments = deployments.filter(d => d.status === options.status);
      }
      
      // Limit results
      if (options.limit) {
        deployments = deployments.slice(0, options.limit);
      }
      
      return deployments;
    } catch (error) {
      if (error.message.includes('File not found')) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Gets a specific deployment by ID
   * @param {string} deploymentId - Deployment ID
   * @returns {Promise<Object|null>} Deployment record or null
   */
  async getDeployment(deploymentId) {
    try {
      const history = await this._loadHistory();
      return history.deployments.find(d => d.id === deploymentId) || null;
    } catch (error) {
      if (error.message.includes('File not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Prepares a rollback plan for a specific deployment
   * @param {string} deploymentId - Target deployment ID
   * @returns {Promise<Object>} Rollback plan
   */
  async prepareRollback(deploymentId) {
    try {
      const targetDeployment = await this.getDeployment(deploymentId);
      
      if (!targetDeployment) {
        throw new Error(`Deployment not found: ${deploymentId}`);
      }
      
      const currentHistory = await this.getHistory({ limit: 1 });
      const currentDeployment = currentHistory[0] || null;
      
      // Create rollback plan
      const rollbackPlan = {
        targetDeployment: {
          id: targetDeployment.id,
          timestamp: targetDeployment.timestamp,
          environment: targetDeployment.environment,
          version: targetDeployment.version,
          gitCommit: targetDeployment.gitCommit,
          gitBranch: targetDeployment.gitBranch
        },
        currentDeployment: currentDeployment ? {
          id: currentDeployment.id,
          timestamp: currentDeployment.timestamp,
          environment: currentDeployment.environment,
          version: currentDeployment.version
        } : null,
        steps: this._generateRollbackSteps(targetDeployment),
        warnings: this._generateRollbackWarnings(targetDeployment, currentDeployment),
        createdAt: new Date().toISOString()
      };
      
      return rollbackPlan;
    } catch (error) {
      logger.error(`Failed to prepare rollback: ${error.message}`);
      throw error;
    }
  }

  /**
   * Displays deployment history in a formatted way
   * @param {Array} history - Deployment records
   * @param {Object} options - Display options
   */
  displayHistory(history, options = {}) {
    if (!history || history.length === 0) {
      logger.warning('No deployment history found');
      logger.info('Deploy at least once to create history');
      return;
    }
    
    logger.header('Deployment History');
    logger.newline();
    
    history.forEach((deployment, index) => {
      const date = new Date(deployment.timestamp);
      const formattedDate = date.toLocaleString();
      
      // Status indicator
      const statusSymbol = this._getStatusSymbol(deployment.status);
      const statusColor = this._getStatusColor(deployment.status);
      
      logger.raw(`${statusSymbol} ${logger.colorize(deployment.id, statusColor)}`);
      logger.bullet(`Environment: ${deployment.environment}`);
      logger.bullet(`Timestamp: ${formattedDate}`);
      logger.bullet(`Version: ${deployment.version || 'N/A'}`);
      logger.bullet(`Git: ${deployment.gitBranch}@${deployment.gitCommit?.substring(0, 7) || 'N/A'}`);
      logger.bullet(`Status: ${deployment.status}`);
      
      if (deployment.deploymentUrl) {
        logger.bullet(`URL: ${deployment.deploymentUrl}`);
      }
      
      if (deployment.duration) {
        const durationSec = Math.round(deployment.duration / 1000);
        logger.bullet(`Duration: ${durationSec}s`);
      }
      
      if (deployment.notes) {
        logger.bullet(`Notes: ${deployment.notes}`);
      }
      
      if (index < history.length - 1) {
        logger.newline();
      }
    });
    
    logger.newline();
    logger.divider();
    logger.info(`Total deployments: ${history.length}`);
  }

  /**
   * Displays a rollback plan
   * @param {Object} rollbackPlan - Rollback plan
   */
  displayRollbackPlan(rollbackPlan) {
    logger.header('Rollback Plan');
    logger.newline();
    
    logger.step('Target Deployment:');
    logger.bullet(`ID: ${rollbackPlan.targetDeployment.id}`);
    logger.bullet(`Environment: ${rollbackPlan.targetDeployment.environment}`);
    logger.bullet(`Version: ${rollbackPlan.targetDeployment.version}`);
    logger.bullet(`Git: ${rollbackPlan.targetDeployment.gitBranch}@${rollbackPlan.targetDeployment.gitCommit?.substring(0, 7)}`);
    logger.bullet(`Timestamp: ${new Date(rollbackPlan.targetDeployment.timestamp).toLocaleString()}`);
    
    logger.newline();
    
    if (rollbackPlan.currentDeployment) {
      logger.step('Current Deployment:');
      logger.bullet(`ID: ${rollbackPlan.currentDeployment.id}`);
      logger.bullet(`Environment: ${rollbackPlan.currentDeployment.environment}`);
      logger.bullet(`Version: ${rollbackPlan.currentDeployment.version}`);
      logger.newline();
    }
    
    if (rollbackPlan.warnings && rollbackPlan.warnings.length > 0) {
      logger.warning('Warnings:');
      rollbackPlan.warnings.forEach(warning => {
        logger.bullet(warning);
      });
      logger.newline();
    }
    
    logger.step('Rollback Steps:');
    rollbackPlan.steps.forEach((step, index) => {
      logger.bullet(`${index + 1}. ${step}`);
    });
    
    logger.newline();
    logger.divider();
  }

  /**
   * Loads deployment history from file
   * @returns {Promise<Object>} History object
   * @private
   */
  async _loadHistory() {
    const exists = await fileExists(this.historyFile);
    
    if (!exists) {
      return {
        version: '1.0.0',
        deployments: []
      };
    }
    
    return await readJSON(this.historyFile);
  }

  /**
   * Saves deployment history to file
   * @param {Object} history - History object
   * @returns {Promise<void>}
   * @private
   */
  async _saveHistory(history) {
    await writeJSON(this.historyFile, history);
  }

  /**
   * Cleans up old deployment records
   * @param {Object} history - History object
   * @private
   */
  _cleanupHistory(history) {
    // Remove records exceeding max count
    if (history.deployments.length > this.maxRecords) {
      history.deployments = history.deployments.slice(0, this.maxRecords);
    }
    
    // Remove records older than retention period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
    
    history.deployments = history.deployments.filter(d => {
      const deploymentDate = new Date(d.timestamp);
      return deploymentDate >= cutoffDate;
    });
  }

  /**
   * Gets git information
   * @returns {Object} Git info
   * @private
   */
  _getGitInfo() {
    try {
      const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      
      return { commit, branch };
    } catch (error) {
      return { commit: null, branch: null };
    }
  }

  /**
   * Gets package version
   * @returns {string} Version
   * @private
   */
  _getPackageVersion() {
    try {
      const packageJson = require(PATHS.PACKAGE_JSON);
      return packageJson.version || '1.0.0';
    } catch (error) {
      return '1.0.0';
    }
  }

  /**
   * Gets deployed by information
   * @returns {string} Deployer info
   * @private
   */
  _getDeployedBy() {
    try {
      const gitUser = execSync('git config user.email', { encoding: 'utf8' }).trim();
      return gitUser || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Generates rollback steps
   * @param {Object} targetDeployment - Target deployment
   * @returns {Array<string>} Rollback steps
   * @private
   */
  _generateRollbackSteps(targetDeployment) {
    const steps = [];
    
    if (targetDeployment.gitCommit) {
      steps.push(`Checkout git commit: git checkout ${targetDeployment.gitCommit}`);
    }
    
    if (targetDeployment.gitBranch) {
      steps.push(`Or checkout branch: git checkout ${targetDeployment.gitBranch}`);
    }
    
    steps.push('Install dependencies: npm install');
    steps.push(`Deploy to ${targetDeployment.environment}: npm run deploy:${targetDeployment.environment === 'production' ? 'prod' : targetDeployment.environment}`);
    steps.push('Verify deployment: npm run health');
    
    return steps;
  }

  /**
   * Generates rollback warnings
   * @param {Object} targetDeployment - Target deployment
   * @param {Object} currentDeployment - Current deployment
   * @returns {Array<string>} Warnings
   * @private
   */
  _generateRollbackWarnings(targetDeployment, currentDeployment) {
    const warnings = [];
    
    if (targetDeployment.environment === 'production') {
      warnings.push('Rolling back production - ensure you have approval');
    }
    
    if (currentDeployment && targetDeployment.version !== currentDeployment.version) {
      warnings.push(`Version will change from ${currentDeployment.version} to ${targetDeployment.version}`);
    }
    
    const targetDate = new Date(targetDeployment.timestamp);
    const daysSince = Math.floor((Date.now() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince > 7) {
      warnings.push(`Target deployment is ${daysSince} days old - verify compatibility`);
    }
    
    warnings.push('Database migrations may need to be reversed manually');
    warnings.push('Environment variables may have changed since this deployment');
    
    return warnings;
  }

  /**
   * Gets status symbol for display
   * @param {string} status - Deployment status
   * @returns {string} Symbol
   * @private
   */
  _getStatusSymbol(status) {
    const symbols = {
      [DEPLOYMENT_STATUS.SUCCESS]: '✓',
      [DEPLOYMENT_STATUS.FAILED]: '✗',
      [DEPLOYMENT_STATUS.IN_PROGRESS]: '⟳',
      [DEPLOYMENT_STATUS.PENDING]: '○',
      [DEPLOYMENT_STATUS.ROLLED_BACK]: '↶'
    };
    
    return symbols[status] || '•';
  }

  /**
   * Gets status color for display
   * @param {string} status - Deployment status
   * @returns {string} Color code
   * @private
   */
  _getStatusColor(status) {
    const colors = {
      [DEPLOYMENT_STATUS.SUCCESS]: '\x1b[32m',
      [DEPLOYMENT_STATUS.FAILED]: '\x1b[31m',
      [DEPLOYMENT_STATUS.IN_PROGRESS]: '\x1b[33m',
      [DEPLOYMENT_STATUS.PENDING]: '\x1b[36m',
      [DEPLOYMENT_STATUS.ROLLED_BACK]: '\x1b[35m'
    };
    
    return colors[status] || '\x1b[37m';
  }
}

module.exports = HistoryTracker;
