/**
 * API Configuration
 * 
 * CENTRALIZED URL CONFIGURATION
 * =============================
 * All URLs are defined here and ONLY here.
 * Use these exported constants throughout the application.
 * 
 * Environment Variables (set in .env file):
 * - VITE_BACKEND_URL: Backend API URL (e.g., http://localhost:8081 or https://api.makemycrafts.com)
 * 
 * For development: Uses localhost:8081
 * For production: Uses environment variable VITE_BACKEND_URL
 */

// === SINGLE SOURCE OF TRUTH FOR ALL URLs ===
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

// Derive WebSocket URL from backend URL
const getWebSocketUrl = (baseUrl: string): string => {
  return baseUrl
    .replace('https://', 'wss://')
    .replace('http://', 'ws://') + '/ws';
};

export const API_CONFIG = {
  // Core Backend URL - THE single source of truth
  BACKEND_URL,

  // API Base URL with /api prefix
  API_BASE_URL: `${BACKEND_URL}/api`,

  // Admin Dashboard (now part of monolith - uses same backend)
  ADMIN_DASHBOARD_SERVICE_URL: BACKEND_URL,

  // Admin API Base URL (uses monolithic backend)
  ADMIN_API_BASE_URL: `${BACKEND_URL}/api`,

  // Admin API Fallback (same as above - monolithic)
  ADMIN_API_FALLBACK_URL: `${BACKEND_URL}/api`,

  // Payment Service (now part of monolith - uses same backend)
  PAYMENT_SERVICE_URL: BACKEND_URL,

  // WebSocket URL for admin dashboard
  ADMIN_WEBSOCKET_URL: import.meta.env['VITE_ADMIN_WEBSOCKET_URL'] || getWebSocketUrl(BACKEND_URL),
} as const;

// === HELPER FUNCTIONS ===

/**
 * Get full image URL - handles both absolute and relative URLs
 * @param imagePath - The image path (can be relative like /uploads/image.jpg or absolute URL)
 * @returns Full URL to the image
 */
export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath; // Already a full URL (e.g., Cloudinary URL)
  }
  return `${BACKEND_URL}${imagePath}`; // Construct full URL for relative paths
};

/**
 * Get profile image URL with fallback
 * @param profileImage - Primary profile image path
 * @param profilePictureUrl - Fallback profile picture URL (e.g., OAuth provider)
 * @returns Full URL to the profile image or null if none available
 */
export const getProfileImageUrl = (profileImage?: string, profilePictureUrl?: string): string | null => {
  if (profileImage) {
    return getImageUrl(profileImage);
  }
  if (profilePictureUrl) {
    return profilePictureUrl;
  }
  return null;
};

export default API_CONFIG;
