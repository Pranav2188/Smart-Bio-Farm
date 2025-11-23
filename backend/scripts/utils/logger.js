/**
 * Logger utility with color-coded output
 * Provides consistent logging across deployment scripts
 */

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

// Symbols for different log types
const symbols = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✗',
  step: '→',
  bullet: '•'
};

class Logger {
  constructor(options = {}) {
    this.enableColors = options.enableColors !== false;
    this.verbose = options.verbose || false;
  }

  /**
   * Formats a message with color
   * @param {string} message - Message to format
   * @param {string} color - Color code
   * @returns {string}
   */
  colorize(message, color) {
    if (!this.enableColors) return message;
    return `${color}${message}${colors.reset}`;
  }

  /**
   * Logs an informational message
   * @param {string} message - Message to log
   */
  info(message) {
    const prefix = this.colorize(`${symbols.info} `, colors.blue);
    console.log(`${prefix}${message}`);
  }

  /**
   * Logs a success message
   * @param {string} message - Message to log
   */
  success(message) {
    const prefix = this.colorize(`${symbols.success} `, colors.green);
    console.log(`${prefix}${this.colorize(message, colors.green)}`);
  }

  /**
   * Logs a warning message
   * @param {string} message - Message to log
   */
  warning(message) {
    const prefix = this.colorize(`${symbols.warning} `, colors.yellow);
    console.log(`${prefix}${this.colorize(message, colors.yellow)}`);
  }

  /**
   * Logs an error message
   * @param {string} message - Message to log
   */
  error(message) {
    const prefix = this.colorize(`${symbols.error} `, colors.red);
    console.error(`${prefix}${this.colorize(message, colors.red)}`);
  }

  /**
   * Logs a step in a process
   * @param {string} message - Message to log
   */
  step(message) {
    const prefix = this.colorize(`${symbols.step} `, colors.cyan);
    console.log(`${prefix}${message}`);
  }

  /**
   * Logs a bullet point
   * @param {string} message - Message to log
   */
  bullet(message) {
    console.log(`  ${symbols.bullet} ${message}`);
  }

  /**
   * Logs a verbose message (only if verbose mode enabled)
   * @param {string} message - Message to log
   */
  verbose(message) {
    if (this.verbose) {
      const prefix = this.colorize('[VERBOSE] ', colors.dim);
      console.log(`${prefix}${message}`);
    }
  }

  /**
   * Sets verbose mode
   * @param {boolean} enabled - Enable verbose mode
   */
  setVerbose(enabled) {
    this.verbose = enabled;
  }

  /**
   * Logs a header/title
   * @param {string} message - Message to log
   */
  header(message) {
    console.log('');
    console.log(this.colorize(message, colors.bright + colors.cyan));
    console.log(this.colorize('='.repeat(message.length), colors.cyan));
  }

  /**
   * Logs a section divider
   */
  divider() {
    console.log(this.colorize('─'.repeat(50), colors.dim));
  }

  /**
   * Logs a blank line
   */
  newline() {
    console.log('');
  }

  /**
   * Logs raw text without formatting
   * @param {string} message - Message to log
   */
  raw(message) {
    console.log(message);
  }

  /**
   * Logs a table of key-value pairs
   * @param {Object} data - Data to display
   */
  table(data) {
    const maxKeyLength = Math.max(...Object.keys(data).map(k => k.length));
    Object.entries(data).forEach(([key, value]) => {
      const paddedKey = key.padEnd(maxKeyLength);
      console.log(`  ${this.colorize(paddedKey, colors.dim)}: ${value}`);
    });
  }
}

// Export singleton instance
const logger = new Logger();

module.exports = logger;
module.exports.Logger = Logger;
