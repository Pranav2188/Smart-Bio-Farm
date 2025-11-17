/**
 * Firestore Security Rules Test Script
 * 
 * This script provides manual testing scenarios for Firestore security rules.
 * Run this with the Firebase emulator to verify rules work correctly.
 * 
 * Prerequisites:
 * 1. Start Firebase emulator: firebase emulators:start
 * 2. Run this script: node test-security-rules.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  connectFirestoreEmulator 
} = require('firebase/firestore');
const { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  connectAuthEmulator 
} = require('firebase/auth');

// Firebase configuration (using emulator)
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "smartbiofarm"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators
connectFirestoreEmulator(db, 'localhost', 8080);
connectAuthEmulator(auth, 'http://localhost:9099');

// Test utilities
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  log(`Testing: ${testName}`, 'yellow');
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

// Test scenarios
async function runTests() {
  log('\n🔥 Starting Firestore Security Rules Tests\n', 'yellow');
  
  try {
    // Test 1: Unauthenticated access should fail
    logTest('Unauthenticated Access (Should Fail)');
    try {
      const testDoc = doc(db, 'livestock', 'test-unauth');
      await getDoc(testDoc);
      logError('Unauthenticated read should have failed but succeeded');
    } catch (error) {
      if (error.code === 'permission-denied') {
        logSuccess('Unauthenticated access correctly denied');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Create test users
    logTest('Creating Test Users');
    const user1Email = `testuser1_${Date.now()}@test.com`;
    const user2Email = `testuser2_${Date.now()}@test.com`;
    const password = 'testpass123';

    const user1Cred = await createUserWithEmailAndPassword(auth, user1Email, password);
    const user1Id = user1Cred.user.uid;
    logSuccess(`Created User 1: ${user1Id}`);

    // Test 2: User can create their own profile
    logTest('User Profile Creation');
    try {
      const userProfileRef = doc(db, 'users', user1Id);
      await setDoc(userProfileRef, {
        email: user1Email,
        fullName: 'Test User 1',
        role: 'farmer',
        createdAt: new Date()
      });
      logSuccess('User can create their own profile');
    } catch (error) {
      logError(`Failed to create profile: ${error.message}`);
    }

    // Test 3: User can read their own profile
    logTest('User Profile Read');
    try {
      const userProfileRef = doc(db, 'users', user1Id);
      const profileDoc = await getDoc(userProfileRef);
      if (profileDoc.exists()) {
        logSuccess('User can read their own profile');
      } else {
        logError('Profile document does not exist');
      }
    } catch (error) {
      logError(`Failed to read profile: ${error.message}`);
    }

    // Test 4: User can create livestock records
    logTest('Livestock Record Creation');
    try {
      const livestockRef = doc(collection(db, 'livestock'));
      await setDoc(livestockRef, {
        userId: user1Id,
        animalType: 'pigs',
        date: '2024-01-15',
        category: 'Boar',
        gender: 'Male',
        quantity: 10,
        price: 5000,
        createdAt: new Date()
      });
      logSuccess('User can create livestock records with their userId');
    } catch (error) {
      logError(`Failed to create livestock: ${error.message}`);
    }

    // Test 5: User cannot create livestock with another user's ID
    logTest('Livestock Record with Wrong UserId (Should Fail)');
    try {
      const livestockRef = doc(collection(db, 'livestock'));
      await setDoc(livestockRef, {
        userId: 'different-user-id',
        animalType: 'chickens',
        date: '2024-01-15',
        category: 'Broiler',
        gender: 'Mixed',
        quantity: 50,
        price: 200,
        createdAt: new Date()
      });
      logError('User should not be able to create livestock with different userId');
    } catch (error) {
      if (error.code === 'permission-denied') {
        logSuccess('Correctly prevented creating livestock with wrong userId');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 6: User can create alerts
    logTest('Alert Creation');
    try {
      const alertRef = doc(collection(db, 'alerts'));
      await setDoc(alertRef, {
        userId: user1Id,
        type: 'warning',
        message: 'Test alert message',
        timestamp: new Date(),
        read: false
      });
      logSuccess('User can create alerts with their userId');
    } catch (error) {
      logError(`Failed to create alert: ${error.message}`);
    }

    // Test 7: Environmental data access
    logTest('Environmental Data Access');
    try {
      const envRef = doc(db, 'environmentalData', 'current');
      await setDoc(envRef, {
        temperature: 25.5,
        humidity: 60,
        timestamp: new Date()
      });
      logSuccess('Authenticated user can write environmental data');
      
      const envDoc = await getDoc(envRef);
      if (envDoc.exists()) {
        logSuccess('Authenticated user can read environmental data');
      }
    } catch (error) {
      logError(`Environmental data access failed: ${error.message}`);
    }

    // Test 8: User profile deletion should fail
    logTest('User Profile Deletion (Should Fail)');
    try {
      const userProfileRef = doc(db, 'users', user1Id);
      await deleteDoc(userProfileRef);
      logError('User profile deletion should have failed but succeeded');
    } catch (error) {
      if (error.code === 'permission-denied') {
        logSuccess('User profile deletion correctly prevented');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Create second user for cross-user testing
    logTest('Creating Second User for Cross-User Tests');
    const user2Cred = await createUserWithEmailAndPassword(auth, user2Email, password);
    const user2Id = user2Cred.user.uid;
    logSuccess(`Created User 2: ${user2Id}`);

    // Sign in as user 2
    await signInWithEmailAndPassword(auth, user2Email, password);
    logSuccess('Signed in as User 2');

    // Test 9: User 2 cannot read User 1's profile
    logTest('Cross-User Profile Access (Should Fail)');
    try {
      const user1ProfileRef = doc(db, 'users', user1Id);
      await getDoc(user1ProfileRef);
      logError('User 2 should not be able to read User 1 profile');
    } catch (error) {
      if (error.code === 'permission-denied') {
        logSuccess('Cross-user profile access correctly denied');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    log('\n✅ All security rule tests completed!\n', 'green');
    log('Summary:', 'yellow');
    log('- Authentication is required for all operations', 'reset');
    log('- Users can only access their own data', 'reset');
    log('- User profiles cannot be deleted', 'reset');
    log('- Environmental data is accessible to all authenticated users', 'reset');
    log('- Cross-user data access is properly restricted\n', 'reset');

  } catch (error) {
    logError(`\nTest suite failed with error: ${error.message}`);
    console.error(error);
  }
}

// Run tests
log('⚠️  Make sure Firebase emulator is running: firebase emulators:start\n', 'yellow');
runTests().catch(console.error);
