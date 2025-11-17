import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * OfflineIndicator component displays network status
 * Shows offline banner when network is unavailable
 * Shows sync message when connection is restored
 */
const OfflineIndicator = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showSyncMessage, setShowSyncMessage] = useState(false);

  useEffect(() => {
    // Show sync message when coming back online
    if (isOnline && wasOffline) {
      setShowSyncMessage(true);
      // Hide sync message after 3 seconds
      const timer = setTimeout(() => {
        setShowSyncMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Don't render anything if online and no sync message
  if (isOnline && !showSyncMessage) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {!isOnline && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
          <span className="inline-flex items-center">
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" 
              />
            </svg>
            You are offline. Viewing cached data.
          </span>
        </div>
      )}
      
      {showSyncMessage && isOnline && (
        <div className="bg-green-500 text-white px-4 py-2 text-center text-sm font-medium animate-fade-in">
          <span className="inline-flex items-center">
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            Back online. Syncing data...
          </span>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
