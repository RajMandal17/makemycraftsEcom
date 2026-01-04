import apiClient from './api';



export interface CategoryStats {
    categoryId?: string;
    category: string;
    slug?: string;
    artworkCount: number;
    salesCount: number;
    totalRevenue: number;
    averagePrice: number;
    uniqueCustomers: number;
    displayName: string;
    icon: string;
    imageUrl?: string;
    rank: number;
}


export interface AdminCategory {
    id: string;
    name: string;
    slug: string;
    displayName: string;
    description?: string;
    imageUrl?: string;
    emoji?: string;
    displayOrder: number;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    deletedBy?: string;
    artworkCount?: number;
}


export interface CategoryCreateRequest {
    name: string;
    displayName?: string;
    description?: string;
    emoji?: string;
    displayOrder?: number;
    isActive?: boolean;
}


export interface CategoryUpdateRequest {
    name?: string;
    displayName?: string;
    description?: string;
    emoji?: string;
    displayOrder?: number;
    isActive?: boolean;
    removeImage?: boolean;
}

export interface TopCategoriesResponse {
    success: boolean;
    message: string;
    data: {
        categories: CategoryStats[];
        count: number;
        limit: number;
    };
}

export interface AllCategoriesResponse {
    success: boolean;
    message: string;
    data: {
        categories: string[];
        count: number;
    };
}

export interface CategoryStatsResponse {
    success: boolean;
    message: string;
    data: CategoryStats;
}


export interface PublicCategory {
    id: string;
    name: string;
    slug: string;
    displayName: string;
    description?: string;
    imageUrl?: string;
    emoji?: string;
    displayOrder: number;
}

export interface ActiveCategoriesResponse {
    success: boolean;
    message: string;
    data: {
        categories: PublicCategory[];
        count: number;
    };
}


export const categoryAPI = {
    
    getTopSelling: async (limit: number = 10): Promise<CategoryStats[]> => {
        try {
            const response = await apiClient.get<TopCategoriesResponse>(
                `/categories/top-selling`,
                { params: { limit } }
            );

            if (response.data.success && response.data.data) {
                return response.data.data.categories;
            }

            return [];
        } catch (error) {
            console.error('Error fetching top selling categories:', error);
            return [];
        }
    },

    
    getAll: async (): Promise<string[]> => {
        try {
            const response = await apiClient.get<AllCategoriesResponse>('/categories/all');

            if (response.data.success && response.data.data) {
                return response.data.data.categories;
            }

            return [];
        } catch (error) {
            console.error('Error fetching all categories:', error);
            return [];
        }
    },

    
    getStats: async (categoryName: string): Promise<CategoryStats | null> => {
        try {
            const response = await apiClient.get<CategoryStatsResponse>(
                `/categories/${categoryName}/stats`
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Error fetching stats for category ${categoryName}:`, error);
            return null;
        }
    },

    
    getActive: async (): Promise<PublicCategory[]> => {
        try {
            const response = await apiClient.get<ActiveCategoriesResponse>('/categories/active');

            if (response.data.success && response.data.data) {
                return response.data.data.categories;
            }

            return [];
        } catch (error) {
            console.error('Error fetching active categories:', error);
            return [];
        }
    },
};





interface AdminCategoriesResponse {
    success: boolean;
    message: string;
    data: {
        categories: AdminCategory[];
        total?: number;
        totalPages?: number;
        currentPage?: number;
        count?: number;
    };
}

interface AdminCategoryResponse {
    success: boolean;
    message: string;
    data: AdminCategory;
}

interface CategoryStatsAdminResponse {
    success: boolean;
    message: string;
    data: {
        totalCategories: number;
        activeCategories: number;
        inactiveCategories: number;
        deletedCategories: number;
    };
}

interface NameCheckResponse {
    success: boolean;
    message: string;
    data: {
        name: string;
        available: boolean;
    };
}


export const adminCategoryAPI = {
    
    getAll: async (page: number = 0, limit: number = 50): Promise<AdminCategoriesResponse['data'] | null> => {
        try {
            const response = await apiClient.get<AdminCategoriesResponse>(
                '/admin/categories',
                { params: { page, limit } }
            );
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error('Error fetching admin categories:', error);
            return null;
        }
    },

    
    getAllList: async (): Promise<AdminCategory[]> => {
        try {
            const response = await apiClient.get<AdminCategoriesResponse>('/admin/categories/list');
            return response.data.success ? response.data.data.categories : [];
        } catch (error) {
            console.error('Error fetching admin categories list:', error);
            return [];
        }
    },

    
    getActive: async (page: number = 0, limit: number = 50): Promise<AdminCategoriesResponse['data'] | null> => {
        try {
            const response = await apiClient.get<AdminCategoriesResponse>(
                '/admin/categories/active',
                { params: { page, limit } }
            );
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error('Error fetching active categories:', error);
            return null;
        }
    },

    
    getDeleted: async (): Promise<AdminCategory[]> => {
        try {
            const response = await apiClient.get<AdminCategoriesResponse>('/admin/categories/deleted');
            return response.data.success ? response.data.data.categories : [];
        } catch (error) {
            console.error('Error fetching deleted categories:', error);
            return [];
        }
    },

    
    search: async (query: string, includeDeleted: boolean = false): Promise<AdminCategory[]> => {
        try {
            const response = await apiClient.get<AdminCategoriesResponse>(
                '/admin/categories/search',
                { params: { q: query, includeDeleted } }
            );
            return response.data.success ? response.data.data.categories : [];
        } catch (error) {
            console.error('Error searching categories:', error);
            return [];
        }
    },

    
    getById: async (id: string): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.get<AdminCategoryResponse>(`/admin/categories/${id}`);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error fetching category ${id}:`, error);
            return null;
        }
    },

    
    create: async (request: CategoryCreateRequest): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.post<AdminCategoryResponse>('/admin/categories', request);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },

    
    createWithImage: async (request: CategoryCreateRequest, image: File): Promise<AdminCategory | null> => {
        try {
            const formData = new FormData();
            formData.append('category', new Blob([JSON.stringify(request)], { type: 'application/json' }));
            formData.append('image', image);

            const response = await apiClient.post<AdminCategoryResponse>(
                '/admin/categories/with-image',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error('Error creating category with image:', error);
            throw error;
        }
    },

    
    update: async (id: string, request: CategoryUpdateRequest): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.put<AdminCategoryResponse>(`/admin/categories/${id}`, request);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error updating category ${id}:`, error);
            throw error;
        }
    },

    
    updateWithImage: async (id: string, request: CategoryUpdateRequest, image: File): Promise<AdminCategory | null> => {
        try {
            const formData = new FormData();
            formData.append('category', new Blob([JSON.stringify(request)], { type: 'application/json' }));
            formData.append('image', image);

            const response = await apiClient.put<AdminCategoryResponse>(
                `/admin/categories/${id}/with-image`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error updating category ${id} with image:`, error);
            throw error;
        }
    },

    
    uploadImage: async (id: string, image: File): Promise<AdminCategory | null> => {
        try {
            const formData = new FormData();
            formData.append('image', image);

            const response = await apiClient.post<AdminCategoryResponse>(
                `/admin/categories/${id}/image`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error uploading image for category ${id}:`, error);
            throw error;
        }
    },

    
    removeImage: async (id: string): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.delete<AdminCategoryResponse>(`/admin/categories/${id}/image`);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error removing image for category ${id}:`, error);
            throw error;
        }
    },

    
    toggleActive: async (id: string): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.put<AdminCategoryResponse>(`/admin/categories/${id}/toggle`);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error toggling category ${id}:`, error);
            throw error;
        }
    },

    
    reorder: async (categoryIds: string[]): Promise<AdminCategory[]> => {
        try {
            const response = await apiClient.put<AdminCategoriesResponse>(
                '/admin/categories/reorder',
                categoryIds
            );
            return response.data.success ? response.data.data.categories : [];
        } catch (error) {
            console.error('Error reordering categories:', error);
            throw error;
        }
    },

    
    softDelete: async (id: string): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.delete<AdminCategoryResponse>(`/admin/categories/${id}`);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error soft deleting category ${id}:`, error);
            throw error;
        }
    },

    
    restore: async (id: string): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.put<AdminCategoryResponse>(`/admin/categories/${id}/restore`);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error restoring category ${id}:`, error);
            throw error;
        }
    },

    
    hardDelete: async (id: string): Promise<boolean> => {
        try {
            const response = await apiClient.delete<{ success: boolean }>(`/admin/categories/${id}/hard`);
            return response.data.success;
        } catch (error) {
            console.error(`Error permanently deleting category ${id}:`, error);
            throw error;
        }
    },

    
    getStats: async (): Promise<CategoryStatsAdminResponse['data'] | null> => {
        try {
            const response = await apiClient.get<CategoryStatsAdminResponse>('/admin/categories/stats');
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error('Error fetching category stats:', error);
            return null;
        }
    },

    
    checkNameAvailable: async (name: string, excludeId?: string): Promise<boolean> => {
        try {
            const params: { name: string; excludeId?: string } = { name };
            if (excludeId) params.excludeId = excludeId;

            const response = await apiClient.get<NameCheckResponse>(
                '/admin/categories/check-name',
                { params }
            );
            return response.data.success ? response.data.data.available : false;
        } catch (error) {
            console.error('Error checking name availability:', error);
            return false;
        }
    },
};

export default categoryAPI;
