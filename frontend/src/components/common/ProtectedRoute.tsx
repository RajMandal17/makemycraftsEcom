import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { state } = useAppContext();
  const location = useLocation();

  console.log('🔒 ProtectedRoute check:', {
    path: location.pathname,
    isAuthenticated: state.auth.isAuthenticated,
    loading: state.auth.loading,
    hasUser: !!state.auth.user,
    userRole: state.auth.user?.role,
    hasToken: !!state.auth.token
  });

  // Show loading spinner while authentication is being verified
  if (state.auth.loading) {
    console.log('⏳ ProtectedRoute: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated and not loading, redirect to login
  if (!state.auth.isAuthenticated || !state.auth.user || !state.auth.token) {
    console.log('❌ ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions if roles are specified
  if (roles && !roles.includes(state.auth.user.role)) {
    console.log('🚫 ProtectedRoute: Role mismatch, redirecting based on user role');
    // Redirect to appropriate dashboard based on user role
    if (state.auth.user.role === 'ADMIN') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (state.auth.user.role === 'ARTIST') {
      return <Navigate to="/dashboard/artist" replace />;
    } else if (state.auth.user.role === 'CUSTOMER') {
      return <Navigate to="/dashboard/customer" replace />;
    } else {
      // Fallback to login if role is unrecognized
      console.error('🚫 ProtectedRoute: Unrecognized role, redirecting to login');
      return <Navigate to="/login" replace />;
    }
  }

  console.log('✅ ProtectedRoute: Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;