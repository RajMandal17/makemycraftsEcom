import apiClient from './api';



export const healthAPI = {
  
  check: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  
  ping: async () => {
    const response = await apiClient.get('/health/ping');
    return response.data;
  },

  
  log: async (message: string, level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' = 'INFO', source = 'frontend') => {
    const response = await apiClient.post('/health/log', {
      message,
      level,
      source
    });
    return response.data;
  },

  
  echo: async (data: any) => {
    const response = await apiClient.post('/health/echo', data);
    return response.data;
  }
};


export const backendLogger = {
  info: (message: string, source?: string) => healthAPI.log(message, 'INFO', source),
  warn: (message: string, source?: string) => healthAPI.log(message, 'WARN', source),
  error: (message: string, source?: string) => healthAPI.log(message, 'ERROR', source),
  debug: (message: string, source?: string) => healthAPI.log(message, 'DEBUG', source),
};

export default healthAPI;
