
import TokenManager from '../utils/tokenManager';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../config/api';

class TokenRefreshService {
  private refreshPromise: Promise<string | null> | null = null;

  
  async refreshAccessToken(): Promise<string | null> {
    
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      console.error('No refresh token available');
      return null;
    }

    
    if (TokenManager.isTokenExpired(refreshToken)) {
      console.error('Refresh token is expired');
      TokenManager.clearTokens();
      return null;
    }

    this.refreshPromise = this.performRefresh(refreshToken);

    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(refreshToken: string): Promise<string | null> {
    try {
      console.log('Attempting to refresh access token...');

      
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        const newAccessToken = data.data.accessToken;

        
        TokenManager.setTokens(newAccessToken, refreshToken);

        console.log('✅ Access token refreshed successfully');
        return newAccessToken;
      } else {
        throw new Error('Invalid refresh response format');
      }
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);

      
      TokenManager.clearTokens();

      
      toast.error('Session expired. Please login again.');

      
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);

      return null;
    }
  }

  
  async ensureValidToken(): Promise<string | null> {
    const currentToken = TokenManager.getToken();

    if (!currentToken) {
      return null;
    }

    
    if (TokenManager.isTokenValid(currentToken)) {
      return currentToken;
    }

    
    console.log('Current token is expired or expiring soon, attempting refresh...');
    return await this.refreshAccessToken();
  }

  
  startAutoRefresh(): void {
    const checkAndRefresh = async () => {
      const token = TokenManager.getToken();
      if (!token) {
        return;
      }

      const tokenInfo = TokenManager.getTokenInfo(token);
      if (tokenInfo.payload?.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = tokenInfo.payload.exp - currentTime;

        
        if (timeUntilExpiry > 0 && timeUntilExpiry < (5 * 60)) {
          console.log(`Token expires in ${Math.floor(timeUntilExpiry / 60)} minutes, attempting refresh...`);
          await this.refreshAccessToken();
        }
      }
    };

    
    const intervalId = setInterval(checkAndRefresh, 60 * 1000);

    
    checkAndRefresh();

    
    (window as any).__tokenRefreshInterval = intervalId;
  }

  
  stopAutoRefresh(): void {
    const intervalId = (window as any).__tokenRefreshInterval;
    if (intervalId) {
      clearInterval(intervalId);
      delete (window as any).__tokenRefreshInterval;
    }
  }
}


export const tokenRefreshService = new TokenRefreshService();
export default tokenRefreshService;
