/**
 * Progress Indicator Utility
 * Provides visual progress indicators for long-running operations
 */

const logger = require('./logger');

class ProgressIndicator {
  constructor(options = {}) {
    this.message = options.message || 'Processing';
    this.frames = options.frames || ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.interval = options.interval || 80;
    this.currentFrame = 0;
    this.timer = null;
    this.isSpinning = false;
  }

  /**
   * Starts the progress indicator
   * @param {string} message - Optional message to display
   */
  start(message) {
    if (this.isSpinning) return;
    
    if (message) {
      this.message = message;
    }
    
    this.isSpinning = true;
    this.currentFrame = 0;
    
    // Hide cursor
    process.stdout.write('\x1B[?25l');
    
    this.timer = setInterval(() => {
      const frame = this.frames[this.currentFrame];
      process.stdout.write(`\r${frame} ${this.message}...`);
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }, this.interval);
  }

  /**
   * Updates the progress message
   * @param {string} message - New message
   */
  update(message) {
    this.message = message;
  }

  /**
   * Stops the progress indicator with success
   * @param {string} message - Success message
   */
  succeed(message) {
    this.stop();
    logger.success(message || this.message);
  }

  /**
   * Stops the progress indicator with failure
   * @param {string} message - Error message
   */
  fail(message) {
    this.stop();
    logger.error(message || this.message);
  }

  /**
   * Stops the progress indicator with warning
   * @param {string} message - Warning message
   */
  warn(message) {
    this.stop();
    logger.warning(message || this.message);
  }

  /**
   * Stops the progress indicator
   */
  stop() {
    if (!this.isSpinning) return;
    
    clearInterval(this.timer);
    this.isSpinning = false;
    
    // Clear the line and show cursor
    process.stdout.write('\r\x1B[K');
    process.stdout.write('\x1B[?25h');
  }
}

/**
 * Progress bar for operations with known progress
 */
class ProgressBar {
  constructor(options = {}) {
    this.total = options.total || 100;
    this.current = 0;
    this.width = options.width || 40;
    this.message = options.message || 'Progress';
  }

  /**
   * Updates the progress bar
   * @param {number} current - Current progress value
   * @param {string} message - Optional message
   */
  update(current, message) {
    this.current = current;
    if (message) {
      this.message = message;
    }
    this.render();
  }

  /**
   * Increments the progress
   * @param {number} amount - Amount to increment (default: 1)
   */
  increment(amount = 1) {
    this.current = Math.min(this.current + amount, this.total);
    this.render();
  }

  /**
   * Renders the progress bar
   */
  render() {
    const percentage = Math.floor((this.current / this.total) * 100);
    const filled = Math.floor((this.current / this.total) * this.width);
    const empty = this.width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const display = `\r${this.message}: [${bar}] ${percentage}%`;
    
    process.stdout.write(display);
    
    if (this.current >= this.total) {
      process.stdout.write('\n');
    }
  }

  /**
   * Completes the progress bar
   * @param {string} message - Completion message
   */
  complete(message) {
    this.current = this.total;
    this.render();
    if (message) {
      logger.success(message);
    }
  }
}

/**
 * Multi-step progress tracker
 */
class StepProgress {
  constructor(steps) {
    this.steps = steps;
    this.currentStep = 0;
    this.totalSteps = steps.length;
  }

  /**
   * Starts a step
   * @param {number} stepIndex - Step index
   */
  startStep(stepIndex) {
    this.currentStep = stepIndex;
    const step = this.steps[stepIndex];
    logger.step(`[${stepIndex + 1}/${this.totalSteps}] ${step}...`);
  }

  /**
   * Completes a step
   * @param {number} stepIndex - Step index
   * @param {string} message - Optional completion message
   */
  completeStep(stepIndex, message) {
    const step = this.steps[stepIndex];
    logger.success(message || `${step} completed`);
  }

  /**
   * Fails a step
   * @param {number} stepIndex - Step index
   * @param {string} message - Error message
   */
  failStep(stepIndex, message) {
    const step = this.steps[stepIndex];
    logger.error(message || `${step} failed`);
  }

  /**
   * Gets progress percentage
   * @returns {number}
   */
  getProgress() {
    return Math.floor((this.currentStep / this.totalSteps) * 100);
  }
}

module.exports = {
  ProgressIndicator,
  ProgressBar,
  StepProgress
};
