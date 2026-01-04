import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Privacy Policy | MakeMyCrafts - Protecting Your Privacy</title>
                <meta
                    name="description"
                    content="MakeMyCrafts Privacy Policy - Learn how we collect, use, and protect your personal information. Your privacy and data security are our top priorities."
                />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
                {}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center mb-6">
                            <Shield className="w-16 h-16" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-center text-blue-100">
                            Last Updated: December 24, 2025
                        </p>
                    </div>
                </div>

                {}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                        {}
                        <section className="mb-12">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                At MakeMyCrafts, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website{' '}
                                <a href="https://makemycrafts.com" className="text-blue-600 hover:text-blue-700 font-medium">
                                    makemycrafts.com
                                </a>{' '}
                                and use our services.
                            </p>
                        </section>

                        {}
                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <Database className="w-6 h-6 text-blue-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
                            </div>
                            <div className="ml-9 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1 Personal Information</h3>
                                    <p className="text-gray-700">We may collect the following personal information:</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                                        <li>Name and contact information (email address, phone number)</li>
                                        <li>Shipping and billing addresses</li>
                                        <li>Payment information (processed securely through Razorpay)</li>
                                        <li>Account credentials (username, password)</li>
                                        <li>Profile information (bio, profile picture, preferences)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2 Automatically Collected Information</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>IP address and browser type</li>
                                        <li>Device information and operating system</li>
                                        <li>Browsing behavior and interaction with our website</li>
                                        <li>Cookies and similar tracking technologies</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">1.3 Artist Information</h3>
                                    <p className="text-gray-700">For artists using our platform:</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                                        <li>Artwork details and images</li>
                                        <li>Bank account details for payments</li>
                                        <li>KYC documents as required by law</li>
                                        <li>Sales and transaction history</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {}
                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <Eye className="w-6 h-6 text-blue-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
                            </div>
                            <div className="ml-9">
                                <p className="text-gray-700 mb-3">We use the collected information for:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>Processing and fulfilling your orders</li>
                                    <li>Managing your account and providing customer support</li>
                                    <li>Processing payments securely through our payment gateway</li>
                                    <li>Sending order confirmations, shipping updates, and notifications</li>
                                    <li>Improving our website, products, and services</li>
                                    <li>Personalizing your experience and showing relevant content</li>
                                    <li>Preventing fraud and ensuring platform security</li>
                                    <li>Complying with legal obligations and regulations</li>
                                    <li>Sending marketing communications (with your consent)</li>
                                </ul>
                            </div>
                        </section>

                        {}
                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <Lock className="w-6 h-6 text-blue-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">3. Data Security</h2>
                            </div>
                            <div className="ml-9 space-y-3">
                                <p className="text-gray-700">
                                    We implement industry-standard security measures to protect your personal information:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>SSL/TLS encryption for data transmission</li>
                                    <li>Secure payment processing through PCI-DSS compliant payment gateways</li>
                                    <li>Regular security audits and vulnerability assessments</li>
                                    <li>Access controls and authentication mechanisms</li>
                                    <li>Encrypted storage of sensitive information</li>
                                    <li>Regular backups and disaster recovery procedures</li>
                                </ul>
                                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
                                    <p className="text-amber-800">
                                        <strong>Note:</strong> While we strive to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {}
                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <UserCheck className="w-6 h-6 text-blue-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">4. Sharing Your Information</h2>
                            </div>
                            <div className="ml-9 space-y-3">
                                <p className="text-gray-700">We may share your information with:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li><strong>Payment Processors:</strong> Razorpay for processing payments securely</li>
                                    <li><strong>Shipping Partners:</strong> Courier services for order delivery</li>
                                    <li><strong>Service Providers:</strong> Third-party services for email, analytics, and hosting</li>
                                    <li><strong>Artists:</strong> Order details necessary for fulfillment (name, address)</li>
                                    <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                                </ul>
                                <p className="text-gray-700 mt-4">
                                    <strong>We do not sell or rent your personal information to third parties for marketing purposes.</strong>
                                </p>
                            </div>
                        </section>

                        {}
                        <section className="mb-10">
                            <div className="flex items-center mb-4">
                                <Mail className="w-6 h-6 text-blue-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">5. Your Rights and Choices</h2>
                            </div>
                            <div className="ml-9 space-y-3">
                                <p className="text-gray-700">You have the following rights regarding your personal information:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li><strong>Access:</strong> Request access to your personal data</li>
                                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                                    <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                                    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                                    <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                                    <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
                                </ul>
                                <p className="text-gray-700 mt-4">
                                    To exercise these rights, please contact us at{' '}
                                    <a href="mailto:privacy@makemycrafts.com" className="text-blue-600 hover:text-blue-700 font-medium">
                                        privacy@makemycrafts.com
                                    </a>
                                </p>
                            </div>
                        </section>

                        {}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
                            <div className="space-y-3 text-gray-700">
                                <p>
                                    We use cookies and similar tracking technologies to enhance your browsing experience. You can control cookies through your browser settings. Types of cookies we use:
                                </p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                                    <li><strong>Performance Cookies:</strong> Help us understand how you use our site</li>
                                    <li><strong>Functional Cookies:</strong> Remember your preferences</li>
                                    <li><strong>Marketing Cookies:</strong> Show relevant advertisements (with consent)</li>
                                </ul>
                            </div>
                        </section>

                        {}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
                            <p className="text-gray-700">
                                Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                            </p>
                        </section>

                        {}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h2>
                            <p className="text-gray-700">
                                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                            </p>
                        </section>

                        {}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Retention</h2>
                            <p className="text-gray-700">
                                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, we securely delete or anonymize it.
                            </p>
                        </section>

                        {}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
                            <p className="text-gray-700">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
                            </p>
                        </section>

                        {}
                        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                            <p className="text-gray-700 mb-4">
                                If you have any questions about this Privacy Policy or our data practices, please contact us:
                            </p>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Email:</strong> <a href="mailto:privacy@makemycrafts.com" className="text-blue-600 hover:text-blue-700">privacy@makemycrafts.com</a></p>
                                <p><strong>Email:</strong> <a href="mailto:support@makemycrafts.com" className="text-blue-600 hover:text-blue-700">support@makemycrafts.com</a></p>
                                <p><strong>Website:</strong> <a href="https://makemycrafts.com" className="text-blue-600 hover:text-blue-700">https:
                                <p><strong>Address:</strong> MakeMyCrafts, India</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrivacyPolicyPage;
