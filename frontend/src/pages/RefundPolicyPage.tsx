import React from 'react';
import { Helmet } from 'react-helmet-async';
import { RefreshCw, Clock, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const RefundPolicyPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Refund & Cancellation Policy | MakeMyCrafts</title>
                <meta name="description" content="MakeMyCrafts Refund and Cancellation Policy - Learn about our order cancellation process, refund eligibility, and timelines." />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center mb-6">
                            <RefreshCw className="w-16 h-16" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Refund & Cancellation Policy</h1>
                        <p className="text-xl text-center text-green-100">Last Updated: December 24, 2025</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                        <section className="mb-12">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                At MakeMyCrafts, we strive to ensure complete customer satisfaction. This policy outlines the conditions for order cancellations and refunds.
                            </p>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <XCircle className="w-6 h-6 text-green-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">1. Order Cancellation</h2>
                            </div>
                            <div className="ml-9 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1 Customer Cancellation</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                                        <li>Orders can be cancelled within <strong>2 hours</strong> of placement</li>
                                        <li>Cancellation available before artist begins processing</li>
                                        <li>No cancellation fee for early cancellations</li>
                                        <li>Request via "My Orders" or email support@makemycrafts.com</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2 Platform/Artist Cancellation</h3>
                                    <p className="text-gray-700">Full refund provided if order is cancelled by artist or platform due to unavailability, fraud detection, or force majeure.</p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">2. Refund Eligibility</h2>
                            </div>
                            <div className="ml-9 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Eligible for Full Refund:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>Cancelled within 2 hours before processing</li>
                                        <li>Item significantly different from description</li>
                                        <li>Damaged or defective item received</li>
                                        <li>Wrong item shipped</li>
                                        <li>Item not received within promised timeframe</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">NOT Eligible:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>Order already shipped or in transit</li>
                                        <li>Order delivered and accepted</li>
                                        <li>Change of mind after confirmation</li>
                                        <li>Minor variations in handmade items</li>
                                        <li>Custom/personalized orders (unless defective)</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <Clock className="w-6 h-6 text-green-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">3. Refund Timeline</h2>
                            </div>
                            <div className="ml-9 space-y-3">
                                <div className="space-y-2">
                                    <p className="text-gray-700"><strong>Step 1:</strong> Request review - 24-48 hours</p>
                                    <p className="text-gray-700"><strong>Step 2:</strong> Approval notification - 1 business day</p>
                                    <p className="text-gray-700"><strong>Step 3:</strong> Refund processing - 5-7 business days</p>
                                    <p className="text-gray-700"><strong>Step 4:</strong> Bank processing - 3-5 business days</p>
                                </div>
                                <p className="text-gray-800 font-semibold mt-4">Total: 7-15 business days</p>
                                <p className="text-gray-700">Refunds processed to original payment method (Card/UPI/Net Banking/Wallet)</p>
                            </div>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-green-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">4. Damaged/Defective Items</h2>
                            </div>
                            <div className="ml-9 space-y-3 text-gray-700">
                                <p>Report within <strong>48 hours</strong> of delivery with:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Clear photos of damage/defect</li>
                                    <li>Photos of packaging</li>
                                    <li>Order number and description</li>
                                </ul>
                                <p className="mt-3">We arrange free pickup for approved returns. Refund processed after inspection.</p>
                            </div>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Non-Refundable Items</h2>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                <li>Digital downloads (once accessed)</li>
                                <li>Gift cards/vouchers</li>
                                <li>Custom or personalized artwork</li>
                                <li>Items marked "Final Sale"</li>
                                <li>Shipping charges (unless our error)</li>
                            </ul>
                        </section>

                        <section className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Refunds:</strong> <a href="mailto:refunds@makemycrafts.com" className="text-blue-600 hover:text-blue-700">refunds@makemycrafts.com</a></p>
                                <p><strong>Support:</strong> <a href="mailto:support@makemycrafts.com" className="text-blue-600 hover:text-blue-700">support@makemycrafts.com</a></p>
                                <p><strong>Website:</strong> <a href="https://makemycrafts.com" className="text-blue-600 hover:text-blue-700">https://makemycrafts.com</a></p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RefundPolicyPage;
