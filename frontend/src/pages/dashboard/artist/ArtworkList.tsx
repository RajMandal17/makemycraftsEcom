import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Search, Filter, Loader2, AlertCircle, ChevronLeft, ChevronRight, Clock, XCircle, CheckCircle } from 'lucide-react';
import { artworkAPI, getFullImageUrl } from '../../../services/api';
import { artistAPI } from '../../../services/artistAPI';
import { Artwork } from '../../../types';
import { toast } from 'react-toastify';

const ArtworkList: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArtworks, setTotalArtworks] = useState(0);
  const limit = 8;

  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });

  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      setError(null);

      
      const params: any = {
        page: currentPage,
        limit,
      };

      if (filters.search) {
        params.search = filters.search;
      }

      if (filters.category && filters.category !== 'all') {
        params.category = filters.category;
      }

      if (filters.minPrice) {
        params.minPrice = parseFloat(filters.minPrice);
      }

      if (filters.maxPrice) {
        params.maxPrice = parseFloat(filters.maxPrice);
      }

      
      const token = localStorage.getItem('access_token');
      console.log('Artist Dashboard - Fetching artworks with token:', token ? `${token.substring(0, 15)}...` : 'none');

      
      if (!token) {
        setError('Authentication error. Please log in again.');
        setArtworks([]);
        setLoading(false);
        return;
      }

      
      const response = await artistAPI.getMyArtworks(params);
      console.log('Artist artworks response:', response);

      setArtworks(response.artworks || []);
      setTotalPages(response.totalPages || 1);
      setTotalArtworks(response.total || 0);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      setError('Failed to load your artworks. Please try again.');
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, [currentPage]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); 
    fetchArtworks();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      setIsDeleting(true);
      await artistAPI.deleteArtwork(deletingId);
      toast.success('Artwork deleted successfully');
      setArtworks(prev => prev.filter(artwork => artwork.id !== deletingId));
      setDeletingId(null);

      
      setTotalArtworks(prev => prev - 1);
      if (artworks.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchArtworks();
      }
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error('Failed to delete artwork. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Artworks</h1>
        <Link
          to="/dashboard/artist/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Upload New Artwork
        </Link>
      </div>

      {}
      <form onSubmit={handleFilterSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by title..."
                className="w-full border-gray-300 rounded-md shadow-sm pl-10 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="relative">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm pl-10 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Painting">Painting</option>
                <option value="Drawing">Drawing</option>
                <option value="Photography">Photography</option>
                <option value="Digital Art">Digital Art</option>
                <option value="Sculpture">Sculpture</option>
                <option value="Mixed Media">Mixed Media</option>
              </select>
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price (₹)
            </label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              min="0"
              placeholder="Min"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price (₹)
            </label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              min="0"
              placeholder="Max"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="self-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors h-[42px]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </form>

      {}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading your artworks...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchArtworks}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : artworks.length === 0 ? (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
          <div className="text-blue-500 mb-2 text-xl">🖼️</div>
          <h3 className="text-lg font-medium text-blue-800 mb-2">No artworks found</h3>
          <p className="text-blue-600 mb-4">
            {filters.search || filters.category || filters.minPrice || filters.maxPrice
              ? "No artworks match your filters. Try adjusting your search criteria."
              : "You haven't uploaded any artworks yet. Get started by uploading your first piece!"}
          </p>
          <Link
            to="/dashboard/artist/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Upload Your First Artwork
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 relative">
                {}
                {artwork.approvalStatus && artwork.approvalStatus !== 'APPROVED' && (
                  <div className="absolute top-2 left-2 z-10">
                    {artwork.approvalStatus === 'PENDING' ? (
                      <div className="group relative">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Approval
                        </span>
                        {artwork.moderationNotes && (
                          <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            {artwork.moderationNotes}
                          </div>
                        )}
                      </div>
                    ) : artwork.approvalStatus === 'REJECTED' ? (
                      <div className="group relative">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300 shadow-sm">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </span>
                        {artwork.moderationNotes && (
                          <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <strong>Reason:</strong> {artwork.moderationNotes}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
                {artwork.approvalStatus === 'APPROVED' && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Live
                    </span>
                  </div>
                )}

                <div className="aspect-square overflow-hidden">
                  <img
                    src={getFullImageUrl(artwork.images?.[0] || '') || 'https://via.placeholder.com/300'}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-medium mb-1 truncate" title={artwork.title}>
                    {artwork.title}
                  </h3>
                  <p className="text-blue-600 font-bold mb-3">₹{artwork.price.toFixed(2)}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {artwork.category}
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {artwork.medium}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <Link
                      to={`/dashboard/artist/edit/${artwork.id}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Link>

                    <button
                      onClick={() => setDeletingId(artwork.id)}
                      className="text-red-600 hover:text-red-800 transition-colors flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {}
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {artworks.length} of {totalArtworks} artworks
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {}
      {deletingId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this artwork? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtworkList;
