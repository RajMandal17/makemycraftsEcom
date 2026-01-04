import apiClient from './api';

export const debugAPI = {
  
  testAuth: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/users/auth-check');
      console.log('Auth check response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Auth check error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  
  testArtistAccess: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/artworks/my-artworks');
      console.log('Artist access test response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Artist access test error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default debugAPI;
