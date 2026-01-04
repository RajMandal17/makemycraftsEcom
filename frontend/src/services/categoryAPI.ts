import apiClient from './api';

/**
 * Category API Service
 * Handles all category-related API calls
 */

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

/**
 * Admin Category DTO - includes all fields for admin panel
 */
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

/**
 * Request to create a new category
 */
export interface CategoryCreateRequest {
    name: string;
    displayName?: string;
    description?: string;
    emoji?: string;
    displayOrder?: number;
    isActive?: boolean;
}

/**
 * Request to update an existing category
 */
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

/**
 * Public Category DTO - active admin-approved categories for dropdowns
 */
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

/**
 * Category API client
 * Follows Single Responsibility Principle
 */
export const categoryAPI = {
    /**
     * Get top selling categories
     * @param limit Maximum number of categories to return (default: 10)
     * @returns Promise with top selling categories
     */
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

    /**
     * Get all unique categories
     * @returns Promise with all category names
     */
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

    /**
     * Get statistics for a specific category
     * @param categoryName Category name
     * @returns Promise with category statistics
     */
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

    /**
     * Get all active categories with full details
     * Returns only admin-approved active categories
     * Used for category dropdowns in artwork creation/editing
     * @returns Promise with active categories including full details
     */
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

// ============================================
// Admin Category API
// ============================================

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

/**
 * Admin Category API client
 * Requires ADMIN role for all operations
 */
export const adminCategoryAPI = {
    /**
     * Get all categories (including deleted) with pagination
     */
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

    /**
     * Get all categories as a list (no pagination)
     */
    getAllList: async (): Promise<AdminCategory[]> => {
        try {
            const response = await apiClient.get<AdminCategoriesResponse>('/admin/categories/list');
            return response.data.success ? response.data.data.categories : [];
        } catch (error) {
            console.error('Error fetching admin categories list:', error);
            return [];
        }
    },

    /**
     * Get only active (not deleted) categories
     */
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

    /**
     * Get only deleted categories
     */
    getDeleted: async (): Promise<AdminCategory[]> => {
        try {
            const response = await apiClient.get<AdminCategoriesResponse>('/admin/categories/deleted');
            return response.data.success ? response.data.data.categories : [];
        } catch (error) {
            console.error('Error fetching deleted categories:', error);
            return [];
        }
    },

    /**
     * Search categories
     */
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

    /**
     * Get a specific category by ID
     */
    getById: async (id: string): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.get<AdminCategoryResponse>(`/admin/categories/${id}`);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error fetching category ${id}:`, error);
            return null;
        }
    },

    /**
     * Create a new category (without image)
     */
    create: async (request: CategoryCreateRequest): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.post<AdminCategoryResponse>('/admin/categories', request);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },

    /**
     * Create a new category with image
     */
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

    /**
     * Update an existing category
     */
    update: async (id: string, request: CategoryUpdateRequest): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.put<AdminCategoryResponse>(`/admin/categories/${id}`, request);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error updating category ${id}:`, error);
            throw error;
        }
    },

    /**
     * Update category with new image
     */
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

    /**
     * Upload/update category image only
     */
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

    /**
     * Remove category image
     */
    removeImage: async (id: string): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.delete<AdminCategoryResponse>(`/admin/categories/${id}/image`);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error removing image for category ${id}:`, error);
            throw error;
        }
    },

    /**
     * Toggle category active status
     */
    toggleActive: async (id: string): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.put<AdminCategoryResponse>(`/admin/categories/${id}/toggle`);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error toggling category ${id}:`, error);
            throw error;
        }
    },

    /**
     * Reorder categories
     */
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

    /**
     * Soft delete a category
     */
    softDelete: async (id: string): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.delete<AdminCategoryResponse>(`/admin/categories/${id}`);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error soft deleting category ${id}:`, error);
            throw error;
        }
    },

    /**
     * Restore a soft-deleted category
     */
    restore: async (id: string): Promise<AdminCategory | null> => {
        try {
            const response = await apiClient.put<AdminCategoryResponse>(`/admin/categories/${id}/restore`);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error(`Error restoring category ${id}:`, error);
            throw error;
        }
    },

    /**
     * Permanently delete a category (CANNOT BE UNDONE)
     */
    hardDelete: async (id: string): Promise<boolean> => {
        try {
            const response = await apiClient.delete<{ success: boolean }>(`/admin/categories/${id}/hard`);
            return response.data.success;
        } catch (error) {
            console.error(`Error permanently deleting category ${id}:`, error);
            throw error;
        }
    },

    /**
     * Get category statistics
     */
    getStats: async (): Promise<CategoryStatsAdminResponse['data'] | null> => {
        try {
            const response = await apiClient.get<CategoryStatsAdminResponse>('/admin/categories/stats');
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error('Error fetching category stats:', error);
            return null;
        }
    },

    /**
     * Check if a category name is available
     */
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
