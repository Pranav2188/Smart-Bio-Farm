/**
 * Version Utility
 * Provides version information for deployment scripts
 */

const path = require('path');
const { readJSONSync } = require('./fileUtils');

const SCRIPT_VERSION = '1.0.0';
const SCRIPT_BUILD_DATE = '2025-11-23';

/**
 * Gets the backend package version
 * @returns {string}
 */
function getPackageVersion() {
  try {
    const packagePath = path.join(__dirname, '..', '..', 'package.json');
    const packageJson = readJSONSync(packagePath);
    return packageJson.version || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Gets the script version
 * @returns {string}
 */
function getScriptVersion() {
  return SCRIPT_VERSION;
}

/**
 * Gets the full version string
 * @returns {string}
 */
function getVersionString() {
  return `v${getScriptVersion()} (Backend: v${getPackageVersion()})`;
}

/**
 * Gets version information object
 * @returns {Object}
 */
function getVersionInfo() {
  return {
    scriptVersion: SCRIPT_VERSION,
    packageVersion: getPackageVersion(),
    buildDate: SCRIPT_BUILD_DATE,
    nodeVersion: process.version
  };
}

/**
 * Displays version information
 */
function displayVersion() {
  const info = getVersionInfo();
  console.log(`Deployment Scripts: v${info.scriptVersion}`);
  console.log(`Backend Package: v${info.packageVersion}`);
  console.log(`Build Date: ${info.buildDate}`);
  console.log(`Node.js: ${info.nodeVersion}`);
}

module.exports = {
  getPackageVersion,
  getScriptVersion,
  getVersionString,
  getVersionInfo,
  displayVersion,
  SCRIPT_VERSION,
  SCRIPT_BUILD_DATE
};
