/**
 * Deployment logger with structured logging and file output
 * Extends the basic logger with deployment-specific functionality
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const { PATHS } = require('./constants');

/**
 * Log levels
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  CRITICAL: 4
};

/**
 * Log event types
 */
const EVENT_TYPES = {
  DEPLOYMENT_START: 'deployment_start',
  DEPLOYMENT_COMPLETE: 'deployment_complete',
  DEPLOYMENT_FAILED: 'deployment_failed',
  VALIDATION_START: 'validation_start',
  VALIDATION_COMPLETE: 'validation_complete',
  VALIDATION_FAILED: 'validation_failed',
  HEALTH_CHECK_START: 'health_check_start',
  HEALTH_CHECK_COMPLETE: 'health_check_complete',
  HEALTH_CHECK_FAILED: 'health_check_failed',
  CREDENTIAL_PREPARED: 'credential_prepared',
  ENVIRONMENT_LOADED: 'environment_loaded',
  CONFIG_UPDATED: 'config_updated',
  HISTORY_RECORDED: 'history_recorded',
  ROLLBACK_INITIATED: 'rollback_initiated',
  ROLLBACK_COMPLETE: 'rollback_complete',
  ERROR_OCCURRED: 'error_occurred'
};

class DeploymentLogger {
  constructor(options = {}) {
    this.sessionId = this.generateSessionId();
    this.logLevel = options.logLevel || LOG_LEVELS.INFO;
    this.enableFileLogging = options.enableFileLogging !== false;
    this.logDir = options.logDir || path.join(PATHS.BACKEND_ROOT, 'logs');
    this.logFile = options.logFile || this.getLogFileName();
    this.events = [];
    this.startTime = Date.now();
    
    // Ensure log directory exists
    if (this.enableFileLogging) {
      this.ensureLogDirectory();
    }
  }

  /**
   * Generates a unique session ID
   * @returns {string}
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Gets log file name based on current date
   * @returns {string}
   */
  getLogFileName() {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `deployment-${dateStr}.log`;
  }

  /**
   * Ensures log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Writes log entry to file
   * @param {Object} entry - Log entry
   */
  writeToFile(entry) {
    if (!this.enableFileLogging) return;

    try {
      const logPath = path.join(this.logDir, this.logFile);
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(logPath, logLine, 'utf8');
    } catch (error) {
      // Fail silently to avoid breaking deployment
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  /**
   * Creates a structured log entry
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   * @returns {Object}
   */
  createLogEntry(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      level,
      message,
      ...data
    };
  }

  /**
   * Logs a deployment event
   * @param {string} eventType - Event type from EVENT_TYPES
   * @param {Object} data - Event data
   */
  logEvent(eventType, data = {}) {
    const entry = this.createLogEntry('INFO', eventType, {
      eventType,
      ...data
    });

    this.events.push(entry);
    this.writeToFile(entry);

    // Also log to console based on event type
    switch (eventType) {
      case EVENT_TYPES.DEPLOYMENT_START:
        logger.header(`Starting Deployment: ${data.environment || 'unknown'}`);
        break;
      case EVENT_TYPES.DEPLOYMENT_COMPLETE:
        logger.success(`Deployment completed successfully in ${data.duration}ms`);
        break;
      case EVENT_TYPES.DEPLOYMENT_FAILED:
        logger.error(`Deployment failed: ${data.error}`);
        break;
      case EVENT_TYPES.VALIDATION_COMPLETE:
        logger.success('Validation completed successfully');
        break;
      case EVENT_TYPES.HEALTH_CHECK_COMPLETE:
        logger.success(`Health check passed: ${data.url}`);
        break;
      default:
        logger.info(`Event: ${eventType}`);
    }
  }

  /**
   * Logs debug information
   * @param {string} message - Debug message
   * @param {Object} data - Additional data
   */
  debug(message, data = {}) {
    if (this.logLevel > LOG_LEVELS.DEBUG) return;

    const entry = this.createLogEntry('DEBUG', message, data);
    this.writeToFile(entry);
    logger.verbose(message);
  }

  /**
   * Logs informational message
   * @param {string} message - Info message
   * @param {Object} data - Additional data
   */
  info(message, data = {}) {
    if (this.logLevel > LOG_LEVELS.INFO) return;

    const entry = this.createLogEntry('INFO', message, data);
    this.writeToFile(entry);
    logger.info(message);
  }

  /**
   * Logs warning message
   * @param {string} message - Warning message
   * @param {Object} data - Additional data
   */
  warning(message, data = {}) {
    if (this.logLevel > LOG_LEVELS.WARNING) return;

    const entry = this.createLogEntry('WARNING', message, data);
    this.writeToFile(entry);
    logger.warning(message);
  }

  /**
   * Logs error message
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {Object} data - Additional data
   */
  error(message, error = null, data = {}) {
    const entry = this.createLogEntry('ERROR', message, {
      ...data,
      error: error ? {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      } : null
    });

    this.writeToFile(entry);
    logger.error(message);
    
    if (error && error.stack) {
      this.debug('Error stack trace', { stack: error.stack });
    }
  }

  /**
   * Logs critical error
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {Object} data - Additional data
   */
  critical(message, error = null, data = {}) {
    const entry = this.createLogEntry('CRITICAL', message, {
      ...data,
      error: error ? {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      } : null
    });

    this.writeToFile(entry);
    logger.error(`CRITICAL: ${message}`);
  }

  /**
   * Logs deployment step
   * @param {string} step - Step name
   * @param {Object} data - Step data
   */
  step(step, data = {}) {
    const entry = this.createLogEntry('INFO', `Step: ${step}`, {
      step,
      ...data
    });

    this.writeToFile(entry);
    logger.step(step);
  }

  /**
   * Logs deployment success
   * @param {string} message - Success message
   * @param {Object} data - Additional data
   */
  success(message, data = {}) {
    const entry = this.createLogEntry('INFO', message, {
      success: true,
      ...data
    });

    this.writeToFile(entry);
    logger.success(message);
  }

  /**
   * Gets all events for current session
   * @returns {Array}
   */
  getEvents() {
    return this.events;
  }

  /**
   * Gets events by type
   * @param {string} eventType - Event type to filter
   * @returns {Array}
   */
  getEventsByType(eventType) {
    return this.events.filter(e => e.eventType === eventType);
  }

  /**
   * Gets session duration
   * @returns {number} Duration in milliseconds
   */
  getSessionDuration() {
    return Date.now() - this.startTime;
  }

  /**
   * Gets session summary
   * @returns {Object}
   */
  getSessionSummary() {
    const errors = this.events.filter(e => e.level === 'ERROR' || e.level === 'CRITICAL');
    const warnings = this.events.filter(e => e.level === 'WARNING');
    
    return {
      sessionId: this.sessionId,
      startTime: new Date(this.startTime).toISOString(),
      duration: this.getSessionDuration(),
      totalEvents: this.events.length,
      errors: errors.length,
      warnings: warnings.length,
      eventTypes: [...new Set(this.events.map(e => e.eventType).filter(Boolean))]
    };
  }

  /**
   * Writes session summary to file
   */
  writeSessionSummary() {
    if (!this.enableFileLogging) return;

    const summary = this.getSessionSummary();
    const entry = this.createLogEntry('INFO', 'Session summary', {
      eventType: 'session_summary',
      summary
    });

    this.writeToFile(entry);
    this.writeToFile({ separator: '---' }); // Visual separator between sessions
  }

  /**
   * Cleans up old log files
   * @param {number} retentionDays - Number of days to keep logs
   */
  cleanupOldLogs(retentionDays = 30) {
    if (!this.enableFileLogging) return;

    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = retentionDays * 24 * 60 * 60 * 1000;

      files.forEach(file => {
        if (!file.startsWith('deployment-') || !file.endsWith('.log')) {
          return;
        }

        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filePath);
          this.debug(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      this.warning(`Failed to cleanup old logs: ${error.message}`);
    }
  }

  /**
   * Reads log file
   * @param {string} logFileName - Log file name (optional, defaults to current)
   * @returns {Array} Array of log entries
   */
  readLogFile(logFileName = null) {
    const fileName = logFileName || this.logFile;
    const logPath = path.join(this.logDir, fileName);

    if (!fs.existsSync(logPath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(logPath, 'utf8');
      const lines = content.trim().split('\n');
      
      return lines
        .filter(line => line && line !== '{"separator":"---"}')
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } catch (error) {
      this.error(`Failed to read log file: ${error.message}`);
      return [];
    }
  }

  /**
   * Gets list of available log files
   * @returns {Array} Array of log file names
   */
  getLogFiles() {
    if (!fs.existsSync(this.logDir)) {
      return [];
    }

    try {
      return fs.readdirSync(this.logDir)
        .filter(file => file.startsWith('deployment-') && file.endsWith('.log'))
        .sort()
        .reverse(); // Most recent first
    } catch (error) {
      this.error(`Failed to list log files: ${error.message}`);
      return [];
    }
  }

  /**
   * Searches logs for specific criteria
   * @param {Object} criteria - Search criteria
   * @returns {Array} Matching log entries
   */
  searchLogs(criteria = {}) {
    const { eventType, level, environment, startDate, endDate } = criteria;
    let entries = [];

    // Read all log files if date range specified, otherwise just current
    const logFiles = (startDate || endDate) ? this.getLogFiles() : [this.logFile];

    logFiles.forEach(file => {
      const fileEntries = this.readLogFile(file);
      entries = entries.concat(fileEntries);
    });

    // Filter by criteria
    return entries.filter(entry => {
      if (eventType && entry.eventType !== eventType) return false;
      if (level && entry.level !== level) return false;
      if (environment && entry.environment !== environment) return false;
      
      if (startDate) {
        const entryDate = new Date(entry.timestamp);
        if (entryDate < new Date(startDate)) return false;
      }
      
      if (endDate) {
        const entryDate = new Date(entry.timestamp);
        if (entryDate > new Date(endDate)) return false;
      }

      return true;
    });
  }
}

module.exports = {
  DeploymentLogger,
  LOG_LEVELS,
  EVENT_TYPES
};
