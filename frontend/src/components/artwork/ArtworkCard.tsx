import React, { useCallback, memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Artwork } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { getFullImageUrl } from '../../services/api';
import { toast } from 'react-toastify';
import {motion} from 'framer-motion';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import QuickViewModal from './QuickViewModal';

interface ArtworkCardProps {
  artwork: Artwork;
  onAddToCart?: (artwork: Artwork) => void;
  onAddToWishlist?: (artwork: Artwork) => void;
  showBadge?: boolean;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  onAddToCart,
  onAddToWishlist,
  showBadge = true,
}) => {
  const { state, dispatch } = useAppContext();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isInWishlist = state.wishlist.some(item => item.artwork.id === artwork.id);
  const isInCart = state.cart.some(item => item.artwork.id === artwork.id);

  const handleAddToCart = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();

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

    if (onAddToCart) {
      onAddToCart(artwork);
    }
  }, [artwork, isInCart, state.auth.isAuthenticated, dispatch, onAddToCart]);

  const handleAddToWishlist = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();

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

    if (onAddToWishlist) {
      onAddToWishlist(artwork);
    }
  }, [artwork, isInWishlist, state.auth.isAuthenticated, dispatch, onAddToWishlist, state.wishlist]);

  
  const safeArtwork = {
    ...artwork,
    images: artwork.images?.length > 0 ? artwork.images : ['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg'],
    reviews: artwork.reviews || [],
    averageRating: artwork.averageRating || 0,
    totalReviews: artwork.totalReviews || 0,
    dimensions: artwork.dimensions || { width: 0, height: 0 }
  };

  
  const getBadge = () => {
    if (!showBadge) return null;
    if (!artwork.isAvailable) return <Badge variant="soldOut" size="sm">Sold Out</Badge>;
    
    
    return null;
  };

  return (
    <>
      <div className="group relative bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in">
        {}
        <Link to={`/artworks/${artwork.id}`} className="block">
          <div className="relative aspect-portrait overflow-hidden bg-neutral-100">
            {}
            {!imageLoaded && (
              <div className="absolute inset-0 shimmer" />
            )}

            <img
              src={getFullImageUrl(safeArtwork.images[0] || '')}
              alt={safeArtwork.title}
              className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 group-hover:scale-110' : 'opacity-0'
                }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />

            {}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 flex items-center justify-center gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsQuickViewOpen(true);
                  }}
                  className="p-3 bg-white rounded-full shadow-lg hover:bg-neutral-100 transition-all transform hover:scale-110"
                  aria-label="Quick view"
                >
                  <Eye className="h-5 w-5 text-neutral-700" />
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${isInWishlist
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
                  aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {}
            {getBadge() && (
              <div className="absolute top-3 left-3 z-10">
                {getBadge()}
              </div>
            )}

            {}
            <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
              <span className="text-base font-bold text-primary-600">
                ₹{artwork.price.toLocaleString()}
              </span>
            </div>
          </div>
        </Link>

        {}
        <div className="p-4">
          {}
          <Link to={`/artworks/${artwork.id}`}>
            <h3 className="font-display font-semibold text-lg text-neutral-900 hover:text-primary-600 transition-colors mb-1 line-clamp-1">
              {artwork.title}
            </h3>
          </Link>

          {}
          {artwork.artist?.id ? (
            <Link
              to={
                artwork.artist.username
                  ? `/artists/username/${artwork.artist.username}`
                  : `/artists/${artwork.artist.id}`
              }
              className="flex items-center gap-2 mb-3 group/artist"
            >
              {artwork.artist.profileImage ? (
                <img
                  src={artwork.artist.profileImage}
                  alt={`${artwork.artist.firstName} ${artwork.artist.lastName}`}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-700">
                    {artwork.artist.firstName?.[0] || 'A'}
                  </span>
                </div>
              )}
              <span className="text-sm text-neutral-600 group-hover/artist:text-primary-600 transition-colors">
                {artwork.artist.firstName} {artwork.artist.lastName}
              </span>
            </Link>
          ) : (
            <p className="text-sm text-neutral-600 mb-3">
              by {artwork.artist?.firstName || 'Unknown'} {artwork.artist?.lastName || 'Artist'}
            </p>
          )}

          {}
          {artwork.averageRating > 0 && (
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= artwork.averageRating
                      ? 'text-yellow-400 fill-current'
                      : 'text-neutral-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-neutral-600 ml-2">
                ({artwork.totalReviews})
              </span>
            </div>
          )}

          {}
          <p className="text-sm text-neutral-700 mb-4 line-clamp-2">
            {artwork.description}
          </p>

          {}
          {artwork.tags && artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {artwork.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {artwork.tags.length > 2 && (
                <span className="text-xs text-neutral-500 px-2 py-1">
                  +{artwork.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {}
          <Button
            variant={isInCart ? 'secondary' : 'primary'}
            size="md"
            fullWidth
            leftIcon={<ShoppingCart />}
            disabled={!artwork.isAvailable}
            onClick={handleAddToCart}
            className="shadow-sm"
          >
            {!artwork.isAvailable ? 'Sold Out' : isInCart ? 'In Cart' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      {}
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        artwork={safeArtwork}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
        isInWishlist={isInWishlist}
        isInCart={isInCart}
      />
    </>
  );
};


export default memo(ArtworkCard, (prevProps, nextProps) => {
  return (
    prevProps.artwork.id === nextProps.artwork.id &&
    prevProps.artwork.updatedAt === nextProps.artwork.updatedAt &&
    prevProps.artwork.isAvailable === nextProps.artwork.isAvailable
  );
});