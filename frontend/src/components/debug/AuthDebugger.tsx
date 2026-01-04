import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { debugToken } from '../../utils/debugToken';
import { debugAPI } from '../../services/debugAPI';
import TokenManager from '../../utils/tokenManager';
import tokenRefreshService from '../../services/tokenRefresh';

const AuthDebugger: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [showDebugger, setShowDebugger] = useState(false);

  
  useEffect(() => {
    if (showDebugger) {
      console.log('🔍 AuthDebugger - Current auth state:', {
        isAuthenticated: state.auth.isAuthenticated,
        loading: state.auth.loading,
        user: state.auth.user,
        token: state.auth.token ? `${state.auth.token.substring(0, 20)}...` : null,
        error: state.auth.error
      });
    }
  }, [showDebugger, state.auth]);

  
  const [localStorageContent, setLocalStorageContent] = useState({
    token: localStorage.getItem('access_token') ? 'Present' : 'Missing',
    refreshToken: localStorage.getItem('refresh_token') ? 'Present' : 'Missing',
    tokenLength: localStorage.getItem('access_token')?.length,
  });

  
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setLocalStorageContent({
        token: localStorage.getItem('access_token') ? 'Present' : 'Missing',
        refreshToken: localStorage.getItem('refresh_token') ? 'Present' : 'Missing',
        tokenLength: localStorage.getItem('access_token')?.length,
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    
    if (!state.auth.loading) {
      const token = localStorage.getItem('access_token');
      if (!token && state.auth.isAuthenticated) {
        toast.error('Auth inconsistency: Token missing but marked as authenticated');
        
        dispatch({ type: 'LOGOUT' });
        
        setTimeout(() => window.location.href = '/login', 500);
      } else if (token && !state.auth.isAuthenticated) {
        toast.error('Auth inconsistency: Token exists but marked as not authenticated');
      }
    }
  }, [state.auth.isAuthenticated, state.auth.loading, dispatch]);

  const fixAuthState = () => {
    const token = TokenManager.getToken();

    if (token) {
      try {
        const userFromToken = TokenManager.getUserFromToken(token);
        if (userFromToken) {
          console.log('Token payload for fix:', userFromToken);

          
          const user = {
            id: userFromToken.id,
            email: userFromToken.email,
            firstName: userFromToken.firstName,
            lastName: userFromToken.lastName,
            role: userFromToken.role as 'CUSTOMER' | 'ARTIST' | 'ADMIN',
            createdAt: new Date().toISOString()
          };

          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user,
              token
            }
          });

          toast.success('Auth state fixed from token');
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        toast.error('Failed to parse token');
      }
    }
  };

  if (!showDebugger) {
    return (
      <button
        className="fixed bottom-5 right-5 bg-gray-800 text-white p-2 rounded-full z-50 opacity-50 hover:opacity-100"
        onClick={() => setShowDebugger(true)}
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 bg-white border shadow-lg p-4 rounded-lg z-50 max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">Auth Debugger</h3>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setShowDebugger(false)}
        >
          Close
        </button>
      </div>

      <div className="text-sm mb-3">
        <div><strong>Loading:</strong> {state.auth.loading ? 'Yes' : 'No'}</div>
        <div><strong>Authenticated:</strong> {state.auth.isAuthenticated ? 'Yes' : 'No'}</div>
        <div><strong>Role:</strong> {state.auth.user?.role || 'None'}</div>
        <div><strong>Token in Context:</strong> {state.auth.token ? '✓ Present' : '✗ Missing'}</div>
        <div><strong>Token in LocalStorage:</strong> {localStorage.getItem('access_token') ? '✓ Present' : '✗ Missing'}</div>
        <div><strong>Error:</strong> {state.auth.error || 'None'}</div>
      </div>

      <div className="flex space-x-2 flex-wrap gap-2">
        <button
          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => {
            TokenManager.clearTokens();
            dispatch({ type: 'LOGOUT' });
            toast.info('Logged out and cleared auth state');
          }}
        >
          Clear Auth
        </button>
        <button
          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
          onClick={fixAuthState}
        >
          Fix Auth State
        </button>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => {
            TokenManager.debugToken();
            toast.info('Check console for enhanced token details');
          }}
        >
          Debug Token
        </button>
        <button
          className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
          onClick={async () => {
            try {
              const newToken = await tokenRefreshService.refreshAccessToken();
              if (newToken) {
                toast.success('Token refreshed successfully!');
              } else {
                toast.error('Failed to refresh token');
              }
            } catch (error) {
              toast.error('Token refresh error');
            }
          }}
        >
          Refresh Token
        </button>
        <button
          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => {
            const validation = TokenManager.validateTokenWithDetails();
            if (validation.isValid) {
              toast.success('Token is valid!');
            } else {
              toast.error(`Token invalid: ${validation.errors.join(', ')}`);
            }
            if (validation.warnings.length > 0) {
              toast.warn(`Warnings: ${validation.warnings.join(', ')}`);
            }
          }}
        >
          Validate Token
        </button>
        <button
          className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
          onClick={async () => {
            try {
              const result = await debugAPI.testAuth();
              toast.success('Auth check succeeded! See console');
              console.log('Auth check result:', result);
            } catch (error) {
              toast.error('Auth check failed. See console');
            }
          }}
        >
          Test Auth
        </button>
        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
          onClick={async () => {
            try {
              const result = await debugAPI.testArtistAccess();
              toast.success('Artist access check succeeded! See console');
              console.log('Artist access result:', result);
            } catch (error) {
              toast.error('Artist access check failed. See console');
            }
          }}
        >
          Test Artist Access
        </button>
      </div>
    </div>
  );
};

export default AuthDebugger;
