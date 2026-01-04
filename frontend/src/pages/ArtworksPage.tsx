import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient, { getFullImageUrl } from '../services/api';
import { categoryAPI, PublicCategory } from '../services/categoryAPI';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  medium: string;
  images: string[];
  artist: {
    firstName: string;
    lastName: string;
  };
  isAvailable: boolean;
}

const ArtworksPage: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  // Dynamic categories from API
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const activeCategories = await categoryAPI.getActive();
        setCategories(activeCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArtworks();
  }, [filters]);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: 1,
        limit: 50
      };

      if (filters.category && filters.category !== 'All') {
        params.category = filters.category;
      }
      if (filters.minPrice) {
        params.minPrice = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice) {
        params.maxPrice = parseFloat(filters.maxPrice);
      }
      if (filters.search) {
        params.search = filters.search;
      }

      const response = await apiClient.get('/artworks', { params });
      setArtworks(response.data.artworks || []);
    } catch (err: any) {
      console.error('Error fetching artworks:', err);
      setError(err.response?.data?.message || 'Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  if (loading && artworks.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing Artworks
          </h1>
          <p className="text-xl text-purple-100">
            Browse our collection of unique pieces from talented artists
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Filter Artworks</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search artworks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Loading...' : 'All Categories'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price (₹)
              </label>
              <input
                type="number"
                placeholder="10000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${artworks.length} artwork${artworks.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Artworks Grid */}
        {artworks.length === 0 && !loading ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No artworks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <Link
                key={artwork.id}
                to={`/artworks/${artwork.id}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {artwork.images && artwork.images.length > 0 ? (
                    <img
                      src={getFullImageUrl(artwork.images[0])}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <svg
                        className="h-16 w-16 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {artwork.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-2">
                    by {artwork.artist.firstName} {artwork.artist.lastName}
                  </p>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {artwork.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {artwork.medium}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-purple-600">
                      ₹{artwork.price.toFixed(2)}
                    </p>
                    {artwork.isAvailable ? (
                      <span className="text-xs text-green-600 font-medium">
                        Available
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium">
                        Sold
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtworksPage;
