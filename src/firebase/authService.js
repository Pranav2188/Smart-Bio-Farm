import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Sign up a new user with email and password
 * Creates both Firebase Auth account and Firestore user profile
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} fullName - User's full name
 * @param {string} role - User's role (farmer, veterinarian, government)
 * @param {Object} additionalData - Additional user data (e.g., department, region)
 * @returns {Promise<Object>} User object with profile data
 */
export const signUp = async (email, password, fullName, role = 'farmer', additionalData = {}) => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile document in Firestore
    const userProfile = {
      userId: user.uid,
      email: email,
      fullName: fullName,
      role: role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profileComplete: true,
      ...additionalData // Spread additional data (department, region, etc.)
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    return {
      uid: user.uid,
      email: user.email,
      fullName: fullName,
      role: role,
      ...additionalData
    };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Sign in an existing user with email and password
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object from Firebase Auth
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * Terminates the active user session
 * 
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get the currently authenticated user
 * 
 * @returns {Object|null} Current user object or null if not authenticated
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listen for authentication state changes
 * 
 * @param {Function} callback - Callback function to execute when auth state changes
 * @returns {Function} Unsubscribe function to stop listening
 */
export const onAuthStateChanged = (callback) => {
  return firebaseOnAuthStateChanged(auth, callback);
};
