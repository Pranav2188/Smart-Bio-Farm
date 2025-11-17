import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

// ============================================
// USER PROFILE OPERATIONS
// ============================================

/**
 * Create a new user profile in Firestore
 * @param {string} userId - Firebase Auth UID
 * @param {Object} data - User profile data (email, fullName, role)
 * @returns {Promise<void>}
 */
export const createUserProfile = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role || 'farmer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profileComplete: true
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object|null>} User profile data or null if not found
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// ============================================
// LIVESTOCK OPERATIONS
// ============================================

/**
 * Add a new livestock record
 * @param {string} userId - Owner's Firebase Auth UID
 * @param {Object} data - Livestock data (animalType, date, category, gender, quantity, price)
 * @returns {Promise<string>} Document ID of the created record
 */
export const addLivestock = async (userId, data) => {
  try {
    const livestockRef = collection(db, 'livestock');
    const docRef = await addDoc(livestockRef, {
      userId,
      animalType: data.animalType,
      date: data.date,
      category: data.category,
      gender: data.gender,
      quantity: data.quantity,
      price: data.price,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding livestock:', error);
    throw error;
  }
};

/**
 * Get livestock records for a user and animal type
 * @param {string} userId - Owner's Firebase Auth UID
 * @param {string} animalType - Type of animal ('pigs' or 'chickens')
 * @returns {Promise<Array>} Array of livestock records
 */
export const getLivestock = async (userId, animalType) => {
  try {
    const livestockRef = collection(db, 'livestock');
    const q = query(
      livestockRef,
      where('userId', '==', userId),
      where('animalType', '==', animalType),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const livestock = [];
    querySnapshot.forEach((doc) => {
      livestock.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return livestock;
  } catch (error) {
    console.error('Error getting livestock:', error);
    throw error;
  }
};

/**
 * Update an existing livestock record
 * @param {string} docId - Document ID
 * @param {Object} data - Updated livestock data
 * @returns {Promise<void>}
 */
export const updateLivestock = async (docId, data) => {
  try {
    const livestockRef = doc(db, 'livestock', docId);
    await updateDoc(livestockRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating livestock:', error);
    throw error;
  }
};

/**
 * Delete a livestock record
 * @param {string} docId - Document ID
 * @returns {Promise<void>}
 */
export const deleteLivestock = async (docId) => {
  try {
    const livestockRef = doc(db, 'livestock', docId);
    await deleteDoc(livestockRef);
  } catch (error) {
    console.error('Error deleting livestock:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time livestock updates
 * @param {string} userId - Owner's Firebase Auth UID
 * @param {string} animalType - Type of animal ('pigs' or 'chickens')
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeLivestock = (userId, animalType, callback) => {
  try {
    const livestockRef = collection(db, 'livestock');
    const q = query(
      livestockRef,
      where('userId', '==', userId),
      where('animalType', '==', animalType),
      orderBy('date', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const livestock = [];
      querySnapshot.forEach((doc) => {
        livestock.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(livestock);
    }, (error) => {
      console.error('Error in livestock subscription:', error);
      callback([], error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to livestock:', error);
    throw error;
  }
};

// ============================================
// ENVIRONMENTAL DATA OPERATIONS
// ============================================

/**
 * Get current environmental data
 * @returns {Promise<Object|null>} Environmental data or null if not found
 */
export const getEnvironmentalData = async () => {
  try {
    const envRef = doc(db, 'environmentalData', 'current');
    const envSnap = await getDoc(envRef);
    
    if (envSnap.exists()) {
      return {
        id: envSnap.id,
        ...envSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting environmental data:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time environmental data updates
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeEnvironmentalData = (callback) => {
  try {
    const envRef = doc(db, 'environmentalData', 'current');
    
    const unsubscribe = onSnapshot(envRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error in environmental data subscription:', error);
      callback(null, error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to environmental data:', error);
    throw error;
  }
};

/**
 * Update environmental data (typically called by sensors or admin)
 * @param {Object} data - Environmental data (temperature, humidity, location, sensorId)
 * @returns {Promise<void>}
 */
export const updateEnvironmentalData = async (data) => {
  try {
    const envRef = doc(db, 'environmentalData', 'current');
    await setDoc(envRef, {
      temperature: data.temperature,
      humidity: data.humidity,
      location: data.location || '',
      sensorId: data.sensorId || '',
      timestamp: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating environmental data:', error);
    throw error;
  }
};

// ============================================
// ALERTS OPERATIONS
// ============================================

/**
 * Add a new alert
 * @param {string} userId - User who creates/receives the alert
 * @param {Object} data - Alert data (type, message, priority)
 * @returns {Promise<string>} Document ID of the created alert
 */
export const addAlert = async (userId, data) => {
  try {
    const alertsRef = collection(db, 'alerts');
    const docRef = await addDoc(alertsRef, {
      userId,
      type: data.type || 'info',
      message: data.message,
      priority: data.priority || 3,
      read: false,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding alert:', error);
    throw error;
  }
};

/**
 * Get alerts for a user
 * @param {string} userId - User's Firebase Auth UID
 * @returns {Promise<Array>} Array of alerts ordered by timestamp (newest first)
 */
export const getAlerts = async (userId) => {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(
      alertsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const alerts = [];
    querySnapshot.forEach((doc) => {
      alerts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return alerts;
  } catch (error) {
    console.error('Error getting alerts:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time alerts updates
 * @param {string} userId - User's Firebase Auth UID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeAlerts = (userId, callback) => {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(
      alertsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const alerts = [];
      querySnapshot.forEach((doc) => {
        alerts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(alerts);
    }, (error) => {
      console.error('Error in alerts subscription:', error);
      callback([], error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to alerts:', error);
    throw error;
  }
};
