import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Backend URL - uses Render in production, localhost in development
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://trip-defender-backend.onrender.com'
    : 'http://localhost:5000');

/**
 * Send notification via backend server (if available) or log for manual handling
 * @param {string} endpoint - Backend endpoint path
 * @param {Object} payload - Notification payload
 * @returns {Promise<Object>} - Result object with success status
 */
const sendViaBackend = async (endpoint, payload) => {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      return { success: false, error: 'Backend returned error' };
    }
  } catch (error) {
    // Backend not available - this is okay
    console.log('Backend notification service not available, using fallback');
    return { success: false, error: error.message, backendUnavailable: true };
  }
};

/**
 * Get FCM tokens for users matching a query
 * @param {string} collectionName - Firestore collection name
 * @param {Object} queryConstraints - Query constraints
 * @returns {Promise<Array>} - Array of FCM tokens
 */
const getTokensForUsers = async (collectionName, queryConstraints = null) => {
  try {
    let q;
    if (queryConstraints) {
      q = query(collection(db, collectionName), ...queryConstraints);
    } else {
      q = query(collection(db, collectionName));
    }
    
    const snapshot = await getDocs(q);
    const tokens = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });
    
    return tokens;
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return [];
  }
};

/**
 * Notify all farmers about a new alert
 * @param {Object} alertData - Alert information
 * @returns {Promise<Object>} - Notification result
 */
export const notifyFarmersNewAlert = async (alertData) => {
  const { alertType, alertMessage, createdByName } = alertData;
  
  // Try backend first
  const backendResult = await sendViaBackend('/notify-farmers-new-alert', {
    alertType,
    alertMessage,
    createdByName
  });
  
  if (backendResult.success) {
    console.log(`Alert notification sent to ${backendResult.data.successCount} farmers via backend`);
    return { success: true, method: 'backend', count: backendResult.data.successCount };
  }
  
  // Backend unavailable - get tokens for direct notification (future enhancement)
  if (backendResult.backendUnavailable) {
    const tokens = await getTokensForUsers('users', [where('role', '==', 'farmer')]);
    console.log(`Backend unavailable. Found ${tokens.length} farmer tokens for future direct notification`);
    
    // Note: Direct FCM sending requires Firebase Admin SDK on backend
    // For now, we just log this. In production, you'd need a cloud function
    return { 
      success: false, 
      method: 'fallback', 
      message: 'Backend unavailable. Notifications will be sent when users open the app.',
      tokenCount: tokens.length 
    };
  }
  
  return { success: false, error: backendResult.error };
};

/**
 * Notify all veterinarians about a new request
 * @param {Object} requestData - Request information
 * @returns {Promise<Object>} - Notification result
 */
export const notifyVetsNewRequest = async (requestData) => {
  const { requestId, animalType, category, farmerName, symptoms, urgency } = requestData;
  
  // Try backend first
  const backendResult = await sendViaBackend('/notify-vets-new-request', {
    requestId: requestId || 'unknown',
    animalType: animalType || 'animal',
    category: category || symptoms || urgency || 'treatment needed'
  });
  
  if (backendResult.success) {
    console.log(`Request notification sent to ${backendResult.data.successCount} vets via backend`);
    return { success: true, method: 'backend', count: backendResult.data.successCount };
  }
  
  // Backend unavailable
  if (backendResult.backendUnavailable) {
    const tokens = await getTokensForUsers('users', [where('role', '==', 'veterinarian')]);
    console.log(`Backend unavailable. Found ${tokens.length} vet tokens for future direct notification`);
    
    return { 
      success: false, 
      method: 'fallback', 
      message: 'Backend unavailable. Vets will see the request when they open the app.',
      tokenCount: tokens.length 
    };
  }
  
  return { success: false, error: backendResult.error };
};

/**
 * Notify a specific farmer about treatment update
 * @param {Object} treatmentData - Treatment information
 * @returns {Promise<Object>} - Notification result
 */
export const notifyFarmerTreatment = async (treatmentData) => {
  const { farmerName, vetName, animalType, diagnosis, treatment } = treatmentData;
  
  // Try backend first
  const backendResult = await sendViaBackend('/notify-farmer-treatment', {
    farmerName,
    vetName,
    animalType,
    diagnosis,
    treatment
  });
  
  if (backendResult.success) {
    console.log('Treatment notification sent to farmer via backend');
    return { success: true, method: 'backend' };
  }
  
  // Backend unavailable
  if (backendResult.backendUnavailable) {
    console.log('Backend unavailable. Farmer will see treatment update when they open the app.');
    
    return { 
      success: false, 
      method: 'fallback', 
      message: 'Backend unavailable. Farmer will see the update when they open the app.'
    };
  }
  
  return { success: false, error: backendResult.error };
};

/**
 * Check if backend notification service is available
 * @returns {Promise<boolean>}
 */
export const isBackendAvailable = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
