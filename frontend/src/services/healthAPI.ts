import apiClient from './api';

/**
 * Health Check and Logging API Service
 */

export const healthAPI = {
  /**
   * Check if backend API is alive and get system status
   */
  check: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  /**
   * Quick ping test for connectivity
   */
  ping: async () => {
    const response = await apiClient.get('/health/ping');
    return response.data;
  },

  /**
   * Send a log message to backend
   */
  log: async (message: string, level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' = 'INFO', source = 'frontend') => {
    const response = await apiClient.post('/health/log', {
      message,
      level,
      source
    });
    return response.data;
  },

  /**
   * Echo test for request/response verification
   */
  echo: async (data: any) => {
    const response = await apiClient.post('/health/echo', data);
    return response.data;
  }
};

/**
 * Log helper functions for easy frontend logging
 */
export const backendLogger = {
  info: (message: string, source?: string) => healthAPI.log(message, 'INFO', source),
  warn: (message: string, source?: string) => healthAPI.log(message, 'WARN', source),
  error: (message: string, source?: string) => healthAPI.log(message, 'ERROR', source),
  debug: (message: string, source?: string) => healthAPI.log(message, 'DEBUG', source),
};

export default healthAPI;
