import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  Settings, Plus, Edit, Trash2, Eye, EyeOff, Upload, X,
  Search, Filter, ChevronLeft, ChevronRight, BarChart3,
  Image as ImageIcon, AlertTriangle, CheckCircle, Clock,
  RefreshCw, GripVertical
} from 'lucide-react';
import { adminCategoryAPI, AdminCategory, CategoryCreateRequest, CategoryUpdateRequest } from '../../../services/categoryAPI';
import PendingArtworkApprovals from './PendingArtworkApprovals';

interface CategoryFormData {
  name: string;
  displayName: string;
  description: string;
  emoji: string;
  displayOrder: number;
  isActive: boolean;
}

const AdminSettings: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    displayName: '',
    description: '',
    emoji: '',
    displayOrder: 0,
    isActive: true
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async (page = 1, search = searchQuery, includeDeleted = showDeleted) => {
    setIsLoading(true);
    try {
      let response;
      if (search.trim()) {
        response = await adminCategoryAPI.search(search, includeDeleted);
        setCategories(response);
        setTotalCategories(response.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else if (includeDeleted) {
        response = await adminCategoryAPI.getAll(page - 1, 10);
        if (response) {
          setCategories(response.categories);
          setTotalCategories(response.total);
          setTotalPages(Math.ceil(response.total / 10));
          setCurrentPage(page);
        }
      } else {
        response = await adminCategoryAPI.getActive(page - 1, 10);
        if (response) {
          setCategories(response.categories);
          setTotalCategories(response.total);
          setTotalPages(Math.ceil(response.total / 10));
          setCurrentPage(page);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      toast.error(error.response?.data?.message || 'Failed to load categories');
      setCategories([]);
      setTotalCategories(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminCategoryAPI.getStats();
      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error('Failed to fetch category stats:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStats();
    
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCategories(1, searchQuery, showDeleted);
  };

  const handleFilterChange = () => {
    fetchCategories(1, searchQuery, showDeleted);
  };

  const handlePageChange = (page: number) => {
    fetchCategories(page, searchQuery, showDeleted);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      emoji: '',
      displayOrder: 0,
      isActive: true
    });
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateModalOpen = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditModalOpen = (category: AdminCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      displayName: category.displayName,
      description: category.description || '',
      emoji: category.emoji || '',
      displayOrder: category.displayOrder,
      isActive: category.isActive
    });
    setImagePreview(category.imageUrl || null);
    setShowEditModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (showCreateModal) {
        
        const request: CategoryCreateRequest = {
          name: formData.name,
          displayName: formData.displayName,
          description: formData.description,
          emoji: formData.emoji,
          displayOrder: formData.displayOrder,
          isActive: formData.isActive
        };

        if (selectedImage) {
          await adminCategoryAPI.createWithImage(request, selectedImage);
          toast.success('Category created successfully with image');
        } else {
          await adminCategoryAPI.create(request);
          toast.success('Category created successfully');
        }
      } else if (editingCategory) {
        
        const request: CategoryUpdateRequest = {
          name: formData.name,
          displayName: formData.displayName,
          description: formData.description,
          emoji: formData.emoji,
          displayOrder: formData.displayOrder,
          isActive: formData.isActive
        };

        if (selectedImage) {
          await adminCategoryAPI.updateWithImage(editingCategory.id, request, selectedImage);
          toast.success('Category updated successfully with new image');
        } else {
          await adminCategoryAPI.update(editingCategory.id, request);
          toast.success('Category updated successfully');
        }
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      resetForm();
      fetchCategories(currentPage, searchQuery, showDeleted);
      fetchStats();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (category: AdminCategory) => {
    try {
      await adminCategoryAPI.toggleActive(category.id);
      toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchCategories(currentPage, searchQuery, showDeleted);
    } catch (error: any) {
      console.error('Failed to toggle category status:', error);
      toast.error(error.response?.data?.message || 'Failed to update category status');
    }
  };

  const handleSoftDelete = async (category: AdminCategory) => {
    if (!window.confirm(`Are you sure you want to delete "${category.displayName}"? This action can be undone.`)) {
      return;
    }

    try {
      await adminCategoryAPI.softDelete(category.id);
      toast.success('Category deleted successfully');
      fetchCategories(currentPage, searchQuery, showDeleted);
      fetchStats();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleRestore = async (category: AdminCategory) => {
    try {
      await adminCategoryAPI.restore(category.id);
      toast.success('Category restored successfully');
      fetchCategories(currentPage, searchQuery, showDeleted);
      fetchStats();
    } catch (error: any) {
      console.error('Failed to restore category:', error);
      toast.error(error.response?.data?.message || 'Failed to restore category');
    }
  };

  const handleRemoveImage = async (category: AdminCategory) => {
    if (!window.confirm('Are you sure you want to remove this category image?')) {
      return;
    }

    try {
      await adminCategoryAPI.removeImage(category.id);
      toast.success('Category image removed successfully');
      fetchCategories(currentPage, searchQuery, showDeleted);
    } catch (error: any) {
      console.error('Failed to remove category image:', error);
      toast.error(error.response?.data?.message || 'Failed to remove category image');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center">
          <Settings className="mr-2 h-6 w-6" /> Admin Settings
        </h1>
        <button
          onClick={handleCreateModalOpen}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </button>
      </div>

      {}
      <div className="mb-8">
        <PendingArtworkApprovals />
      </div>

      {}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Category Management</h2>
      </div>

      {}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCategories}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Categories</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeCategories}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Deleted Categories</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.deletedCategories}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <ImageIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">With Images</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.categoriesWithImages}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </form>
          <div className="flex items-center gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => {
                  setShowDeleted(e.target.checked);
                  setTimeout(() => handleFilterChange(), 0);
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show Deleted</span>
            </label>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artworks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className={category.isDeleted ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {category.imageUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={category.imageUrl}
                              alt={category.displayName}
                            />
                          ) : category.emoji ? (
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                              {category.emoji}
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {category.displayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.isActive && !category.isDeleted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {category.isDeleted ? 'Deleted' : category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {category.displayOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {category.artworkCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditModalOpen(category)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {!category.isDeleted && (
                          <button
                            onClick={() => handleToggleActive(category)}
                            className={category.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                            title={category.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {category.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        )}
                        {category.imageUrl && !category.isDeleted && (
                          <button
                            onClick={() => handleRemoveImage(category)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Remove Image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        {category.isDeleted ? (
                          <button
                            onClick={() => handleRestore(category)}
                            className="text-green-600 hover:text-green-900"
                            title="Restore"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSoftDelete(category)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {showCreateModal ? 'Create New Category' : 'Edit Category'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="category-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Display Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Display Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Category description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emoji</label>
                    <input
                      type="text"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="🎨"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category Image</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </button>
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      showCreateModal ? 'Create Category' : 'Update Category'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
