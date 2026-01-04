import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { Artwork, Review } from '../types';
import { artworkAPI, getFullImageUrl, reviewAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ArtworkPreviewModal from '../components/artwork/preview/ArtworkPreviewModal';
import SEO, { generateProductSchema, injectSchema } from '../components/common/SEO';

const ArtworkDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAppContext();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isInWishlist = state.wishlist.some(item => item.artwork.id === id);
  const isInCart = state.cart.some(item => item.artwork.id === id);

  const fetchArtwork = useCallback(async () => {
    try {
      if (!id) return;
      const artworkData = await artworkAPI.getById(id);
      setArtwork(artworkData);
      setSelectedImage(getFullImageUrl(artworkData.images[0]) || '');

      
      const reviewsData = await reviewAPI.getByArtwork(id);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching artwork:', error);
      toast.error('Failed to load artwork details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArtwork();
  }, [fetchArtwork]);

  
  useEffect(() => {
    if (artwork) {
      
      const schema = generateProductSchema({
        id: artwork.id,
        title: artwork.title,
        description: artwork.description,
        price: artwork.price,
        images: artwork.images.map(img => getFullImageUrl(img)),
        category: artwork.category,
        isAvailable: artwork.isAvailable,
        averageRating: artwork.averageRating,
        totalReviews: artwork.totalReviews,
        artist: artwork.artist,
      });
      injectSchema(schema, 'product-schema');
    }
  }, [artwork]);

  const handleAddToCart = useCallback(async () => {
    if (!artwork) return;

    if (!state.auth.isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (isInCart) {
      toast.info('Item already in cart');
      return;
    }

    const cartItem = {
      id: `cart_${artwork.id}_${Date.now()}`,
      artwork,
      quantity: 1,
      addedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    toast.success('Added to cart!');
  }, [artwork, isInCart, state.auth.isAuthenticated, dispatch]);

  const handleAddToWishlist = useCallback(async () => {
    if (!artwork) return;

    if (!state.auth.isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    if (isInWishlist) {
      const itemToRemove = state.wishlist.find(item => item.artwork.id === artwork.id);
      if (itemToRemove) {
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: itemToRemove.id });
        toast.success('Removed from wishlist');
      }
    } else {
      const wishlistItem = {
        id: `wishlist_${artwork.id}_${Date.now()}`,
        artwork,
        addedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_TO_WISHLIST', payload: wishlistItem });
      toast.success('Added to wishlist!');
    }
  }, [artwork, isInWishlist, state.auth.isAuthenticated, dispatch, state.wishlist]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Artwork Not Found</h1>
        <p className="text-gray-600 mb-6">The artwork you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={selectedImage}
              alt={artwork.title}
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => setIsPreviewOpen(true)}
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {artwork.images.map((image, index) => (
              <button
                key={index}
                className={`aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-all
                  ${selectedImage === getFullImageUrl(image) ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => setSelectedImage(getFullImageUrl(image))}
              >
                <img
                  src={getFullImageUrl(image)}
                  alt={`${artwork.title} - View ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{artwork.title}</h1>
            {artwork.artist?.id ? (
              <Link
                to={
                  artwork.artist.username
                    ? `/artists/username/${artwork.artist.username}`
                    : `/artists/${artwork.artist.id}`
                }
                className="text-lg text-blue-600 hover:underline"
              >
                by {artwork.artist.firstName} {artwork.artist.lastName}
              </Link>
            ) : (
              <p className="text-lg text-gray-600">
                by {artwork.artist?.firstName || 'Unknown'} {artwork.artist?.lastName || 'Artist'}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <p className="text-3xl font-bold text-gray-900 mb-4">
              ₹{artwork.price.toLocaleString()}
            </p>
            {!artwork.isAvailable && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Sold Out
              </span>
            )}
          </div>

          {artwork.averageRating > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= artwork.averageRating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({artwork.totalReviews} {artwork.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}

          <p className="text-gray-600 text-lg">{artwork.description}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Medium:</span>
              <span className="font-medium">{artwork.medium}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Dimensions:</span>
              <span className="font-medium">
                {(artwork as any).width || artwork.dimensions?.width}" × {(artwork as any).height || artwork.dimensions?.height}"
                {((artwork as any).depth || artwork.dimensions?.depth) && ` × ${(artwork as any).depth || artwork.dimensions?.depth}"`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Category:</span>
              <span className="font-medium">{artwork.category}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {artwork.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              disabled={!artwork.isAvailable || isInCart}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-md transition-colors ${!artwork.isAvailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isInCart
                  ? 'bg-green-500 text-white cursor-default'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>
                {!artwork.isAvailable
                  ? 'Sold Out'
                  : isInCart
                    ? 'In Cart'
                    : 'Add to Cart'}
              </span>
            </button>
            <button
              onClick={handleAddToWishlist}
              className={`p-3 rounded-md transition-colors ${isInWishlist
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {review.customerName || 'Anonymous'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {}
      <ArtworkPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        images={artwork.images.map(img => getFullImageUrl(img))}
        title={artwork.title}
        artist={`${artwork.artist.firstName} ${artwork.artist.lastName}`}
      />
    </div>
  );
};

export default ArtworkDetailPage;
