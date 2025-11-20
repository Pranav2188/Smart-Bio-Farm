import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signUp as authSignUp, 
  signIn as authSignIn, 
  signOut as authSignOut,
  onAuthStateChanged 
} from '../firebase/authService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { requestNotificationPermission, setupForegroundMessageListener } from '../services/notificationService';

// Create the Authentication Context
const AuthContext = createContext({});

/**
 * Custom hook to use the Auth Context
 * @returns {Object} Auth context value with user state and auth functions
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider component that wraps the app and provides authentication state
 * Handles authentication state persistence across page refreshes
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user profile from Firestore
   * @param {string} userId - Firebase Auth user ID
   */
  const fetchUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        console.error('User profile not found');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  /**
   * Sign up a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} fullName - User's full name
   * @param {string} role - User's role
   * @param {Object} additionalData - Additional user data (e.g., department, region for government)
   */
  const signUp = async (email, password, fullName, role, additionalData = {}) => {
    const user = await authSignUp(email, password, fullName, role, additionalData);
    // Profile is created in authService, fetch it
    await fetchUserProfile(user.uid);
    return user;
  };

  /**
   * Sign in an existing user
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const signIn = async (email, password) => {
    const user = await authSignIn(email, password);
    // Fetch user profile after sign in
    await fetchUserProfile(user.uid);
    return user;
  };

  /**
   * Sign out the current user
   * Clears all cached user data from local state
   */
  const signOut = async () => {
    await authSignOut();
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Set up authentication state listener on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // User is signed in, fetch their profile
        await fetchUserProfile(user.uid);
        
        // Request notification permission for logged-in users
        // Wait a bit to avoid overwhelming the user immediately after login
        setTimeout(() => {
          requestNotificationPermission(user.uid).catch(err => {
            console.error("Failed to request notification permission:", err);
          });
        }, 2000);
      } else {
        // User is signed out, clear profile
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Set up foreground message listener
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = setupForegroundMessageListener((payload) => {
      console.log("Received foreground notification:", payload);
      // You can add custom handling here, like showing a toast
    });

    return unsubscribe;
  }, [currentUser]);

  const value = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
