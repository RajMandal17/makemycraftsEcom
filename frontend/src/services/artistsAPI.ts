import apiClient, { getFullImageUrl } from './api';
import { Artist } from '../types';

const resolveProfileImage = (profileImage?: string | null, profilePictureUrl?: string | null) => {
  if (profilePictureUrl) {
    return profilePictureUrl;
  }
  if (profileImage) {
    return getFullImageUrl(profileImage);
  }
  return null;
};

export const artistsAPI = {
  /**
   * Get all artists with pagination and search
   */
  getAllArtists: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    sort?: string;
  }): Promise<{ artists: Artist[]; total: number; totalPages: number; currentPage: number }> => {
    try {
      console.log('Fetching artists with params:', params);
      const response = await apiClient.get('/artists', { params });
      console.log('Artists response:', response.data);

      // Process image URLs
      const artists = response.data.artists.map((artist: Artist) => ({
        ...artist,
        profileImage: resolveProfileImage(artist.profileImage, artist.profilePictureUrl)
      }));

      return {
        artists,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 0
      };
    } catch (error) {
      console.error("Error fetching artists:", error);
      throw error;
    }
  },

  /**
   * Get artist by ID
   */
  getArtistById: async (id: string): Promise<Artist> => {
    try {
      const response = await apiClient.get(`/artists/${id}`);
      const artist = response.data;

      // Process image URL
      artist.profileImage = resolveProfileImage(artist.profileImage, artist.profilePictureUrl);

      return artist;
    } catch (error) {
      console.error(`Error fetching artist with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get featured artists
   */
  getFeaturedArtists: async (): Promise<Artist[]> => {
    try {
      const response = await apiClient.get('/artists/featured');

      // Process image URLs
      const artists = response.data.artists.map((artist: Artist) => ({
        ...artist,
        profileImage: resolveProfileImage(artist.profileImage, artist.profilePictureUrl)
      }));

      return artists;
    } catch (error) {
      console.error("Error fetching featured artists:", error);
      throw error;
    }
  },

  /**
   * Get artist by username (LinkedIn-style profile URL)
   */
  getArtistByUsername: async (username: string): Promise<Artist> => {
    try {
      const response = await apiClient.get(`/artists/username/${username}`);
      const artist = response.data;

      // Process image URL
      artist.profileImage = resolveProfileImage(artist.profileImage, artist.profilePictureUrl);

      return artist;
    } catch (error) {
      console.error(`Error fetching artist with username ${username}:`, error);
      throw error;
    }
  },

  /**
   * Check if username is available
   */
  checkUsernameAvailability: async (username: string): Promise<{ available: boolean; message: string }> => {
    try {
      const response = await apiClient.get('/artists/username-available', {
        params: { username }
      });
      return {
        available: response.data.available,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error checking username availability for ${username}:`, error);
      throw error;
    }
  }
};

export default artistsAPI;
