import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Scale, ShieldCheck, AlertCircle, Users, CreditCard } from 'lucide-react';

const TermsPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Terms & Conditions | MakeMyCrafts - User Agreement</title>
                <meta
                    name="description"
                    content="MakeMyCrafts Terms and Conditions - Read our terms of service, user agreement, and guidelines for using our online art marketplace platform."
                />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center mb-6">
                            <Scale className="w-16 h-16" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
                            Terms & Conditions
                        </h1>
                        <p className="text-xl text-center text-purple-100">
                            Last Updated: December 24, 2025
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                        {/* Introduction */}
                        <section className="mb-12">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Welcome to MakeMyCrafts! These Terms and Conditions ("Terms") govern your use of our website{' '}
                                <a href="https://makemycrafts.com" className="text-blue-600 hover:text-blue-700 font-medium">
                                    makemycrafts.com
                                </a>{' '}
                                and related services. By accessing or using our platform, you agree to be bound by these Terms. Please read them carefully.
                            </p>
                        </section>

                        {/* Section 1 */}
                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <FileText className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
                            </div>
                            <div className="ml-9 space-y-3 text-gray-700">
                                <p>
                                    By creating an account, browsing, or making a purchase on MakeMyCrafts, you confirm that you:
                                </p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Are at least 18 years of age or have parental/guardian consent</li>
                                    <li>Have the legal capacity to enter into binding contracts</li>
                                    <li>Agree to comply with all applicable laws and regulations</li>
                                    <li>Accept these Terms and our Privacy Policy</li>
                                </ul>
                                <p className="font-medium">
                                    If you do not agree with these Terms, please do not use our services.
                                </p>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <Users className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">2. User Accounts</h2>
                            </div>
                            <div className="ml-9 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Account Registration</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>You must provide accurate and complete information</li>
                                        <li>Keep your password secure and confidential</li>
                                        <li>You are responsible for all activities under your account</li>
                                        <li>Notify us immediately of any unauthorized access</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 Account Types</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li><strong>Customer Accounts:</strong> For browsing and purchasing artwork</li>
                                        <li><strong>Artist Accounts:</strong> For listing and selling artwork (subject to approval)</li>
                                        <li><strong>Admin Accounts:</strong> For platform management (by invitation only)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">2.3 Account Termination</h3>
                                    <p className="text-gray-700">
                                        We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activities, or for any other reason at our sole discretion.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <ShieldCheck className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">3. Artist Terms</h2>
                            </div>
                            <div className="ml-9 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1 Artist Eligibility</h3>
                                    <p className="text-gray-700 mb-2">To sell artwork on MakeMyCrafts, you must:</p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>Complete KYC verification as per regulatory requirements</li>
                                        <li>Provide valid bank account details for payouts</li>
                                        <li>Own or have rights to all artwork you list</li>
                                        <li>Comply with all applicable laws and regulations</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">3.2 Artwork Listing</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>All artwork must be original or you must have proper licensing</li>
                                        <li>Accurate descriptions, dimensions, and pricing are required</li>
                                        <li>High-quality images that represent the actual artwork</li>
                                        <li>No prohibited content (offensive, illegal, or infringing material)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">3.3 Commission Structure</h3>
                                    <p className="text-gray-700">
                                        MakeMyCrafts charges a commission on each sale. The current commission rate is <strong>15% of the sale price</strong>. This may be adjusted with prior notice to artists.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">3.4 Payouts</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>Payouts are processed after successful order delivery</li>
                                        <li>Artists receive 85% of the sale price (after 15% commission)</li>
                                        <li>Minimum payout threshold: ₹500</li>
                                        <li>Payout processing time: 7-10 business days</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <CreditCard className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">4. Orders and Payments</h2>
                            </div>
                            <div className="ml-9 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 Placing Orders</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>All orders are subject to acceptance and availability</li>
                                        <li>We reserve the right to refuse or cancel any order</li>
                                        <li>Prices are in Indian Rupees (₹) and include applicable taxes</li>
                                        <li>Prices may change without notice (not affecting confirmed orders)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2 Payment Processing</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>Payments are processed securely through Razorpay</li>
                                        <li>We accept UPI, cards, net banking, and wallets</li>
                                        <li>Payment must be received before order processing</li>
                                        <li>Payment information is encrypted and not stored on our servers</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">4.3 Order Confirmation</h3>
                                    <p className="text-gray-700">
                                        You will receive an email confirmation once your order is successfully placed. This confirmation does not constitute acceptance of your order.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">5.1 Platform Content</h3>
                                    <p className="text-gray-700">
                                        All content on MakeMyCrafts, including text, graphics, logos, icons, images, and software, is our property or licensed to us and is protected by intellectual property laws.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">5.2 Artist Content</h3>
                                    <p className="text-gray-700">
                                        Artists retain all rights to their artwork. By listing artwork, you grant us a non-exclusive license to display, promote, and sell your work on our platform.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">5.3 Prohibited Use</h3>
                                    <p className="text-gray-700">You may not:</p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                                        <li>Reproduce, modify, or distribute our content without permission</li>
                                        <li>Use our platform for any illegal or unauthorized purpose</li>
                                        <li>Infringe on the intellectual property rights of others</li>
                                        <li>Reverse engineer or attempt to extract source code</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>
                            <div className="space-y-3 text-gray-700">
                                <p>Users are prohibited from:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Engaging in fraudulent transactions or chargebacks</li>
                                    <li>Harassing, threatening, or impersonating others</li>
                                    <li>Uploading malware, viruses, or harmful code</li>
                                    <li>Scraping, data mining, or automated data collection</li>
                                    <li>Creating fake reviews or manipulating ratings</li>
                                    <li>Circumventing security features or access controls</li>
                                    <li>Reselling or commercial use without authorization</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 7 */}
                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <AlertCircle className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">7. Disclaimers and Limitations</h2>
                            </div>
                            <div className="ml-9 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">7.1 Service Availability</h3>
                                    <p className="text-gray-700">
                                        We strive to maintain continuous service but do not guarantee uninterrupted access. We may modify, suspend, or discontinue services without notice.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">7.2 Third-Party Content</h3>
                                    <p className="text-gray-700">
                                        Artists are solely responsible for their artwork listings. We do not guarantee the accuracy, quality, or legality of artwork or artist representations.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">7.3 Limitation of Liability</h3>
                                    <p className="text-gray-700">
                                        To the maximum extent permitted by law, MakeMyCrafts shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 8 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Dispute Resolution</h2>
                            <div className="space-y-3 text-gray-700">
                                <p>
                                    In case of disputes between buyers and artists, we will attempt to facilitate resolution. However, we are not obligated to mediate disputes and are not liable for any outcomes.
                                </p>
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                                    <p className="text-blue-800">
                                        <strong>Governing Law:</strong> These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 9 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
                            <p className="text-gray-700">
                                You agree to indemnify and hold MakeMyCrafts, its officers, directors, employees, and agents harmless from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-3">
                                <li>Your violation of these Terms</li>
                                <li>Your violation of any third-party rights</li>
                                <li>Your use of our services</li>
                                <li>Content you submit or transmit through our platform</li>
                            </ul>
                        </section>

                        {/* Section 10 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
                            <p className="text-gray-700">
                                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after changes constitutes acceptance of the modified Terms. We recommend reviewing these Terms periodically.
                            </p>
                        </section>

                        {/* Section 11 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Severability</h2>
                            <p className="text-gray-700">
                                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
                            </p>
                        </section>

                        {/* Section 12 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Entire Agreement</h2>
                            <p className="text-gray-700">
                                These Terms, together with our Privacy Policy and any other legal notices published on our website, constitute the entire agreement between you and MakeMyCrafts.
                            </p>
                        </section>

                        {/* Contact Section */}
                        <section className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mt-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                            <p className="text-gray-700 mb-4">
                                If you have any questions about these Terms & Conditions, please contact us:
                            </p>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Email:</strong> <a href="mailto:legal@makemycrafts.com" className="text-blue-600 hover:text-blue-700">legal@makemycrafts.com</a></p>
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

export default TermsPage;
