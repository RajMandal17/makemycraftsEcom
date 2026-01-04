import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  ShoppingBag, Search, Filter, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';
import { adminAPI } from '../../../services/adminAPI';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderToEdit, setOrderToEdit] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedStatusOption, setSelectedStatusOption] = useState('');

  const fetchOrders = async (page = 1, status = selectedStatus) => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getOrders({ page, limit: 10, status });
      setOrders(response.orders);
      setTotalOrders(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePageChange = (page: number) => {
    fetchOrders(page);
  };

  const handleFilterChange = () => {
    fetchOrders(1, selectedStatus);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    
    fetchOrders(1, selectedStatus);
  };

  const handleViewDetails = (order: any) => {
    setOrderToEdit(order);
    setShowOrderDetailsModal(true);
  };

  const handleStatusModalOpen = (order: any) => {
    setOrderToEdit(order);
    setSelectedStatusOption(order.status);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!orderToEdit) return;

    try {
      await adminAPI.updateOrderStatus(orderToEdit.id, selectedStatusOption);
      toast.success(`Order #${orderToEdit.id.substring(0, 8)} status updated to ${selectedStatusOption}`);

      
      setOrders(orders.map(order =>
        order.id === orderToEdit.id ? { ...order, status: selectedStatusOption } : order
      ));

      setShowStatusModal(false);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center">
          <ShoppingBag className="mr-2 h-6 w-6" /> Manage Orders
        </h1>
      </div>

      {}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form
          onSubmit={handleSearch}
          className="flex-1 flex"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search order ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            onClick={handleFilterChange}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" /> Filter
          </button>
        </div>
      </div>

      {}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{order.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items?.length || '0'} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleStatusModalOpen(order)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{orders.length}</span> of{' '}
            <span className="font-medium">{totalOrders}</span> orders
          </p>

          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-2 border rounded-md disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {}
            <button className="px-4 py-2 border bg-purple-50 text-purple-600 font-medium rounded-md">
              {currentPage}
            </button>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-2 border rounded-md disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Update Order Status</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <p>
                #{orderToEdit?.id?.substring(0, 8)} - ₹{orderToEdit?.totalAmount?.toFixed(2)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatusOption}
                onChange={(e) => setSelectedStatusOption(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {showOrderDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium">
                Order #{orderToEdit?.id?.substring(0, 8)}
              </h3>
              <button
                onClick={() => setShowOrderDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Order Information</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="mb-1">
                    <span className="font-medium">Date: </span>
                    {formatDate(orderToEdit?.createdAt)}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Status: </span>
                    <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(orderToEdit?.status)}`}>
                      {orderToEdit?.status}
                    </span>
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Payment Method: </span>
                    {orderToEdit?.paymentMethod}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="mb-1">
                    <span className="font-medium">Name: </span>
                    {orderToEdit?.customerName}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Email: </span>
                    {orderToEdit?.customerEmail}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Shipping Address: </span>
                    {orderToEdit?.shippingAddress}
                  </p>
                </div>
              </div>
            </div>

            <h4 className="font-medium text-gray-700 mb-3">Order Items</h4>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderToEdit?.items?.length > 0 ? (
                    orderToEdit.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 mr-3">
                              {item.artwork?.images && item.artwork.images[0] ? (
                                <img
                                  src={item.artwork.images[0]}
                                  alt={item.artwork.title}
                                  className="h-full w-full object-cover rounded"
                                />
                              ) : (
                                <div className="h-full w-full bg-gray-200 rounded"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{item.artwork?.title}</div>
                              <div className="text-xs text-gray-500">
                                by {item.artwork?.artist?.firstName} {item.artwork?.artist?.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          ₹{item.price?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between items-end">
              <button
                onClick={() => handleStatusModalOpen(orderToEdit)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Update Status
              </button>

              <div className="text-right">
                <div className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Subtotal:</span> ₹{orderToEdit?.totalAmount?.toFixed(2)}
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Shipping:</span> ₹0.00
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Tax:</span> Included
                </div>
                <div className="text-lg font-bold text-gray-900">
                  <span>Total:</span> ₹{orderToEdit?.totalAmount?.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
