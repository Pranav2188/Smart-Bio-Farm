// Backend Firebase Connection Test
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

console.log("🔍 Testing Backend Firebase Admin SDK Connection...\n");

try {
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  const db = admin.firestore();
  
  console.log("✅ Firebase Admin SDK initialized successfully");
  console.log("✅ Project ID:", admin.app().options.projectId);
  console.log("✅ Service Account Email:", serviceAccount.client_email);
  
  // Test Firestore connection by attempting to read from users collection
  console.log("\n🔍 Testing Firestore database connection...");
  
  db.collection('users').limit(1).get()
    .then((snapshot) => {
      console.log("✅ Firestore connection successful!");
      console.log("✅ Can query database collections");
      console.log(`✅ Found ${snapshot.size} document(s) in users collection`);
      
      console.log("\n" + "=".repeat(60));
      console.log("✅ BACKEND FIREBASE CONNECTION: WORKING PERFECTLY");
      console.log("=".repeat(60));
      
      process.exit(0);
    })
    .catch((error) => {
      console.log("❌ Firestore query failed:", error.message);
      console.log("\nPossible issues:");
      console.log("- Check Firestore security rules");
      console.log("- Verify service account has proper permissions");
      process.exit(1);
    });
    
} catch (error) {
  console.log("❌ Firebase Admin SDK initialization failed");
  console.log("Error:", error.message);
  console.log("\nPossible issues:");
  console.log("- serviceAccountKey.json file is missing or invalid");
  console.log("- Firebase project configuration is incorrect");
  process.exit(1);
}
