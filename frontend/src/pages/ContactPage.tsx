import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Clock, Send, MessageCircle, HelpCircle, ShoppingBag } from 'lucide-react';
import { updateMetaTags } from '../components/common/SEO';
import { toast } from 'react-toastify';


const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        
        updateMetaTags({
            title: 'Contact MakeMyCrafts - Get Help with Handmade Artwork & Custom Crafts Orders',
            description: 'Contact MakeMyCrafts for questions about handmade artwork, custom made crafts orders, artist inquiries, or customer support. We\'re here to help with your homemade art needs.',
            keywords: 'contact makemycrafts, contact make my crafts, handmade art support, custom artwork inquiry, buy handmade help, artist support, makemycraft contact, make my craft contact, custom crafts order help',
            url: 'https://makemycrafts.com/contact',
            type: 'website',
        });

        
        const contactSchema = {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Contact MakeMyCrafts',
            description: 'Contact page for MakeMyCrafts - India\'s marketplace for handmade artwork and custom crafts',
            url: 'https://makemycrafts.com/contact',
            mainEntity: {
                '@type': 'Organization',
                name: 'MakeMyCrafts',
                email: 'mail@makemycrafts.com',
                telephone: '+91-XXXXXXXXXX',
                address: {
                    '@type': 'PostalAddress',
                    addressCountry: 'IN'
                }
            }
        };

        const script = document.createElement('script');
        script.id = 'contact-schema';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(contactSchema);
        document.head.appendChild(script);

        return () => {
            const existing = document.getElementById('contact-schema');
            if (existing) existing.remove();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        
        setTimeout(() => {
            toast.success('Thank you for your message! We\'ll get back to you within 24 hours.');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {}
            <section className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Contact MakeMyCrafts
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto opacity-90">
                        Have questions about <strong>handmade artwork</strong> or <strong>custom crafts</strong>? We're here to help!
                    </p>
                </div>
            </section>

            {}
            <section className="py-12 -mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ContactCard
                            icon={<Mail className="h-8 w-8 text-purple-600" />}
                            title="Email Us"
                            info="mail@makemycrafts.com"
                            description="For general inquiries about handmade art"
                        />
                        <ContactCard
                            icon={<Clock className="h-8 w-8 text-blue-600" />}
                            title="Response Time"
                            info="Within 24 Hours"
                            description="We respond to all queries promptly"
                        />
                        <ContactCard
                            icon={<MapPin className="h-8 w-8 text-green-600" />}
                            title="Location"
                            info="India"
                            description="Serving art lovers across India"
                        />
                    </div>
                </div>
            </section>

            {}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {}
                        <div className="bg-white rounded-2xl shadow-sm p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Send Us a Message
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="custom-artwork">Custom Artwork Inquiry</option>
                                        <option value="order-help">Order Help</option>
                                        <option value="artist-inquiry">Artist Inquiry - Sell Handmade Art</option>
                                        <option value="returns">Returns & Refunds</option>
                                        <option value="feedback">Feedback & Suggestions</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Tell us about your handmade art inquiry..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        'Sending...'
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Frequently Asked Questions
                            </h2>
                            <div className="space-y-4">
                                <FAQItem
                                    icon={<ShoppingBag className="h-6 w-6 text-purple-600" />}
                                    question="How do I order custom handmade artwork?"
                                    answer="Browse our collection, select an artwork you like, or contact the artist directly for custom made pieces. Each artist can create personalized handmade art based on your requirements."
                                />
                                <FAQItem
                                    icon={<MessageCircle className="h-6 w-6 text-blue-600" />}
                                    question="Can I request modifications to an artwork?"
                                    answer="Yes! Many of our artists offer custom modifications. You can message the artist directly through our platform to discuss your custom artwork needs."
                                />
                                <FAQItem
                                    icon={<HelpCircle className="h-6 w-6 text-green-600" />}
                                    question="How do I become a seller on MakeMyCrafts?"
                                    answer="Click 'Start Selling' and register as an artist. Once approved, you can upload your handmade artwork, set prices, and start selling to art lovers across India."
                                />
                                <FAQItem
                                    icon={<Clock className="h-6 w-6 text-amber-600" />}
                                    question="What is the delivery time for handmade art?"
                                    answer="Delivery times vary by artwork. Ready-made pieces typically ship within 3-5 days. Custom made crafts may take 1-2 weeks depending on complexity."
                                />
                            </div>

                            {}
                            <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Need More Help?
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Check out our help resources or reach out directly:
                                </p>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-center">
                                        <Mail className="h-5 w-5 text-purple-600 mr-3" />
                                        <span><strong>Email:</strong> mail@makemycrafts.com</span>
                                    </li>
                                    <li className="flex items-center">
                                        <Clock className="h-5 w-5 text-blue-600 mr-3" />
                                        <span><strong>Hours:</strong> Mon-Sat, 9 AM - 6 PM IST</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};


const ContactCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    info: string;
    description: string;
}> = ({ icon, title, info, description }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-purple-600 font-medium mb-2">{info}</p>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);


const FAQItem: React.FC<{
    icon: React.ReactNode;
    question: string;
    answer: string;
}> = ({ icon, question, answer }) => (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">{icon}</div>
            <div className="ml-4">
                <h3 className="font-semibold text-gray-900 mb-2">{question}</h3>
                <p className="text-gray-600 text-sm">{answer}</p>
            </div>
        </div>
    </div>
);

export default ContactPage;
