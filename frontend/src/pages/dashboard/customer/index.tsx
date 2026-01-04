import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  User, ShoppingBag, Heart,
  LayoutDashboard, LogOut, Search, ShoppingCart
} from 'lucide-react';

import CustomerProfile from './CustomerProfile';
import BrowseArtworks from './BrowseArtworks';
import OrderHistory from './OrderHistory';
import OrderDetails from './OrderDetails';
import WishlistItems from './WishlistItems';
import { useAppContext } from '../../../context/AppContext';
import { getProfileImageUrl } from '../../../config/api';

const CustomerDashboard: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col items-center pb-5 mb-5 border-b">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                {getProfileImageUrl(state.auth.user?.profileImage, state.auth.user?.profilePictureUrl) ? (
                  <img
                    src={getProfileImageUrl(state.auth.user?.profileImage, state.auth.user?.profilePictureUrl)!}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User size={36} className="text-blue-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold">
                {state.auth.user?.firstName} {state.auth.user?.lastName}
              </h3>
              <span className="text-sm text-gray-500">Customer</span>
            </div>

            <nav className="space-y-1">
              <Link
                to="/dashboard/customer"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/customer'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>

              <Link
                to="/dashboard/customer/browse"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/customer/browse'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Search className="mr-3 h-5 w-5" />
                Browse Artworks
              </Link>

              <Link
                to="/dashboard/customer/wishlist"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/customer/wishlist'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Heart className="mr-3 h-5 w-5" />
                Wishlist
                {state.wishlist.length > 0 && (
                  <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {state.wishlist.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/cart'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ShoppingCart className="mr-3 h-5 w-5" />
                Cart
                {state.cart.length > 0 && (
                  <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {state.cart.length}
                  </span>
                )}
              </Link>

              <Link
                to="/dashboard/customer/orders"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/customer/orders' || location.pathname.includes('/dashboard/customer/orders/')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                Order History
              </Link>

              <Link
                to="/dashboard/customer/profile"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/customer/profile'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <User className="mr-3 h-5 w-5" />
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

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
            <Routes>
              <Route index element={<CustomerDashboardHome />} />
              <Route path="browse" element={<BrowseArtworks />} />
              <Route path="wishlist" element={<WishlistItems />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="orders/:orderId" element={<OrderDetails />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Routes>

            {/* Handle direct access to /profile URL */}
            {location.pathname === '/profile' && <CustomerProfile />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Home Component
const CustomerDashboardHome: React.FC = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();

  // Get most recent order, if any
  const recentOrder = state.auth.isAuthenticated &&
    Array.isArray(state.orders) &&
    state.orders.length > 0 ?
    state.orders[0] : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Dashboard</h1>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Wishlist Items</p>
              <h3 className="text-xl font-bold">{state.wishlist.length}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Cart Items</p>
              <h3 className="text-xl font-bold">{state.cart.length}</h3>
            </div>
            <div className="bg-emerald-100 p-2 rounded-full">
              <ShoppingCart className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <h3 className="text-xl font-bold">{Array.isArray(state.orders) ? state.orders.length : 0}</h3>
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <ShoppingBag className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/dashboard/customer/browse')}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Browse Artworks</h3>
              <p className="text-sm text-gray-500">Discover amazing pieces</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/cart')}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="bg-emerald-100 p-2 rounded-full mr-3">
              <ShoppingCart className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">View Cart</h3>
              <p className="text-sm text-gray-500">Checkout your items</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard/customer/orders')}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <ShoppingBag className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Order History</h3>
              <p className="text-sm text-gray-500">Track your purchases</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent order */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {recentOrder ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h3 className="font-medium">Latest Order</h3>
              <button
                onClick={() => navigate(`/dashboard/customer/orders/${recentOrder.id}`)}
                className="text-sm text-blue-600 hover:underline"
              >
                View Details
              </button>
            </div>
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Order #{recentOrder.id.substring(0, 8)}</span>
                <span className="text-sm text-gray-500">
                  {new Date(recentOrder.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    {recentOrder.items.length} {recentOrder.items.length === 1 ? 'item' : 'items'}
                  </p>
                  <p className="font-medium">₹{recentOrder.totalAmount.toFixed(2)}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${recentOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  recentOrder.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    recentOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                  {recentOrder.status.charAt(0) + recentOrder.status.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-6 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <h3 className="text-lg font-medium text-gray-500">No orders yet</h3>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              Browse our collection and make your first purchase
            </p>
            <button
              onClick={() => navigate('/dashboard/customer/browse')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse Artworks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
