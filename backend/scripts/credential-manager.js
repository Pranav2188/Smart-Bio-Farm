/**
 * Credential Manager
 * Manages Firebase credentials and formatting for Render deployment
 */

const { readJSON, writeText, fileExists } = require('./utils/fileUtils');
const logger = require('./utils/logger');
const { PATHS, ERROR_CODES, DEFAULTS } = require('./utils/constants');

class CredentialManager {
  constructor(options = {}) {
    this.serviceAccountPath = options.serviceAccountPath || PATHS.SERVICE_ACCOUNT_KEY;
    this.outputPath = options.outputPath || PATHS.FIREBASE_CREDENTIALS_OUTPUT;
  }

  /**
   * Prepares Firebase credentials for Render deployment
   * Reads service account file, validates, formats, and saves
   * @returns {Promise<Object>} Result with formatted credentials and file path
   */
  async prepareCredentials() {
    logger.step('Preparing Firebase credentials for Render deployment');

    // Check if service account file exists
    const exists = await fileExists(this.serviceAccountPath);
    if (!exists) {
      const error = ERROR_CODES.MISSING_CREDENTIALS;
      logger.error(error.message);
      logger.newline();
      logger.raw('📋 To fix this:');
      error.remediation.forEach(step => logger.raw(`   ${step}`));
      throw new Error(error.message);
    }

    // Read service account file
    let credentials;
    try {
      credentials = await readJSON(this.serviceAccountPath);
    } catch (error) {
      const errorCode = ERROR_CODES.INVALID_CREDENTIALS;
      logger.error(errorCode.message);
      logger.newline();
      logger.raw('📋 To fix this:');
      errorCode.remediation.forEach(step => logger.raw(`   ${step}`));
      throw new Error(errorCode.message);
    }

    // Validate credential structure
    const isValid = this.validateStructure(credentials);
    if (!isValid) {
      const error = ERROR_CODES.INVALID_CREDENTIALS;
      logger.error(error.message);
      logger.newline();
      logger.raw('📋 To fix this:');
      error.remediation.forEach(step => logger.raw(`   ${step}`));
      throw new Error(error.message);
    }

    logger.success('Service account file is valid');

    // Format credentials for Render
    const formatted = this.formatForRender(credentials);

    // Save to file
    await this.saveToFile(formatted, this.outputPath);

    return {
      success: true,
      formattedCredentials: formatted,
      outputPath: this.outputPath,
      maskedCredentials: this.maskSensitiveData(credentials)
    };
  }

  /**
   * Formats JSON credentials as single-line string for Render
   * @param {Object} credentials - Firebase service account object
   * @returns {string} Single-line JSON string
   */
  formatForRender(credentials) {
    return JSON.stringify(credentials);
  }

  /**
   * Saves formatted credentials to file
   * @param {string} formattedCredentials - Single-line JSON string
   * @param {string} outputPath - Output file path
   * @returns {Promise<void>}
   */
  async saveToFile(formattedCredentials, outputPath) {
    try {
      await writeText(outputPath, formattedCredentials);
      logger.success(`Credentials saved to: ${outputPath}`);
    } catch (error) {
      logger.error(`Failed to save credentials: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validates credential structure
   * Checks that all required Firebase service account fields are present
   * @param {Object} credentials - Credentials to validate
   * @returns {boolean} True if valid
   */
  validateStructure(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return false;
    }

    const requiredFields = DEFAULTS.REQUIRED_FIREBASE_FIELDS;
    const missingFields = requiredFields.filter(field => !credentials[field]);

    if (missingFields.length > 0) {
      logger.error(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }

    return true;
  }

  /**
   * Masks sensitive credential data for safe display
   * @param {Object} credentials - Credentials to mask
   * @returns {Object} Credentials with sensitive fields masked
   */
  maskSensitiveData(credentials) {
    const masked = { ...credentials };

    // Mask private key
    if (masked.private_key) {
      const key = masked.private_key;
      const start = key.substring(0, 30);
      const end = key.substring(key.length - 30);
      masked.private_key = `${start}...[REDACTED]...${end}`;
    }

    // Mask private key ID
    if (masked.private_key_id) {
      masked.private_key_id = `${masked.private_key_id.substring(0, 8)}...[REDACTED]`;
    }

    // Mask client ID
    if (masked.client_id) {
      masked.client_id = `${masked.client_id.substring(0, 8)}...[REDACTED]`;
    }

    return masked;
  }
}

module.exports = CredentialManager;
