# Firestore Security Rules Deployment Guide

This guide provides instructions for testing and deploying the Firestore security rules for the Smart Bio Farm application.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project configured (smartbiofarm)
- Node.js and npm installed

## Security Rules Overview

The `firestore.rules` file contains security rules that:

1. **Require authentication** for all database operations
2. **Isolate user data** - users can only access their own documents
3. **Prevent user deletion** - user profiles cannot be deleted
4. **Allow shared environmental data** - all authenticated users can read sensor data
5. **Enforce ownership** - livestock and alerts are tied to specific users

## Step 1: Install Firebase CLI

If you haven't already installed the Firebase CLI:

```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication.

## Step 3: Initialize Firebase (if not already done)

If you haven't initialized Firebase in this project:

```bash
firebase init
```

Select:
- Firestore: Configure security rules and indexes files
- Choose your existing project: smartbiofarm
- Accept default firestore.rules file location
- Accept default firestore.indexes.json file location

## Step 4: Test Security Rules with Firebase Emulator

### Install Firebase Emulator Suite

```bash
firebase init emulators
```

Select Firestore emulator and accept default ports.

### Start the Emulator

```bash
firebase emulators:start
```

The emulator will run at:
- Firestore Emulator: http://localhost:8080
- Emulator UI: http://localhost:4000

### Manual Testing Scenarios

With the emulator running, you can test the security rules:

#### Test 1: Unauthenticated Access (Should Fail)
Try to read/write data without authentication - should be denied.

#### Test 2: User Profile Access
- Create a user profile with userId matching auth.uid - should succeed
- Try to read another user's profile - should fail
- Try to delete a user profile - should fail

#### Test 3: Livestock Records
- Create livestock record with userId matching auth.uid - should succeed
- Try to read another user's livestock - should fail
- Update own livestock record - should succeed
- Delete own livestock record - should succeed

#### Test 4: Environmental Data
- Any authenticated user can read environmental data - should succeed
- Any authenticated user can write environmental data - should succeed

#### Test 5: Alerts
- Create alert with userId matching auth.uid - should succeed
- Try to read another user's alerts - should fail
- Update own alert - should succeed
- Delete own alert - should succeed

## Step 5: Deploy Security Rules to Production

Once testing is complete and rules are verified:

```bash
firebase deploy --only firestore:rules
```

This command will:
1. Upload the firestore.rules file to your Firebase project
2. Apply the rules to your production Firestore database
3. Display a success message with deployment details

## Step 6: Verify Deployment

After deployment, verify the rules are active:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project (smartbiofarm)
3. Navigate to Firestore Database > Rules
4. Verify the rules match your local firestore.rules file
5. Check the "Published" timestamp

## Step 7: Test in Production

Test the deployed rules with your application:

1. **Test Authentication Requirement**
   - Try accessing data without logging in - should redirect to login
   - Log in and verify data loads correctly

2. **Test Data Isolation**
   - Create two test accounts
   - Add livestock/alerts to each account
   - Verify each user only sees their own data

3. **Test Environmental Data Sharing**
   - Verify all authenticated users can see environmental data
   - Test real-time updates work correctly

4. **Test User Profile Protection**
   - Verify users can read/update their own profile
   - Verify users cannot delete their profile
   - Verify users cannot access other profiles

## Automated Testing with Firebase Emulator

You can also create automated tests for security rules. Create a file `firestore.test.js`:

```javascript
const firebase = require('@firebase/testing');
const fs = require('fs');

const PROJECT_ID = 'smartbiofarm-test';
const RULES = fs.readFileSync('firestore.rules', 'utf8');

describe('Firestore Security Rules', () => {
  let db;
  
  beforeAll(async () => {
    await firebase.loadFirestoreRules({
      projectId: PROJECT_ID,
      rules: RULES
    });
  });
  
  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });
  
  test('Unauthenticated users cannot read data', async () => {
    db = firebase.initializeTestApp({ projectId: PROJECT_ID }).firestore();
    const doc = db.collection('livestock').doc('test');
    await firebase.assertFails(doc.get());
  });
  
  test('Users can only read their own livestock', async () => {
    const userId = 'user123';
    db = firebase.initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid: userId }
    }).firestore();
    
    // Should succeed - own data
    const ownDoc = db.collection('livestock').doc('test1');
    await firebase.assertSucceeds(
      ownDoc.set({ userId: userId, animalType: 'pigs' })
    );
    
    // Should fail - other user's data
    const otherDoc = db.collection('livestock').doc('test2');
    await firebase.assertFails(
      otherDoc.set({ userId: 'otherUser', animalType: 'pigs' })
    );
  });
});
```

Run tests with:
```bash
npm test -- firestore.test.js
```

## Troubleshooting

### Issue: "Permission Denied" errors in production

**Solution**: Verify that:
1. Users are properly authenticated
2. The userId field in documents matches the authenticated user's UID
3. Security rules are deployed correctly

### Issue: Rules not updating

**Solution**: 
1. Clear browser cache
2. Re-deploy rules: `firebase deploy --only firestore:rules`
3. Check Firebase Console for rule syntax errors

### Issue: Emulator not starting

**Solution**:
1. Check if ports 8080 and 4000 are available
2. Kill any processes using those ports
3. Restart the emulator

## Security Best Practices

1. **Never disable security rules** in production
2. **Test rules thoroughly** before deploying
3. **Use the principle of least privilege** - only grant necessary permissions
4. **Regularly audit rules** for security vulnerabilities
5. **Monitor Firebase Console** for unauthorized access attempts
6. **Keep rules version controlled** in your repository

## Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Security Rules Testing](https://firebase.google.com/docs/rules/unit-tests)

## Requirements Satisfied

This implementation satisfies the following requirements:

- **7.3**: Firestore security rules enforce that users can only access their own data
- **7.4**: Users attempting to access another user's data receive authorization errors
- **7.5**: All read and write operations require authentication

