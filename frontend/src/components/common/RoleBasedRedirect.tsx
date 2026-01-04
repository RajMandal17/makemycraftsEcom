import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import LoadingSpinner from './LoadingSpinner';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ children }) => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  console.log('🔀 RoleBasedRedirect check:', {
    path: location.pathname,
    isAuthenticated: state.auth.isAuthenticated,
    loading: state.auth.loading,
    hasUser: !!state.auth.user,
    userRole: state.auth.user?.role,
    hasRedirected: hasRedirected.current
  });

  useEffect(() => {
    
    if (state.auth.isAuthenticated && !state.auth.loading && state.auth.user && !hasRedirected.current) {
      const role = state.auth.user.role;
      let targetPath = '';
      
      switch (role) {
        case 'ARTIST':
          targetPath = '/dashboard/artist';
          break;
        case 'ADMIN':
          targetPath = '/dashboard/admin';
          break;
        case 'CUSTOMER':
          targetPath = '/dashboard/customer';
          break;
        default:
          
          return;
      }

      
      if (location.pathname !== targetPath && !location.pathname.startsWith(targetPath)) {
        console.log(`🔀 RoleBasedRedirect: Redirecting ${role} to ${targetPath}`);
        hasRedirected.current = true;
        navigate(targetPath, { replace: true });
        return;
      }
    }
  }, [state.auth.isAuthenticated, state.auth.loading, state.auth.user, navigate, location.pathname]);

  
  useEffect(() => {
    if (!state.auth.isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [state.auth.isAuthenticated]);

  
  if (state.auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  
  return <>{children}</>;
};

export default RoleBasedRedirect;
