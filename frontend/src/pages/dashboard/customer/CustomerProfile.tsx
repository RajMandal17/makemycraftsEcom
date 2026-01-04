import React, { useState, useEffect } from 'react';
import { User, PencilLine, Upload, Save, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';
import { userAPI } from '../../../services/userAPI';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';


const ProfileSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  address: Yup.string()
    .max(100, 'Address is too long'),
  city: Yup.string()
    .max(50, 'City name is too long'),
  state: Yup.string()
    .max(50, 'State name is too long'),
  zipCode: Yup.string()
    .matches(/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid ZIP code format (e.g. 12345 or 12345-6789)')
    .max(10, 'ZIP code is too long'),
  country: Yup.string()
    .max(50, 'Country name is too long'),
});


const FormErrorMessage = ({ children }: any) => (
  <div className="text-red-500 text-sm mt-1 flex items-center">
    <AlertCircle className="w-3 h-3 mr-1" />
    {children}
  </div>
);

const CustomerProfile: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(state.auth.user?.profileImage || null);
  const [initialValues, setInitialValues] = useState({
    firstName: state.auth.user?.firstName || '',
    lastName: state.auth.user?.lastName || '',
    email: state.auth.user?.email || '',
    address: state.auth.user?.address || '',
    city: state.auth.user?.city || '',
    state: state.auth.user?.state || '',
    zipCode: state.auth.user?.zipCode || '',
    country: state.auth.user?.country || ''
  });

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

  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  
  interface ProfileFormValues {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }

  
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userProfile = await userAPI.getProfile();

        
        setInitialValues({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          email: userProfile.email || '',
          address: userProfile.address || '',
          city: userProfile.city || '',
          state: userProfile.state || '',
          zipCode: userProfile.zipCode || '',
          country: userProfile.country || ''
        });

        
        if (userProfile.profileImage) {
          setPreviewImage(userProfile.profileImage);
        }

      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      toast.info('Updating password...');
      await userAPI.updatePassword(passwordData.newPassword, passwordData.confirmPassword);
      toast.success('Password updated successfully!');

      
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
    } catch (error: any) {
      console.error('Error updating password:', error);
      const message = error.response?.data?.message || 'Failed to update password';
      toast.error(message);
    }
  };

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      toast.info('Saving profile changes...');

      
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append('image', selectedImage); 

        try {
          
          const imageUrl = await userAPI.updateProfileWithImage(imageFormData);

          
          const updatedUser = await userAPI.updateProfile({
            firstName: values.firstName,
            lastName: values.lastName,
            address: values.address,
            city: values.city,
            state: values.state,
            zipCode: values.zipCode,
            country: values.country,
            profileImage: imageUrl
          });

          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: updatedUser,
              token: state.auth.token || ''
            }
          });
        } catch (error) {
          console.error('Error updating profile image:', error);
          toast.error('Failed to upload profile image');
          return;
        }
      } else {
        
        const updatedUser = await userAPI.updateProfile({
          firstName: values.firstName,
          lastName: values.lastName,
          address: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country
        });

        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: updatedUser,
            token: state.auth.token || ''
          }
        });
      }

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Profile Settings</h1>
        <div className="flex gap-3">
          {}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center px-4 py-2 text-white rounded-md bg-gray-600 hover:bg-gray-700"
          >
            <Lock className="w-4 h-4 mr-2" />
            Update Password
          </button>

          {}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PencilLine className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <button
              type="submit"
              form="profile-form"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {}
          <div className="flex flex-col items-center">
            <div className="h-40 w-40 rounded-full bg-blue-100 flex items-center justify-center mb-4 overflow-hidden">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={64} className="text-blue-600" />
              )}
            </div>

            {isEditing && (
              <label className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </label>
            )}
          </div>

          {}
          <div className="flex-1">
            <Formik
              initialValues={initialValues}
              validationSchema={ProfileSchema}
              enableReinitialize
              onSubmit={(values: ProfileFormValues, { setSubmitting }: FormikHelpers<ProfileFormValues>) => {
                handleSubmit(values).finally(() => setSubmitting(false));
              }}
            >
              {({ errors, touched }) => (
                <Form id="profile-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <Field
                        type="text"
                        name="firstName"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md disabled:bg-gray-100 ${errors.firstName && touched.firstName ? 'border-red-500' : ''
                          }`}
                      />
                      <ErrorMessage name="firstName" component={FormErrorMessage} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <Field
                        type="text"
                        name="lastName"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md disabled:bg-gray-100 ${errors.lastName && touched.lastName ? 'border-red-500' : ''
                          }`}
                      />
                      <ErrorMessage name="lastName" component={FormErrorMessage} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Field
                      type="email"
                      name="email"
                      disabled={true} 
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                    />
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        Contact customer support to change your email address
                      </p>
                    )}
                  </div>

                  <h3 className="font-medium text-lg mb-3 mt-6">Shipping Address</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <Field
                      type="text"
                      name="address"
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md disabled:bg-gray-100 ${errors.address && touched.address ? 'border-red-500' : ''
                        }`}
                    />
                    <ErrorMessage name="address" component={FormErrorMessage} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <Field
                        type="text"
                        name="city"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md disabled:bg-gray-100 ${errors.city && touched.city ? 'border-red-500' : ''
                          }`}
                      />
                      <ErrorMessage name="city" component={FormErrorMessage} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province
                      </label>
                      <Field
                        type="text"
                        name="state"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md disabled:bg-gray-100 ${errors.state && touched.state ? 'border-red-500' : ''
                          }`}
                      />
                      <ErrorMessage name="state" component={FormErrorMessage} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <Field
                        type="text"
                        name="zipCode"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md disabled:bg-gray-100 ${errors.zipCode && touched.zipCode ? 'border-red-500' : ''
                          }`}
                      />
                      <ErrorMessage name="zipCode" component={FormErrorMessage} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <Field
                        type="text"
                        name="country"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md disabled:bg-gray-100 ${errors.country && touched.country ? 'border-red-500' : ''
                          }`}
                      />
                      <ErrorMessage name="country" component={FormErrorMessage} />
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      {}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-2">
              Update Password
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your new password below. Your identity is verified through your login session.
            </p>

            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  placeholder="Min 8 chars, uppercase, lowercase, digit, special"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-md bg-blue-600 hover:bg-blue-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
