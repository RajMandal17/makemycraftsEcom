import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Truck, Package, MapPin, Clock, Shield, AlertCircle } from 'lucide-react';

const ShippingPolicyPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Shipping & Delivery Policy | MakeMyCrafts</title>
                <meta name="description" content="MakeMyCrafts Shipping and Delivery Policy - Information about shipping methods, delivery timeframes, tracking, and shipping charges." />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center mb-6">
                            <Truck className="w-16 h-16" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Shipping & Delivery Policy</h1>
                        <p className="text-xl text-center text-indigo-100">Last Updated: December 24, 2025</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                        <section className="mb-12">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                At MakeMyCrafts, we are committed to delivering your artwork safely and on time. This policy outlines our shipping methods, delivery timeframes, and related terms.
                            </p>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <MapPin className="w-6 h-6 text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">1. Shipping Coverage</h2>
                            </div>
                            <div className="ml-9 space-y-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1 Domestic Shipping (India)</h3>
                                    <p className="text-gray-700">We currently ship to all serviceable pin codes across India. Most locations are covered, but remote areas may have extended delivery times.</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2 International Shipping</h3>
                                    <p className="text-gray-700">International shipping is not currently available but will be introduced in the future.</p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <Clock className="w-6 h-6 text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">2. Delivery Timeframes</h2>
                            </div>
                            <div className="ml-9 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Processing Time</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li><strong>Standard Items:</strong> 1-3 business days for order processing</li>
                                        <li><strong>Custom/Personalized:</strong> 5-7 business days (varies by artist)</li>
                                        <li>Processing time starts after payment confirmation</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 Shipping Time</h3>
                                    <div className="space-y-2 text-gray-700">
                                        <p><strong>Metro Cities:</strong> 3-5 business days</p>
                                        <p><strong>Tier 2/3 Cities:</strong> 5-7 business days</p>
                                        <p><strong>Remote Areas:</strong> 7-10 business days</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">2.3 Total Delivery Time</h3>
                                    <p className="text-gray-700">Processing time + Shipping time = <strong>4-17 business days</strong> (depending on location and item type)</p>
                                </div>
                                <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                                    <p className="text-amber-800">
                                        <strong>Note:</strong> Delivery times are estimates and may vary during peak seasons, festivals, or due to unforeseen circumstances.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <Package className="w-6 h-6 text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">3. Shipping Methods & Partners</h2>
                            </div>
                            <div className="ml-9 space-y-3">
                                <p className="text-gray-700">We partner with reliable courier services including:</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                    <li>Delhivery</li>
                                    <li>Blue Dart</li>
                                    <li>DTDC</li>
                                    <li>India Post (for specific locations)</li>
                                </ul>
                                <p className="text-gray-700 mt-3">The shipping partner is selected based on your location and item specifications to ensure safe delivery.</p>
                            </div>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <Truck className="w-6 h-6 text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">4. Shipping Charges</h2>
                            </div>
                            <div className="ml-9 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 Standard Rates</h3>
                                    <div className="space-y-2 text-gray-700">
                                        <p><strong>Orders below ₹999:</strong> ₹99 shipping fee</p>
                                        <p><strong>Orders ₹999 and above:</strong> FREE shipping</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2 Special Items</h3>
                                    <p className="text-gray-700">
                                        Large or fragile artworks may incur additional shipping charges based on size and weight. This will be displayed at checkout before payment.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">4.3 Remote Areas</h3>
                                    <p className="text-gray-700">
                                        Remote or difficult-to-access locations may have additional charges levied by courier partners.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <Shield className="w-6 h-6 text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">5. Order Tracking</h2>
                            </div>
                            <div className="ml-9 space-y-3 text-gray-700">
                                <p>Once your order is shipped, you will receive:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Shipping confirmation email with tracking number</li>
                                    <li>Real-time tracking link to monitor your shipment</li>
                                    <li>SMS updates at key delivery milestones</li>
                                    <li>Tracking information in "My Orders" section</li>
                                </ul>
                            </div>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <Package className="w-6 h-6 text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">6. Packaging Standards</h2>
                            </div>
                            <div className="ml-9 space-y-3 text-gray-700">
                                <p>We ensure your artwork is packaged securely:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Bubble wrap and protective layering for fragile items</li>
                                    <li>Sturdy cardboard boxes or wooden crates for paintings</li>
                                    <li>Moisture-resistant packaging materials</li>
                                    <li>Tamper-proof sealing to prevent transit damage</li>
                                    <li>Handling instructions marked on packages</li>
                                </ul>
                            </div>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <AlertCircle className="w-6 h-6 text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">7. Delivery Issues</h2>
                            </div>
                            <div className="ml-9 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">7.1 Failed Delivery Attempts</h3>
                                    <p className="text-gray-700">
                                        If delivery fails due to incorrect address, recipient unavailability, or refusal:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                                        <li>Up to 3 delivery attempts will be made</li>
                                        <li>You'll be contacted via phone/email</li>
                                        <li>Item may be returned to artist if undelivered</li>
                                        <li>Return shipping fees may apply</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">7.2 Lost or Damaged in Transit</h3>
                                    <p className="text-gray-700">
                                        In rare cases of loss or damage during shipping:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                                        <li>Contact us immediately with photos and details</li>
                                        <li>We will file a claim with the courier partner</li>
                                        <li>Full refund or replacement will be arranged</li>
                                        <li>No cost to you for shipping errors</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">7.3 Delayed Deliveries</h3>
                                    <p className="text-gray-700">
                                        If your order is significantly delayed beyond estimated delivery:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                                        <li>Contact our support team for assistance</li>
                                        <li>We'll track and expedite with courier partner</li>
                                        <li>Compensation considered for excessive delays</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Address Verification</h2>
                            <div className="space-y-3 text-gray-700">
                                <p>Please ensure your shipping address is complete and accurate:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Full name of recipient</li>
                                    <li>Complete address with house/flat number</li>
                                    <li>Correct PIN code</li>
                                    <li>Active phone number for delivery coordination</li>
                                    <li>Nearby landmark (if applicable)</li>
                                </ul>
                                <p className="mt-3 font-medium">We are not responsible for delays or failed deliveries due to incorrect address information provided by the customer.</p>
                            </div>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Unattended Deliveries</h2>
                            <p className="text-gray-700">
                                For security reasons, we require signature confirmation upon delivery. Packages will not be left unattended without recipient confirmation.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Inspection at Delivery</h2>
                            <div className="space-y-3 text-gray-700">
                                <p>We recommend inspecting your package upon delivery:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Check for external damage to the package</li>
                                    <li>Open and inspect the item in presence of delivery agent (if possible)</li>
                                    <li>Report any visible damage immediately</li>
                                    <li>Take photos if damage is found</li>
                                </ul>
                                <p className="mt-3">For damage claims, report within 48 hours with photographic evidence.</p>
                            </div>
                        </section>

                        <section className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Support</h2>
                            <p className="text-gray-700 mb-4">
                                For shipping-related queries, contact our support team:
                            </p>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Email:</strong> <a href="mailto:shipping@makemycrafts.com" className="text-blue-600 hover:text-blue-700">shipping@makemycrafts.com</a></p>
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

export default ShippingPolicyPage;
