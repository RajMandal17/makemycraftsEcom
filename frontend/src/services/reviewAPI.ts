import apiClient from './api';



export interface ReviewDto {
    id?: string;
    rating: number;
    comment?: string;
    orderItemId: string;
    artworkId?: string;
    customerId?: string;
    orderId?: string;
    verified?: boolean;
    createdAt?: string;
    updatedAt?: string;
    customerName?: string;
    customerProfileImage?: string;
    artworkTitle?: string;
    artworkImageUrl?: string;
    helpfulCount?: number;
}

export interface ReviewEligibilityDto {
    orderItemId: string;
    artworkId?: string;
    artworkTitle?: string;
    artworkImageUrl?: string;
    orderId?: string;
    eligible: boolean;
    reason?: string;
    alreadyReviewed: boolean;
    existingReviewId?: string;
    existingRating?: number;
    deliveredAt?: string;
    reviewDeadline?: string;
    daysRemaining: number;
    canEdit: boolean;
}

export interface ArtworkRatingSummaryDto {
    artworkId: string;
    averageRating: number;
    totalReviews: number;
    oneStarCount: number;
    twoStarCount: number;
    threeStarCount: number;
    fourStarCount: number;
    fiveStarCount: number;
    recentReviews: ReviewDto[];
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
    reviews?: ReviewDto[];
    total?: number;
    averageRating?: number;
}


export const reviewAPI = {
    
    submitReview: async (review: Pick<ReviewDto, 'orderItemId' | 'rating' | 'comment'>): Promise<ReviewDto> => {
        const response = await apiClient.post<ApiResponse<ReviewDto>>('/reviews', review);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to submit review');
        }
        return response.data.data!;
    },

    
    updateReview: async (reviewId: string, review: Pick<ReviewDto, 'rating' | 'comment'>): Promise<ReviewDto> => {
        const response = await apiClient.put<ApiResponse<ReviewDto>>(`/reviews/${reviewId}`, review);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to update review');
        }
        return response.data.data!;
    },

    
    deleteReview: async (reviewId: string): Promise<void> => {
        const response = await apiClient.delete<ApiResponse<void>>(`/reviews/${reviewId}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete review');
        }
    },

    
    getArtworkReviews: async (artworkId: string): Promise<{ reviews: ReviewDto[]; total: number }> => {
        const response = await apiClient.get<ApiResponse<never>>(`/reviews/artwork/${artworkId}`);
        return {
            reviews: response.data.reviews || [],
            total: response.data.total || 0
        };
    },

    
    getArtworkRatingSummary: async (artworkId: string): Promise<ArtworkRatingSummaryDto> => {
        const response = await apiClient.get<ApiResponse<ArtworkRatingSummaryDto>>(`/reviews/artwork/${artworkId}/summary`);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Failed to get rating summary');
        }
        return response.data.data;
    },

    
    checkEligibility: async (orderItemId: string): Promise<ReviewEligibilityDto> => {
        const response = await apiClient.get<ApiResponse<ReviewEligibilityDto>>(`/reviews/eligibility/${orderItemId}`);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Failed to check eligibility');
        }
        return response.data.data;
    },

    
    getReviewableItems: async (): Promise<ReviewEligibilityDto[]> => {
        const response = await apiClient.get<ApiResponse<ReviewEligibilityDto[]> & { data: ReviewEligibilityDto[] }>('/reviews/reviewable-items');
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to get reviewable items');
        }
        return response.data.data || [];
    },

    
    getMyReviews: async (): Promise<ReviewDto[]> => {
        const response = await apiClient.get<ApiResponse<never>>('/reviews/my-reviews');
        return response.data.reviews || [];
    },

    
    getArtistReviews: async (artistId: string): Promise<{ reviews: ReviewDto[]; total: number; averageRating: number }> => {
        const response = await apiClient.get<ApiResponse<never>>(`/reviews/artist/${artistId}`);
        return {
            reviews: response.data.reviews || [],
            total: response.data.total || 0,
            averageRating: response.data.averageRating || 0
        };
    }
};

export default reviewAPI;
