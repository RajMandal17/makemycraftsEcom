import apiClient from './api';
import { HomeStats } from '../types';


export const homeAPI = {
  
  async getStatistics(config?: { signal?: AbortSignal }): Promise<HomeStats> {
    try {
      const response = await apiClient.get<HomeStats>('/home/stats', config);
      return response.data;
    } catch (error) {
      console.error('Error fetching home statistics:', error);
      
      return {
        totalArtworks: 0,
        totalArtists: 0,
        averageRating: 0.0,
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
      };
    }
  },

  
  async getTopSellers(limit: number = 10, config?: { signal?: AbortSignal }): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/home/top-sellers', {
        ...config,
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top-selling artworks:', error);
      return [];
    }
  },
};
