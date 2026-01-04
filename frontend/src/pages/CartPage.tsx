import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppContext } from '../context/AppContext';
import { orderAPI, getFullImageUrl } from '../services/api';
import { Address } from '../types';

const CartPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  
  console.log('CartPage render:', {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    cartItems: state.cart.length,
    cart: state.cart
  });

  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: state.auth.user?.address || '',
    city: state.auth.user?.city || '',
    state: state.auth.user?.state || '',
    zipCode: state.auth.user?.zipCode || '',
    country: state.auth.user?.country || 'USA',
  });
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = state.cart.reduce((sum, item) => sum + (item.artwork.price * item.quantity), 0);
  const shippingCost = subtotal > 100 ? 0 : 15; 
  const tax = subtotal * 0.1; 
  const total = subtotal + shippingCost + tax;

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;

    dispatch({
      type: 'UPDATE_CART_QUANTITY',
      payload: { id, quantity }
    });
    toast.success('Cart updated');
  };

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    toast.success('Item removed from cart');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value,
    });
  };

  const handlePlaceOrder = async () => {
    if (!state.auth.isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    
    const addressFields = Object.entries(shippingAddress);
    const emptyFields = addressFields.filter(([_, value]) => !value.trim());

    if (emptyFields.length > 0) {
      toast.error(`Please fill in all address fields: ${emptyFields.map(([field]) => field).join(', ')}`);
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        items: state.cart.map(item => ({
          artworkId: item.artwork.id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod,
      };

      const newOrder = await orderAPI.create(orderData);

      
      dispatch({ type: 'ADD_ORDER', payload: newOrder });

      
      dispatch({ type: 'CLEAR_CART' });

      toast.success('Order placed successfully!');
      navigate(`/dashboard/customer/orders/${newOrder.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {}
      {!state.auth.isAuthenticated ? (
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in to view your cart</h2>
          <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Go to Login
          </Link>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Link to="/dashboard/customer/browse" className="flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8 text-center">Your Shopping Cart</h1>

          {state.cart.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Looks like you haven't added any artworks to your cart yet.</p>
              <Link
                to="/dashboard/customer/browse"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Browse Artworks
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {}
              <div className="lg:w-2/3">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                      Cart Items ({state.cart.reduce((sum, item) => sum + item.quantity, 0)})
                    </h2>
                  </div>

                  <ul className="divide-y">
                    {state.cart.map((item) => {
                      
                      console.log('Rendering cart item:', item);

                      if (!item.artwork || !item.artwork.images || item.artwork.images.length === 0) {
                        console.warn('Invalid cart item:', item);
                        return null;
                      }

                      return (
                        <li key={item.id} className="p-6 flex flex-col sm:flex-row">
                          <div className="flex-shrink-0 w-full sm:w-32 h-32 mb-4 sm:mb-0">
                            <img
                              src={getFullImageUrl(item.artwork.images[0])}
                              alt={item.artwork.title}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div className="sm:ml-6 flex-1">
                            <div className="flex flex-col sm:flex-row sm:justify-between">
                              <div>
                                <h3 className="text-lg font-medium">{item.artwork.title}</h3>
                                <p className="text-gray-500 text-sm">
                                  by {item.artwork.artist?.firstName || 'Unknown'} {item.artwork.artist?.lastName || 'Artist'}
                                </p>
                                <p className="text-gray-500 text-sm mt-1">
                                  {item.artwork.medium} • {item.artwork.dimensions?.width || 'N/A'}" × {item.artwork.dimensions?.height || 'N/A'}"
                                </p>
                              </div>
                              <div className="mt-2 sm:mt-0 text-right">
                                <p className="font-medium">₹{item.artwork.price.toFixed(2)}</p>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-between items-center">
                              <div className="flex items-center border rounded">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="px-3 py-1 disabled:opacity-50"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-1 border-x">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className="px-3 py-1"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-600 hover:text-red-800 flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    }).filter(Boolean)}
                  </ul>
                </div>
              </div>

              {}
              <div className="lg:w-1/3">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>{shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'Free'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (10%)</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {!isCheckingOut ? (
                    <button
                      onClick={() => navigate('/checkout')}
                      className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Proceed to Checkout
                    </button>
                  ) : (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Shipping Information</h3>
                      <form>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address
                          </label>
                          <input
                            type="text"
                            name="street"
                            value={shippingAddress.street}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={shippingAddress.city}
                              onChange={handleInputChange}
                              className="w-full border rounded px-3 py-2"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={shippingAddress.state}
                              onChange={handleInputChange}
                              className="w-full border rounded px-3 py-2"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Zip Code
                            </label>
                            <input
                              type="text"
                              name="zipCode"
                              value={shippingAddress.zipCode}
                              onChange={handleInputChange}
                              className="w-full border rounded px-3 py-2"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Country
                            </label>
                            <input
                              type="text"
                              name="country"
                              value={shippingAddress.country}
                              onChange={handleInputChange}
                              className="w-full border rounded px-3 py-2"
                              required
                            />
                          </div>
                        </div>

                        <div className="mb-5">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Method
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="CREDIT_CARD">Credit Card</option>
                            <option value="PAYPAL">PayPal</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={handlePlaceOrder}
                          disabled={isProcessing}
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center"
                        >
                          {isProcessing ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <ShoppingBag className="w-5 h-5 mr-2" />
                              Place Order
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsCheckingOut(false)}
                          className="w-full mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                          Back to Cart
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPage;
