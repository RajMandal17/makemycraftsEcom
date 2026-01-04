

import { toast } from 'react-toastify';
import TokenManager from './tokenManager';


export const checkAuthConsistency = (isAuthenticated: boolean): boolean => {
  
  const token = TokenManager.getToken();
  
  
  if (isAuthenticated && !token) {
    console.error('❌ Auth inconsistency detected: Token missing but marked as authenticated');
    
    
    TokenManager.clearTokens(); 
    
    
    toast.error('Authentication error. Please log in again.', {
      toastId: 'auth-inconsistency',
      autoClose: 5000
    });
    
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
    
    return false;
  }
  
  return true;
};

export default { checkAuthConsistency };
