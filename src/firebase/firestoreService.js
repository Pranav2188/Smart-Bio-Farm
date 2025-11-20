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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

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
 * Add a new alert (shared across all farmers)
 * @param {string} userId - User who creates the alert
 * @param {Object} data - Alert data (type, message, priority, createdBy)
 * @returns {Promise<string>} Document ID of the created alert
 */
export const addAlert = async (userId, data) => {
  try {
    const alertsRef = collection(db, 'alerts');
    const docRef = await addDoc(alertsRef, {
      createdBy: userId,
      createdByName: data.createdByName || 'Unknown User',
      type: data.type || 'info',
      message: data.message,
      priority: data.priority || 3,
      isGlobal: true, // Make alerts visible to all farmers
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding alert:', error);
    throw error;
  }
};

/**
 * Get all global alerts (visible to all farmers)
 * @returns {Promise<Array>} Array of alerts ordered by timestamp (newest first)
 */
export const getAlerts = async () => {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(
      alertsRef,
      where('isGlobal', '==', true),
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
 * Subscribe to real-time global alerts updates (visible to all farmers)
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeAlerts = (callback) => {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(
      alertsRef,
      where('isGlobal', '==', true),
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

// ============================================
// SHARED ANIMALS COLLECTION OPERATIONS
// ============================================

/**
 * Add a new animal to the shared animals collection
 * @param {string} ownerId - Farmer's Firebase Auth UID
 * @param {Object} data - Animal data (type, category, gender, quantity, price, date, healthStatus)
 * @returns {Promise<string>} Document ID of the created animal
 */
export const addAnimal = async (ownerId, data) => {
  try {
    const animalsRef = collection(db, 'animals');
    const docRef = await addDoc(animalsRef, {
      ownerId,
      type: data.type,
      category: data.category || '',
      gender: data.gender || '',
      quantity: data.quantity,
      price: data.price,
      date: data.date,
      healthStatus: data.healthStatus || 'Healthy',
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding animal:', error);
    throw error;
  }
};

/**
 * Get animals for a specific farmer
 * @param {string} ownerId - Farmer's Firebase Auth UID
 * @param {string} type - Optional animal type filter ('pigs', 'chickens', etc.)
 * @returns {Promise<Array>} Array of animal records
 */
export const getAnimals = async (ownerId, type = null) => {
  try {
    const animalsRef = collection(db, 'animals');
    let q;
    
    if (type) {
      q = query(
        animalsRef,
        where('ownerId', '==', ownerId),
        where('type', '==', type),
        orderBy('date', 'desc')
      );
    } else {
      q = query(
        animalsRef,
        where('ownerId', '==', ownerId),
        orderBy('date', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const animals = [];
    querySnapshot.forEach((doc) => {
      animals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return animals;
  } catch (error) {
    console.error('Error getting animals:', error);
    throw error;
  }
};

/**
 * Get all animals (for veterinarians to view all farmers' animals)
 * @param {string} type - Optional animal type filter
 * @returns {Promise<Array>} Array of all animal records
 */
export const getAllAnimals = async (type = null) => {
  try {
    const animalsRef = collection(db, 'animals');
    let q;
    
    if (type) {
      q = query(
        animalsRef,
        where('type', '==', type),
        orderBy('lastUpdated', 'desc')
      );
    } else {
      q = query(
        animalsRef,
        orderBy('lastUpdated', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const animals = [];
    querySnapshot.forEach((doc) => {
      animals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return animals;
  } catch (error) {
    console.error('Error getting all animals:', error);
    throw error;
  }
};

/**
 * Update an existing animal record
 * @param {string} docId - Document ID
 * @param {Object} data - Updated animal data
 * @returns {Promise<void>}
 */
export const updateAnimal = async (docId, data) => {
  try {
    const animalRef = doc(db, 'animals', docId);
    await updateDoc(animalRef, {
      ...data,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating animal:', error);
    throw error;
  }
};

/**
 * Delete an animal record
 * @param {string} docId - Document ID
 * @returns {Promise<void>}
 */
export const deleteAnimal = async (docId) => {
  try {
    const animalRef = doc(db, 'animals', docId);
    await deleteDoc(animalRef);
  } catch (error) {
    console.error('Error deleting animal:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time animal updates for a specific farmer
 * @param {string} ownerId - Farmer's Firebase Auth UID
 * @param {string} type - Optional animal type filter
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeAnimals = (ownerId, type, callback) => {
  try {
    const animalsRef = collection(db, 'animals');
    let q;
    
    if (type) {
      q = query(
        animalsRef,
        where('ownerId', '==', ownerId),
        where('type', '==', type),
        orderBy('date', 'desc')
      );
    } else {
      q = query(
        animalsRef,
        where('ownerId', '==', ownerId),
        orderBy('date', 'desc')
      );
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const animals = [];
      querySnapshot.forEach((doc) => {
        animals.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(animals);
    }, (error) => {
      console.error('Error in animals subscription:', error);
      callback([], error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to animals:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for all animals (for veterinarians)
 * @param {string} type - Optional animal type filter
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeAllAnimals = (type, callback) => {
  try {
    const animalsRef = collection(db, 'animals');
    let q;
    
    if (type) {
      q = query(
        animalsRef,
        where('type', '==', type),
        orderBy('lastUpdated', 'desc')
      );
    } else {
      q = query(
        animalsRef,
        orderBy('lastUpdated', 'desc')
      );
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const animals = [];
      querySnapshot.forEach((doc) => {
        animals.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(animals);
    }, (error) => {
      console.error('Error in all animals subscription:', error);
      callback([], error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to all animals:', error);
    throw error;
  }
};

// ============================================
// VET REPORTS OPERATIONS
// ============================================

/**
 * Add a new vet report
 * @param {string} vetId - Veterinarian's Firebase Auth UID
 * @param {Object} data - Report data (animalId, farmerId, animalType, symptoms, medicine, dose, nextVisit, notes)
 * @returns {Promise<string>} Document ID of the created report
 */
export const addVetReport = async (vetId, data) => {
  try {
    const reportsRef = collection(db, 'vetReports');
    const docRef = await addDoc(reportsRef, {
      vetId,
      animalId: data.animalId,
      farmerId: data.farmerId,
      animalType: data.animalType,
      symptoms: data.symptoms,
      medicine: data.medicine || '',
      dose: data.dose || '',
      nextVisit: data.nextVisit || '',
      notes: data.notes || '',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding vet report:', error);
    throw error;
  }
};

/**
 * Get vet reports for a specific animal
 * @param {string} animalId - Animal document ID
 * @returns {Promise<Array>} Array of vet reports
 */
export const getVetReports = async (animalId) => {
  try {
    const reportsRef = collection(db, 'vetReports');
    const q = query(
      reportsRef,
      where('animalId', '==', animalId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return reports;
  } catch (error) {
    console.error('Error getting vet reports:', error);
    throw error;
  }
};

/**
 * Get all vet reports for a farmer
 * @param {string} farmerId - Farmer's Firebase Auth UID
 * @returns {Promise<Array>} Array of vet reports
 */
export const getFarmerVetReports = async (farmerId) => {
  try {
    const reportsRef = collection(db, 'vetReports');
    const q = query(
      reportsRef,
      where('farmerId', '==', farmerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return reports;
  } catch (error) {
    console.error('Error getting farmer vet reports:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time vet reports for a farmer
 * @param {string} farmerId - Farmer's Firebase Auth UID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeVetReports = (farmerId, callback) => {
  try {
    const reportsRef = collection(db, 'vetReports');
    const q = query(
      reportsRef,
      where('farmerId', '==', farmerId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reports = [];
      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(reports);
    }, (error) => {
      console.error('Error in vet reports subscription:', error);
      callback([], error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to vet reports:', error);
    throw error;
  }
};
