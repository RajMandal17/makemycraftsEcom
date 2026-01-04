import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Loader2, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { artworkAPI } from '../../../services/api';
import { categoryAPI, PublicCategory } from '../../../services/categoryAPI';
import { Artwork } from '../../../types';

const EditArtwork: React.FC = () => {
  const { artworkId } = useParams<{ artworkId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    medium: '',
    width: '',
    height: '',
    depth: '',
    tags: '',
    isAvailable: true
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Categories from admin backend
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const media = [
    'Oil on Canvas', 'Acrylic on Canvas', 'Watercolor', 'Charcoal',
    'Pencil', 'Digital', 'Photography', 'Bronze', 'Clay',
    'Marble', 'Wood', 'Mixed Media', 'Other'
  ];

  useEffect(() => {
    const fetchArtwork = async () => {
      if (!artworkId) return;

      try {
        setFetchLoading(true);
        setError(null);

        const artwork = await artworkAPI.getById(artworkId);

        // Populate form data
        setFormData({
          title: artwork.title,
          description: artwork.description,
          price: artwork.price.toString(),
          category: artwork.category,
          medium: artwork.medium,
          width: artwork.dimensions?.width?.toString() || '',
          height: artwork.dimensions?.height?.toString() || '',
          depth: artwork.dimensions?.depth?.toString() || '',
          tags: artwork.tags?.join(', ') || '',
          isAvailable: artwork.isAvailable
        });

        // Set existing images
        setExistingImages(artwork.images || []);
      } catch (error) {
        console.error('Error fetching artwork:', error);
        setError('Failed to load artwork details. Please try again.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchArtwork();
  }, [artworkId]);

  // Fetch active categories from backend
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleNewImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Validate files
      const validFiles = newFiles.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          return false;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB size limit`);
          return false;
        }

        return true;
      });

      if (validFiles.length > 0) {
        // Add to selected images
        setNewImages(prev => [...prev, ...validFiles]);

        // Generate previews
        validFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = () => {
            setNewImagePreviews(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages(prev => prev.filter(url => url !== imageUrl));
    setImagesToRemove(prev => [...prev, imageUrl]);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    try {
      setLoading(true);

      // Parse tags
      const tagsList = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Create update payload
      const artworkUpdateData: Partial<Artwork> = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        medium: formData.medium,
        dimensions: {
          width: parseFloat(formData.width),
          height: parseFloat(formData.height),
          depth: formData.depth ? parseFloat(formData.depth) : undefined
        },
        tags: tagsList,
        isAvailable: formData.isAvailable,
        // Keep existing images minus removed ones
        images: existingImages
      };

      // For new images, we would typically upload them separately first
      // Then add their URLs to the artwork
      // This depends on your API implementation
      if (newImages.length > 0) {
        // In a real app, you would upload these and get URLs back
        // For now, we'll just log them
        console.log(`Would upload ${newImages.length} new images`);

        // Normally, you'd do something like:
        // const uploadedImageUrls = await uploadImages(newImages);
        // artworkUpdateData.images = [...existingImages, ...uploadedImageUrls];
      }

      // Update the artwork
      if (artworkId) {
        await artworkAPI.update(artworkId, artworkUpdateData);
        toast.success('Artwork updated successfully!');
        navigate('/dashboard/artist/artworks');
      }
    } catch (error) {
      console.error('Error updating artwork:', error);
      toast.error('Failed to update artwork. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading artwork details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 mb-2 text-xl">⚠️</div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/dashboard/artist/artworks')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Back to Artworks
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/dashboard/artist/artworks')}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-semibold">Edit Artwork</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Artwork Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (rupees) *
            </label>
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Category & Medium */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? 'Loading categories...' : 'Select a category'}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medium *
            </label>
            <select
              name="medium"
              value={formData.medium}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a medium</option>
              {media.map((medium) => (
                <option key={medium} value={medium}>
                  {medium}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (cm) *
            </label>
            <input
              type="number"
              name="width"
              min="0"
              step="0.1"
              value={formData.width}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm) *
            </label>
            <input
              type="number"
              name="height"
              min="0"
              step="0.1"
              value={formData.height}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Depth (cm) <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="number"
              name="depth"
              min="0"
              step="0.1"
              value={formData.depth}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags <span className="text-gray-400">(comma separated)</span>
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. abstract, colorful, landscape"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Availability */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAvailable"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
            Artwork is available for purchase
          </label>
        </div>

        {/* Image Management */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Artwork Images * <span className="text-gray-400">(at least one image required)</span>
          </label>

          <div className="mb-2">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Current Images</h4>
            <div className="flex flex-wrap gap-4 mb-4">
              {existingImages.length > 0 ? (
                existingImages.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Artwork ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(imageUrl)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No current images</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Add New Images</h4>
            <div className="flex flex-wrap gap-4 mb-4">
              {/* New image previews */}
              {newImagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative">
                  <img
                    src={preview}
                    alt={`New ${index + 1}`}
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}

              {/* Upload button */}
              <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Upload Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {existingImages.length === 0 && newImages.length === 0 && (
            <p className="text-sm text-red-500">At least one image is required</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/dashboard/artist/artworks')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (existingImages.length === 0 && newImages.length === 0)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditArtwork;
