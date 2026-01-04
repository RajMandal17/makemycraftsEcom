import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, CartItem, WishlistItem, Artwork, Order } from '../types';
import { authAPI } from '../services/api';
import TokenManager from '../utils/tokenManager';
import tokenRefreshService from '../services/tokenRefresh';

type AppAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; redirectUrl?: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_ARTWORKS'; payload: Artwork[] }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Get initial token and user data from localStorage
// Get initial authentication state in a more robust way
const initialToken = TokenManager.getToken();
const initialUser = TokenManager.getUserData();
// Explicitly check token validity to avoid auth inconsistencies
const hasValidToken = !!(initialToken && TokenManager.isTokenValid(initialToken) === true);
const hasCompleteAuthState = !!(hasValidToken && initialUser);

console.log('🔍 Initial state check:', {
  tokenExists: !!initialToken,
  tokenValid: hasValidToken,
  userExists: !!initialUser,
  hasCompleteAuth: hasCompleteAuthState,
  tokenPreview: initialToken ? `${initialToken.substring(0, 20)}...` : 'none',
  userPreview: initialUser ? `${initialUser.email} (${initialUser.role})` : 'none',
  currentPath: window.location.pathname
});

// Fix for Auth inconsistency: More strict checking of authentication state
// Only consider authenticated if both token and user exist AND token is valid
const initialState: AppState = {
  auth: {
    user: initialUser, // Load user from localStorage
    token: hasValidToken ? initialToken : null, // Only set token if it's valid
    isAuthenticated: Boolean(hasValidToken && !!initialUser), // Only authenticated if we have both valid token and user
    loading: Boolean(initialToken && !hasCompleteAuthState), // Show loading only if we have token but need to fetch/validate user
    error: null,
  },
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]'),
  artworks: [],
  orders: [],
  loading: false,
  error: null,
};

console.log('🏁 Initial state created with token:', initialState.auth.token ? 'Present' : 'None');

// Store app state in localStorage for auth consistency checking across page loads
const saveStateToLocalStorage = (state: AppState) => {
  try {
    const serializedState = JSON.stringify({
      auth: {
        isAuthenticated: state.auth.isAuthenticated,
        token: !!state.auth.token
      }
    });
    localStorage.setItem('app_state', serializedState);
  } catch (e) {
    console.error('Could not save state to localStorage:', e);
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  console.log('🔄 AppReducer action:', action.type, action);
  
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        auth: { ...state.auth, loading: true, error: null },
      };
    case 'AUTH_SUCCESS':
      // Defensive: check payload
      if (!action.payload || !action.payload.user || !action.payload.token) {
        return {
          ...state,
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: 'Invalid authentication payload',
          },
        };
      }
      // Store complete authentication state (tokens + user data)
      TokenManager.setAuthState(action.payload.token, action.payload.user);
      console.log('✅ Auth success - complete state stored via TokenManager');
      
      const newState = {
        ...state,
        auth: {
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      };
      
      // Save auth state to localStorage for consistency checking
      saveStateToLocalStorage(newState);
      
      return newState;
    case 'AUTH_FAILURE':
      TokenManager.clearTokens();
      localStorage.removeItem('app_state'); // Clear auth state tracking
      
      const failureState = {
        ...state,
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false, // Important: set loading to false
          error: action.payload,
        },
      };
      
      return failureState;
    case 'LOGOUT':
      TokenManager.clearTokens();
      tokenRefreshService.stopAutoRefresh();
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      localStorage.removeItem('app_state'); // Clear auth state tracking
      
      const logoutState = {
        ...initialState,
        auth: { ...initialState.auth, token: null },
        cart: [],
        wishlist: [],
      };
      
      return logoutState;
    case 'ADD_TO_CART':
      const existingCartItem = state.cart.find(item => item.artwork.id === action.payload.artwork.id);
      let newCart;
      if (existingCartItem) {
        newCart = state.cart.map(item =>
          item.artwork.id === action.payload.artwork.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...state.cart, action.payload];
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return { ...state, cart: newCart };
    case 'REMOVE_FROM_CART':
      const filteredCart = state.cart.filter(item => item.id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(filteredCart));
      return { ...state, cart: filteredCart };
    case 'UPDATE_CART_QUANTITY':
      const updatedCart = state.cart.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return { ...state, cart: updatedCart };
    case 'CLEAR_CART':
      localStorage.removeItem('cart');
      return { ...state, cart: [] };
    case 'ADD_TO_WISHLIST':
      const newWishlist = [...state.wishlist, action.payload];
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return { ...state, wishlist: newWishlist };
    case 'REMOVE_FROM_WISHLIST':
      const filteredWishlist = state.wishlist.filter(item => item.id !== action.payload);
      localStorage.setItem('wishlist', JSON.stringify(filteredWishlist));
      return { ...state, wishlist: filteredWishlist };
    case 'SET_ARTWORKS':
      return { ...state, artworks: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing authentication...');
      console.log('Current pathname:', window.location.pathname);
      let token = TokenManager.getToken();
      const storedUser = TokenManager.getUserData();
      console.log('Initial state:', {
        token: token ? `${token.substring(0, 20)}...` : 'None',
        storedUser: storedUser ? `${storedUser.email} (${storedUser.role})` : 'None'
      });
      
      // If we already have complete auth state, don't re-initialize
      if (TokenManager.hasCompleteAuthState() && TokenManager.isTokenValid(token || '')) {
        console.log('✅ Complete auth state already exists, skipping initialization');
        if (!state.auth.isAuthenticated) {
          const user = TokenManager.getUserData();
          if (user && token) {
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
            tokenRefreshService.startAutoRefresh();
          }
        }
        return;
      }
      
      // If no token, user is simply not authenticated - this is normal for public pages
      if (!token) {
        console.log('ℹ️ No token found - user is viewing as guest (public access)');
        // Don't dispatch AUTH_FAILURE - just ensure state reflects unauthenticated status
        // The initial state already handles this correctly
        return;
      }

      // Only show loading if we don't already have complete auth state
      if (!state.auth.isAuthenticated) {
        dispatch({ type: 'AUTH_START' });
      }

      // Add a small delay to prevent race conditions with React Router
      await new Promise(resolve => setTimeout(resolve, 50));

      // Check if token is expired and try to refresh if needed
      const validation = TokenManager.validateTokenWithDetails(token);
      console.log('Initial token validation result:', validation);
      
      if (!validation.isValid || validation.errors.includes('Token is expired')) {
        console.log('🔄 Token expired or invalid, attempting refresh...');
        
        // Attempt token refresh
        const refreshedToken = await tokenRefreshService.refreshAccessToken();
        
        if (refreshedToken) {
          console.log('✅ Token refreshed successfully');
          token = refreshedToken;
          
          // Re-validate the refreshed token
          const refreshValidation = TokenManager.validateTokenWithDetails(token);
          console.log('Refreshed token validation result:', refreshValidation);
          
          if (!refreshValidation.isValid) {
            console.error('❌ Refreshed token is still invalid:', refreshValidation.errors);
            dispatch({ type: 'AUTH_FAILURE', payload: refreshValidation.errors.join(', ') });
            return;
          }
        } else {
          console.error('❌ Token refresh failed');
          // Clear tokens and stop refresh service
          TokenManager.clearTokens();
          tokenRefreshService.stopAutoRefresh();
          dispatch({ type: 'AUTH_FAILURE', payload: 'Token refresh failed - please login again' });
          return;
        }
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        console.warn('Token validation warnings:', validation.warnings);
      }

      try {
        let user: User;
        
        // If we have stored user data and the token is for the same user, use cached data
        if (storedUser) {
          const tokenUserId = TokenManager.getUserFromToken(token)?.id;
          if (tokenUserId === storedUser.id) {
            console.log('✅ Using cached user data for same user');
            user = storedUser;
          } else {
            console.log('⚠️ Token user ID mismatch, extracting fresh user data');
            const userFromToken = TokenManager.getUserFromToken(token);
            if (!userFromToken) {
              throw new Error('Failed to extract user information from token');
            }
            user = {
              ...userFromToken,
              role: userFromToken.role as 'CUSTOMER' | 'ARTIST' | 'ADMIN',
              createdAt: new Date().toISOString()
            };
          }
        } else {
          // No cached user data, extract from token
          console.log('📝 No cached user data, extracting from token');
          const userFromToken = TokenManager.getUserFromToken(token);
          if (!userFromToken) {
            throw new Error('Failed to extract user information from token');
          }
          user = {
            ...userFromToken,
            role: userFromToken.role as 'CUSTOMER' | 'ARTIST' | 'ADMIN',
            createdAt: new Date().toISOString()
          };
        }

        console.log('✅ Authentication successful, dispatching AUTH_SUCCESS');
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        
        // Start automatic token refresh service
        tokenRefreshService.startAutoRefresh();

        // Try to verify with backend (don't block on this)
        authAPI.verifyToken(token)
          .then(verifiedUser => {
            console.log('Backend verification successful:', verifiedUser);
            // Update stored user data with backend-verified data if different
            if (JSON.stringify(user) !== JSON.stringify(verifiedUser)) {
              console.log('🔄 Updating user data from backend verification');
              TokenManager.setUserData(verifiedUser);
              dispatch({ type: 'AUTH_SUCCESS', payload: { user: verifiedUser, token } });
            }
          })
          .catch(verifyError => {
            console.warn('Backend verification failed (but continuing with token auth):', verifyError);
          });
          
      } catch (error) {
        console.error('Token initialization failed:', error);
        dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid or expired token' });
      }
    };

    // Always initialize on mount
    console.log('🚀 Starting auth initialization...');
    initializeAuth();
  }, []); // Empty dependency array to run only once on mount

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};