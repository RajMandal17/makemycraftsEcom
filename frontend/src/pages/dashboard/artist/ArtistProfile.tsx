import React, { useState } from 'react';
import { User, PencilLine, Upload, Save, Globe, Instagram, Twitter, Facebook } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';
import { userAPI } from '../../../services/userAPI';
import { getProfileImageUrl } from '../../../config/api';

const ArtistProfile: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(getProfileImageUrl(state.auth.user?.profileImage, state.auth.user?.profilePictureUrl));
  const [formValues, setFormValues] = useState({
    firstName: state.auth.user?.firstName || '',
    lastName: state.auth.user?.lastName || '',
    email: state.auth.user?.email || '',
    bio: (state.auth.user as any)?.bio || '',
    website: (state.auth.user as any)?.website || '',
    instagram: (state.auth.user as any)?.socialLinks?.instagram || '',
    twitter: (state.auth.user as any)?.socialLinks?.twitter || '',
    facebook: (state.auth.user as any)?.socialLinks?.facebook || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5000000) { 
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);

    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      
      const updateData = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        bio: formValues.bio,
        website: formValues.website,
        socialLinks: {
          instagram: formValues.instagram,
          twitter: formValues.twitter,
          facebook: formValues.facebook
        }
      };

      
      const updatedUser = await userAPI.updateProfile(updateData);

      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: {
            ...state.auth.user!,
            ...updatedUser,
            ...(previewImage && { profileImage: previewImage })
          },
          token: state.auth.token || ''
        }
      });

      
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const imageUrl = await userAPI.updateProfileWithImage(formData);

        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: {
              ...state.auth.user!,
              profileImage: imageUrl
            },
            token: state.auth.token || ''
          }
        });
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Artist Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
          >
            <PencilLine size={16} className="mr-2" />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-6">
            {}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="h-28 w-28 rounded-full overflow-hidden bg-gray-100">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <User size={40} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {isEditing && (
                  <label
                    htmlFor="profile-image"
                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700"
                  >
                    <Upload size={14} />
                    <input
                      type="file"
                      id="profile-image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageChange}
                    />
                  </label>
                )}
              </div>

              {isEditing && (
                <p className="text-xs text-gray-500 text-center">
                  Click the upload button to change your profile picture
                </p>
              )}
            </div>

            {}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formValues.firstName}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!isEditing ? 'bg-gray-50' : 'bg-white'
                      }`}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formValues.lastName}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!isEditing ? 'bg-gray-50' : 'bg-white'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formValues.email}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
                {isEditing && (
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Artist Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formValues.bio}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!isEditing ? 'bg-gray-50' : 'bg-white'
                    }`}
                ></textarea>
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    <Globe size={16} />
                  </span>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formValues.website}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    placeholder="https://yourwebsite.com"
                    className={`flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${!isEditing ? 'bg-gray-50' : 'bg-white'
                      }`}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Social Media Links</h3>

                <div className="space-y-3">
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      <Instagram size={16} />
                    </span>
                    <input
                      type="text"
                      id="instagram"
                      name="instagram"
                      value={formValues.instagram}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      placeholder="Instagram username"
                      className={`flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${!isEditing ? 'bg-gray-50' : 'bg-white'
                        }`}
                    />
                  </div>

                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      <Twitter size={16} />
                    </span>
                    <input
                      type="text"
                      id="twitter"
                      name="twitter"
                      value={formValues.twitter}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      placeholder="Twitter/X username"
                      className={`flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${!isEditing ? 'bg-gray-50' : 'bg-white'
                        }`}
                    />
                  </div>

                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      <Facebook size={16} />
                    </span>
                    <input
                      type="text"
                      id="facebook"
                      name="facebook"
                      value={formValues.facebook}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      placeholder="Facebook username"
                      className={`flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${!isEditing ? 'bg-gray-50' : 'bg-white'
                        }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 text-right">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ArtistProfile;
