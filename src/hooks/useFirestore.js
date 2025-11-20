import { useState, useEffect, useCallback } from 'react';
import {
  addLivestock,
  updateLivestock,
  deleteLivestock,
  subscribeLivestock,
  subscribeEnvironmentalData,
  addAlert,
  subscribeAlerts
} from '../firebase/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Custom hook for livestock CRUD operations with real-time updates
 * Supports offline mode by showing cached data
 * @param {string} animalType - Type of animal ('pigs' or 'chickens')
 * @returns {Object} Livestock data, loading state, error, and CRUD functions
 */
export const useLivestock = (animalType) => {
  const { currentUser } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    if (!currentUser || !animalType) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates
    // Firestore automatically serves cached data when offline
    const unsubscribe = subscribeLivestock(
      currentUser.uid,
      animalType,
      (livestockData, err) => {
        if (err) {
          // If offline, keep showing cached data
          if (!isOnline && data.length > 0) {
            setIsFromCache(true);
            setLoading(false);
          } else {
            setError(err.message || 'Failed to load livestock data');
            setLoading(false);
          }
        } else {
          setData(livestockData);
          setIsFromCache(!isOnline);
          setLoading(false);
        }
      }
    );

    // Cleanup listener on unmount or when dependencies change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, animalType, isOnline]);

  // Add new livestock record
  const add = useCallback(async (livestockData) => {
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    try {
      const docId = await addLivestock(currentUser.uid, {
        ...livestockData,
        animalType
      });
      return docId;
    } catch (err) {
      setError(err.message || 'Failed to add livestock');
      throw err;
    }
  }, [currentUser, animalType]);

  // Update existing livestock record
  const update = useCallback(async (docId, livestockData) => {
    try {
      await updateLivestock(docId, livestockData);
    } catch (err) {
      setError(err.message || 'Failed to update livestock');
      throw err;
    }
  }, []);

  // Delete livestock record
  const remove = useCallback(async (docId) => {
    try {
      await deleteLivestock(docId);
    } catch (err) {
      setError(err.message || 'Failed to delete livestock');
      throw err;
    }
  }, []);

  return {
    data,
    loading,
    error,
    isFromCache,
    add,
    update,
    delete: remove
  };
};

/**
 * Custom hook for real-time environmental data
 * Supports offline mode by showing cached data
 * @returns {Object} Environmental data, loading state, and error
 */
export const useEnvironmentalData = () => {
  const { isOnline } = useNetworkStatus();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Subscribe to real-time environmental data updates
    // Firestore automatically serves cached data when offline
    const unsubscribe = subscribeEnvironmentalData((envData, err) => {
      if (err) {
        // If offline, keep showing cached data
        if (!isOnline && data) {
          setIsFromCache(true);
          setLoading(false);
        } else {
          setError(err.message || 'Failed to load environmental data');
          setLoading(false);
        }
      } else {
        setData(envData);
        setIsFromCache(!isOnline);
        setLoading(false);
      }
    });

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  return {
    data,
    loading,
    error,
    isFromCache
  };
};

/**
 * Custom hook for global alert management with real-time updates
 * Alerts are shared across all farmers
 * Supports offline mode by showing cached data
 * @returns {Object} Alerts data, loading state, error, and addAlert function
 */
export const useAlerts = () => {
  const { currentUser } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Subscribe to real-time global alerts updates
    // Firestore automatically serves cached data when offline
    const unsubscribe = subscribeAlerts(
      (alertsData, err) => {
        if (err) {
          // If offline, keep showing cached data
          if (!isOnline && alerts.length > 0) {
            setIsFromCache(true);
            setLoading(false);
          } else {
            setError(err.message || 'Failed to load alerts');
            setLoading(false);
          }
        } else {
          setAlerts(alertsData);
          setIsFromCache(!isOnline);
          setLoading(false);
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // Add new alert with user info
  const addNewAlert = useCallback(async (alertData) => {
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }

    try {
      const docId = await addAlert(currentUser.uid, {
        ...alertData,
        createdByName: currentUser.displayName || currentUser.email || 'Unknown User'
      });
      return docId;
    } catch (err) {
      setError(err.message || 'Failed to add alert');
      throw err;
    }
  }, [currentUser]);

  return {
    alerts,
    loading,
    error,
    isFromCache,
    addAlert: addNewAlert
  };
};
