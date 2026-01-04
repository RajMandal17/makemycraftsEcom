import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import {
  User,
  Artist,
  Artwork,
  Order,
  Review,
  LoginCredentials,
  RegisterData,
  ApiResponse,
  CartItem,
  WishlistItem,
  LoginResponse,
} from '../types';
import TokenManager from '../utils/tokenManager';
import tokenRefreshService from './tokenRefresh';
import { API_CONFIG } from '../config/api';

// Loading callbacks
let showLoadingCallback: ((message?: string) => void) | null = null;
let hideLoadingCallback: (() => void) | null = null;

// Function to register loading callbacks from LoadingContext
export const registerLoadingCallbacks = (
  showLoading: (message?: string) => void,
  hideLoading: () => void
) => {
  showLoadingCallback = showLoading;
  hideLoadingCallback = hideLoading;
};

const API_BASE_URL = API_CONFIG.API_BASE_URL;
const DIRECT_API_URL = API_CONFIG.BACKEND_URL;

// Utility function to construct full image URLs
export const getFullImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl; // Already a full URL
  }
  return `${DIRECT_API_URL}${imageUrl}`; // Construct full URL for relative paths
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create admin axios instance
const adminApiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.ADMIN_API_FALLBACK_URL, // Always use backend for admin APIs
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ADMIN_API_DEFAULT_BASE_URL = API_CONFIG.ADMIN_API_FALLBACK_URL;
const ADMIN_API_FALLBACK_BASE_URL = API_CONFIG.ADMIN_API_FALLBACK_URL;
const ADMIN_SERVICE_ENABLED = false; // Disabled since we're using backend directly

// Request interceptor for adminApiClient
adminApiClient.interceptors.request.use(
  async (config) => {
    // Show loading animation
    if (showLoadingCallback) {
      let loadingMessage = 'Loading admin data...';
      if (config.url?.includes('/users')) {
        loadingMessage = config.method?.toUpperCase() === 'PUT' || config.method?.toUpperCase() === 'POST'
          ? 'Updating user...' : 'Loading user management...';
      } else if (config.url?.includes('/artworks')) {
        loadingMessage = 'Loading artwork management...';
      } else if (config.url?.includes('/orders')) {
        loadingMessage = 'Loading order management...';
      } else if (config.url?.includes('/analytics')) {
        loadingMessage = 'Loading analytics...';
      }
      showLoadingCallback(loadingMessage);
    }

    let token = TokenManager.getToken();
    console.log('🔐 Admin API Request:', config.method?.toUpperCase(), config.url);
    console.log('🎫 Token available:', !!token);

    // Admin endpoints always require authentication
    if (!token) {
      console.error('❌ No token available for admin endpoint:', config.url);
      if (hideLoadingCallback) hideLoadingCallback();
      return Promise.reject(new Error('No authentication token found'));
    }

    // Check if token is expired and try to refresh
    if (!TokenManager.isTokenValid(token)) {
      console.log('🔄 Token expired, attempting refresh before admin request...');
      try {
        const refreshedToken = await tokenRefreshService.refreshAccessToken();
        if (refreshedToken) {
          token = refreshedToken;
          console.log('✅ Token refreshed successfully for admin request');
        } else {
          console.warn('⚠️ Token refresh failed for admin request');
          if (hideLoadingCallback) hideLoadingCallback();
          return Promise.reject(new Error('Token refresh failed'));
        }
      } catch (error) {
        console.error('❌ Token refresh error for admin request:', error);
        if (hideLoadingCallback) hideLoadingCallback();
        return Promise.reject(error);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header set for admin request');
    }

    return config;
  },
  (error) => {
    console.error('Admin request interceptor error:', error);
    if (hideLoadingCallback) hideLoadingCallback();
    return Promise.reject(error);
  }
);

// Response interceptor for adminApiClient
adminApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Hide loading animation on successful response
    if (hideLoadingCallback) {
      hideLoadingCallback();
    }
    console.log('✅ Admin API Success:', response.config.method?.toUpperCase(), response.config.url);
    return response;
  },
  async (error) => {
    // Hide loading animation on error
    if (hideLoadingCallback) {
      hideLoadingCallback();
    }

    console.error('❌ Admin API Error:', error.response?.status, error.response?.data);
    const originalRequest = error.config || {};

    if (error.response?.status === 401) {
      const alreadyUsingFallback = originalRequest.baseURL === ADMIN_API_FALLBACK_BASE_URL
        || (!ADMIN_SERVICE_ENABLED && !originalRequest.baseURL);

      if (ADMIN_SERVICE_ENABLED && !alreadyUsingFallback && !originalRequest._retriedWithFallback) {
        originalRequest._retriedWithFallback = true;
        originalRequest.baseURL = ADMIN_API_FALLBACK_BASE_URL;
        console.warn('⚠️ Admin service rejected token. Retrying against backend fallback:', originalRequest.url);
        return adminApiClient(originalRequest);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('🔄 Admin API 401 error, attempting token refresh...');

      try {
        const refreshedToken = await tokenRefreshService.refreshAccessToken();
        if (refreshedToken) {
          console.log('✅ Admin token refreshed after 401, retrying request');
          originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
          return adminApiClient(originalRequest);
        } else {
          throw new Error('Token refresh returned no token');
        }
      } catch (refreshError) {
        console.error('❌ Admin token refresh failed after 401:', refreshError);
        toast.error('Session expired. Please login again.');
        // Delay redirect to allow toast to show
        setTimeout(() => {
          TokenManager.clearTokens();
          window.location.href = '/login';
        }, 1000);
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 401) {
      console.error('❌ 401 after retry - redirecting to login');
      toast.error('Authentication failed. Please login again.');
      setTimeout(() => {
        TokenManager.clearTokens();
        window.location.href = '/login';
      }, 1000);
    } else if (error.response?.status === 403) {
      console.error('403 Forbidden in admin API:', error.response.data);
      toast.error('Access denied. Admin permissions required.');
    } else if (error.response?.status >= 500) {
      console.error('500+ Server error in admin API:', error.response.data);
      toast.error(error.response?.data?.message || 'Server error. Please try again.');
    } else if (error.message === 'Network Error') {
      console.error('Network error - Admin API server may be down');
      toast.error('Network error. Please check your connection.');
    } else if (error.message?.includes('No authentication token')) {
      console.error('No token available - redirecting to login');
      toast.error('Please login to continue.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token with automatic refresh
apiClient.interceptors.request.use(
  async (config) => {
    // Show loading animation
    if (showLoadingCallback) {
      // Customize loading message based on endpoint
      let loadingMessage = 'Loading...';
      if (config.url?.includes('/artworks')) {
        loadingMessage = 'Loading beautiful artworks...';
      } else if (config.url?.includes('/artists')) {
        loadingMessage = 'Loading talented artists...';
      } else if (config.url?.includes('/orders')) {
        loadingMessage = 'Processing your order...';
      } else if (config.url?.includes('/cart')) {
        loadingMessage = 'Updating your cart...';
      } else if (config.url?.includes('/wishlist')) {
        loadingMessage = 'Managing your wishlist...';
      } else if (config.url?.includes('/suggestion')) {
        loadingMessage = 'AI is analyzing your artwork...';
      } else if (config.url?.includes('/auth')) {
        loadingMessage = 'Authenticating...';
      } else if (config.url?.includes('/upload')) {
        loadingMessage = 'Uploading artwork...';
      }
      showLoadingCallback(loadingMessage);
    }

    // List of public endpoints that don't require authentication
    const publicEndpoints = [
      '/home/stats',
      '/artworks',
      '/artists',
      '/auth/login',
      '/auth/register',
      '/auth/oauth2',
    ];

    // Check if this is a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url?.includes(endpoint)
    );

    let token = TokenManager.getToken();

    // Only check for auth inconsistency on protected endpoints
    if (!isPublicEndpoint) {
      const appState = window.localStorage.getItem('app_state');
      if (appState) {
        try {
          const parsedState = JSON.parse(appState);
          if (parsedState.auth?.isAuthenticated === true && !token) {
            console.error('❌ Auth inconsistency detected: Token missing but marked as authenticated');
            // Clear inconsistent state
            TokenManager.clearTokens();
            localStorage.removeItem('app_state');
          }
        } catch (err) {
          console.error('Error parsing app state:', err);
        }
      }
    }

    if (token) {
      // Check if token is expired and try to refresh
      if (!TokenManager.isTokenValid(token)) {
        console.log('🔄 Token expired, attempting refresh...');
        try {
          const refreshedToken = await tokenRefreshService.refreshAccessToken();
          if (refreshedToken) {
            token = refreshedToken;
            console.log('✅ Token refreshed successfully');
          } else {
            console.warn('⚠️ Token refresh failed');
            TokenManager.clearTokens();
            token = null;
          }
        } catch (error) {
          console.error('❌ Token refresh error:', error);
          TokenManager.clearTokens();
          token = null;
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else if (!isPublicEndpoint) {
      // Only log warning for protected endpoints
      console.warn('⚠️ No token available for protected endpoint:', config.url);
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Hide loading animation on successful response
    if (hideLoadingCallback) {
      hideLoadingCallback();
    }
    return response;
  },
  async (error) => {
    // Hide loading animation on error
    if (hideLoadingCallback) {
      hideLoadingCallback();
    }
    const originalRequest = error.config;
    console.error('API Error Response:', error.response);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('🔄 401 error, attempting token refresh...');

      try {
        const refreshedToken = await tokenRefreshService.refreshAccessToken();
        if (refreshedToken) {
          console.log('✅ Token refreshed, retrying original request');
          // Update the authorization header and retry
          originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        TokenManager.clearTokens();
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 401) {
      console.error('401 Unauthorized error after retry. Redirecting to login.');
      TokenManager.clearTokens();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      console.error('403 Forbidden error. User lacks required permissions.');
      toast.error('Access denied. Insufficient permissions.');

      // Show detailed error if available
      if (error.response?.data?.message) {
        toast.error(`Access denied: ${error.response.data.message}`);
      }
    } else if (error.response?.status >= 500) {
      console.error('500+ Server error:', error.response.data);
      toast.error('Server error. Please try again later.');
    } else if (error.message === 'Network Error') {
      console.error('Network error - API server may be down');
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  register: async (userData: RegisterData): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/auth/register',
      userData
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    const token = TokenManager.getToken();
    await apiClient.post('/auth/logout', { token });
  },

  verifyToken: async (token: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },
};

// Artwork API
export const artworkAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    artistId?: string;
  }): Promise<{ artworks: Artwork[]; total: number; totalPages: number }> => {
    try {
      // Don't adjust page index - backend expects 1-based pagination
      console.log('Fetching artworks with params:', params);
      const response = await apiClient.get('/artworks', { params });
      console.log('API Response:', response.data);

      // Direct response structure from our controller (no wrapping)
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.artworks)) {
          console.log('Standard response structure detected');
          return response.data;
        }
        // Wrapped response in data property (API standard pattern)
        else if (response.data.data && Array.isArray(response.data.data.artworks)) {
          console.log('Wrapped response structure detected');
          return response.data.data;
        }
        // The response itself might be the artworks array
        else if (Array.isArray(response.data)) {
          console.log('Array response structure detected');
          return {
            artworks: response.data,
            total: response.data.length,
            totalPages: 1
          };
        }
      }

      // Log unexpected structure for debugging
      console.warn('Could not parse artworks from response:', response.data);

      // Default return for any other cases
      return {
        artworks: [],
        total: 0,
        totalPages: 0
      };
    } catch (error) {
      console.error("Error fetching artworks:", error);
      return {
        artworks: [],
        total: 0,
        totalPages: 0
      };
    }
  },

  getById: async (id: string): Promise<Artwork> => {
    try {
      // Try to get artwork from our backend first
      const response = await apiClient.get(`/v1/artwork-query/${id}`);
      if (response.data) {
        return response.data.data || response.data;
      }
    } catch (error) {
      console.error("Error fetching artwork:", error);
    }

    // Fallback to placeholder data if backend fails or doesn't return expected data
    return {
      id: id,
      title: "Artwork Title",
      description: "This artwork is currently unavailable",
      price: 0,
      category: "unknown",
      medium: "Unknown",
      images: ["https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg"],
      tags: ["art"],
      isAvailable: false,
      artistId: "unknown",
      artist: { id: "unknown", firstName: "Artist", lastName: "Unknown" },
      dimensions: { width: 0, height: 0 },
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  create: async (artworkData: FormData): Promise<Artwork> => {
    const response = await apiClient.post<ApiResponse<Artwork>>('/artworks', artworkData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  update: async (id: string, artworkData: Partial<Artwork>): Promise<Artwork> => {
    const response = await apiClient.put<ApiResponse<Artwork>>(`/artworks/${id}`, artworkData);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/artworks/${id}`);
  },

  getByArtist: async (artistId: string): Promise<{ artworks: Artwork[], total: number, totalPages: number }> => {
    const response = await apiClient.get<{ artworks: Artwork[], total: number, totalPages: number }>(`/artworks/artist/${artistId}`);
    console.log('API Response for /artworks/artist/' + artistId + ' with auth:', response);
    return response.data;
  },
};

// Cart API
export const cartAPI = {
  add: async (artworkId: string, quantity: number = 1): Promise<CartItem> => {
    const response = await apiClient.post<ApiResponse<CartItem>>('/cart/add', {
      artworkId,
      quantity,
    });
    return response.data.data;
  },

  getItems: async (): Promise<CartItem[]> => {
    const response = await apiClient.get<ApiResponse<CartItem[]>>('/cart');
    return response.data.data;
  },

  updateQuantity: async (itemId: string, quantity: number): Promise<CartItem> => {
    const response = await apiClient.put<ApiResponse<CartItem>>(`/cart/${itemId}`, { quantity });
    return response.data.data;
  },

  remove: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/cart/${itemId}`);
  },

  clear: async (): Promise<void> => {
    await apiClient.delete('/cart/clear');
  },
};

// Wishlist API
export const wishlistAPI = {
  add: async (artworkId: string): Promise<WishlistItem> => {
    const response = await apiClient.post<ApiResponse<WishlistItem>>('/wishlist/add', {
      artworkId,
    });
    return response.data.data;
  },

  getItems: async (): Promise<WishlistItem[]> => {
    const response = await apiClient.get<ApiResponse<WishlistItem[]>>('/wishlist');
    return response.data.data;
  },

  remove: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${itemId}`);
  },
};

// Order API
export const orderAPI = {
  create: async (orderData: {
    items: { artworkId: string; quantity: number }[];
    shippingAddress: any;
    paymentMethod: string;
  }): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', orderData);
    return response.data.data;
  },

  getAll: async (params?: { page?: number; limit?: number }): Promise<{ orders: Order[]; total: number }> => {
    const response = await apiClient.get<ApiResponse<{ orders: Order[]; total: number }>>(
      '/orders',
      { params }
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data.data;
  },
};

// Artist Order API
export const artistOrderAPI = {
  getAll: async (params?: { page?: number; size?: number; status?: string }): Promise<{ orders: Order[]; total: number; totalPages: number; currentPage: number }> => {
    const response = await apiClient.get<ApiResponse<{ orders: Order[]; total: number; totalPages: number; currentPage: number }>>('/artist/orders', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/artist/orders/${id}`);
    return response.data.data;
  },

  updateStatus: async (id: string, data: { status: string; trackingNumber?: string; notes?: string }): Promise<Order> => {
    const response = await apiClient.put<ApiResponse<Order>>(`/artist/orders/${id}/status`, data);
    return response.data.data;
  },

  getStats: async (): Promise<{
    totalOrders: number;
    totalSales: number;
    pendingOrders: number;
    confirmedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/artist/orders/stats');
    return response.data.data;
  },
};

// Review API
export const reviewAPI = {
  create: async (reviewData: {
    orderItemId: string;  // The order item ID to verify purchase
    rating: number;
    comment: string;
  }): Promise<Review> => {
    const response = await apiClient.post<ApiResponse<Review>>('/reviews', reviewData);
    return response.data.data;
  },

  getByArtwork: async (artworkId: string): Promise<Review[]> => {
    try {
      const response = await apiClient.get<any>(`/reviews/artwork/${artworkId}`);
      console.log('Review response for artwork:', artworkId, response.data);

      // API returns { success: true, reviews: [...], total: N }
      if (response.data.reviews && Array.isArray(response.data.reviews)) {
        return response.data.reviews;
      }
      // Fallback: check other possible formats
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  update: async (id: string, reviewData: { rating: number; comment: string }): Promise<Review> => {
    const response = await apiClient.put<ApiResponse<Review>>(`/reviews/${id}`, reviewData);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },
};

// Payment API
export const paymentAPI = {
  createPayment: async (paymentData: {
    orderId: string;
    customerId: string;
    artistId?: string;
    amount: number;
    currency: string;
  }): Promise<{
    id: string;
    orderId: string;
    gatewayOrderId: string;
    amount: number;
    currency: string;
    status: string;
  }> => {
    const response = await apiClient.post('/payment/create', {
      ...paymentData,
      idempotencyKey: `payment-${Date.now()}-${Math.random()}`,
    });
    return response.data;
  },

  verifyPayment: async (verificationData: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await apiClient.post('/payment/verify', verificationData);
    return response.data;
  },

  getPaymentByOrder: async (orderId: string): Promise<{
    id: string;
    orderId: string;
    amount: number;
    status: string;
    gatewayOrderId: string;
    gatewayPaymentId?: string;
  }> => {
    const response = await apiClient.get(`/payment/order/${orderId}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (params?: { page?: number; limit?: number; role?: string }): Promise<{
    users: User[];
    total: number;
  }> => {
    const response = await apiClient.get<ApiResponse<{ users: User[]; total: number }>>(
      '/admin/users',
      { params }
    );
    return response.data.data;
  },

  updateUserStatus: async (userId: string, status: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${userId}/status`, {
      status,
    });
    return response.data.data;
  },

  getAnalytics: async (): Promise<{
    totalUsers: number;
    totalArtworks: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Order[];
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/analytics');
    return response.data.data;
  },
};

export { adminApiClient };
export default apiClient;