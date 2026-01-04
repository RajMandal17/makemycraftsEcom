import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import { Artwork } from '../../types';

interface ProductCarouselProps {
  products: Artwork[];
  autoPlayInterval?: number;
  title?: string;
  viewAllLink?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  autoPlayInterval = 5000,
  title = 'Top Sellers',
  viewAllLink = '/artworks',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Determine how many items to show based on screen size
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width >= 1280) return 5; // xl screens
    if (width >= 1024) return 4; // lg screens
    if (width >= 768) return 3; // md screens
    if (width >= 640) return 2; // sm screens
    return 1; // mobile
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsPerView);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-play functionality
  useEffect(() => {
    if (!isHovered && products.length > itemsPerView) {
      autoPlayRef.current = setInterval(goToNext, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isHovered, goToNext, autoPlayInterval, products.length, itemsPerView]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  if (!products || products.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            <p className="text-gray-600">
              Most popular artworks loved by our customers
            </p>
          </div>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="hidden md:inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              View All
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          )}
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Buttons - Desktop */}
          {products.length > itemsPerView && (
            <>
              <button
                onClick={goToPrev}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-200 hover:scale-110"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>
              <button
                onClick={goToNext}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-200 hover:scale-110"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Carousel Track */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <Link
                    to={`/artworks/${product.id}`}
                    className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={product.imageUrl || '/placeholder-artwork.jpg'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      {product.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </div>
                      )}
                      {product.stock !== undefined && product.stock === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.title}
                      </h3>

                      {/* Artist */}
                      {product.artistName && (
                        <p className="text-sm text-gray-600 mb-2">
                          by {product.artistName}
                        </p>
                      )}

                      {/* Rating */}
                      {product.averageRating !== undefined && product.averageRating > 0 && (
                        <div className="flex items-center mb-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-medium text-gray-700">
                            {product.averageRating.toFixed(1)}
                          </span>
                          {product.reviewCount !== undefined && product.reviewCount > 0 && (
                            <span className="ml-1 text-sm text-gray-500">
                              ({product.reviewCount})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        <div className="bg-blue-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ShoppingCart className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator - Mobile */}
          {products.length > itemsPerView && (
            <div className="flex justify-center mt-6 gap-2 md:hidden">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-blue-600'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Link - Mobile */}
        {viewAllLink && (
          <div className="mt-8 text-center md:hidden">
            <Link
              to={viewAllLink}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              View All Products
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCarousel;
