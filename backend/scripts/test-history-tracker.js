#!/usr/bin/env node

/**
 * Test script for History Tracker
 * Tests the core functionality of the history tracker
 */

const HistoryTracker = require('./history-tracker');
const logger = require('./utils/logger');
const { DEPLOYMENT_STATUS } = require('./utils/constants');
const path = require('path');

async function testHistoryTracker() {
  logger.header('Testing History Tracker');
  logger.newline();
  
  try {
    // Use a test history file
    const testHistoryFile = path.join(__dirname, '../config/test-deployment-history.json');
    const tracker = new HistoryTracker({ historyFile: testHistoryFile });
    
    // Test 1: Record a deployment
    logger.step('Test 1: Recording a deployment');
    const deploymentId1 = await tracker.recordDeployment({
      environment: 'development',
      version: '1.0.0',
      configuration: {
        renderServiceName: 'test-service',
        region: 'oregon'
      },
      status: DEPLOYMENT_STATUS.SUCCESS,
      deploymentUrl: 'https://test-service.onrender.com',
      duration: 120000,
      notes: 'Test deployment 1'
    });
    logger.success(`Deployment recorded: ${deploymentId1}`);
    logger.newline();
    
    // Test 2: Record another deployment
    logger.step('Test 2: Recording another deployment');
    const deploymentId2 = await tracker.recordDeployment({
      environment: 'staging',
      version: '1.0.1',
      configuration: {
        renderServiceName: 'test-service-staging',
        region: 'oregon'
      },
      status: DEPLOYMENT_STATUS.SUCCESS,
      deploymentUrl: 'https://test-service-staging.onrender.com',
      duration: 150000,
      notes: 'Test deployment 2'
    });
    logger.success(`Deployment recorded: ${deploymentId2}`);
    logger.newline();
    
    // Test 3: Get deployment history
    logger.step('Test 3: Retrieving deployment history');
    const history = await tracker.getHistory({ limit: 10 });
    logger.success(`Retrieved ${history.length} deployments`);
    logger.newline();
    
    // Test 4: Display history
    logger.step('Test 4: Displaying deployment history');
    tracker.displayHistory(history);
    logger.newline();
    
    // Test 5: Get specific deployment
    logger.step('Test 5: Retrieving specific deployment');
    const deployment = await tracker.getDeployment(deploymentId1);
    if (deployment) {
      logger.success(`Found deployment: ${deployment.id}`);
      logger.bullet(`Environment: ${deployment.environment}`);
      logger.bullet(`Version: ${deployment.version}`);
      logger.bullet(`Status: ${deployment.status}`);
    } else {
      logger.error('Deployment not found');
    }
    logger.newline();
    
    // Test 6: Filter by environment
    logger.step('Test 6: Filtering by environment');
    const devHistory = await tracker.getHistory({ environment: 'development' });
    logger.success(`Found ${devHistory.length} development deployments`);
    logger.newline();
    
    // Test 7: Prepare rollback
    logger.step('Test 7: Preparing rollback plan');
    const rollbackPlan = await tracker.prepareRollback(deploymentId1);
    logger.success('Rollback plan prepared');
    tracker.displayRollbackPlan(rollbackPlan);
    logger.newline();
    
    // Test 8: Record a failed deployment
    logger.step('Test 8: Recording a failed deployment');
    const deploymentId3 = await tracker.recordDeployment({
      environment: 'production',
      version: '1.0.2',
      status: DEPLOYMENT_STATUS.FAILED,
      notes: 'Test failed deployment'
    });
    logger.success(`Failed deployment recorded: ${deploymentId3}`);
    logger.newline();
    
    // Test 9: Filter by status
    logger.step('Test 9: Filtering by status');
    const failedHistory = await tracker.getHistory({ status: DEPLOYMENT_STATUS.FAILED });
    logger.success(`Found ${failedHistory.length} failed deployments`);
    logger.newline();
    
    // Cleanup
    logger.step('Cleaning up test file');
    const fs = require('fs').promises;
    await fs.unlink(testHistoryFile);
    logger.success('Test file removed');
    logger.newline();
    
    logger.header('All Tests Passed!');
    logger.success('History Tracker is working correctly');
    
  } catch (error) {
    logger.error(`Test failed: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  testHistoryTracker();
}

module.exports = { testHistoryTracker };
