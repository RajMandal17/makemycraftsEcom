


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';


const getWebSocketUrl = (baseUrl: string): string => {
  return baseUrl
    .replace('https://', 'wss://')
    .replace('http://', 'ws://') + '/ws';
};

export const API_CONFIG = {
  
  BACKEND_URL,

  
  API_BASE_URL: `${BACKEND_URL}/api`,

  
  ADMIN_DASHBOARD_SERVICE_URL: BACKEND_URL,

  
  ADMIN_API_BASE_URL: `${BACKEND_URL}/api`,

  
  ADMIN_API_FALLBACK_URL: `${BACKEND_URL}/api`,

  
  PAYMENT_SERVICE_URL: BACKEND_URL,

  
  ADMIN_WEBSOCKET_URL: import.meta.env['VITE_ADMIN_WEBSOCKET_URL'] || getWebSocketUrl(BACKEND_URL),
} as const;




export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath; 
  }
  return `${BACKEND_URL}${imagePath}`; 
};


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
