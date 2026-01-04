import React, { memo, useCallback } from 'react';
import { Artwork } from '../../types';
import ArtworkCard from './ArtworkCard';
import LoadingSpinner from '../common/LoadingSpinner';

interface ArtworkGridProps {
  artworks: Artwork[];
  loading?: boolean;
  onAddToCart?: (artwork: Artwork) => void;
  onAddToWishlist?: (artwork: Artwork) => void;
}

const ArtworkGrid: React.FC<ArtworkGridProps> = ({
  artworks,
  loading = false,
  onAddToCart,
  onAddToWishlist,
}) => {
  // Using useCallback to memoize functions passed to child components
  const handleAddToCart = useCallback((artwork: Artwork) => {
    if (onAddToCart) {
      onAddToCart(artwork);
    }
  }, [onAddToCart]);

  const handleAddToWishlist = useCallback((artwork: Artwork) => {
    if (onAddToWishlist) {
      onAddToWishlist(artwork);
    }
  }, [onAddToWishlist]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No artworks found</div>
        <p className="text-gray-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artworks.map((artwork) => (
        <ArtworkCard
          key={artwork.id}
          artwork={artwork}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
        />
      ))}
    </div>
  );
};

// Using memo to prevent unnecessary re-renders when props don't change
export default memo(ArtworkGrid, (prevProps, nextProps) => {
  // Only re-render if loading state changes or artworks array changes
  return prevProps.loading === nextProps.loading && 
         prevProps.artworks === nextProps.artworks;
});