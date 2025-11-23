/**
 * Constants for deployment scripts
 * Includes error codes, paths, and configuration defaults
 */

const path = require('path');

// Base paths
const BACKEND_ROOT = path.resolve(__dirname, '../..');
const SCRIPTS_DIR = path.resolve(__dirname, '..');
const CONFIG_DIR = path.join(BACKEND_ROOT, 'config');

// File paths
const PATHS = {
  // Root directories
  BACKEND_ROOT,
  SCRIPTS_DIR,
  CONFIG_DIR,
  
  // Configuration files
  DEPLOYMENT_CONFIG: path.join(CONFIG_DIR, 'deployment-config.json'),
  DEPLOYMENT_HISTORY: path.join(CONFIG_DIR, 'deployment-history.json'),
  PACKAGE_JSON: path.join(BACKEND_ROOT, 'package.json'),
  
  // Credential files
  SERVICE_ACCOUNT_KEY: path.join(BACKEND_ROOT, 'serviceAccountKey.json'),
  FIREBASE_CREDENTIALS_OUTPUT: path.join(BACKEND_ROOT, 'firebase-credentials-for-render.txt'),
  
  // Environment files
  ENV_FILE: path.join(BACKEND_ROOT, '.env'),
  ENV_EXAMPLE: path.join(BACKEND_ROOT, '.env.example'),
  
  // Server files
  SERVER_JS: path.join(BACKEND_ROOT, 'server.js'),
  
  // Documentation
  DOCS_DIR: path.join(BACKEND_ROOT, 'docs'),
  DEPLOYMENT_DOCS: path.join(BACKEND_ROOT, 'docs', 'DEPLOYMENT.md'),
  TROUBLESHOOTING_DOCS: path.join(BACKEND_ROOT, 'docs', 'TROUBLESHOOTING.md')
};

// Error codes with messages and remediation steps
const ERROR_CODES = {
  // Validation errors (1xxx)
  MISSING_CREDENTIALS: {
    code: 'E1001',
    message: 'Firebase service account file not found',
    remediation: [
      'Go to Firebase Console → Project Settings → Service Accounts',
      'Click "Generate new private key"',
      'Save as backend/serviceAccountKey.json',
      '',
      'Or run: npm run prepare-credentials'
    ]
  },
  
  INVALID_CREDENTIALS: {
    code: 'E1002',
    message: 'Firebase service account file is invalid',
    remediation: [
      'Verify the serviceAccountKey.json file contains valid JSON',
      'Ensure all required fields are present:',
      '  - project_id',
      '  - private_key',
      '  - client_email',
      '',
      'Download a fresh copy from Firebase Console if needed'
    ]
  },
  
  MISSING_DEPENDENCIES: {
    code: 'E1003',
    message: 'Required npm dependencies are not installed',
    remediation: [
      'Run: npm install',
      '',
      'If issues persist, try:',
      '  npm clean-install'
    ]
  },
  
  INVALID_ENVIRONMENT: {
    code: 'E1004',
    message: 'Invalid environment specified',
    remediation: [
      'Valid environments are:',
      '  - development',
      '  - staging',
      '  - production',
      '',
      'Example: npm run deploy:dev'
    ]
  },
  
  MISSING_ENV_CONFIG: {
    code: 'E1005',
    message: 'Environment configuration not found',
    remediation: [
      'Create deployment configuration file:',
      '  backend/config/deployment-config.json',
      '',
      'Or run: npm run env:list to see available environments'
    ]
  },
  
  MISSING_SERVER_FILE: {
    code: 'E1006',
    message: 'Server file (server.js) not found',
    remediation: [
      'Ensure backend/server.js exists',
      'Verify you are in the correct directory'
    ]
  },
  
  VALIDATION_FAILED: {
    code: 'E1007',
    message: 'Pre-deployment validation failed',
    remediation: [
      'Fix the validation errors listed above',
      'Run validation again: npm run deploy -- --validate-only'
    ]
  },
  
  // Configuration errors (2xxx)
  CONFIG_READ_ERROR: {
    code: 'E2001',
    message: 'Failed to read configuration file',
    remediation: [
      'Check that the configuration file exists and is readable',
      'Verify JSON syntax is valid'
    ]
  },
  
  CONFIG_WRITE_ERROR: {
    code: 'E2002',
    message: 'Failed to write configuration file',
    remediation: [
      'Check file permissions',
      'Ensure directory exists'
    ]
  },
  
  INVALID_CONFIG_STRUCTURE: {
    code: 'E2003',
    message: 'Configuration file has invalid structure',
    remediation: [
      'Verify configuration follows the expected schema',
      'Check documentation for correct format'
    ]
  },
  
  // Deployment errors (3xxx)
  DEPLOYMENT_FAILED: {
    code: 'E3001',
    message: 'Deployment process failed',
    remediation: [
      'Check the error details above',
      'Verify all prerequisites are met',
      'Try running with --verbose for more details'
    ]
  },
  
  RENDER_API_ERROR: {
    code: 'E3002',
    message: 'Render API request failed',
    remediation: [
      'Check your Render API key is valid',
      'Verify network connectivity',
      'Check Render status: https://status.render.com'
    ]
  },
  
  TIMEOUT_ERROR: {
    code: 'E3003',
    message: 'Operation timed out',
    remediation: [
      'Check network connectivity',
      'Try again in a few moments',
      'Increase timeout with --timeout flag'
    ]
  },
  
  // Health check errors (4xxx)
  HEALTH_CHECK_FAILED: {
    code: 'E4001',
    message: 'Backend health check failed',
    remediation: [
      'Check Render logs for errors',
      'Verify service is running on Render dashboard',
      'Check environment variables are set correctly',
      '',
      'View logs: https://dashboard.render.com'
    ]
  },
  
  SERVICE_UNREACHABLE: {
    code: 'E4002',
    message: 'Backend service is unreachable',
    remediation: [
      'Verify the service URL is correct',
      'Check if service is deployed on Render',
      'Verify network connectivity',
      'Check Render service status'
    ]
  },
  
  // History/Rollback errors (5xxx)
  HISTORY_READ_ERROR: {
    code: 'E5001',
    message: 'Failed to read deployment history',
    remediation: [
      'Check that deployment-history.json exists',
      'Verify file permissions'
    ]
  },
  
  NO_DEPLOYMENT_HISTORY: {
    code: 'E5002',
    message: 'No deployment history found',
    remediation: [
      'Deploy at least once to create history',
      'History is stored in: backend/config/deployment-history.json'
    ]
  },
  
  ROLLBACK_NOT_AVAILABLE: {
    code: 'E5003',
    message: 'Rollback not available for this deployment',
    remediation: [
      'Ensure deployment history exists',
      'Verify deployment ID is valid'
    ]
  }
};

// Configuration defaults
const DEFAULTS = {
  // Deployment settings
  DEPLOYMENT: {
    TIMEOUT: 300000, // 5 minutes
    HEALTH_CHECK_TIMEOUT: 30000, // 30 seconds
    HEALTH_CHECK_RETRIES: 3,
    HEALTH_CHECK_INTERVAL: 5000, // 5 seconds
    DEFAULT_ENVIRONMENT: 'development',
    DEFAULT_REGION: 'oregon',
    DEFAULT_PLAN: 'free'
  },
  
  // Environment names
  ENVIRONMENTS: ['development', 'staging', 'production'],
  
  // Required Firebase service account fields
  REQUIRED_FIREBASE_FIELDS: [
    'type',
    'project_id',
    'private_key_id',
    'private_key',
    'client_email',
    'client_id',
    'auth_uri',
    'token_uri',
    'auth_provider_x509_cert_url',
    'client_x509_cert_url'
  ],
  
  // Required environment variables
  REQUIRED_ENV_VARS: [
    'NODE_ENV',
    'PORT',
    'ADMIN_SETUP_CODE'
  ],
  
  // Deployment history settings
  HISTORY: {
    MAX_RECORDS: 50,
    RETENTION_DAYS: 90
  },
  
  // Render configuration
  RENDER: {
    DEFAULT_BUILD_COMMAND: 'cd backend && npm install',
    DEFAULT_START_COMMAND: 'cd backend && npm start',
    DEFAULT_HEALTH_CHECK_PATH: '/',
    DEFAULT_PORT: 10000
  }
};

// Exit codes
const EXIT_CODES = {
  SUCCESS: 0,
  VALIDATION_ERROR: 1,
  CONFIGURATION_ERROR: 2,
  DEPLOYMENT_ERROR: 3,
  HEALTH_CHECK_ERROR: 4,
  UNKNOWN_ERROR: 99
};

// Deployment statuses
const DEPLOYMENT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUCCESS: 'success',
  FAILED: 'failed',
  ROLLED_BACK: 'rolled_back'
};

// Environment types
const ENVIRONMENT_TYPES = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
};

module.exports = {
  PATHS,
  ERROR_CODES,
  DEFAULTS,
  EXIT_CODES,
  DEPLOYMENT_STATUS,
  ENVIRONMENT_TYPES
};
