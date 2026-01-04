import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Users, Database, ShoppingBag, LayoutDashboard,
  LogOut, Image, BarChart2, Settings, FileCheck, FileText
} from 'lucide-react';

import { useAppContext } from '../../../context/AppContext';
import { adminAPI, adminApiClient } from '../../../services/adminAPI';
import { adminWebSocketClient, DashboardUpdate } from '../../../services/adminWebSocketClient';

import AdminUsers from './AdminUsers';
import AdminArtworks from './AdminArtworks';
import AdminOrders from './AdminOrders';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';
import AdminKYC from './kyc/AdminKYC';
import AdminReports from './AdminReports';
import SystemHealthMonitor from '../../../components/admin/SystemHealthMonitor';

import { getProfileImageUrl } from '../../../config/api';

const AdminDashboard: React.FC = () => {
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
              <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                {getProfileImageUrl(state.auth.user?.profileImage, (state.auth.user as any)?.profilePictureUrl) ? (
                  <img
                    src={getProfileImageUrl(state.auth.user?.profileImage, (state.auth.user as any)?.profilePictureUrl)!}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <Settings size={36} className="text-purple-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold">
                {state.auth.user?.firstName} {state.auth.user?.lastName}
              </h3>
              <span className="text-sm text-gray-500">Administrator</span>
            </div>

            <nav className="space-y-1">
              <Link
                to="/dashboard/admin"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/admin'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>

              <Link
                to="/dashboard/admin/users"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/admin/users'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Users className="mr-3 h-5 w-5" />
                Manage Users
              </Link>

              <Link
                to="/dashboard/admin/artworks"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/admin/artworks'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Image className="mr-3 h-5 w-5" />
                Manage Artworks
              </Link>

              <Link
                to="/dashboard/admin/orders"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/admin/orders' || location.pathname.includes('/dashboard/admin/orders/')
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                Manage Orders
              </Link>

              <Link
                to="/dashboard/admin/analytics"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/admin/analytics'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <BarChart2 className="mr-3 h-5 w-5" />
                Analytics
              </Link>

              <Link
                to="/dashboard/admin/kyc"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/admin/kyc'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <FileCheck className="mr-3 h-5 w-5" />
                KYC Verification
              </Link>

              <Link
                to="/dashboard/admin/reports"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/admin/reports'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <FileText className="mr-3 h-5 w-5" />
                Reports
              </Link>

              <Link
                to="/dashboard/admin/settings"
                className={`flex items-center px-4 py-2 rounded-md ${location.pathname === '/dashboard/admin/settings'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
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
              <Route index element={<AdminDashboardHome />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="artworks" element={<AdminArtworks />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="kyc" element={<AdminKYC />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Home Component
const AdminDashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Call the Admin Dashboard Service to get full dashboard overview
        const response = await adminAPI.getDashboardOverview();
        setDashboardData(response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');

        // Fallback to backend if Admin Dashboard Service is not available
        try {
          const response = await adminApiClient.get('/v1/admin/dashboard/overview');
          setDashboardData(response.data.data);
          setError(null);
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Connect to WebSocket for real-time updates
    const connectWebSocket = async () => {
      try {
        await adminWebSocketClient.connect();
        setIsWsConnected(true);

        // Subscribe to dashboard updates
        const unsubscribe = adminWebSocketClient.subscribeToDashboard((data: DashboardUpdate) => {
          console.log('Received real-time dashboard update:', data);
          setDashboardData((prev: any) => ({
            ...prev,
            userStats: data.userStats || prev?.userStats,
            artworkStats: data.artworkStats || prev?.artworkStats,
            orderStats: data.orderStats || prev?.orderStats,
            systemHealth: data.systemHealth || prev?.systemHealth,
          }));
        });

        // Cleanup on unmount
        return () => {
          unsubscribe();
          adminWebSocketClient.disconnect();
        };
      } catch (err) {
        console.error('Failed to connect to WebSocket:', err);
        setIsWsConnected(false);
      }
    };

    connectWebSocket();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

        {/* WebSocket Connection Indicator */}
        <div className="flex items-center space-x-2">
          {isWsConnected ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live Updates Active</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Static Mode</span>
            </>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <h3 className="text-xl font-bold">
                {loading ? 'Loading...' : error ? 'Error' : dashboardData?.userStats?.totalUsers || 0}
              </h3>
              {!loading && !error && dashboardData?.userStats?.newUsersToday > 0 && (
                <p className="text-xs text-green-600">+{dashboardData.userStats.newUsersToday} today</p>
              )}
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Artworks</p>
              <h3 className="text-xl font-bold">
                {loading ? 'Loading...' : error ? 'Error' : dashboardData?.artworkStats?.totalArtworks || 0}
              </h3>
              {!loading && !error && dashboardData?.artworkStats?.pendingApproval > 0 && (
                <p className="text-xs text-orange-600">{dashboardData.artworkStats.pendingApproval} pending</p>
              )}
            </div>
            <div className="bg-indigo-100 p-2 rounded-full">
              <Image className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <h3 className="text-xl font-bold">
                {loading ? 'Loading...' : error ? 'Error' : dashboardData?.orderStats?.totalOrders || 0}
              </h3>
              {!loading && !error && dashboardData?.orderStats?.pendingOrders > 0 && (
                <p className="text-xs text-orange-600">{dashboardData.orderStats.pendingOrders} pending</p>
              )}
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <ShoppingBag className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <h3 className="text-xl font-bold">
                {loading ? 'Loading...' : error ? 'Error' : `₹${dashboardData?.revenueStats?.totalRevenue?.toFixed(2) || '0.00'}`}
              </h3>
              {!loading && !error && dashboardData?.revenueStats?.revenueToday > 0 && (
                <p className="text-xs text-green-600">+${dashboardData.revenueStats.revenueToday.toFixed(2)} today</p>
              )}
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <BarChart2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Health Monitor */}
      <div className="mb-8">
        <SystemHealthMonitor />
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/dashboard/admin/users')}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Manage Users</h3>
              <p className="text-sm text-gray-500">View and edit user accounts</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard/admin/artworks')}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <Image className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Manage Artworks</h3>
              <p className="text-sm text-gray-500">Review and manage listings</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard/admin/orders')}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <ShoppingBag className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Manage Orders</h3>
              <p className="text-sm text-gray-500">Process customer orders</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard/admin/reports')}
            className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Generate Reports</h3>
              <p className="text-sm text-gray-500">Create PDF, Excel, CSV reports</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium">System Status</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className={`p-1 rounded-full mr-3 mt-1 ${loading ? 'bg-yellow-100' : error ? 'bg-red-100' : 'bg-green-100'}`}>
                  <div className={`h-2 w-2 rounded-full ${loading ? 'bg-yellow-500' : error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Analytics:</span> {
                      loading ? 'Loading dashboard data...' :
                        error ? `Error loading data: ${error}` :
                          'Dashboard data loaded successfully'
                    }
                  </p>
                  <span className="text-xs text-gray-500">Just now</span>
                </div>
              </li>
              {!loading && !error && dashboardData && (
                <>
                  <li className="flex items-start">
                    <div className="bg-blue-100 p-1 rounded-full mr-3 mt-1">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Users:</span> {dashboardData.userStats?.totalUsers || 0} total, {dashboardData.userStats?.activeUsers || 0} active
                        {dashboardData.userStats?.newUsersToday > 0 && ` (+${dashboardData.userStats.newUsersToday} today)`}
                      </p>
                      <span className="text-xs text-gray-500">Just now</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-indigo-100 p-1 rounded-full mr-3 mt-1">
                      <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Artworks:</span> {dashboardData.artworkStats?.totalArtworks || 0} total
                        {dashboardData.artworkStats?.pendingApproval > 0 && ` (${dashboardData.artworkStats.pendingApproval} pending approval)`}
                      </p>
                      <span className="text-xs text-gray-500">Just now</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Orders:</span> {dashboardData.orderStats?.totalOrders || 0} total
                        {dashboardData.orderStats?.pendingOrders > 0 && ` (${dashboardData.orderStats.pendingOrders} pending)`}
                      </p>
                      <span className="text-xs text-gray-500">Just now</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Revenue:</span> ₹{dashboardData.revenueStats?.totalRevenue?.toFixed(2) || '0.00'} total
                        {dashboardData.revenueStats?.revenueToday > 0 && ` (+$${dashboardData.revenueStats.revenueToday.toFixed(2)} today)`}
                      </p>
                      <span className="text-xs text-gray-500">Just now</span>
                    </div>
                  </li>
                  {!loading && !error && dashboardData?.systemHealth && (
                    <li className="flex items-start">
                      <div className={`p-1 rounded-full mr-3 mt-1 ${dashboardData.systemHealth.status === 'HEALTHY' ? 'bg-green-100' :
                        dashboardData.systemHealth.status === 'WARNING' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                        <div className={`h-2 w-2 rounded-full ${dashboardData.systemHealth.status === 'HEALTHY' ? 'bg-green-500' :
                          dashboardData.systemHealth.status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">System Health:</span> {dashboardData.systemHealth.status}
                          ({dashboardData.systemHealth.activeServices}/{dashboardData.systemHealth.totalServices} services active)
                        </p>
                        <span className="text-xs text-gray-500">Just now</span>
                      </div>
                    </li>
                  )}
                </>
              )}
              <li className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">System:</span> Admin dashboard initialized successfully
                  </p>
                  <span className="text-xs text-gray-500">Just now</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
