import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { artworkAPI } from '../../../services/api';
import { categoryAPI, PublicCategory } from '../../../services/categoryAPI';
import { analyzeArtwork, ArtworkSuggestion } from '../../../services/suggestionAPI';
import SuggestionPanel from '../../../components/artwork/SuggestionPanel';
import AuthDebugger from '../../../components/debug/AuthDebugger';
import TokenDebugger from '../../../components/debug/TokenDebugger';
import runAuthDiagnostics from '../../../utils/authDebug';

const CreateArtwork: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  
  const [showSuggestionPanel, setShowSuggestionPanel] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<ArtworkSuggestion | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const media = [
    'Oil on Canvas', 'Acrylic on Canvas', 'Watercolor', 'Charcoal',
    'Pencil', 'Digital', 'Photography', 'Bronze', 'Clay',
    'Marble', 'Wood', 'Mixed Media', 'Other'
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      
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
        
        setImages(prev => [...prev, ...validFiles]);

        
        validFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = () => {
            setImagePreviews(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        });

        
        if (images.length === 0 && validFiles.length > 0) {
          await uploadAndAnalyzeImage(validFiles[0]);
        }
      }
    }
  };

  const uploadAndAnalyzeImage = async (file: File) => {
    try {
      setAnalyzingImage(true);

      
      const tempFormData = new FormData();
      tempFormData.append('images', file);

      
      
      
      const reader = new FileReader();
      reader.onload = async () => {
        const imageDataUrl = reader.result as string;

        
        
        toast.info('Analyzing artwork with AI...', { autoClose: 2000 });

        try {
          const suggestion = await analyzeArtwork({
            imageUrl: imageDataUrl, 
            includeAdvancedAnalysis: true
          });

          setCurrentSuggestion(suggestion);
          setShowSuggestionPanel(true);
          toast.success('AI analysis complete!');
        } catch (error) {
          console.error('Error analyzing artwork:', error);
          toast.warning('AI analysis unavailable. Please continue manually.');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in analysis:', error);
      toast.warning('AI analysis unavailable. You can continue filling the form manually.');
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleApplySuggestion = (suggestion: ArtworkSuggestion) => {
    if (!suggestion) return;

    
    const partialSuggestion = suggestion as any;
    if (partialSuggestion.appliedField && partialSuggestion.appliedValue) {
      
      const field = partialSuggestion.appliedField;
      const value = partialSuggestion.appliedValue;

      setFormData(prev => ({
        ...prev,
        [field]: Array.isArray(value) ? value.join(', ') : String(value)
      }));

      setAppliedFields(prev => new Set(prev).add(field));
      toast.success(`Applied ${field} suggestion`);
    } else {
      
      setFormData(prev => ({
        ...prev,
        title: suggestion.suggestedTitle || prev.title,
        description: suggestion.suggestedDescription || prev.description,
        category: suggestion.suggestedCategory || prev.category,
        medium: suggestion.suggestedMedium || prev.medium,
        width: suggestion.suggestedWidth ? String(suggestion.suggestedWidth) : prev.width,
        height: suggestion.suggestedHeight ? String(suggestion.suggestedHeight) : prev.height,
        tags: suggestion.suggestedTags ? suggestion.suggestedTags.join(', ') : prev.tags,
      }));

      setAppliedFields(new Set(['title', 'description', 'category', 'medium', 'width', 'height', 'tags']));
      toast.success('Applied all AI suggestions!');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    try {
      setLoading(true);

      
      const tagsList = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      
      const apiFormData = new FormData();
      apiFormData.append('title', formData.title);
      apiFormData.append('description', formData.description);
      apiFormData.append('price', formData.price);
      apiFormData.append('category', formData.category);
      apiFormData.append('medium', formData.medium);
      apiFormData.append('width', formData.width);
      apiFormData.append('height', formData.height);

      if (formData.depth) {
        apiFormData.append('depth', formData.depth);
      }

      
      tagsList.forEach(tag => {
        apiFormData.append('tags', tag);
      });

      
      images.forEach(image => {
        apiFormData.append('images', image);
      });

      
      const response: any = await artworkAPI.create(apiFormData);

      
      
      const artworkData = response?.approvalStatus ? response : (response?.data || response);
      if (artworkData?.approvalStatus === 'PENDING') {
        toast.success(
          'Artwork created and submitted for review! ' +
          'Since you used a new category, both your artwork and the category need admin approval before they appear in listings.',
          { autoClose: 8000 }
        );
      } else {
        toast.success('Artwork created successfully!');
      }
      navigate('/dashboard/artist/artworks');
    } catch (error: any) {
      console.error('Error creating artwork:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to create artwork. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    runAuthDiagnostics();

    
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const activeCategories = await categoryAPI.getActive();
        setCategories(activeCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories. Please refresh the page.');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Upload New Artwork</h1>
      <AuthDebugger />

      <form onSubmit={handleSubmit} className="space-y-6">
        {}
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

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>

            {}
            <div className="flex items-center mb-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomCategory}
                  onChange={(e) => {
                    setUseCustomCategory(e.target.checked);
                    if (!e.target.checked) {
                      setCustomCategory('');
                      setFormData(prev => ({ ...prev, category: '' }));
                    }
                  }}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Suggest a new category</span>
              </label>
            </div>

            {useCustomCategory ? (
              <>
                <input
                  type="text"
                  name="category"
                  placeholder="Enter your new category name"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    setFormData(prev => ({ ...prev, category: e.target.value }));
                  }}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ New categories require admin approval. Your artwork will be pending review until the category is approved.
                </p>
              </>
            ) : (
              <>
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
                {categories.length === 0 && !categoriesLoading && (
                  <p className="text-xs text-amber-500 mt-1">
                    No categories available yet. You can suggest a new category above.
                  </p>
                )}
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medium *
            </label>
            <input
              type="text"
              name="medium"
              value={formData.medium}
              onChange={handleChange}
              placeholder="e.g., Oil on Canvas, Watercolor, Digital"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              AI suggestions: Oil on Canvas, Acrylic, Watercolor, Digital, etc.
            </p>
          </div>
        </div>

        {}
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

        {}
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

        {}
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

        {}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Artwork Images * <span className="text-gray-400">(max 5 images, 5MB each)</span>
          </label>

          <div className="flex flex-wrap gap-4 mb-4">
            {}
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-32 h-32 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}

            {}
            <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Upload Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {images.length === 0 && (
            <p className="text-sm text-red-500">At least one image is required</p>
          )}

          {}
          {images.length > 0 && !analyzingImage && (
            <button
              type="button"
              onClick={() => setShowSuggestionPanel(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              {currentSuggestion ? 'View AI Suggestions' : 'Get AI Suggestions'}
            </button>
          )}

          {analyzingImage && (
            <div className="mt-4 flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">AI is analyzing your artwork...</span>
            </div>
          )}
        </div>

        {}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Artwork'
            )}
          </button>
        </div>
      </form>

      {}
      <SuggestionPanel
        isOpen={showSuggestionPanel}
        onClose={() => setShowSuggestionPanel(false)}
        suggestion={currentSuggestion}
        loading={analyzingImage}
        onApplySuggestion={handleApplySuggestion}
        appliedFields={appliedFields}
      />

      {}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Debug Tools</h3>
        <AuthDebugger />
        <TokenDebugger />
      </div>
    </div>
  );
};

export default CreateArtwork;
