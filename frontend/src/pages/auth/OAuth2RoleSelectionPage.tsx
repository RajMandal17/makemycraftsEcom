import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Brush, Palette } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import apiClient from '../../services/api';

/**
 * OAuth2 Role Selection Page
 * Shown when a new user signs up with OAuth2 (Google, Facebook, GitHub)
 * Allows them to choose their role (Customer or Artist) before completing registration
 */
const OAuth2RoleSelectionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'ARTIST'>('CUSTOMER');
  const [loading, setLoading] = useState(false);

  // Get OAuth2 user data from URL params (passed from backend)
  const tempToken = searchParams.get('tempToken');
  const email = searchParams.get('email');
  const name = searchParams.get('name');
  const provider = searchParams.get('provider');

  // If no temp token, redirect to login
  React.useEffect(() => {
    if (!tempToken) {
      toast.error('Invalid OAuth2 session. Please try again.');
      navigate('/login');
    }
  }, [tempToken, navigate]);

  const handleRoleSelection = async () => {
    if (!tempToken) return;

    setLoading(true);
    try {
      // Complete OAuth2 registration with selected role
      const response = await apiClient.post('/oauth2/complete-registration', {
        tempToken,
        role: selectedRole
      });

      if (response.data && response.data.success) {
        // Store tokens - backend returns token and refreshToken directly
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        // Store user data
        if (response.data.user) {
          localStorage.setItem('userData', JSON.stringify(response.data.user));
          localStorage.setItem('userRole', response.data.user.role);
        }
        
        toast.success(`Welcome! Your ${selectedRole.toLowerCase()} account has been created.`);

        // Use redirectUrl from backend response or fallback to role-based redirect
        const redirectPath = response.data.redirectUrl || (selectedRole === 'ARTIST' ? '/dashboard/artist' : '/dashboard/customer');
        navigate(redirectPath);
      } else {
        // Handle case where response is not successful
        toast.error(response.data?.error || 'Failed to complete registration');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Role selection error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to complete registration. Please try again.';
      toast.error(errorMessage);
      
      // If the error is related to invalid token, redirect to login
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-600 p-3 rounded-full">
                <Palette className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Almost There!</h2>
            <p className="text-gray-600 mt-2">
              Just one more step to complete your registration
            </p>
          </div>

          {/* User Info */}
          {email && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Signing up with {provider}</p>
              <p className="font-medium text-gray-900">{name || email}</p>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What do you want to do on ArtMarket?
            </label>
            <div className="grid grid-cols-1 gap-4">
              {/* Customer Option */}
              <button
                type="button"
                onClick={() => setSelectedRole('CUSTOMER')}
                disabled={loading}
                className={`p-6 border-2 rounded-lg transition-all text-left ${
                  selectedRole === 'CUSTOMER'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-gray-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${selectedRole === 'CUSTOMER' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <User className="h-8 w-8" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="font-semibold text-lg text-gray-900">
                      I want to buy artworks
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Browse and purchase beautiful artworks from talented artists
                    </p>
                    <ul className="mt-2 text-xs text-gray-500 space-y-1">
                      <li>• Browse artwork collections</li>
                      <li>• Add items to cart and wishlist</li>
                      <li>• Purchase securely</li>
                      <li>• Track your orders</li>
                    </ul>
                  </div>
                  {selectedRole === 'CUSTOMER' && (
                    <div className="ml-2">
                      <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10 2L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>

              {/* Artist Option */}
              <button
                type="button"
                onClick={() => setSelectedRole('ARTIST')}
                disabled={loading}
                className={`p-6 border-2 rounded-lg transition-all text-left ${
                  selectedRole === 'ARTIST'
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-gray-300 hover:border-gray-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${selectedRole === 'ARTIST' ? 'text-purple-600' : 'text-gray-400'}`}>
                    <Brush className="h-8 w-8" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="font-semibold text-lg text-gray-900">
                      I want to sell my artworks
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Showcase and sell your creative works to art lovers worldwide
                    </p>
                    <ul className="mt-2 text-xs text-gray-500 space-y-1">
                      <li>• Upload and manage your artworks</li>
                      <li>• Set your own prices</li>
                      <li>• Reach a global audience</li>
                      <li>• Track sales and earnings</li>
                    </ul>
                  </div>
                  {selectedRole === 'ARTIST' && (
                    <div className="ml-2">
                      <div className="h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10 2L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleRoleSelection}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              selectedRole === 'CUSTOMER'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-purple-600 hover:bg-purple-700'
            } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                Continue as {selectedRole === 'CUSTOMER' ? 'Customer' : 'Artist'}
              </>
            )}
          </button>

          {/* Back to Login */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              disabled={loading}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuth2RoleSelectionPage;
