/**
 * File system utilities for deployment scripts
 * Provides helper functions for reading/writing JSON and text files
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

/**
 * Reads a JSON file and parses it
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<Object>}
 * @throws {Error} If file doesn't exist or JSON is invalid
 */
async function readJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in file: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Writes an object to a JSON file
 * @param {string} filePath - Path to JSON file
 * @param {Object} data - Data to write
 * @param {Object} options - Write options
 * @param {boolean} options.pretty - Pretty print JSON (default: true)
 * @returns {Promise<void>}
 */
async function writeJSON(filePath, data, options = {}) {
  const pretty = options.pretty !== false;
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  await ensureDirectory(dir);
  
  await fs.writeFile(filePath, content, 'utf8');
}

/**
 * Reads a text file
 * @param {string} filePath - Path to text file
 * @returns {Promise<string>}
 * @throws {Error} If file doesn't exist
 */
async function readText(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Writes text to a file
 * @param {string} filePath - Path to text file
 * @param {string} content - Content to write
 * @returns {Promise<void>}
 */
async function writeText(filePath, content) {
  // Ensure directory exists
  const dir = path.dirname(filePath);
  await ensureDirectory(dir);
  
  await fs.writeFile(filePath, content, 'utf8');
}

/**
 * Checks if a file exists
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>}
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a file exists (synchronous)
 * @param {string} filePath - Path to file
 * @returns {boolean}
 */
function fileExistsSync(filePath) {
  try {
    fsSync.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures a directory exists, creates it if not
 * @param {string} dirPath - Path to directory
 * @returns {Promise<void>}
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Deletes a file if it exists
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if file was deleted
 */
async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

/**
 * Copies a file
 * @param {string} source - Source file path
 * @param {string} destination - Destination file path
 * @returns {Promise<void>}
 */
async function copyFile(source, destination) {
  // Ensure destination directory exists
  const dir = path.dirname(destination);
  await ensureDirectory(dir);
  
  await fs.copyFile(source, destination);
}

/**
 * Lists files in a directory
 * @param {string} dirPath - Path to directory
 * @param {Object} options - List options
 * @param {boolean} options.recursive - List recursively
 * @param {string} options.extension - Filter by extension
 * @returns {Promise<string[]>}
 */
async function listFiles(dirPath, options = {}) {
  const files = [];
  
  async function scan(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && options.recursive) {
        await scan(fullPath);
      } else if (entry.isFile()) {
        if (!options.extension || fullPath.endsWith(options.extension)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await scan(dirPath);
  return files;
}

/**
 * Gets file stats
 * @param {string} filePath - Path to file
 * @returns {Promise<Object>}
 */
async function getFileStats(filePath) {
  const stats = await fs.stat(filePath);
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory()
  };
}

/**
 * Reads a JSON file synchronously
 * @param {string} filePath - Path to JSON file
 * @returns {Object}
 */
function readJSONSync(filePath) {
  const content = fsSync.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Writes a JSON file synchronously
 * @param {string} filePath - Path to JSON file
 * @param {Object} data - Data to write
 * @param {Object} options - Write options
 */
function writeJSONSync(filePath, data, options = {}) {
  const pretty = options.pretty !== false;
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  fsSync.writeFileSync(filePath, content, 'utf8');
}

module.exports = {
  readJSON,
  writeJSON,
  readText,
  writeText,
  fileExists,
  fileExistsSync,
  ensureDirectory,
  deleteFile,
  copyFile,
  listFiles,
  getFileStats,
  readJSONSync,
  writeJSONSync
};
