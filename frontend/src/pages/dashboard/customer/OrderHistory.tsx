import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, Package, AlertTriangle } from 'lucide-react';
import { orderAPI, getFullImageUrl } from '../../../services/api';
import { Order } from '../../../types';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../context/AppContext';

const OrderHistory: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      dispatch({ type: 'SET_ORDERS', payload: response.orders });
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load order history. Please try again later.');
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'SHIPPED':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (orderId: string) => {
    navigate(`/dashboard/customer/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!state.orders || state.orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 inline-flex p-3 rounded-full mb-4">
          <ShoppingBag className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
        <p className="mt-1 text-sm text-gray-500 mb-6">
          When you place an order, it will appear here
        </p>
        <button
          onClick={() => navigate('/dashboard/customer/browse')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Browse Artworks
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Order History</h1>

      <div className="space-y-6">
        {state.orders.map((order) => (
          <div key={order.id} className="bg-white border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">Order #{order.id.substring(0, 8)} by {order.customer.firstName} {order.customer.lastName}</span>
                <span className="text-xs text-gray-500 ml-4">
                  Placed on {order.createdAt || order.updatedAt ? new Date(order.createdAt || order.updatedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{order.status.charAt(0) + order.status.slice(1).toLowerCase()}</span>
              </span>
            </div>

            <div className="p-4">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-4 md:mb-0">
                  <h4 className="text-sm font-medium text-gray-500">Items</h4>
                  <div className="mt-1">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center py-1">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={getFullImageUrl(item.artwork.images[0])}
                            alt={item.artwork.title}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Artwork';
                            }}
                          />
                        </div>
                        <div className="ml-3 flex-1 flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.artwork.title}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-gray-500 mt-1">
                        + {order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total</h4>
                  <p className="text-lg font-medium text-gray-900 mt-1">₹{order.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
                  <p className="text-sm text-gray-900">{order.shippingAddress}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                  <p className="text-sm text-gray-900">{order.paymentMethod.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleViewDetails(order.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
