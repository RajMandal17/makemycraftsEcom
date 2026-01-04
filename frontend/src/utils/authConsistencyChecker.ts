/**
 * A utility to check for and fix authentication state inconsistencies
 * This specifically addresses the issue of "Token missing but marked as authenticated"
 * when the frontend is deployed to a different domain (like Railway)
 */

import { toast } from 'react-toastify';
import TokenManager from './tokenManager';

/**
 * Check authentication state consistency and fix if necessary
 * Returns true if authentication is consistent, false if it needed to be fixed
 */
export const checkAuthConsistency = (isAuthenticated: boolean): boolean => {
  // Get current token from storage
  const token = TokenManager.getToken();
  
  // Check for inconsistency: marked as authenticated but no token exists
  if (isAuthenticated && !token) {
    console.error('❌ Auth inconsistency detected: Token missing but marked as authenticated');
    
    // Fix the inconsistency
    TokenManager.clearTokens(); // Clear any partial auth state
    
    // Notify the user
    toast.error('Authentication error. Please log in again.', {
      toastId: 'auth-inconsistency',
      autoClose: 5000
    });
    
    // Redirect to login after a short delay to allow toast to be seen
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
    
    return false;
  }
  
  return true;
};

export default { checkAuthConsistency };
