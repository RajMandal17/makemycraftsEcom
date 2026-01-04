import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  PlusCircle, Settings, ShoppingBag, Star,
  LayoutDashboard, LogOut, PaintBucket, Image,
  AlertCircle, TrendingUp, FileCheck, Wallet
} from 'lucide-react';

import ArtistProfile from './ArtistProfile';
import ArtworkList from './ArtworkList';
import CreateArtwork from './CreateArtwork';
import EditArtwork from './EditArtwork';
import ArtistOrders from './ArtistOrders';
import ArtistReviews from './ArtistReviews';
import SellerKYC from './SellerKYC';
import BankAccounts from './BankAccounts';
import { useAppContext } from '../../../context/AppContext';
import { toast } from 'react-toastify';
import { debugToken } from '../../../utils/debugToken';
import { artistAPI } from '../../../services/artistAPI';
import { API_CONFIG } from '../../../config/api';

const getProfileImageUrl = (profileImage?: string, profilePictureUrl?: string, role?: string) => {

  if (profileImage) {
    if (profileImage.startsWith('http')) return profileImage;
    return `${API_CONFIG.BACKEND_URL}${profileImage}`;
  }

  if (profilePictureUrl) return profilePictureUrl;
  return null;
};

const ArtistDashboard: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);

  
  useEffect(() => {
    console.log('Artist Dashboard - Auth State:', state.auth);
    const tokenInfo = debugToken();
    const token = localStorage.getItem('access_token');

    
    if (state.auth.isAuthenticated && !token) {
      console.error('Auth inconsistency detected: Token missing but marked as authenticated');
      setAuthError('Auth inconsistency: Token missing but marked as authenticated');
      toast.error('Authentication error. Please log in again.');
      
      dispatch({ type: 'LOGOUT' });
      
      setTimeout(() => navigate('/login'), 500);
    }
    else if (!state.auth.isAuthenticated || !state.auth.token) {
      setAuthError('You are not authenticated. Please log in again.');
      toast.error('Authentication error: Please log in again');
      
      setTimeout(() => navigate('/login'), 500);
    } else if (state.auth.user?.role !== 'ARTIST') {
      setAuthError(`Invalid role: ${state.auth.user?.role}. Artist role required.`);
      toast.error('Access denied: Artist role required');
    }
  }, [state.auth, navigate, dispatch]);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col items-center pb-5 mb-5 border-b">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                {getProfileImageUrl(state.auth.user?.profileImage, state.auth.user?.profilePictureUrl, state.auth.user?.role) ? (
                  <img
                    src={getProfileImageUrl(state.auth.user?.profileImage, state.auth.user?.profilePictureUrl, state.auth.user?.role)!}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <PaintBucket size={36} className="text-blue-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold">
                {state.auth.user?.firstName} {state.auth.user?.lastName}
              </h3>
              <span className="text-sm text-gray-500">Artist</span>
            </div>

            <nav className="space-y-1">
              <Link
                to="/dashboard/artist"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/artist'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>

              <Link
                to="/dashboard/artist/artworks"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/artist/artworks'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Image className="mr-3 h-5 w-5" />
                My Artworks
              </Link>

              <Link
                to="/dashboard/artist/create"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/artist/create'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <PlusCircle className="mr-3 h-5 w-5" />
                Upload Artwork
              </Link>

              <Link
                to="/dashboard/artist/orders"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/artist/orders'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                Orders & Sales
              </Link>

              <Link
                to="/dashboard/artist/reviews"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/artist/reviews'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Star className="mr-3 h-5 w-5" />
                Reviews
              </Link>

              <Link
                to="/dashboard/artist/kyc"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/artist/kyc'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <FileCheck className="mr-3 h-5 w-5" />
                KYC Verification
              </Link>

              <Link
                to="/dashboard/artist/bank-accounts"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/artist/bank-accounts'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Wallet className="mr-3 h-5 w-5" />
                Bank Accounts
              </Link>

              <Link
                to="/dashboard/artist/profile"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/artist/profile'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Profile Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 mt-4 text-red-600 rounded-md hover:bg-red-50"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>

          {}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
            {authError ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700">{authError}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            ) : (
              <Routes>
                <Route index element={<ArtistDashboardHome />} />
                <Route path="artworks" element={<ArtworkList />} />
                <Route path="create" element={<CreateArtwork />} />
                <Route path="edit/:artworkId" element={<EditArtwork />} />
                <Route path="orders" element={<ArtistOrders />} />
                <Route path="reviews" element={<ArtistReviews />} />
                <Route path="kyc" element={<SellerKYC />} />
                <Route path="bank-accounts" element={<BankAccounts />} />
                <Route path="profile" element={<ArtistProfile />} />
              </Routes>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const ArtistDashboardHome: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await artistAPI.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">{error || 'Failed to load dashboard data'}</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Artist Dashboard</h1>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Artworks</p>
              <h3 className="text-xl font-bold">{stats.totalArtworks}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Image className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Sales This Month</p>
              <h3 className="text-xl font-bold">${stats.salesThisMonth.toFixed(2)}</h3>
            </div>
            <div className="bg-emerald-100 p-2 rounded-full">
              <ShoppingBag className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <h3 className="text-xl font-bold">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
              </h3>
              {stats.totalReviews > 0 && (
                <p className="text-xs text-gray-500">({stats.totalReviews} reviews)</p>
              )}
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <Star className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <h3 className="text-xl font-bold">₹{stats.totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <h3 className="text-xl font-bold">{stats.totalOrders}</h3>
            </div>
            <div className="bg-indigo-100 p-2 rounded-full">
              <ShoppingBag className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <h3 className="text-xl font-bold">{stats.pendingOrders}</h3>
            </div>
            <div className="bg-rose-100 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/dashboard/artist/create"
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <PlusCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Upload New Artwork</h3>
              <p className="text-sm text-gray-500">Add a new piece to your collection</p>
            </div>
          </Link>

          <Link
            to="/dashboard/artist/orders"
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="bg-emerald-100 p-2 rounded-full mr-3">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-medium">View Recent Orders</h3>
              <p className="text-sm text-gray-500">Check your recent sales</p>
            </div>
          </Link>

          <Link
            to="/dashboard/artist/reviews"
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium">Latest Reviews</h3>
              <p className="text-sm text-gray-500">See what customers are saying</p>
            </div>
          </Link>
        </div>
      </div>

      {}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium">Latest Updates</h3>
          </div>
          <div className="divide-y">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="px-4 py-3 flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${activity.icon === 'shopping_bag' ? 'bg-blue-100' :
                    activity.icon === 'star' ? 'bg-amber-100' :
                      'bg-emerald-100'
                    }`}>
                    {activity.icon === 'shopping_bag' && <ShoppingBag className="h-4 w-4 text-blue-600" />}
                    {activity.icon === 'star' && <Star className="h-4 w-4 text-amber-600" />}
                    {activity.icon === 'image' && <Image className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <div>
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;
