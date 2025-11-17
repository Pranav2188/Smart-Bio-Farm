# Firestore Security Rules - Quick Start Guide

## 📋 Overview

This project includes Firestore security rules that protect user data and ensure proper authentication and authorization for all database operations.

## 🚀 Quick Deployment

### Option 1: Deploy Rules Only
```bash
npm run deploy:rules
```

### Option 2: Deploy Rules and Indexes
```bash
npm run deploy:firestore
```

## 🧪 Testing Security Rules

### Step 1: Start Firebase Emulator
```bash
npm run emulators
```

This will start:
- Firestore Emulator on http://localhost:8080
- Emulator UI on http://localhost:4000

### Step 2: Run Automated Tests (Optional)
```bash
npm run test:security
```

This runs the test script that verifies:
- ✅ Unauthenticated access is denied
- ✅ Users can only access their own data
- ✅ User profiles cannot be deleted
- ✅ Environmental data is shared among authenticated users
- ✅ Cross-user data access is blocked

### Step 3: Manual Testing via Emulator UI

1. Open http://localhost:4000 in your browser
2. Navigate to the Firestore tab
3. Try creating documents with different user IDs
4. Verify access restrictions work as expected

## 📁 Files Created

| File | Purpose |
|------|---------|
| `firestore.rules` | Security rules for Firestore database |
| `firestore.indexes.json` | Composite indexes for optimized queries |
| `firebase.json` | Firebase project configuration |
| `.firebaserc` | Firebase project selection |
| `test-security-rules.js` | Automated security testing script |
| `FIRESTORE_SECURITY_DEPLOYMENT.md` | Detailed deployment guide |

## 🔒 Security Rules Summary

### Users Collection (`/users/{userId}`)
- ✅ Users can read their own profile
- ✅ Users can create their own profile (userId must match auth.uid)
- ✅ Users can update their own profile
- ❌ Users cannot delete profiles
- ❌ Users cannot access other users' profiles

### Livestock Collection (`/livestock/{docId}`)
- ✅ Users can read their own livestock records
- ✅ Users can create livestock records (userId must match auth.uid)
- ✅ Users can update their own livestock records
- ✅ Users can delete their own livestock records
- ❌ Users cannot access other users' livestock

### Environmental Data Collection (`/environmentalData/{docId}`)
- ✅ All authenticated users can read environmental data
- ✅ All authenticated users can write environmental data
- ⚠️ In production, restrict write access to admin/sensor roles

### Alerts Collection (`/alerts/{docId}`)
- ✅ Users can read their own alerts
- ✅ Users can create alerts (userId must match auth.uid)
- ✅ Users can update their own alerts
- ✅ Users can delete their own alerts
- ❌ Users cannot access other users' alerts

## 🎯 Requirements Satisfied

This implementation satisfies requirements:
- **7.3**: Users can only access their own data
- **7.4**: Unauthorized access attempts return permission errors
- **7.5**: All operations require authentication

## 📝 Deployment Checklist

Before deploying to production:

- [ ] Test rules with Firebase Emulator
- [ ] Run automated security tests
- [ ] Verify authentication is working in the app
- [ ] Test with multiple user accounts
- [ ] Verify data isolation between users
- [ ] Check Firebase Console for rule syntax errors
- [ ] Deploy rules: `npm run deploy:rules`
- [ ] Deploy indexes: `npm run deploy:indexes`
- [ ] Verify deployment in Firebase Console
- [ ] Test production app with real users

## 🔧 Troubleshooting

### "Permission Denied" Errors
- Ensure user is authenticated
- Verify userId in documents matches auth.uid
- Check that rules are deployed correctly

### Rules Not Updating
- Clear browser cache
- Re-deploy: `npm run deploy:rules`
- Check Firebase Console for errors

### Emulator Issues
- Ensure ports 8080 and 4000 are available
- Restart emulator: `npm run emulators`
- Check firewall settings

## 📚 Additional Resources

- [Firebase Security Rules Docs](https://firebase.google.com/docs/firestore/security/get-started)
- [Testing Security Rules](https://firebase.google.com/docs/rules/unit-tests)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

## 🆘 Need Help?

Refer to `FIRESTORE_SECURITY_DEPLOYMENT.md` for detailed instructions and troubleshooting steps.
