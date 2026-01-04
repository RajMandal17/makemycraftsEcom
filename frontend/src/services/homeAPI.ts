import apiClient from './api';
import { HomeStats } from '../types';

/**
 * Home page API service
 * Follows Single Responsibility Principle - only handles home-related API calls
 */
export const homeAPI = {
  /**
   * Fetch home page statistics
   * 
   * @returns Promise<HomeStats> containing aggregated statistics
   * @throws Error if the API call fails
   */
  async getStatistics(config?: { signal?: AbortSignal }): Promise<HomeStats> {
    try {
      const response = await apiClient.get<HomeStats>('/home/stats', config);
      return response.data;
    } catch (error) {
      console.error('Error fetching home statistics:', error);
      // Return default values if API fails - graceful degradation
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

  /**
   * Fetch top-selling artworks for homepage carousel
   * 
   * @param limit - Maximum number of artworks to return (default: 10)
   * @returns Promise<Artwork[]> containing top-selling artworks
   * @throws Error if the API call fails
   */
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
