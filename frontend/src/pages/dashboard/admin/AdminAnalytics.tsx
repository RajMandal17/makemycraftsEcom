import React, { useEffect, useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { adminApiClient } from '../../../services/adminAPI';

const AdminAnalytics: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await adminApiClient.get('/v1/admin/dashboard/overview');
        setDashboardData(response.data.data);
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!dashboardData) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold flex items-center mb-6">
        <BarChart2 className="mr-2 h-6 w-6" /> Analytics
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Users</p>
          <h3 className="text-2xl font-bold">{dashboardData.userStats?.totalUsers || 0}</h3>
          <p className="text-xs text-gray-500">{dashboardData.userStats?.activeUsers || 0} active users</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Active Users</p>
          <h3 className="text-2xl font-bold">{dashboardData.userStats?.activeUsers || 0}</h3>
          <p className="text-xs text-gray-500">+{dashboardData.userStats?.newUsersToday || 0} new today</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">User Growth Rate</p>
          <h3 className="text-2xl font-bold">{dashboardData.userStats?.userGrowthRate?.toFixed(1) || 0}%</h3>
          <p className="text-xs text-gray-500">Monthly growth</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Artworks</p>
          <h3 className="text-2xl font-bold">{dashboardData.artworkStats?.totalArtworks || 0}</h3>
          <p className="text-xs text-gray-500">{dashboardData.artworkStats?.featuredArtworks || 0} featured</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Orders</p>
          <h3 className="text-2xl font-bold">{dashboardData.orderStats?.totalOrders || 0}</h3>
          <p className="text-xs text-gray-500">Avg: ${dashboardData.orderStats?.averageOrderValue?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-pink-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <h3 className="text-2xl font-bold">₹{dashboardData.revenueStats?.totalRevenue?.toFixed(2) || '0.00'}</h3>
          <p className="text-xs text-gray-500">+{dashboardData.revenueStats?.revenueGrowthRate?.toFixed(1) || 0}% growth</p>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Revenue Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Today's Revenue</p>
            <h3 className="text-xl font-bold">${dashboardData.revenueStats?.revenueToday?.toFixed(2) || '0.00'}</h3>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">This Week</p>
            <h3 className="text-xl font-bold">${dashboardData.revenueStats?.revenueThisWeek?.toFixed(2) || '0.00'}</h3>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">This Month</p>
            <h3 className="text-xl font-bold">${dashboardData.revenueStats?.revenueThisMonth?.toFixed(2) || '0.00'}</h3>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Order Status Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Pending Orders</p>
            <h3 className="text-xl font-bold">{dashboardData.orderStats?.pendingOrders || 0}</h3>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Shipped Orders</p>
            <h3 className="text-xl font-bold">{dashboardData.orderStats?.shippedOrders || 0}</h3>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Delivered Orders</p>
            <h3 className="text-xl font-bold">{dashboardData.orderStats?.deliveredOrders || 0}</h3>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Orders</p>
            <h3 className="text-xl font-bold">{dashboardData.orderStats?.totalOrders || 0}</h3>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Artwork Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Artworks</p>
            <h3 className="text-xl font-bold">{dashboardData.artworkStats?.totalArtworks || 0}</h3>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Pending Approval</p>
            <h3 className="text-xl font-bold">{dashboardData.artworkStats?.pendingApproval || 0}</h3>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Featured Artworks</p>
            <h3 className="text-xl font-bold">{dashboardData.artworkStats?.featuredArtworks || 0}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
