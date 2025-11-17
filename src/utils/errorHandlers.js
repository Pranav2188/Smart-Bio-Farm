/**
 * Error message mappings for Firebase Authentication errors
 */
export const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use': 'This email is already registered',
  'auth/invalid-email': 'Invalid email address',
  'auth/weak-password': 'Password should be at least 6 characters',
  'auth/user-not-found': 'No account found with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/network-request-failed': 'Network error. Please check your connection',
  'auth/too-many-requests': 'Too many attempts. Please try again later',
  'auth/user-disabled': 'This account has been disabled',
  'auth/operation-not-allowed': 'This operation is not allowed',
  'auth/invalid-credential': 'Invalid credentials provided',
  'auth/requires-recent-login': 'Please log in again to continue',
};

/**
 * Error message mappings for Firestore errors
 */
export const FIRESTORE_ERROR_MESSAGES = {
  'permission-denied': 'You do not have permission to access this data',
  'not-found': 'Requested data not found',
  'already-exists': 'This record already exists',
  'unavailable': 'Service temporarily unavailable. Please try again',
  'unauthenticated': 'Please log in to continue',
  'cancelled': 'Operation was cancelled',
  'unknown': 'An unknown error occurred',
  'invalid-argument': 'Invalid data provided',
  'deadline-exceeded': 'Request timeout. Please try again',
  'resource-exhausted': 'Too many requests. Please try again later',
  'failed-precondition': 'Operation cannot be completed at this time',
  'aborted': 'Operation was aborted. Please try again',
  'out-of-range': 'Value is out of valid range',
  'unimplemented': 'This feature is not yet implemented',
  'internal': 'Internal server error. Please try again',
  'data-loss': 'Data loss detected. Please contact support',
};

/**
 * Get user-friendly error message for Firebase Authentication errors
 * @param {Error} error - Firebase authentication error
 * @returns {string} User-friendly error message
 */
export const getAuthErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  const errorCode = error.code || '';
  return AUTH_ERROR_MESSAGES[errorCode] || error.message || 'Authentication failed. Please try again';
};

/**
 * Get user-friendly error message for Firestore errors
 * @param {Error} error - Firestore error
 * @returns {string} User-friendly error message
 */
export const getFirestoreErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  const errorCode = error.code || '';
  return FIRESTORE_ERROR_MESSAGES[errorCode] || error.message || 'Database operation failed. Please try again';
};

/**
 * Generic error handler that determines error type and returns appropriate message
 * @param {Error} error - Any Firebase error
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  const errorCode = error.code || '';
  
  // Check if it's an auth error
  if (errorCode.startsWith('auth/')) {
    return getAuthErrorMessage(error);
  }
  
  // Check if it's a Firestore error
  if (FIRESTORE_ERROR_MESSAGES[errorCode]) {
    return getFirestoreErrorMessage(error);
  }
  
  // Return generic message
  return error.message || 'An error occurred. Please try again';
};
