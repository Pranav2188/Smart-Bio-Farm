#!/usr/bin/env node

/**
 * Helper script to prepare Firebase service account for Render deployment
 * This reads your serviceAccountKey.json and outputs it as a single-line JSON string
 * that you can copy-paste into Render's environment variables
 */

const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

console.log('\n' + '='.repeat(70));
console.log('🔧 Preparing Firebase Service Account for Render Deployment');
console.log('='.repeat(70) + '\n');

try {
  // Check if file exists
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Error: serviceAccountKey.json not found!');
    console.error('\n📋 To fix this:');
    console.error('1. Go to Firebase Console → Project Settings → Service Accounts');
    console.error('2. Click "Generate new private key"');
    console.error('3. Save the file as "serviceAccountKey.json" in the backend folder\n');
    process.exit(1);
  }

  // Read and parse the file
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  // Validate it has required fields
  const requiredFields = ['project_id', 'private_key', 'client_email'];
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);

  if (missingFields.length > 0) {
    console.error('❌ Error: Invalid service account file!');
    console.error(`Missing fields: ${missingFields.join(', ')}\n`);
    process.exit(1);
  }

  // Convert to single-line JSON string
  const jsonString = JSON.stringify(serviceAccount);

  console.log('✅ Service account file is valid!\n');
  console.log('📋 Copy the text below and paste it into Render:');
  console.log('   Environment Variable Name: FIREBASE_SERVICE_ACCOUNT');
  console.log('   Environment Variable Value: (paste the text below)\n');
  console.log('─'.repeat(70));
  console.log(jsonString);
  console.log('─'.repeat(70) + '\n');

  console.log('💡 Tips:');
  console.log('   • Copy the ENTIRE text (including curly braces)');
  console.log('   • Make sure there are no extra spaces or line breaks');
  console.log('   • In Render, this should be a single line\n');

  // Also save to a file for easy copying
  const outputPath = path.join(__dirname, 'firebase-credentials-for-render.txt');
  fs.writeFileSync(outputPath, jsonString);
  console.log(`✅ Also saved to: ${outputPath}`);
  console.log('   You can open this file and copy from there\n');

  console.log('='.repeat(70) + '\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
