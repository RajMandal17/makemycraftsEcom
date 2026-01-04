// Admin API Service
import { adminApiClient } from './api';
import { User, Artwork, Order, ApiResponse } from '../types';

export const adminAPI = {
  // User Management
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
      // Filter out empty string values from params
      const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      console.log('Calling admin users API with params:', cleanParams);
      const response = await adminApiClient.get<any>('/v1/admin/users', { params: cleanParams });
      console.log('Admin users API raw response:', response);

      // Handle different response formats
      if (response.data?.data) {
        // Backend returns { data: { users: [], total: ... }, success: true, message: ... }
        return response.data.data;
      } else if (response.data?.users) {
        // Direct data format
        return response.data;
      } else if (Array.isArray(response.data)) {
        // Array response
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

    // Backend returns { data: UserDto, success: true, message: ... }
    return response.data.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await adminApiClient.put<any>(`/v1/admin/users/${userId}/role`, {
      role: role,  // Backend expects 'role', not 'newRole'
    });
    // Backend returns { data: UserDto, success: true, message: ... }
    return response.data.data;
  },

  // Artwork Management
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
      // Filter out empty string values from params
      const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      console.log('Calling admin artworks API with params:', cleanParams);
      const response = await adminApiClient.get<any>('/v1/admin/artworks', { params: cleanParams });
      console.log('Admin artworks API raw response:', response);

      // Handle different response formats
      if (response.data?.data) {
        // Backend returns { data: { artworks: [], total: ... }, success: true, message: ... }
        return response.data.data;
      } else if (response.data?.artworks) {
        // Direct data format
        return response.data;
      } else if (Array.isArray(response.data)) {
        // Array response
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
    // Backend returns { data: ArtworkDto, success: true, message: ... }
    return response.data.data;
  },

  deleteArtwork: async (artworkId: string): Promise<void> => {
    await adminApiClient.delete(`/v1/admin/artworks/${artworkId}`);
  },

  // Pending Artwork Approvals
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

  // Order Management
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
    // Backend returns { data: { orders: [], total: ... }, success: true, message: ... }
    return response.data.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await adminApiClient.put<any>(`/v1/admin/orders/${orderId}/status`, {
      status,
    });
    // Backend returns { data: OrderDto, success: true, message: ... }
    return response.data.data;
  },

  // Analytics
  getAnalytics: async (): Promise<{
    totalUsers: number;
    totalArtworks: number;
    totalOrders: number;
    revenue: number;
  }> => {
    const response = await adminApiClient.get<ApiResponse<any>>('/v1/admin/dashboard/overview');
    const data = response.data.data;

    // Map the backend response to the expected frontend format
    return {
      totalUsers: data.userStats?.totalUsers || 0,
      totalArtworks: data.artworkStats?.totalArtworks || 0,
      totalOrders: data.orderStats?.totalOrders || 0,
      revenue: data.revenueStats?.totalRevenue || 0,
    };
  },

  // Dashboard Overview (NEW - Admin Dashboard Service)
  getDashboardOverview: async (): Promise<any> => {
    const response = await adminApiClient.get<ApiResponse<any>>('/v1/admin/dashboard/overview');
    return response.data.data;
  },

  // Report Generation (NEW - Admin Dashboard Service)
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

  // Download Report (NEW - Admin Dashboard Service)
  downloadReport: async (reportId: string): Promise<Blob> => {
    const response = await adminApiClient.get(`/v1/admin/reports/download/${reportId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get Report Formats (NEW - Admin Dashboard Service)
  getReportFormats: async (): Promise<string[]> => {
    const response = await adminApiClient.get<ApiResponse<string[]>>('/v1/admin/reports/formats');
    return response.data.data;
  },
};

// Export types
export type ReportType = 'SALES' | 'USER_ACTIVITY' | 'ARTWORK_PERFORMANCE' | 'REVENUE';
export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV';

export { adminApiClient };
export default adminAPI;
