import { messaging, VAPID_KEY } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Request notification permission and get FCM token
 * @param {string} userId - The user's UID
 * @returns {Promise<string|null>} - The FCM token or null
 */
export const requestNotificationPermission = async (userId) => {
  try {
    // Check if messaging is supported
    if (!messaging) {
      console.warn("Firebase Messaging is not supported in this browser");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      console.log("Notification permission granted");

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });

      if (token) {
        console.log("FCM Token:", token);

        // Save token to Firestore
        if (userId) {
          await saveFCMToken(userId, token);
        }

        return token;
      } else {
        console.log("No registration token available");
        return null;
      }
    } else if (permission === "denied") {
      console.log("Notification permission denied");
      return null;
    } else {
      console.log("Notification permission dismissed");
      return null;
    }
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return null;
  }
};

/**
 * Save FCM token to Firestore user document
 * @param {string} userId - The user's UID
 * @param {string} token - The FCM token
 */
export const saveFCMToken = async (userId, token) => {
  try {
    const userRef = doc(db, "users", userId);
    
    // Check if user document exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing document
      await setDoc(userRef, {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date()
      }, { merge: true });
    } else {
      // Create new document with token
      await setDoc(userRef, {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date()
      });
    }
    
    console.log("FCM token saved to Firestore");
  } catch (err) {
    console.error("Error saving FCM token:", err);
  }
};

/**
 * Setup foreground message listener
 * @param {Function} callback - Callback function to handle messages
 */
export const setupForegroundMessageListener = (callback) => {
  if (!messaging) {
    console.warn("Firebase Messaging is not supported");
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    
    // Show notification using browser API
    if (Notification.permission === "granted") {
      new Notification(payload.notification?.title || "Smart Bio Farm", {
        body: payload.notification?.body || "You have a new notification",
        icon: "/logo192.png",
        badge: "/logo192.png",
        data: payload.data
      });
    }

    // Call custom callback
    if (callback) {
      callback(payload);
    }
  });

  return unsubscribe;
};

/**
 * Check if notifications are supported and enabled
 * @returns {boolean}
 */
export const areNotificationsSupported = () => {
  return "Notification" in window && messaging !== null;
};

/**
 * Get current notification permission status
 * @returns {string} - "granted", "denied", or "default"
 */
export const getNotificationPermission = () => {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
};
