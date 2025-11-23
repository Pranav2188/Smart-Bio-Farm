/**
 * Log file management utility
 * Handles log rotation, cleanup, and analysis
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('./constants');

class LogManager {
  constructor(logDir = null) {
    this.logDir = logDir || path.join(PATHS.BACKEND_ROOT, 'logs');
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
   * Gets all log files
   * @returns {Array} Array of log file info
   */
  getLogFiles() {
    this.ensureLogDirectory();

    try {
      const files = fs.readdirSync(this.logDir);
      
      return files
        .filter(file => file.endsWith('.log'))
        .map(file => {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            sizeFormatted: this.formatFileSize(stats.size)
          };
        })
        .sort((a, b) => b.modified - a.modified); // Most recent first
    } catch (error) {
      console.error(`Failed to get log files: ${error.message}`);
      return [];
    }
  }

  /**
   * Formats file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Rotates log files when they exceed size limit
   * @param {string} logFile - Log file name
   * @param {number} maxSizeMB - Maximum size in MB
   */
  rotateLogFile(logFile, maxSizeMB = 10) {
    const logPath = path.join(this.logDir, logFile);
    
    if (!fs.existsSync(logPath)) {
      return;
    }

    const stats = fs.statSync(logPath);
    const sizeMB = stats.size / (1024 * 1024);

    if (sizeMB > maxSizeMB) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedName = logFile.replace('.log', `.${timestamp}.log`);
      const rotatedPath = path.join(this.logDir, rotatedName);

      try {
        fs.renameSync(logPath, rotatedPath);
        console.log(`Rotated log file: ${logFile} -> ${rotatedName}`);
      } catch (error) {
        console.error(`Failed to rotate log file: ${error.message}`);
      }
    }
  }

  /**
   * Cleans up old log files
   * @param {number} retentionDays - Number of days to keep logs
   * @returns {Object} Cleanup results
   */
  cleanupOldLogs(retentionDays = 30) {
    this.ensureLogDirectory();

    const results = {
      deleted: [],
      kept: [],
      errors: []
    };

    try {
      const files = this.getLogFiles();
      const now = Date.now();
      const maxAge = retentionDays * 24 * 60 * 60 * 1000;

      files.forEach(file => {
        const age = now - file.modified.getTime();

        if (age > maxAge) {
          try {
            fs.unlinkSync(file.path);
            results.deleted.push({
              name: file.name,
              age: Math.floor(age / (24 * 60 * 60 * 1000)),
              size: file.sizeFormatted
            });
          } catch (error) {
            results.errors.push({
              name: file.name,
              error: error.message
            });
          }
        } else {
          results.kept.push({
            name: file.name,
            age: Math.floor(age / (24 * 60 * 60 * 1000)),
            size: file.sizeFormatted
          });
        }
      });
    } catch (error) {
      results.errors.push({
        error: error.message
      });
    }

    return results;
  }

  /**
   * Compresses old log files
   * @param {number} ageDays - Compress files older than this many days
   * @returns {Object} Compression results
   */
  compressOldLogs(ageDays = 7) {
    // Note: This is a placeholder for compression functionality
    // In a production environment, you might use zlib or a similar library
    console.log(`Compression of logs older than ${ageDays} days is not yet implemented`);
    return {
      compressed: [],
      errors: []
    };
  }

  /**
   * Gets log statistics
   * @returns {Object} Log statistics
   */
  getLogStatistics() {
    const files = this.getLogFiles();
    
    if (files.length === 0) {
      return {
        totalFiles: 0,
        totalSize: 0,
        totalSizeFormatted: '0 Bytes',
        oldestLog: null,
        newestLog: null
      };
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const sortedByDate = [...files].sort((a, b) => a.created - b.created);

    return {
      totalFiles: files.length,
      totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize),
      oldestLog: {
        name: sortedByDate[0].name,
        date: sortedByDate[0].created,
        size: sortedByDate[0].sizeFormatted
      },
      newestLog: {
        name: sortedByDate[sortedByDate.length - 1].name,
        date: sortedByDate[sortedByDate.length - 1].created,
        size: sortedByDate[sortedByDate.length - 1].sizeFormatted
      }
    };
  }

  /**
   * Reads and parses a log file
   * @param {string} logFileName - Log file name
   * @returns {Array} Array of log entries
   */
  readLogFile(logFileName) {
    const logPath = path.join(this.logDir, logFileName);

    if (!fs.existsSync(logPath)) {
      throw new Error(`Log file not found: ${logFileName}`);
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
      throw new Error(`Failed to read log file: ${error.message}`);
    }
  }

  /**
   * Analyzes log file for errors and warnings
   * @param {string} logFileName - Log file name
   * @returns {Object} Analysis results
   */
  analyzeLogFile(logFileName) {
    const entries = this.readLogFile(logFileName);
    
    const analysis = {
      totalEntries: entries.length,
      byLevel: {},
      byEventType: {},
      errors: [],
      warnings: [],
      sessions: new Set(),
      timeRange: {
        start: null,
        end: null
      }
    };

    entries.forEach(entry => {
      // Count by level
      analysis.byLevel[entry.level] = (analysis.byLevel[entry.level] || 0) + 1;
      
      // Count by event type
      if (entry.eventType) {
        analysis.byEventType[entry.eventType] = (analysis.byEventType[entry.eventType] || 0) + 1;
      }
      
      // Collect errors and warnings
      if (entry.level === 'ERROR' || entry.level === 'CRITICAL') {
        analysis.errors.push({
          timestamp: entry.timestamp,
          message: entry.message,
          error: entry.error
        });
      }
      
      if (entry.level === 'WARNING') {
        analysis.warnings.push({
          timestamp: entry.timestamp,
          message: entry.message
        });
      }
      
      // Track sessions
      if (entry.sessionId) {
        analysis.sessions.add(entry.sessionId);
      }
      
      // Track time range
      if (!analysis.timeRange.start || entry.timestamp < analysis.timeRange.start) {
        analysis.timeRange.start = entry.timestamp;
      }
      if (!analysis.timeRange.end || entry.timestamp > analysis.timeRange.end) {
        analysis.timeRange.end = entry.timestamp;
      }
    });

    analysis.sessions = analysis.sessions.size;

    return analysis;
  }

  /**
   * Searches across all log files
   * @param {Object} criteria - Search criteria
   * @returns {Array} Matching entries
   */
  searchAllLogs(criteria = {}) {
    const files = this.getLogFiles();
    let results = [];

    files.forEach(file => {
      try {
        const entries = this.readLogFile(file.name);
        const filtered = this.filterEntries(entries, criteria);
        
        results = results.concat(
          filtered.map(entry => ({
            ...entry,
            logFile: file.name
          }))
        );
      } catch (error) {
        console.error(`Error searching ${file.name}: ${error.message}`);
      }
    });

    return results;
  }

  /**
   * Filters log entries by criteria
   * @param {Array} entries - Log entries
   * @param {Object} criteria - Filter criteria
   * @returns {Array} Filtered entries
   */
  filterEntries(entries, criteria) {
    const { level, eventType, sessionId, message, startDate, endDate } = criteria;

    return entries.filter(entry => {
      if (level && entry.level !== level) return false;
      if (eventType && entry.eventType !== eventType) return false;
      if (sessionId && entry.sessionId !== sessionId) return false;
      if (message && !entry.message.toLowerCase().includes(message.toLowerCase())) return false;
      
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

  /**
   * Exports logs to JSON file
   * @param {string} outputPath - Output file path
   * @param {Object} criteria - Filter criteria (optional)
   */
  exportLogs(outputPath, criteria = null) {
    const logs = criteria ? this.searchAllLogs(criteria) : this.getAllLogs();
    
    try {
      fs.writeFileSync(outputPath, JSON.stringify(logs, null, 2), 'utf8');
      console.log(`Exported ${logs.length} log entries to ${outputPath}`);
    } catch (error) {
      throw new Error(`Failed to export logs: ${error.message}`);
    }
  }

  /**
   * Gets all log entries from all files
   * @returns {Array} All log entries
   */
  getAllLogs() {
    const files = this.getLogFiles();
    let allLogs = [];

    files.forEach(file => {
      try {
        const entries = this.readLogFile(file.name);
        allLogs = allLogs.concat(
          entries.map(entry => ({
            ...entry,
            logFile: file.name
          }))
        );
      } catch (error) {
        console.error(`Error reading ${file.name}: ${error.message}`);
      }
    });

    return allLogs;
  }

  /**
   * Displays log statistics in console
   */
  displayStatistics() {
    const stats = this.getLogStatistics();
    
    console.log('\n' + '='.repeat(60));
    console.log('LOG FILE STATISTICS');
    console.log('='.repeat(60));
    console.log(`Total Files: ${stats.totalFiles}`);
    console.log(`Total Size: ${stats.totalSizeFormatted}`);
    
    if (stats.oldestLog) {
      console.log(`\nOldest Log: ${stats.oldestLog.name}`);
      console.log(`  Date: ${stats.oldestLog.date.toISOString()}`);
      console.log(`  Size: ${stats.oldestLog.size}`);
    }
    
    if (stats.newestLog) {
      console.log(`\nNewest Log: ${stats.newestLog.name}`);
      console.log(`  Date: ${stats.newestLog.date.toISOString()}`);
      console.log(`  Size: ${stats.newestLog.size}`);
    }
    
    console.log('='.repeat(60) + '\n');
  }
}

module.exports = { LogManager };
