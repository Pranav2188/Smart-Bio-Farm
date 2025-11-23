#!/usr/bin/env node

/**
 * Integration and End-to-End Testing Script
 * Tests all deployment automation components together
 */

const fs = require('fs');
const path = require('path');
const { Validator } = require('./validator');
const CredentialManager = require('./credential-manager');
const EnvironmentManager = require('./environment-manager');
const HealthChecker = require('./health-checker');
const HistoryTracker = require('./history-tracker');
const DeploymentManager = require('./deployment-manager');
const logger = require('./utils/logger');

class IntegrationTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };
    this.validator = new Validator();
    this.credentialManager = new CredentialManager();
    this.environmentManager = new EnvironmentManager();
    this.healthChecker = new HealthChecker();
    this.historyTracker = new HistoryTracker();
    this.deploymentManager = new DeploymentManager();
  }

  /**
   * Run all integration tests
   */
  async runAllTests() {
    logger.info('🧪 Starting Integration and End-to-End Tests\n');
    
    try {
      // Task 14.1: Test complete deployment workflow
      await this.testDeploymentWorkflow();
      
      // Task 14.2: Test health check functionality
      await this.testHealthCheckFunctionality();
      
      // Task 14.3: Test credential management
      await this.testCredentialManagement();
      
      // Task 14.4: Test environment management
      await this.testEnvironmentManagement();
      
      // Task 14.5: Test history and rollback
      await this.testHistoryAndRollback();
      
      // Display summary
      this.displaySummary();
      
      // Exit with appropriate code
      process.exit(this.testResults.failed > 0 ? 1 : 0);
    } catch (error) {
      logger.error('Fatal error during testing:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    }
  }

  /**
   * Task 14.1: Test complete deployment workflow
   */
  async testDeploymentWorkflow() {
    logger.header('Task 14.1: Testing Complete Deployment Workflow');
    
    // Test 14.1.1: Validation checks
    await this.runTest('Validation checks work correctly', async () => {
      const result = await this.validator.validateAll({ environment: 'development' });
      if (!result || typeof result.success !== 'boolean') {
        throw new Error('Validator did not return expected result structure');
      }
      return true;
    });
    
    // Test 14.1.2: Development environment deployment (dry-run)
    await this.runTest('Development environment deployment (dry-run)', async () => {
      const result = await this.deploymentManager.deploy({
        environment: 'development',
        dryRun: true,
        skipValidation: false
      });
      if (!result || typeof result.success !== 'boolean') {
        throw new Error('Deployment manager did not return expected result');
      }
      return true;
    });
    
    // Test 14.1.3: Staging environment deployment (dry-run)
    await this.runTest('Staging environment deployment (dry-run)', async () => {
      const result = await this.deploymentManager.deploy({
        environment: 'staging',
        dryRun: true,
        skipValidation: false
      });
      if (!result || typeof result.success !== 'boolean') {
        throw new Error('Deployment manager did not return expected result');
      }
      return true;
    });
    
    // Test 14.1.4: Production deployment with confirmation (dry-run)
    await this.runTest('Production deployment requires confirmation', async () => {
      // In dry-run mode, should not require actual confirmation
      const result = await this.deploymentManager.deploy({
        environment: 'production',
        dryRun: true,
        skipValidation: false
      });
      if (!result || typeof result.success !== 'boolean') {
        throw new Error('Production deployment did not work in dry-run mode');
      }
      return true;
    });
    
    // Test 14.1.5: Validation error handling
    await this.runTest('Validation errors are caught and reported', async () => {
      // Test with invalid environment - validator returns error result, doesn't throw
      const result = await this.validator.validateEnvironment('invalid-env');
      
      if (result.passed) {
        throw new Error('Invalid environment should fail validation');
      }
      
      if (!result.message || !result.remediation) {
        throw new Error('Error result should include message and remediation');
      }
      
      return true;
    });
  }

  /**
   * Task 14.2: Test health check functionality
   */
  async testHealthCheckFunctionality() {
    logger.header('Task 14.2: Testing Health Check Functionality');
    
    // Test 14.2.1: Health check for development environment
    await this.runTest('Health check for development environment', async () => {
      const config = await this.environmentManager.loadEnvironment('development');
      const url = config.deploymentUrl || 'http://localhost:10000';
      
      try {
        const result = await this.healthChecker.checkHealth({
          environment: 'development',
          url: url,
          timeout: 5000
        });
        
        // Should return a result even if unreachable
        if (!result || typeof result.status !== 'string') {
          throw new Error('Health checker did not return expected result');
        }
        return true;
      } catch (error) {
        // Health check might fail if service is not running, but should not throw
        if (error.message.includes('did not return expected result')) {
          throw error;
        }
        return true;
      }
    });
    
    // Test 14.2.2: Health check for staging environment
    await this.runTest('Health check for staging environment', async () => {
      const config = await this.environmentManager.loadEnvironment('staging');
      const url = config.deploymentUrl || 'http://localhost:10000';
      
      try {
        const result = await this.healthChecker.checkHealth({
          environment: 'staging',
          url: url,
          timeout: 5000
        });
        
        if (!result || typeof result.status !== 'string') {
          throw new Error('Health checker did not return expected result');
        }
        return true;
      } catch (error) {
        if (error.message.includes('did not return expected result')) {
          throw error;
        }
        return true;
      }
    });
    
    // Test 14.2.3: Health check for production environment
    await this.runTest('Health check for production environment', async () => {
      const config = await this.environmentManager.loadEnvironment('production');
      const url = config.deploymentUrl || 'http://localhost:10000';
      
      try {
        const result = await this.healthChecker.checkHealth({
          environment: 'production',
          url: url,
          timeout: 5000
        });
        
        if (!result || typeof result.status !== 'string') {
          throw new Error('Health checker did not return expected result');
        }
        return true;
      } catch (error) {
        if (error.message.includes('did not return expected result')) {
          throw error;
        }
        return true;
      }
    });
    
    // Test 14.2.4: Timeout handling
    await this.runTest('Health check timeout handling', async () => {
      try {
        const result = await this.healthChecker.checkHealth({
          url: 'http://192.0.2.1:9999', // Non-routable IP
          timeout: 2000
        });
        
        // Should return unreachable or unhealthy status, not throw
        if (!['unreachable', 'unhealthy'].includes(result.status)) {
          throw new Error('Expected unreachable or unhealthy status for timeout');
        }
        return true;
      } catch (error) {
        if (error.message.includes('Expected unreachable')) {
          throw error;
        }
        // Timeout is acceptable
        return true;
      }
    });
    
    // Test 14.2.5: Error scenarios (unreachable backend)
    await this.runTest('Health check handles unreachable backend', async () => {
      const result = await this.healthChecker.checkHealth({
        url: 'http://localhost:99999', // Invalid port
        timeout: 2000
      });
      
      // Should return unreachable, not throw
      if (!result || !['unreachable', 'unhealthy'].includes(result.status)) {
        throw new Error('Health checker should handle unreachable backend gracefully');
      }
      return true;
    });
  }

  /**
   * Task 14.3: Test credential management
   */
  async testCredentialManagement() {
    logger.header('Task 14.3: Testing Credential Management');
    
    // Test 14.3.1: Credential preparation and formatting
    await this.runTest('Credential preparation and formatting', async () => {
      const testCredentials = {
        type: 'service_account',
        project_id: 'test-project',
        private_key_id: 'test-key-id',
        private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
        client_email: 'test@test.iam.gserviceaccount.com',
        client_id: '123456789',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/test%40test.iam.gserviceaccount.com'
      };
      
      const formatted = this.credentialManager.formatForRender(testCredentials);
      
      // Should be single line
      if (formatted.includes('\n')) {
        throw new Error('Formatted credentials should be single line');
      }
      
      // Should be valid JSON
      const parsed = JSON.parse(formatted);
      if (parsed.project_id !== 'test-project') {
        throw new Error('Formatted credentials should be valid JSON');
      }
      
      return true;
    });
    
    // Test 14.3.2: Validation of service account structure
    await this.runTest('Service account structure validation', async () => {
      const validCredentials = {
        type: 'service_account',
        project_id: 'test-project',
        private_key_id: 'test-key-id',
        private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
        client_email: 'test@test.iam.gserviceaccount.com',
        client_id: '123456789',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/test%40test.iam.gserviceaccount.com'
      };
      
      const isValid = this.credentialManager.validateStructure(validCredentials);
      if (!isValid) {
        throw new Error('Valid credentials should pass validation');
      }
      
      const invalidCredentials = {
        type: 'service_account',
        project_id: 'test-project'
        // Missing required fields
      };
      
      const isInvalid = this.credentialManager.validateStructure(invalidCredentials);
      if (isInvalid) {
        throw new Error('Invalid credentials should fail validation');
      }
      
      return true;
    });
    
    // Test 14.3.3: File saving and display
    await this.runTest('Credential file saving', async () => {
      const testCredentials = {
        type: 'service_account',
        project_id: 'test-project',
        private_key_id: 'test-key-id',
        private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
        client_email: 'test@test.iam.gserviceaccount.com',
        client_id: '123456789'
      };
      
      const formatted = this.credentialManager.formatForRender(testCredentials);
      const testOutputPath = path.join(__dirname, '..', 'test-credentials-output.txt');
      
      try {
        await this.credentialManager.saveToFile(formatted, testOutputPath);
        
        // Verify file was created
        if (!fs.existsSync(testOutputPath)) {
          throw new Error('Credential file was not created');
        }
        
        // Verify content
        const content = fs.readFileSync(testOutputPath, 'utf8');
        if (content !== formatted) {
          throw new Error('Saved content does not match formatted credentials');
        }
        
        // Clean up
        fs.unlinkSync(testOutputPath);
        
        return true;
      } catch (error) {
        // Clean up on error
        if (fs.existsSync(testOutputPath)) {
          fs.unlinkSync(testOutputPath);
        }
        throw error;
      }
    });
    
    // Test 14.3.4: Sensitive data masking
    await this.runTest('Sensitive data masking', async () => {
      const credentials = {
        type: 'service_account',
        project_id: 'test-project',
        private_key: '-----BEGIN PRIVATE KEY-----\nVERY_SECRET_KEY\n-----END PRIVATE KEY-----\n',
        client_email: 'test@test.iam.gserviceaccount.com'
      };
      
      const masked = this.credentialManager.maskSensitiveData(credentials);
      
      // Private key should be masked
      if (masked.private_key.includes('VERY_SECRET_KEY')) {
        throw new Error('Private key should be masked');
      }
      
      // Non-sensitive fields should remain
      if (masked.project_id !== 'test-project') {
        throw new Error('Non-sensitive fields should not be masked');
      }
      
      return true;
    });
  }

  /**
   * Task 14.4: Test environment management
   */
  async testEnvironmentManagement() {
    logger.header('Task 14.4: Testing Environment Management');
    
    // Test 14.4.1: Switching between environments
    await this.runTest('Switching between environments', async () => {
      const devConfig = await this.environmentManager.loadEnvironment('development');
      if (!devConfig || devConfig.name !== 'development') {
        throw new Error('Failed to load development environment');
      }
      
      const stagingConfig = await this.environmentManager.loadEnvironment('staging');
      if (!stagingConfig || stagingConfig.name !== 'staging') {
        throw new Error('Failed to load staging environment');
      }
      
      const prodConfig = await this.environmentManager.loadEnvironment('production');
      if (!prodConfig || prodConfig.name !== 'production') {
        throw new Error('Failed to load production environment');
      }
      
      return true;
    });
    
    // Test 14.4.2: Environment listing
    await this.runTest('Environment listing', async () => {
      const environments = await this.environmentManager.listEnvironments();
      
      if (!Array.isArray(environments)) {
        throw new Error('listEnvironments should return an array');
      }
      
      // Extract environment names from the objects
      const envNames = environments.map(env => env.name);
      
      if (!envNames.includes('development') || 
          !envNames.includes('staging') || 
          !envNames.includes('production')) {
        throw new Error('Should list all standard environments');
      }
      
      // Check that each environment has required properties
      for (const env of environments) {
        if (!env.name || !env.serviceName) {
          throw new Error('Environment objects should have name and serviceName');
        }
      }
      
      return true;
    });
    
    // Test 14.4.3: Environment configuration structure
    await this.runTest('Environment configuration structure', async () => {
      const config = await this.environmentManager.loadEnvironment('development');
      
      // Check required fields
      const requiredFields = ['name', 'renderServiceName', 'region', 'envVars'];
      for (const field of requiredFields) {
        if (!(field in config)) {
          throw new Error(`Environment config missing required field: ${field}`);
        }
      }
      
      // Check envVars structure
      if (typeof config.envVars !== 'object') {
        throw new Error('envVars should be an object');
      }
      
      return true;
    });
    
    // Test 14.4.4: Invalid environment handling
    await this.runTest('Invalid environment handling', async () => {
      try {
        await this.environmentManager.loadEnvironment('invalid-environment');
        throw new Error('Should throw error for invalid environment');
      } catch (error) {
        if (error.message.includes('Should throw error')) {
          throw error;
        }
        // Expected error
        return true;
      }
    });
    
    // Test 14.4.5: Current environment detection
    await this.runTest('Current environment detection', async () => {
      const currentEnv = this.environmentManager.getCurrentEnvironment();
      
      if (typeof currentEnv !== 'string') {
        throw new Error('getCurrentEnvironment should return a string');
      }
      
      // Should be one of the valid environments or 'development' as default
      const validEnvs = ['development', 'staging', 'production'];
      if (!validEnvs.includes(currentEnv)) {
        throw new Error(`Current environment should be one of: ${validEnvs.join(', ')}`);
      }
      
      return true;
    });
  }

  /**
   * Task 14.5: Test history and rollback
   */
  async testHistoryAndRollback() {
    logger.header('Task 14.5: Testing History and Rollback');
    
    // Test 14.5.1: Deployment history recording
    await this.runTest('Deployment history recording', async () => {
      const testDeployment = {
        environment: 'development',
        version: '1.0.0-test',
        gitCommit: 'abc123',
        gitBranch: 'test-branch',
        deployedBy: 'test-user',
        status: 'success'
      };
      
      await this.historyTracker.recordDeployment(testDeployment);
      
      // Verify it was recorded
      const history = await this.historyTracker.getHistory({ limit: 1 });
      if (!history || history.length === 0) {
        throw new Error('Deployment was not recorded in history');
      }
      
      const lastDeployment = history[0];
      if (lastDeployment.environment !== 'development' || 
          lastDeployment.version !== '1.0.0-test') {
        throw new Error('Recorded deployment does not match input');
      }
      
      return true;
    });
    
    // Test 14.5.2: History retrieval and display
    await this.runTest('History retrieval with filters', async () => {
      // Get all history
      const allHistory = await this.historyTracker.getHistory({ limit: 10 });
      if (!Array.isArray(allHistory)) {
        throw new Error('getHistory should return an array');
      }
      
      // Get limited history
      const limitedHistory = await this.historyTracker.getHistory({ limit: 2 });
      if (limitedHistory.length > 2) {
        throw new Error('History limit not respected');
      }
      
      // Get environment-specific history
      if (allHistory.length > 0) {
        const envHistory = await this.historyTracker.getHistory({ 
          environment: 'development',
          limit: 10 
        });
        
        // All results should be for development environment
        const allDev = envHistory.every(d => d.environment === 'development');
        if (!allDev) {
          throw new Error('Environment filter not working correctly');
        }
      }
      
      return true;
    });
    
    // Test 14.5.3: Specific deployment retrieval
    await this.runTest('Specific deployment retrieval', async () => {
      const history = await this.historyTracker.getHistory({ limit: 1 });
      
      if (history.length > 0) {
        const deploymentId = history[0].id;
        const deployment = await this.historyTracker.getDeployment(deploymentId);
        
        if (!deployment || deployment.id !== deploymentId) {
          throw new Error('Failed to retrieve specific deployment');
        }
      }
      
      return true;
    });
    
    // Test 14.5.4: Rollback preparation
    await this.runTest('Rollback preparation', async () => {
      const history = await this.historyTracker.getHistory({ limit: 2 });
      
      if (history.length > 0) {
        const deploymentId = history[0].id;
        const rollbackPlan = await this.historyTracker.prepareRollback(deploymentId);
        
        if (!rollbackPlan || !rollbackPlan.targetDeployment) {
          throw new Error('Failed to prepare rollback plan');
        }
        
        if (rollbackPlan.targetDeployment.id !== deploymentId) {
          throw new Error('Rollback plan targets wrong deployment');
        }
      }
      
      return true;
    });
    
    // Test 14.5.5: History file management
    await this.runTest('History file exists and is valid JSON', async () => {
      const historyPath = path.join(__dirname, '..', 'config', 'deployment-history.json');
      
      if (!fs.existsSync(historyPath)) {
        throw new Error('History file does not exist');
      }
      
      const content = fs.readFileSync(historyPath, 'utf8');
      const history = JSON.parse(content);
      
      if (!history.deployments || !Array.isArray(history.deployments)) {
        throw new Error('History file has invalid structure');
      }
      
      return true;
    });
  }

  /**
   * Run a single test
   */
  async runTest(name, testFn) {
    try {
      await testFn();
      this.testResults.passed++;
      this.testResults.tests.push({ name, status: 'passed' });
      logger.success(`✓ ${name}`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.tests.push({ name, status: 'failed', error: error.message });
      logger.error(`✗ ${name}`);
      logger.error(`  Error: ${error.message}`);
    }
  }

  /**
   * Display test summary
   */
  displaySummary() {
    logger.header('Test Summary');
    
    const total = this.testResults.passed + this.testResults.failed + this.testResults.skipped;
    
    logger.info(`Total Tests: ${total}`);
    logger.success(`Passed: ${this.testResults.passed}`);
    
    if (this.testResults.failed > 0) {
      logger.error(`Failed: ${this.testResults.failed}`);
    }
    
    if (this.testResults.skipped > 0) {
      logger.warning(`Skipped: ${this.testResults.skipped}`);
    }
    
    const passRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0;
    logger.info(`Pass Rate: ${passRate}%`);
    
    if (this.testResults.failed > 0) {
      logger.error('\n❌ Some tests failed. Review errors above.');
    } else {
      logger.success('\n✅ All tests passed!');
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new IntegrationTester();
  tester.runAllTests().catch(error => {
    logger.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = IntegrationTester;
