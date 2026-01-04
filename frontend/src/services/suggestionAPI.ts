import api from './api';

export interface AnalysisMetadata {
  artStyle: string;
  dominantColors: string;
  mood: string;
  subject: string;
  technicalQualities: string[];
}

export interface ArtworkSuggestion {
  id?: number;
  userId: string;
  imageUrl: string;
  suggestedTitle: string;
  suggestedCategory: string;
  suggestedMedium: string;
  suggestedDescription: string;
  suggestedTags: string[];
  suggestedWidth: number;
  suggestedHeight: number;
  confidenceScore: number;
  metadata?: AnalysisMetadata;
  createdAt?: string;
  isApplied?: boolean;
}

export interface AnalysisRequest {
  imageUrl: string;
  includeAdvancedAnalysis?: boolean;
}

export interface SuggestionHistoryResponse {
  suggestions: ArtworkSuggestion[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SuggestionStats {
  totalSuggestions: number;
  appliedSuggestions: number;
  appliedPercentage: number;
}

export interface AIServiceStatus {
  available: boolean;
  provider: string;
}


export const analyzeArtwork = async (request: AnalysisRequest): Promise<ArtworkSuggestion> => {
  const response = await api.post('/suggestions/analyze', request);
  return response.data;
};


export const getSuggestionHistory = async (
  page: number = 0,
  size: number = 10
): Promise<SuggestionHistoryResponse> => {
  const response = await api.get('/suggestions/history', {
    params: { page, size }
  });
  return response.data;
};


export const getAllSuggestions = async (): Promise<ArtworkSuggestion[]> => {
  const response = await api.get('/suggestions/all');
  return response.data;
};


export const getSuggestionById = async (id: number): Promise<ArtworkSuggestion> => {
  const response = await api.get(`/suggestions/${id}`);
  return response.data;
};


export const applySuggestion = async (id: number): Promise<void> => {
  await api.post(`/suggestions/${id}/apply`);
};


export const deleteSuggestion = async (id: number): Promise<void> => {
  await api.delete(`/suggestions/${id}`);
};


export const getSuggestionStats = async (): Promise<SuggestionStats> => {
  const response = await api.get('/suggestions/stats');
  return response.data;
};


export const getAIServiceStatus = async (): Promise<AIServiceStatus> => {
  const response = await api.get('/suggestions/status');
  return response.data;
};

export default {
  analyzeArtwork,
  getSuggestionHistory,
  getAllSuggestions,
  getSuggestionById,
  applySuggestion,
  deleteSuggestion,
  getSuggestionStats,
  getAIServiceStatus
};
