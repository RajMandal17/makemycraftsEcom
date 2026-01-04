import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Shield, Truck, Palette, Star, ArrowRight } from 'lucide-react';
import { updateMetaTags } from '../components/common/SEO';

/**
 * About Page - SEO Optimized for target keywords
 * Keywords: makemycrafts, handmade artwork, custom made crafts, homemade art, Indian artists
 */
const AboutPage: React.FC = () => {
    useEffect(() => {
        // SEO Meta Tags
        updateMetaTags({
            title: 'About MakeMyCrafts - India\'s Premier Handmade Artwork & Custom Crafts Marketplace',
            description: 'Learn about MakeMyCrafts - India\'s leading marketplace for handmade artwork, custom made crafts, and homemade art. We connect skilled Indian artists with art lovers worldwide. Buy unique handcrafted paintings, sculptures & custom artwork.',
            keywords: 'about makemycrafts, about make my crafts, makemycraft story, make my craft, handmade artwork India, custom made crafts marketplace, Indian artists platform, buy handmade art, homemade crafts India, artisan marketplace, custom artwork India',
            url: 'https://makemycrafts.com/about',
            type: 'website',
        });

        // Inject Organization Schema
        const orgSchema = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'MakeMyCrafts',
            url: 'https://makemycrafts.com',
            logo: 'https://makemycrafts.com/logo.png',
            description: 'India\'s premier marketplace for handmade artwork, custom made crafts, and homemade art from skilled Indian artists.',
            foundingDate: '2024',
            founders: [{
                '@type': 'Person',
                name: 'MakeMyCrafts Team'
            }],
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'IN'
            },
            contactPoint: {
                '@type': 'ContactPoint',
                email: 'mail@makemycrafts.com',
                contactType: 'customer service'
            },
            sameAs: [
                'https://www.facebook.com/makemycrafts',
                'https://www.instagram.com/makemycrafts',
                'https://twitter.com/makemycrafts'
            ]
        };

        const script = document.createElement('script');
        script.id = 'about-schema';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(orgSchema);
        document.head.appendChild(script);

        return () => {
            const existing = document.getElementById('about-schema');
            if (existing) existing.remove();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        About MakeMyCrafts
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
                        India's Premier Marketplace for <strong>Handmade Artwork</strong>, <strong>Custom Made Crafts</strong> & <strong>Homemade Art</strong>
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Our Mission: Celebrating Handmade Art
                            </h2>
                            <p className="text-lg text-gray-700 mb-4">
                                At <strong>MakeMyCrafts</strong>, we believe every piece of <strong>handmade artwork</strong> tells a unique story.
                                Our mission is to connect talented Indian artists and craftspeople with art enthusiasts worldwide,
                                making authentic <strong>custom made crafts</strong> and <strong>homemade art</strong> accessible to everyone.
                            </p>
                            <p className="text-lg text-gray-700 mb-4">
                                Whether you're looking for a <strong>custom painting</strong>, a unique <strong>handcrafted sculpture</strong>,
                                or a special <strong>homemade gift</strong>, MakeMyCrafts is your destination for authentic Indian artistry.
                            </p>
                            <p className="text-lg text-gray-700">
                                We empower artists by providing a platform to showcase their <strong>handmade creations</strong>
                                and earn a sustainable income from their craft.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                                    <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                                    <div className="text-gray-600">Skilled Artists</div>
                                </div>
                                <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                                    <div className="text-4xl font-bold text-blue-600 mb-2">2000+</div>
                                    <div className="text-gray-600">Handmade Artworks</div>
                                </div>
                                <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                                    <div className="text-4xl font-bold text-indigo-600 mb-2">10K+</div>
                                    <div className="text-gray-600">Happy Customers</div>
                                </div>
                                <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                                    <div className="text-4xl font-bold text-pink-600 mb-2">4.8★</div>
                                    <div className="text-gray-600">Average Rating</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Why Choose MakeMyCrafts for Handmade Art?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Palette className="h-10 w-10 text-purple-600" />}
                            title="100% Handmade & Authentic"
                            description="Every artwork on MakeMyCrafts is genuinely handmade by skilled Indian artists. No mass-produced items – only authentic handcrafted creations."
                        />
                        <FeatureCard
                            icon={<Users className="h-10 w-10 text-blue-600" />}
                            title="Direct from Artists"
                            description="Buy custom made crafts directly from the artists who create them. Support independent craftspeople and get the best prices."
                        />
                        <FeatureCard
                            icon={<Star className="h-10 w-10 text-yellow-500" />}
                            title="Custom Artwork Orders"
                            description="Want a personalized piece? Our artists create custom made artwork tailored to your specifications and preferences."
                        />
                        <FeatureCard
                            icon={<Shield className="h-10 w-10 text-green-600" />}
                            title="Secure Payments"
                            description="Shop with confidence using our secure payment system. Your transactions are protected with industry-standard encryption."
                        />
                        <FeatureCard
                            icon={<Truck className="h-10 w-10 text-indigo-600" />}
                            title="Pan-India Delivery"
                            description="We deliver handmade artwork across India with careful packaging to ensure your art arrives in perfect condition."
                        />
                        <FeatureCard
                            icon={<Heart className="h-10 w-10 text-red-500" />}
                            title="Satisfaction Guaranteed"
                            description="Not happy with your purchase? We offer easy returns and refunds to ensure you're completely satisfied with your handmade art."
                        />
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Explore Our Handmade Art Collection
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <CategoryCard
                            title="Handmade Paintings"
                            description="Oil paintings, watercolors, acrylics, and more from talented Indian artists"
                            emoji="🎨"
                        />
                        <CategoryCard
                            title="Custom Sculptures"
                            description="Unique handcrafted sculptures in wood, metal, clay, and stone"
                            emoji="🗿"
                        />
                        <CategoryCard
                            title="Homemade Crafts"
                            description="Traditional and contemporary homemade crafts from across India"
                            emoji="✨"
                        />
                        <CategoryCard
                            title="Custom Made Gifts"
                            description="Personalized handmade gifts for every occasion"
                            emoji="🎁"
                        />
                    </div>
                </div>
            </section>

            {/* For Artists Section */}
            <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Are You a Handmade Artist?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Join MakeMyCrafts and reach thousands of art lovers looking for authentic <strong>handmade artwork</strong> and <strong>custom crafts</strong>.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                            <div className="text-4xl mb-4">🎨</div>
                            <h3 className="text-xl font-semibold mb-2">Showcase Your Art</h3>
                            <p className="text-gray-600">Create your artist profile and upload your handmade creations</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                            <div className="text-4xl mb-4">💰</div>
                            <h3 className="text-xl font-semibold mb-2">Earn More</h3>
                            <p className="text-gray-600">Keep 85% of every sale - one of the best rates in the industry</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                            <div className="text-4xl mb-4">🌍</div>
                            <h3 className="text-xl font-semibold mb-2">Reach Global Buyers</h3>
                            <p className="text-gray-600">Connect with art lovers from across India and beyond</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
                        >
                            Start Selling Your Art Today
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Discover Handmade Art?
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Explore our collection of authentic handmade artwork, custom made crafts, and homemade art from talented Indian artists.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/artworks"
                            className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Browse Handmade Artworks
                        </Link>
                        <Link
                            to="/artists"
                            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                        >
                            Meet Our Artists
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Feature Card Component
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
    icon,
    title,
    description,
}) => (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

// Category Card Component
const CategoryCard: React.FC<{ title: string; description: string; emoji: string }> = ({
    title,
    description,
    emoji,
}) => (
    <Link
        to="/artworks"
        className="bg-gray-50 p-6 rounded-xl hover:bg-purple-50 hover:shadow-md transition-all group"
    >
        <div className="text-4xl mb-4">{emoji}</div>
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </Link>
);

export default AboutPage;
