import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Image, Search, Filter, Trash2, Edit, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { adminAPI } from '../../../services/adminAPI';

const AdminArtworks: React.FC = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [totalArtworks, setTotalArtworks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [artworkToEdit, setArtworkToEdit] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    medium: '',
    isAvailable: true
  });

  const fetchArtworks = async (page = 1, category = selectedCategory, status = selectedStatus) => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getArtworks({ page, limit: 8, category, status });
      setArtworks(response.artworks);
      setTotalArtworks(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
      toast.error('Failed to load artworks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  const handlePageChange = (page: number) => {
    fetchArtworks(page);
  };

  const handleFilterChange = () => {
    fetchArtworks(1, selectedCategory, selectedStatus);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    
    fetchArtworks(1, selectedCategory, selectedStatus);
  };

  const handleEditModalOpen = (artwork: any) => {
    setArtworkToEdit(artwork);
    setEditFormData({
      title: artwork.title,
      description: artwork.description,
      price: artwork.price,
      category: artwork.category,
      medium: artwork.medium,
      isAvailable: artwork.isAvailable
    });
    setShowEditModal(true);
  };

  const handleDeleteModalOpen = (artwork: any) => {
    setArtworkToEdit(artwork);
    setShowDeleteModal(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'price'
          ? parseFloat(value) || 0
          : value
    });
  };

  const handleArtworkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artworkToEdit) return;

    try {
      await adminAPI.updateArtwork(artworkToEdit.id, editFormData);
      toast.success(`Artwork "${editFormData.title}" updated successfully`);

      
      setArtworks(artworks.map(artwork =>
        artwork.id === artworkToEdit.id ? { ...artwork, ...editFormData } : artwork
      ));

      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update artwork:', error);
      toast.error('Failed to update artwork');
    }
  };

  const handleArtworkDelete = async () => {
    if (!artworkToEdit) return;

    try {
      await adminAPI.deleteArtwork(artworkToEdit.id);
      toast.success(`Artwork "${artworkToEdit.title}" deleted successfully`);

      
      setArtworks(artworks.filter(artwork => artwork.id !== artworkToEdit.id));
      setTotalArtworks(prev => prev - 1);

      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete artwork:', error);
      toast.error('Failed to delete artwork');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center">
          <Image className="mr-2 h-6 w-6" /> Manage Artworks
        </h1>
      </div>

      {}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form
          onSubmit={handleSearch}
          className="flex-1 flex"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search artworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">All Categories</option>
            <option value="Painting">Painting</option>
            <option value="Sculpture">Sculpture</option>
            <option value="Photography">Photography</option>
            <option value="Digital">Digital Art</option>
            <option value="Mixed Media">Mixed Media</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>

          <button
            onClick={handleFilterChange}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" /> Filter
          </button>
        </div>
      </div>

      {}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-500">Loading artworks...</p>
        </div>
      ) : artworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {artworks.map((artwork) => (
            <div key={artwork.id} className="bg-white border rounded-lg overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                {artwork.images && artwork.images.length > 0 ? (
                  <img
                    src={artwork.images[0]}
                    alt={artwork.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${artwork.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {artwork.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg truncate">{artwork.title}</h3>
                <p className="text-sm text-gray-500 mb-1 truncate">by {artwork.artist?.firstName} {artwork.artist?.lastName}</p>
                <p className="font-medium text-lg mb-2">₹{artwork.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mb-3 truncate">{artwork.category} • {artwork.medium}</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditModalOpen(artwork)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteModalOpen(artwork)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-12 text-center">
          <Image className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No artworks found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query</p>
        </div>
      )}

      {}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{artworks.length}</span> of{' '}
            <span className="font-medium">{totalArtworks}</span> artworks
          </p>

          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-2 border rounded-md disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {}
            <button className="px-4 py-2 border bg-purple-50 text-purple-600 font-medium rounded-md">
              {currentPage}
            </button>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-2 border rounded-md disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {}
      {showEditModal && artworkToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Artwork</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleArtworkUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditFormChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  rows={3}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={editFormData.price}
                  onChange={handleEditFormChange}
                  min="0"
                  step="0.01"
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditFormChange}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="Painting">Painting</option>
                    <option value="Sculpture">Sculpture</option>
                    <option value="Photography">Photography</option>
                    <option value="Digital">Digital Art</option>
                    <option value="Mixed Media">Mixed Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medium
                  </label>
                  <input
                    type="text"
                    name="medium"
                    value={editFormData.medium}
                    onChange={handleEditFormChange}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={editFormData.isAvailable}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        isAvailable: e.target.checked
                      })
                    }
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Available for purchase</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {showDeleteModal && artworkToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>

            <p className="mb-6">
              Are you sure you want to delete the artwork "{artworkToEdit.title}"? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleArtworkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Artwork
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArtworks;
