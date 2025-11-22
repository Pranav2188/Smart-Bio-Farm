import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);

// Initialize Firestore with offline persistence
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (error) {
  // If already initialized, get the existing instance
  console.warn("Firestore already initialized, using existing instance");
  db = getFirestore(app);
}

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase Cloud Messaging with custom service worker
let messaging = null;
let messagingInitPromise = null;

if (typeof window !== 'undefined') {
  messagingInitPromise = (async () => {
    try {
      const supported = await isSupported();
      if (!supported) {
        console.warn("Firebase Messaging not supported in this browser");
        return null;
      }

      // Register custom service worker
      const { registerServiceWorker } = await import('./registerServiceWorker');
      const registration = await registerServiceWorker();
      
      if (registration) {
        // Initialize messaging with the custom service worker
        messaging = getMessaging(app);
        console.log("Firebase Messaging initialized with custom service worker");
      }
      
      return messaging;
    } catch (err) {
      console.warn("Firebase Messaging initialization failed:", err);
      return null;
    }
  })();
}

// VAPID Key for Web Push Notifications
export const VAPID_KEY = "BKUaoqxIggTa4H3Z9WiEyYXrPDEX_dKWgZ5P3eHlifspPZR46eoyNaTUqQTJX4WQfImFEDpbBYQErb0ITcNJJt0";

// Export a function to get messaging instance after initialization
export const getMessagingInstance = async () => {
  if (messagingInitPromise) {
    return await messagingInitPromise;
  }
  return messaging;
};

export { app, auth, db, analytics, messaging };