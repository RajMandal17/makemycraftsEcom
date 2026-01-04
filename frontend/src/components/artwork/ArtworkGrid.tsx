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


export default memo(ArtworkGrid, (prevProps, nextProps) => {
  
  return prevProps.loading === nextProps.loading && 
         prevProps.artworks === nextProps.artworks;
});