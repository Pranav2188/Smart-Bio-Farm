#!/usr/bin/env node

/**
 * Credential Preparation Script
 * Prepares Firebase service account credentials for Render deployment
 * Formats credentials as single-line JSON and provides copy instructions
 */

const CredentialManager = require('./credential-manager');
const logger = require('./utils/logger');
const { EXIT_CODES } = require('./utils/constants');
const { getVersionString } = require('./utils/version');
const { displayRandomTip } = require('./utils/tips');

async function main() {
  logger.header(`Firebase Credential Preparation for Render ${getVersionString()}`);
  logger.newline();

  try {
    const credentialManager = new CredentialManager();
    
    // Prepare credentials
    const result = await credentialManager.prepareCredentials();

    logger.newline();
    logger.divider();
    logger.newline();

    // Display instructions
    logger.raw('📋 Copy the text below and paste it into Render:');
    logger.raw('   Environment Variable Name: FIREBASE_SERVICE_ACCOUNT');
    logger.raw('   Environment Variable Value: (paste the text below)');
    logger.newline();
    logger.divider();
    logger.raw(result.formattedCredentials);
    logger.divider();
    logger.newline();

    // Display tips
    logger.raw('💡 Tips:');
    logger.bullet('Copy the ENTIRE text (including curly braces)');
    logger.bullet('Make sure there are no extra spaces or line breaks');
    logger.bullet('In Render, this should be a single line');
    logger.bullet(`You can also copy from: ${result.outputPath}`);
    logger.newline();

    // Display masked credentials for verification
    logger.raw('🔍 Credential Summary (masked for security):');
    logger.table({
      'Project ID': result.maskedCredentials.project_id,
      'Client Email': result.maskedCredentials.client_email,
      'Private Key': result.maskedCredentials.private_key.substring(0, 50) + '...',
      'Type': result.maskedCredentials.type
    });
    logger.newline();

    logger.success('Credentials prepared successfully!');
    logger.newline();

    // Display helpful tip
    displayRandomTip('deployment');

    process.exit(EXIT_CODES.SUCCESS);
  } catch (error) {
    logger.newline();
    logger.error(`Failed to prepare credentials: ${error.message}`);
    logger.newline();
    process.exit(EXIT_CODES.VALIDATION_ERROR);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = main;
