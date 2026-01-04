import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppContext } from '../context/AppContext';
import { orderAPI, paymentAPI } from '../services/api';
import { Address } from '../types';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

// Declare Razorpay on window
declare global {
    interface Window {
        Razorpay: any;
    }
}

const CheckoutPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    const [shippingAddress, setShippingAddress] = useState<Address>({
        street: state.auth.user?.address || '',
        city: state.auth.user?.city || '',
        state: state.auth.user?.state || '',
        zipCode: state.auth.user?.zipCode || '',
        country: state.auth.user?.country || 'India',
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // Redirect if not authenticated or cart is empty
    useEffect(() => {
        if (!state.auth.isAuthenticated) {
            toast.error('Please login to checkout');
            navigate('/login');
        }
        if (state.cart.length === 0) {
            toast.info('Your cart is empty');
            navigate('/cart');
        }
    }, [state.auth.isAuthenticated, state.cart, navigate]);

    // Calculate totals
    const subtotal = state.cart.reduce((sum, item) => sum + (item.artwork.price * item.quantity), 0);
    const shippingCost = subtotal > 100 ? 0 : 15;
    const tax = subtotal * 0.1;
    const total = subtotal + shippingCost + tax;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setShippingAddress({
            ...shippingAddress,
            [name]: value,
        });
    };

    const handlePayment = async () => {
        // Validate address
        const addressFields = Object.entries(shippingAddress);
        const emptyFields = addressFields.filter(([_, value]) => !value.trim());

        if (emptyFields.length > 0) {
            toast.error(`Please fill in all address fields`);
            return;
        }

        setIsProcessing(true);

        try {
            // Step 1: Create order in backend
            const orderData = {
                items: state.cart.map(item => ({
                    artworkId: item.artwork.id,
                    quantity: item.quantity,
                })),
                shippingAddress,
                paymentMethod: 'RAZORPAY',
            };

            const newOrder = await orderAPI.create(orderData);
            setOrderId(newOrder.id);

            console.log('Order created:', newOrder);

            // Step 2: Create Razorpay payment order
            const artistId = state.cart[0]?.artwork?.artistId || state.cart[0]?.artwork?.artist?.id;

            const paymentData = {
                orderId: newOrder.id,
                customerId: state.auth.user!.id,
                artistId: artistId,
                amount: total,
                currency: 'INR',
            };

            const razorpayOrder = await paymentAPI.createPayment(paymentData);
            console.log('Razorpay order created:', razorpayOrder);

            // Step 3: Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_K2d6X9pQwE7Fn3', // Replace with your key
                amount: razorpayOrder.amount * 100, // Razorpay expects amount in paise
                currency: razorpayOrder.currency,
                name: 'MakeMyCrafts',
                description: `Order #${newOrder.id.substring(0, 8)}`,
                order_id: razorpayOrder.gatewayOrderId,
                handler: async function (response: any) {
                    await handlePaymentSuccess(response, newOrder.id);
                },
                prefill: {
                    name: `${state.auth.user?.firstName || ''} ${state.auth.user?.lastName || ''}`,
                    email: state.auth.user?.email || '',
                    contact: state.auth.user?.phone || '9999999999',
                },
                theme: {
                    color: '#667eea',
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                        toast.warning('Payment cancelled');
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response: any) {
                handlePaymentFailure(response);
            });

            rzp.open();

        } catch (error: any) {
            console.error('Error initiating payment:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
            setIsProcessing(false);
        }
    };

    const handlePaymentSuccess = async (response: any, orderId: string) => {
        try {
            console.log('Payment successful:', response);

            // Verify payment on backend
            await paymentAPI.verifyPayment({
                orderId: orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
            });

            // Clear cart
            dispatch({ type: 'CLEAR_CART' });

            toast.success('Payment successful! Order placed.');

            // Redirect to order details
            navigate(`/dashboard/customer/orders/${orderId}`);
        } catch (error: any) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
            setIsProcessing(false);
        }
    };

    const handlePaymentFailure = (response: any) => {
        console.error('Payment failed:', response);
        toast.error(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
    };

    if (!state.auth.isAuthenticated || state.cart.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping Information */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>

                            <form>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={shippingAddress.street}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={shippingAddress.state}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ZIP Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={shippingAddress.zipCode}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country *
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={shippingAddress.country}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                            </form>

                            {/* Payment Security Info */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start">
                                <Lock className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium text-blue-900">Secure Payment</h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Your payment information is encrypted and secure. We use Razorpay for safe and reliable transactions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                            {/* Cart Items */}
                            <div className="mb-4 space-y-3 max-h-60 overflow-y-auto">
                                {state.cart.map((item) => (
                                    <div key={item.id} className="flex items-center text-sm">
                                        <div className="w-16 h-16 rounded overflow-hidden mr-3 flex-shrink-0">
                                            <img
                                                src={item.artwork.images[0]}
                                                alt={item.artwork.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{item.artwork.title}</p>
                                            <p className="text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium">₹{(item.artwork.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span>{shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'Free'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax (10%)</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Button */}
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5 mr-2" />
                                        Pay ₹{total.toFixed(2)}
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-3">
                                Powered by Razorpay
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
