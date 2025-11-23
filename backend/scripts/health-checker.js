/**
 * Health Checker
 * Verifies backend deployment status and health
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');
const logger = require('./utils/logger');
const { DEFAULTS, ERROR_CODES } = require('./utils/constants');
const EnvironmentManager = require('./environment-manager');
const { ProgressIndicator } = require('./utils/progressIndicator');

class HealthChecker {
  constructor(options = {}) {
    this.timeout = options.timeout || DEFAULTS.DEPLOYMENT.HEALTH_CHECK_TIMEOUT;
    this.environmentManager = new EnvironmentManager();
  }

  /**
   * Checks health of deployed backend
   * @param {Object} options - Health check options
   * @param {string} options.environment - Environment to check
   * @param {string} options.url - Custom URL to check
   * @param {number} options.timeout - Request timeout in ms
   * @returns {Promise<Object>} Health check result
   */
  async checkHealth(options = {}) {
    const startTime = Date.now();
    
    try {
      // Determine URL to check
      let url;
      if (options.url) {
        url = options.url;
      } else if (options.environment) {
        // Load environment config to get URL
        const envConfig = await this.environmentManager.loadEnvironment(options.environment);
        url = this.getServiceUrl(envConfig);
      } else {
        throw new Error('Either environment or url must be specified');
      }

      // Set timeout
      const timeout = options.timeout || this.timeout;

      logger.step(`Checking health of: ${url}`);
      logger.info(`Timeout: ${timeout / 1000}s`);
      logger.newline();

      // Perform health check
      const result = await this.detailedCheck(url, timeout);
      
      // Calculate total time
      const totalTime = Date.now() - startTime;
      result.totalTime = totalTime;
      result.environment = options.environment || 'custom';

      return result;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      return {
        status: 'error',
        error: error.message,
        totalTime,
        timestamp: new Date().toISOString(),
        environment: options.environment || 'custom'
      };
    }
  }

  /**
   * Performs comprehensive health check
   * @param {string} url - Backend URL
   * @param {number} timeout - Request timeout in ms
   * @returns {Promise<Object>} Detailed health check result
   */
  async detailedCheck(url, timeout = this.timeout) {
    const result = {
      status: 'unknown',
      timestamp: new Date().toISOString(),
      endpoints: {},
      errors: []
    };

    try {
      // Test main endpoint
      const mainEndpoint = await this.testEndpoint(url, { timeout });
      result.endpoints['/'] = mainEndpoint;

      if (mainEndpoint.success) {
        result.status = 'healthy';
        result.responseTime = mainEndpoint.responseTime;
        
        // Extract version and other info from response if available
        if (mainEndpoint.data) {
          result.version = mainEndpoint.data.version;
          result.serverInfo = mainEndpoint.data;
        }
      } else {
        result.status = 'unhealthy';
        result.errors.push({
          endpoint: '/',
          error: mainEndpoint.error
        });
      }

      // Test additional endpoints if main endpoint is healthy
      if (result.status === 'healthy') {
        // Test a known endpoint (validate-admin-code) to verify API is working
        const apiEndpoint = await this.testEndpoint(
          `${url}/validate-admin-code`,
          { 
            timeout,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: 'test' }),
            expectStatus: [400, 401] // We expect this to fail, just checking if endpoint responds
          }
        );
        
        result.endpoints['/validate-admin-code'] = apiEndpoint;
        
        if (!apiEndpoint.success && apiEndpoint.statusCode === 0) {
          // Endpoint didn't respond at all
          result.errors.push({
            endpoint: '/validate-admin-code',
            error: apiEndpoint.error
          });
        }
      }

    } catch (error) {
      result.status = 'unreachable';
      result.errors.push({
        error: error.message
      });
    }

    return result;
  }

  /**
   * Tests specific endpoint
   * @param {string} url - Endpoint URL
   * @param {Object} options - Request options
   * @param {number} options.timeout - Request timeout
   * @param {string} options.method - HTTP method
   * @param {Object} options.headers - Request headers
   * @param {string} options.body - Request body
   * @param {Array<number>} options.expectStatus - Expected status codes (default: [200])
   * @returns {Promise<Object>} Endpoint test result
   */
  async testEndpoint(url, options = {}) {
    const startTime = Date.now();
    const timeout = options.timeout || this.timeout;
    const method = options.method || 'GET';
    const expectStatus = options.expectStatus || [200];

    return new Promise((resolve) => {
      try {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;

        const requestOptions = {
          method,
          headers: options.headers || {},
          timeout
        };

        const req = protocol.request(urlObj, requestOptions, (res) => {
          const responseTime = Date.now() - startTime;
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            const success = expectStatus.includes(res.statusCode);
            
            let parsedData = null;
            try {
              parsedData = JSON.parse(data);
            } catch (e) {
              // Not JSON, keep as string
              parsedData = data;
            }

            resolve({
              success,
              statusCode: res.statusCode,
              responseTime,
              data: parsedData,
              headers: res.headers
            });
          });
        });

        req.on('error', (error) => {
          const responseTime = Date.now() - startTime;
          resolve({
            success: false,
            statusCode: 0,
            responseTime,
            error: error.message
          });
        });

        req.on('timeout', () => {
          req.destroy();
          const responseTime = Date.now() - startTime;
          resolve({
            success: false,
            statusCode: 0,
            responseTime,
            error: `Request timed out after ${timeout}ms`
          });
        });

        // Send request body if provided
        if (options.body) {
          req.write(options.body);
        }

        req.end();
      } catch (error) {
        const responseTime = Date.now() - startTime;
        resolve({
          success: false,
          statusCode: 0,
          responseTime,
          error: error.message
        });
      }
    });
  }

  /**
   * Displays health check results
   * @param {Object} result - Health check result
   */
  displayResults(result) {
    logger.divider();
    logger.header('Health Check Results');
    logger.newline();

    // Display overall status
    if (result.status === 'healthy') {
      logger.success(`Status: HEALTHY ✓`);
    } else if (result.status === 'unhealthy') {
      logger.warning(`Status: UNHEALTHY ⚠`);
    } else if (result.status === 'unreachable') {
      logger.error(`Status: UNREACHABLE ✗`);
    } else {
      logger.error(`Status: ERROR ✗`);
    }

    logger.newline();

    // Display basic info
    const info = {
      'Environment': result.environment || 'N/A',
      'Timestamp': result.timestamp,
      'Total Time': `${result.totalTime}ms`
    };

    if (result.responseTime) {
      info['Response Time'] = `${result.responseTime}ms`;
    }

    if (result.version) {
      info['Version'] = result.version;
    }

    logger.table(info);
    logger.newline();

    // Display endpoint results
    if (result.endpoints && Object.keys(result.endpoints).length > 0) {
      logger.info('Endpoint Tests:');
      logger.newline();

      Object.entries(result.endpoints).forEach(([endpoint, endpointResult]) => {
        const statusIcon = endpointResult.success ? '✓' : '✗';
        const statusColor = endpointResult.success ? 'green' : 'red';
        
        logger.bullet(
          `${endpoint}: ${endpointResult.statusCode} ${statusIcon} (${endpointResult.responseTime}ms)`
        );

        if (endpointResult.error) {
          logger.raw(`    Error: ${endpointResult.error}`);
        }
      });

      logger.newline();
    }

    // Display errors
    if (result.errors && result.errors.length > 0) {
      logger.error('Errors:');
      logger.newline();

      result.errors.forEach((error) => {
        if (error.endpoint) {
          logger.bullet(`${error.endpoint}: ${error.error}`);
        } else {
          logger.bullet(error.error);
        }
      });

      logger.newline();
    }

    // Display remediation if unhealthy or unreachable
    if (result.status === 'unhealthy' || result.status === 'unreachable' || result.status === 'error') {
      logger.divider();
      logger.warning('Troubleshooting:');
      logger.newline();

      if (result.status === 'unreachable') {
        ERROR_CODES.SERVICE_UNREACHABLE.remediation.forEach(step => {
          logger.bullet(step);
        });
      } else {
        ERROR_CODES.HEALTH_CHECK_FAILED.remediation.forEach(step => {
          logger.bullet(step);
        });
      }

      logger.newline();
    }

    logger.divider();
  }

  /**
   * Gets service URL from environment configuration
   * @param {Object} envConfig - Environment configuration
   * @returns {string} Service URL
   */
  getServiceUrl(envConfig) {
    // For Render, construct URL from service name
    const serviceName = envConfig.renderServiceName;
    return `https://${serviceName}.onrender.com`;
  }
}

module.exports = HealthChecker;
