
import { adminApiClient } from './api';
import { User, Artwork, Order, ApiResponse } from '../types';

export const adminAPI = {
  
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
  }): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> => {
    try {
      
      const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      console.log('Calling admin users API with params:', cleanParams);
      const response = await adminApiClient.get<any>('/v1/admin/users', { params: cleanParams });
      console.log('Admin users API raw response:', response);

      
      if (response.data?.data) {
        
        return response.data.data;
      } else if (response.data?.users) {
        
        return response.data;
      } else if (Array.isArray(response.data)) {
        
        return {
          users: response.data,
          total: response.data.length,
          totalPages: 1,
          currentPage: params?.page || 1
        };
      } else {
        console.warn('Unexpected admin users response format:', response.data);
        return {
          users: [],
          total: 0,
          totalPages: 1,
          currentPage: params?.page || 1
        };
      }
    } catch (error: any) {
      console.error('Admin getUsers API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  updateUserStatus: async (userId: string, status: string): Promise<User> => {
    const normalizedStatus = status?.toUpperCase();
    if (!normalizedStatus) {
      throw new Error('Status is required');
    }

    console.log('Updating user status', { userId, status: normalizedStatus });
    const response = await adminApiClient.put<any>(
      `/v1/admin/users/${userId}/status`,
      { status: normalizedStatus }
    );

    
    return response.data.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await adminApiClient.put<any>(`/v1/admin/users/${userId}/role`, {
      role: role,  
    });
    
    return response.data.data;
  },

  
  getArtworks: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
  }): Promise<{
    artworks: Artwork[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> => {
    try {
      
      const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      console.log('Calling admin artworks API with params:', cleanParams);
      const response = await adminApiClient.get<any>('/v1/admin/artworks', { params: cleanParams });
      console.log('Admin artworks API raw response:', response);

      
      if (response.data?.data) {
        
        return response.data.data;
      } else if (response.data?.artworks) {
        
        return response.data;
      } else if (Array.isArray(response.data)) {
        
        return {
          artworks: response.data,
          total: response.data.length,
          totalPages: 1,
          currentPage: params?.page || 1
        };
      } else {
        console.warn('Unexpected admin artworks response format:', response.data);
        return {
          artworks: [],
          total: 0,
          totalPages: 1,
          currentPage: params?.page || 1
        };
      }
    } catch (error: any) {
      console.error('Admin getArtworks API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  updateArtwork: async (artworkId: string, artworkData: any): Promise<Artwork> => {
    const response = await adminApiClient.put<any>(`/v1/admin/artworks/${artworkId}`, artworkData);
    
    return response.data.data;
  },

  deleteArtwork: async (artworkId: string): Promise<void> => {
    await adminApiClient.delete(`/v1/admin/artworks/${artworkId}`);
  },

  
  getPendingArtworks: async (): Promise<Artwork[]> => {
    try {
      const response = await adminApiClient.get<any>('/v1/admin/artworks/pending');
      console.log('Pending artworks response:', response.data);

      if (response.data?.data?.artworks) {
        return response.data.data.artworks;
      } else if (response.data?.artworks) {
        return response.data.artworks;
      } else if (Array.isArray(response.data?.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching pending artworks:', error);
      throw error;
    }
  },

  approveArtworkWithCategory: async (artworkId: string, notes?: string): Promise<Artwork> => {
    const response = await adminApiClient.post<any>(
      `/v1/admin/artworks/${artworkId}/approve-with-category`,
      { notes }
    );
    return response.data.data;
  },

  approveArtwork: async (artworkId: string, notes?: string): Promise<Artwork> => {
    const response = await adminApiClient.post<any>(
      `/v1/admin/artworks/${artworkId}/approve`,
      { notes }
    );
    return response.data.data;
  },

  rejectArtwork: async (artworkId: string, reason: string): Promise<Artwork> => {
    const response = await adminApiClient.post<any>(
      `/v1/admin/artworks/${artworkId}/reject`,
      { reason }
    );
    return response.data.data;
  },

  
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    orders: Order[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> => {
    const response = await adminApiClient.get<any>('/v1/admin/orders', { params });
    
    return response.data.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await adminApiClient.put<any>(`/v1/admin/orders/${orderId}/status`, {
      status,
    });
    
    return response.data.data;
  },

  
  getAnalytics: async (): Promise<{
    totalUsers: number;
    totalArtworks: number;
    totalOrders: number;
    revenue: number;
  }> => {
    const response = await adminApiClient.get<ApiResponse<any>>('/v1/admin/dashboard/overview');
    const data = response.data.data;

    
    return {
      totalUsers: data.userStats?.totalUsers || 0,
      totalArtworks: data.artworkStats?.totalArtworks || 0,
      totalOrders: data.orderStats?.totalOrders || 0,
      revenue: data.revenueStats?.totalRevenue || 0,
    };
  },

  
  getDashboardOverview: async (): Promise<any> => {
    const response = await adminApiClient.get<ApiResponse<any>>('/v1/admin/dashboard/overview');
    return response.data.data;
  },

  
  generateReport: async (request: {
    type: string;
    format: string;
    startDate: string;
    endDate: string;
  }): Promise<string> => {
    const response = await adminApiClient.post<{ reportId: string; filename: string; message: string; success: boolean }>(
      '/v1/admin/reports/generate',
      request
    );
    return response.data.reportId;
  },

  
  downloadReport: async (reportId: string): Promise<Blob> => {
    const response = await adminApiClient.get(`/v1/admin/reports/download/${reportId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  
  getReportFormats: async (): Promise<string[]> => {
    const response = await adminApiClient.get<ApiResponse<string[]>>('/v1/admin/reports/formats');
    return response.data.data;
  },
};


export type ReportType = 'SALES' | 'USER_ACTIVITY' | 'ARTWORK_PERFORMANCE' | 'REVENUE';
export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV';

export { adminApiClient };
export default adminAPI;
