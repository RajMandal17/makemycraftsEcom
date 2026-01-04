/**
 * Token refresh service to handle automatic token renewal
 */
import TokenManager from '../utils/tokenManager';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../config/api';

class TokenRefreshService {
  private refreshPromise: Promise<string | null> | null = null;

  /**
   * Attempt to refresh the access token using the refresh token
   */
  async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      console.error('No refresh token available');
      return null;
    }

    // Check if refresh token is valid
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

      // Call the refresh endpoint
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

        // Store the new access token (keep existing refresh token)
        TokenManager.setTokens(newAccessToken, refreshToken);

        console.log('✅ Access token refreshed successfully');
        return newAccessToken;
      } else {
        throw new Error('Invalid refresh response format');
      }
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);

      // Clear all tokens on refresh failure
      TokenManager.clearTokens();

      // Optionally notify user and redirect to login
      toast.error('Session expired. Please login again.');

      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);

      return null;
    }
  }

  /**
   * Check if token needs refresh and attempt to refresh if necessary
   */
  async ensureValidToken(): Promise<string | null> {
    const currentToken = TokenManager.getToken();

    if (!currentToken) {
      return null;
    }

    // If current token is still valid, return it
    if (TokenManager.isTokenValid(currentToken)) {
      return currentToken;
    }

    // Try to refresh if current token is expired
    console.log('Current token is expired or expiring soon, attempting refresh...');
    return await this.refreshAccessToken();
  }

  /**
   * Set up automatic token refresh before expiration
   */
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

        // Refresh if token expires in less than 5 minutes
        if (timeUntilExpiry > 0 && timeUntilExpiry < (5 * 60)) {
          console.log(`Token expires in ${Math.floor(timeUntilExpiry / 60)} minutes, attempting refresh...`);
          await this.refreshAccessToken();
        }
      }
    };

    // Check every minute
    const intervalId = setInterval(checkAndRefresh, 60 * 1000);

    // Initial check
    checkAndRefresh();

    // Store interval ID for cleanup if needed
    (window as any).__tokenRefreshInterval = intervalId;
  }

  /**
   * Stop automatic token refresh
   */
  stopAutoRefresh(): void {
    const intervalId = (window as any).__tokenRefreshInterval;
    if (intervalId) {
      clearInterval(intervalId);
      delete (window as any).__tokenRefreshInterval;
    }
  }
}

// Export singleton instance
export const tokenRefreshService = new TokenRefreshService();
export default tokenRefreshService;
