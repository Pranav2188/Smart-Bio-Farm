import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute component that guards dashboard routes
 * Redirects unauthenticated users to login page
 * Redirects users to appropriate dashboard based on their role
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} props.requiredRole - Optional role required to access the route
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userProfile, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Wait for user profile to load
  if (!userProfile) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading profile...
      </div>
    );
  }

  // Check if user has required role (if specified)
  if (requiredRole && userProfile.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const dashboardRoutes = {
      farmer: '/dashboard',
      veterinarian: '/vet-dashboard',
      government: '/gov-dashboard'
    };
    
    const userDashboard = dashboardRoutes[userProfile.role] || '/dashboard';
    return <Navigate to={userDashboard} replace />;
  }

  // User is authenticated and has correct role, render children
  return children;
};

export default ProtectedRoute;
