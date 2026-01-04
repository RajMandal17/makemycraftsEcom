

import { User } from '../types';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

export class TokenManager {
  private static readonly TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'user_data';
  private static readonly TOKEN_EXPIRY_BUFFER = 5 * 60; 

  
  static setTokens(accessToken: string, refreshToken?: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }
      console.log('✅ Tokens stored successfully');
    } catch (error) {
      console.error('❌ Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  
  static setUserData(user: User): void {
    try {
      if (!user || typeof user !== 'object') {
        console.error('❌ Invalid user data provided to setUserData:', user);
        throw new Error('Invalid user data: user is null or undefined');
      }
      
      if (!user.id || !user.email || !user.role) {
        console.error('❌ User data missing required fields:', user);
        throw new Error('Invalid user data: missing required fields (id, email, role)');
      }
      
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      console.log('✅ User data stored successfully:', { id: user.id, email: user.email, role: user.role });
    } catch (error) {
      console.error('❌ Failed to store user data:', error);
      throw new Error('Failed to store user data');
    }
  }

  
  static getUserData(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (!userData) {
        console.log('🔍 No user data found in localStorage');
        return null;
      }
      const user = JSON.parse(userData) as User;
      console.log('✅ User data retrieved:', { id: user.id, email: user.email, role: user.role });
      return user;
    } catch (error) {
      console.error('❌ Failed to retrieve user data:', error);
      return null;
    }
  }

  
  static setAuthState(accessToken: string, user: User, refreshToken?: string): void {
    this.setTokens(accessToken, refreshToken);
    this.setUserData(user);
  }

  
  static getToken(): string | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      console.log(`🔍 TokenManager.getToken() called, found: ${token ? `${token.substring(0, 20)}...` : 'null'}`);
      return token;
    } catch (error) {
      console.error('❌ Failed to retrieve token:', error);
      return null;
    }
  }

  
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('❌ Failed to retrieve refresh token:', error);
      return null;
    }
  }

  
  static decodeToken(token?: string): TokenPayload | null {
    const tokenToUse = token || this.getToken();
    if (!tokenToUse) {
      return null;
    }

    try {
      const parts = tokenToUse.split('.');
      if (parts.length !== 3 || !parts[1]) {
        console.error('❌ Invalid token format');
        return null;
      }

      const payload = JSON.parse(atob(parts[1])) as TokenPayload;
      return payload;
    } catch (error) {
      console.error('❌ Failed to decode token:', error);
      return null;
    }
  }

  
  static isTokenExpired(token?: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp <= (currentTime + this.TOKEN_EXPIRY_BUFFER);
    
    if (isExpired) {
      console.warn('⚠️ Token is expired or expiring soon');
    }
    
    return isExpired;
  }

  
  static isTokenValid(token?: string): boolean {
    const tokenToUse = token || this.getToken();
    if (!tokenToUse) {
      return false;
    }

    const payload = this.decodeToken(tokenToUse);
    if (!payload) {
      return false;
    }

    return !this.isTokenExpired(tokenToUse);
  }

  
  static getUserFromToken(token?: string): { 
    id: string; 
    email: string; 
    firstName: string; 
    lastName: string; 
    role: string; 
  } | null {
    const payload = this.decodeToken(token);
    if (!payload) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName || 'Unknown',
      lastName: payload.lastName || 'User',
      role: payload.role
    };
  }

  
  static clearTokens(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      console.log('✅ All tokens and user data cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear tokens:', error);
    }
  }

  
  static hasCompleteAuthState(): boolean {
    const hasToken = !!this.getToken();
    const hasUser = !!this.getUserData();
    const hasRefreshToken = !!this.getRefreshToken();
    
    console.log('🔍 Auth state check:', { hasToken, hasUser, hasRefreshToken });
    return hasToken && hasUser;
  }

  
  static getTokenInfo(token?: string): {
    isValid: boolean;
    isExpired: boolean;
    expiresAt: Date | null;
    timeUntilExpiry: string;
    payload: TokenPayload | null;
  } {
    const payload = this.decodeToken(token);
    const isExpired = this.isTokenExpired(token);
    const isValid = this.isTokenValid(token);
    
    let expiresAt: Date | null = null;
    let timeUntilExpiry = 'Unknown';
    
    if (payload?.exp) {
      expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const msUntilExpiry = expiresAt.getTime() - now.getTime();
      
      if (msUntilExpiry > 0) {
        const minutes = Math.floor(msUntilExpiry / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
          timeUntilExpiry = `${days}d ${hours % 24}h`;
        } else if (hours > 0) {
          timeUntilExpiry = `${hours}h ${minutes % 60}m`;
        } else {
          timeUntilExpiry = `${minutes}m`;
        }
      } else {
        timeUntilExpiry = 'Expired';
      }
    }

    return {
      isValid,
      isExpired,
      expiresAt,
      timeUntilExpiry,
      payload
    };
  }

  
  static debugToken(token?: string): void {
    const tokenToUse = token || this.getToken();
    const info = this.getTokenInfo(tokenToUse || undefined);
    
    console.group('🔍 Token Debug Information');
    console.log('Token exists:', !!tokenToUse);
    console.log('Token valid:', info.isValid);
    console.log('Token expired:', info.isExpired);
    console.log('Expires at:', info.expiresAt?.toLocaleString() || 'Unknown');
    console.log('Time until expiry:', info.timeUntilExpiry);
    
    if (info.payload) {
      console.log('User ID:', info.payload.sub);
      console.log('Email:', info.payload.email);
      console.log('Role:', info.payload.role);
      console.log('Issued at:', new Date(info.payload.iat * 1000).toLocaleString());
    }
    
    console.groupEnd();
  }

  
  static validateTokenWithDetails(token?: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const tokenToUse = token || this.getToken();
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!tokenToUse) {
      errors.push('No token found');
      return { isValid: false, errors, warnings };
    }

    const payload = this.decodeToken(tokenToUse);
    if (!payload) {
      errors.push('Invalid token format');
      return { isValid: false, errors, warnings };
    }

    
    if (!payload.sub) errors.push('Missing user ID in token');
    if (!payload.email) errors.push('Missing email in token');
    if (!payload.role) errors.push('Missing role in token');
    if (!payload.exp) errors.push('Missing expiration in token');

    
    if (this.isTokenExpired(tokenToUse)) {
      errors.push('Token is expired');
    } else {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      
      if (timeUntilExpiry < (15 * 60)) { 
        warnings.push('Token expires soon (less than 15 minutes)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export default TokenManager;
