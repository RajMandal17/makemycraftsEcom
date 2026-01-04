import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'CUSTOMER' | 'ARTIST';
}

export function useAuth() {
  const { state, dispatch } = useAppContext();
  
  const isAuthenticated = state.auth.isAuthenticated;
  const user = state.auth.user;
  const isLoading = state.auth.loading;
  const error = state.auth.error;
  
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const { user, token } = await authAPI.login(credentials.email, credentials.password);
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user, token }
      });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to login';
        
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: errorMessage
      });
      
      toast.error(errorMessage);
      throw error;
    }
  }, [dispatch]);
  
  const register = useCallback(async (data: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const { user, token } = await authAPI.register(data);
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user, token }
      });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to register';
        
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: errorMessage
      });
      
      toast.error(errorMessage);
      throw error;
    }
  }, [dispatch]);
  
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  }, [dispatch]);
  
  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    register,
    logout
  };
}
