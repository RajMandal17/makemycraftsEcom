import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Award } from 'lucide-react';
import { Artwork, HomeStats } from '../types';
import { artworkAPI } from '../services/api';
import { homeAPI } from '../services/homeAPI';
import ArtworkGrid from '../components/artwork/ArtworkGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductCarousel from '../components/common/ProductCarousel';
import { updateMetaTags } from '../components/common/SEO';

const HomePage: React.FC = () => {
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([]);
  const [topSellers, setTopSellers] = useState<Artwork[]>([]);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [topSellersLoading, setTopSellersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch statistics, top sellers, and artworks in parallel for better performance
      const fetchStats = async () => {
        try {
          console.log('Fetching home statistics...');
          const statsData = await homeAPI.getStatistics();
          console.log('Home statistics response:', statsData);
          setStats(statsData);
        } catch (error) {
          console.error('Error fetching home statistics:', error);
          // Set default stats on error
          setStats({
            totalArtworks: 0,
            totalArtists: 0,
            averageRating: 0.0,
            totalSales: 0,
            totalOrders: 0,
            totalCustomers: 0,
          });
        } finally {
          setStatsLoading(false);
        }
      };

      const fetchTopSellers = async () => {
        try {
          console.log('Fetching top sellers...');
          const topSellerData = await homeAPI.getTopSellers(10);
          console.log('Top sellers response:', topSellerData);
          setTopSellers(topSellerData || []);
        } catch (error) {
          console.error('Error fetching top sellers:', error);
          setTopSellers([]);
        } finally {
          setTopSellersLoading(false);
        }
      };

      const fetchArtworks = async () => {
        try {
          console.log('Fetching featured artworks...');
          const response = await artworkAPI.getAll({
            limit: 8,
            page: 1
          });

          console.log('Featured artworks response:', response);

          if (response && Array.isArray(response.artworks)) {
            setFeaturedArtworks(response.artworks);
            setError(null);
          } else {
            console.error('Invalid response structure:', response);
            setFeaturedArtworks([]);
            setError('Could not load featured artworks. Please try again later.');
          }
        } catch (error) {
          console.error('Error fetching featured artworks:', error);
          setFeaturedArtworks([]);
          setError('Failed to load featured artworks. Please check your connection and try again.');
        } finally {
          setLoading(false);
        }
      };

      // Execute all three fetches in parallel
      await Promise.all([fetchStats(), fetchTopSellers(), fetchArtworks()]);
    };

    // Set SEO meta tags for homepage
    updateMetaTags({
      title: 'MakeMyCrafts - Buy Handmade Artwork, Custom Made Crafts & Homemade Art Online India',
      description: 'MakeMyCrafts - India\'s best marketplace for handmade artwork, custom made crafts & homemade art. Buy unique handcrafted paintings, sculptures & artworks directly from skilled artists. Perfect for custom artwork gifts & home decor.',
      keywords: 'makemycrafts, make my crafts, makemycraft, make my craft, handmade artwork, custom made art, homemade crafts, custom artwork, handmade crafts India, buy artwork online, custom paintings, handcrafted gifts, artisan crafts, artwork marketplace, handmade paintings, custom made gifts, homemade artwork',
      url: 'https://makemycrafts.com',
      type: 'website',
    });

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Top Sellers Carousel - Hero Section */}
      {!topSellersLoading && topSellers.length > 0 && (
        <ProductCarousel
          products={topSellers}
          title="🔥 Top Sellers"
          viewAllLink="/artworks"
          autoPlayInterval={5000}
        />
      )}


      {/* Featured Artworks */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Artworks
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover handpicked masterpieces from our most talented artists
            </p>
          </div>

          {loading ? (
            <LoadingSpinner size="lg" className="py-12" />
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-lg p-6 text-center max-w-2xl mx-auto">
              <div className="text-red-500 mb-2 text-xl">⚠️</div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : featuredArtworks.length === 0 ? (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center max-w-2xl mx-auto">
              <div className="text-blue-500 mb-2 text-xl">🖼️</div>
              <h3 className="text-lg font-medium text-blue-800 mb-2">No artworks available</h3>
              <p className="text-blue-600 mb-4">
                We're adding new artworks soon! Check back later for our featured collection.
              </p>
              <Link
                to="/artworks"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors"
              >
                Browse All Artworks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <ArtworkGrid artworks={featuredArtworks} />
              <div className="text-center mt-12">
                <Link
                  to="/artworks"
                  className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  View All Artworks
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-xl text-gray-600">
              Find art that matches your style and taste
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Digital Art',
                image: 'https://images.pexels.com/photos/8953363/pexels-photo-8953363.jpeg',
                count: '2,341 pieces',
              },
              {
                name: 'Photography',
                image: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg',
                count: '1,856 pieces',
              },
              {
                name: 'Paintings',
                image: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg',
                count: '3,247 pieces',
              },
              {
                name: 'Sculptures',
                image: 'https://images.pexels.com/photos/8953363/pexels-photo-8953363.jpeg',
                count: '892 pieces',
              },
              {
                name: 'Mixed Media',
                image: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg',
                count: '1,456 pieces',
              },
              {
                name: 'Abstract',
                image: 'https://images.pexels.com/photos/8953363/pexels-photo-8953363.jpeg',
                count: '2,103 pieces',
              },
            ].map((category, index) => (
              <Link
                key={index}
                to={`/artworks?category=${encodeURIComponent(category.name)}`}
                className="group relative overflow-hidden rounded-lg aspect-[4/3] hover:transform hover:scale-105 transition-all duration-300"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                  <p className="text-gray-200">{category.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {statsLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-3xl font-bold text-neutral-900 mb-2">
                  {stats?.totalArtists ? `${stats.totalArtists.toLocaleString()}+` : '0'}
                </h3>
                <p className="text-neutral-600">Active Artists</p>
              </div>
              <div className="text-center">
                <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-secondary-600" />
                </div>
                <h3 className="text-3xl font-bold text-neutral-900 mb-2">
                  {stats?.totalArtworks ? `${stats.totalArtworks.toLocaleString()}+` : '0'}
                </h3>
                <p className="text-neutral-600">Available Artworks</p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-3xl font-bold text-neutral-900 mb-2">
                  {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </h3>
                <p className="text-neutral-600">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-amber-600">₹</span>
                </div>
                <h3 className="text-3xl font-bold text-neutral-900 mb-2">
                  {stats?.totalSales ? `₹${(stats.totalSales / 1000).toFixed(0)}K+` : '₹0'}
                </h3>
                <p className="text-neutral-600">Total Sales</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Art Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of art lovers and creators in our vibrant community.
            Discover, collect, and sell extraordinary artworks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Today
            </Link>
            <Link
              to="/artworks"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;