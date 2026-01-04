import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { orderAPI, reviewAPI } from '../../../services/api';
import { Order, Review } from '../../../types';
import { toast } from 'react-toastify';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<{ [key: string]: boolean }>({});
  const [reviewFormData, setReviewFormData] = useState<{ [key: string]: { rating: number; comment: string } }>({});
  const [reviewSubmitting, setReviewSubmitting] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  const fetchOrderDetails = async (id: string) => {
    try {
      setLoading(true);
      const orderData = await orderAPI.getById(id);
      setOrder(orderData);

      // Initialize review form data
      const initialReviewData: { [key: string]: { rating: number; comment: string } } = {};
      orderData.items.forEach(item => {
        initialReviewData[item.artwork.id] = { rating: 5, comment: '' };
      });
      setReviewFormData(initialReviewData);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again later.');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewToggle = (artworkId: string) => {
    setShowReviewForm(prev => ({
      ...prev,
      [artworkId]: !prev[artworkId]
    }));
  };

  const handleReviewChange = (artworkId: string, field: 'rating' | 'comment', value: string | number) => {
    setReviewFormData(prev => ({
      ...prev,
      [artworkId]: {
        ...prev[artworkId],
        [field]: value
      }
    }));
  };

  const handleSubmitReview = async (orderItemId: string, artworkId: string) => {
    const reviewData = reviewFormData[artworkId];
    if (!reviewData.comment) {
      toast.error('Please provide a comment for your review');
      return;
    }

    try {
      setReviewSubmitting(prev => ({ ...prev, [artworkId]: true }));
      await reviewAPI.create({
        orderItemId,  // Pass orderItemId to verify purchase
        rating: reviewData.rating,
        comment: reviewData.comment
      });

      toast.success('Review submitted successfully');
      setShowReviewForm(prev => ({ ...prev, [artworkId]: false }));
    } catch (err: any) {
      console.error('Error submitting review:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit review. Please try again later.';
      toast.error(errorMessage);
    } finally {
      setReviewSubmitting(prev => ({ ...prev, [artworkId]: false }));
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error || 'Order not found'}</p>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => orderId && fetchOrderDetails(orderId)}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/dashboard/customer/orders')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-600"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard/customer/orders')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Orders
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Order Details</h1>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="ml-1">{order.status.charAt(0) + order.status.slice(1).toLowerCase()}</span>
        </span>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg border mb-6">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h2 className="text-lg font-medium">Order Summary</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-medium">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-lg">₹{order.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg border mb-6">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h2 className="text-lg font-medium">Shipping Address</h2>
        </div>
        <div className="p-4">
          <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
          <p>{order.shippingAddress.street}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
          <p>{order.shippingAddress.country}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h2 className="text-lg font-medium">Order Items</h2>
        </div>
        <div>
          {order.items.map((item) => (
            <div key={item.id} className="border-b last:border-b-0">
              <div className="p-4 flex flex-col md:flex-row md:items-center">
                <div className="flex items-center flex-1">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.artwork.images[0]}
                      alt={item.artwork.title}
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Artwork';
                      }}
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-gray-900">{item.artwork.title}</h3>
                    <p className="text-sm text-gray-500">by {item.artwork.artist.firstName} {item.artwork.artist.lastName}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      ₹{item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-6">
                  <p className="text-lg font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>

                  {/* Only show review button for delivered orders */}
                  {order.status === 'DELIVERED' && (
                    <button
                      onClick={() => handleReviewToggle(item.artwork.id)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      {showReviewForm[item.artwork.id] ? 'Cancel Review' : 'Write a Review'}
                    </button>
                  )}
                </div>
              </div>

              {/* Review Form */}
              {showReviewForm[item.artwork.id] && (
                <div className="p-4 bg-blue-50 border-t">
                  <h4 className="font-medium mb-3">Write a Review</h4>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleReviewChange(item.artwork.id, 'rating', star)}
                          className="p-1"
                        >
                          <Star
                            className={`h-6 w-6 ${star <= reviewFormData[item.artwork.id]?.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <textarea
                      value={reviewFormData[item.artwork.id]?.comment || ''}
                      onChange={(e) => handleReviewChange(item.artwork.id, 'comment', e.target.value)}
                      rows={3}
                      placeholder="Share your thoughts about this artwork..."
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleReviewToggle(item.artwork.id)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmitReview(item.id, item.artwork.id)}
                      disabled={reviewSubmitting[item.artwork.id]}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                      {reviewSubmitting[item.artwork.id] ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
