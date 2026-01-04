import apiClient from './api';
import { Artwork } from '../types';

interface ArtistDashboardStats {
  totalArtworks: number;
  salesThisMonth: number;
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  averageRating: number;
  totalReviews: number;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
    icon: string;
  }>;
  topArtworks: Array<{
    id: string;
    title: string;
    price: number;
    sales: number;
    imageUrl?: string;
  }>;
}

export const artistAPI = {
  /**
   * Get artist dashboard statistics
   */
  getDashboardStats: async (): Promise<ArtistDashboardStats> => {
    try {
      console.log('Fetching artist dashboard stats...');
      const response = await apiClient.get<ArtistDashboardStats>('/dashboard/artist/stats');
      console.log('Artist dashboard stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching artist dashboard stats:", error);
      throw error;
    }
  },

  /**
   * Get artworks for the logged-in artist
   */
  getMyArtworks: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<{ artworks: Artwork[]; total: number; totalPages: number }> => {
    try {
      console.log('Fetching artist artworks with params:', params);
      const response = await apiClient.get('/artworks/my-artworks', { params });
      console.log('Artist artworks response:', response.data);
      
      if (response.data && typeof response.data === 'object') {
        return {
          artworks: response.data.artworks || [],
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        };
      }
      
      return { artworks: [], total: 0, totalPages: 0 };
    } catch (error) {
      console.error("Error fetching artist artworks:", error);
      throw error;
    }
  },
  
  /**
   * Create a new artwork
   */
  createArtwork: async (artworkData: FormData): Promise<Artwork> => {
    const response = await apiClient.post('/artworks', artworkData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  /**
   * Update an existing artwork
   */
  updateArtwork: async (id: string, artworkData: FormData): Promise<Artwork> => {
    const response = await apiClient.put(`/artworks/${id}`, artworkData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  /**
   * Delete an artwork
   */
  deleteArtwork: async (id: string): Promise<void> => {
    await apiClient.delete(`/artworks/${id}`);
  }
};

export default artistAPI;
