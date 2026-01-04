import apiClient from './api';
import { User } from '../types';

export const userAPI = {
  
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  
  updateProfile: async (userData: {
    firstName: string;
    lastName: string;
    bio?: string;
    website?: string;
    socialLinks?: {
      instagram?: string;
      twitter?: string;
      facebook?: string;
    };
  }): Promise<User> => {
    
    const filteredSocialLinks = Object.fromEntries(
      Object.entries(userData.socialLinks || {}).filter(([, value]) => value && value.trim() !== "")
    );
    const payload: any = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      bio: userData.bio,
    };
    if (userData.website && userData.website.trim() !== "") {
      payload.website = userData.website;
    }
    if (Object.keys(filteredSocialLinks).length > 0) {
      payload.socialLinks = filteredSocialLinks;
    }
    const response = await apiClient.put<User>('/users/profile', payload);
    return response.data;
  },

  
  updateProfileWithImage: async (formData: FormData): Promise<string> => {
    const response = await apiClient.post<string>('/users/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  
  updatePassword: async (newPassword: string, confirmPassword: string): Promise<{ status: string; message: string }> => {
    const response = await apiClient.put<{ status: string; message: string }>('/users/password', {
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  
  hasPassword: async (): Promise<boolean> => {
    const response = await apiClient.get<{ status: string; hasPassword: boolean }>('/users/password/status');
    return response.data.hasPassword;
  },
};
