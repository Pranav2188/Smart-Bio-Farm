const fs = require('fs');
const path = require('path');
const net = require('net');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

console.log('\n' + colors.cyan + '🔍 Validating startup requirements...' + colors.reset + '\n');

let hasErrors = false;

// Check 1: Validate Firebase credentials (file or environment variable)
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const hasServiceAccountFile = fs.existsSync(serviceAccountPath);
const hasServiceAccountEnv = !!process.env.FIREBASE_SERVICE_ACCOUNT;

if (hasServiceAccountFile) {
  console.log(colors.green + '✅ serviceAccountKey.json found' + colors.reset);
} else if (hasServiceAccountEnv) {
  console.log(colors.green + '✅ FIREBASE_SERVICE_ACCOUNT environment variable found' + colors.reset);
} else {
  console.error(colors.red + '❌ Firebase credentials missing!' + colors.reset);
  console.error(colors.yellow + '\n📋 To fix this:' + colors.reset);
  console.error('  Option 1 - Local development:');
  console.error('    1. Go to Firebase Console > Project Settings > Service Accounts');
  console.error('    2. Click "Generate New Private Key"');
  console.error('    3. Save the file as serviceAccountKey.json in the backend folder');
  console.error('  Option 2 - Production (Render/Cloud):');
  console.error('    1. Set FIREBASE_SERVICE_ACCOUNT environment variable');
  console.error('    2. Value should be the entire JSON content as a single line\n');
  hasErrors = true;
}

// Check 2: Validate .env file exists (optional but recommended)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log(colors.green + '✅ .env file found' + colors.reset);
} else {
  console.log(colors.yellow + '⚠️  .env file not found (optional)' + colors.reset);
  console.log('   You can create one from .env.example if needed\n');
}

// Check 3: Validate port availability
const PORT = process.env.PORT || 5000;

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

checkPort(PORT).then((isAvailable) => {
  if (isAvailable) {
    console.log(colors.green + `✅ Port ${PORT} is available` + colors.reset);
  } else {
    console.error(colors.red + `❌ Port ${PORT} is already in use!` + colors.reset);
    console.error(colors.yellow + '\n📋 To fix this:' + colors.reset);
    console.error(`  Windows: netstat -ano | findstr :${PORT}`);
    console.error(`  Mac/Linux: lsof -ti:${PORT}`);
    console.error(`  Or use: PORT=5001 npm start\n`);
    hasErrors = true;
  }
  
  // Final validation result
  console.log('\n' + '='.repeat(60));
  if (hasErrors) {
    console.error(colors.red + '❌ Validation failed! Please fix the errors above.' + colors.reset);
    console.log('='.repeat(60) + '\n');
    process.exit(1);
  } else {
    console.log(colors.green + '✅ All validation checks passed!' + colors.reset);
    console.log('='.repeat(60) + '\n');
    process.exit(0);
  }
});
