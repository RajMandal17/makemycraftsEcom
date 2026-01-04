// Login redirector for deployed application
// This file is meant to be included at the root of your deployed application
// It handles the auth inconsistency issue in production

(function() {
  // Check for token/auth inconsistency
  try {
    const appState = localStorage.getItem('app_state');
    const token = localStorage.getItem('access_token');
    
    if (appState) {
      const parsedState = JSON.parse(appState);
      
      // If marked as authenticated but no token exists
      if (parsedState.auth?.isAuthenticated === true && !token) {
        console.error('Auth inconsistency detected: Token missing but marked as authenticated');
        
        // Clear inconsistent state
        localStorage.removeItem('app_state');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        
        // If we're not already on the login page, redirect
        if (!window.location.pathname.includes('/login')) {
          console.log('Redirecting to login page due to auth inconsistency');
          window.location.href = '/login';
        }
      }
    }
  } catch (err) {
    console.error('Error in auth check:', err);
  }
})();
