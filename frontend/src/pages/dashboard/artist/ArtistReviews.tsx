import React, { useState, useEffect } from 'react';
import { Star, ThumbsDown, MessageCircle } from 'lucide-react';
import { reviewAPI, artworkAPI } from '../../../services/api';
import { Review, Artwork } from '../../../types';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../context/AppContext';

const ArtistReviews: React.FC = () => {
  const { state } = useAppContext();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const artistId = state.auth.user?.id;
      
      if (!artistId) {
        setError("User information not found");
        return;
      }
      
      // Fetch all artworks by the artist
      const artistArtworksResponse = await artworkAPI.getByArtist(artistId);
      setArtworks(artistArtworksResponse.artworks);
      
      // Fetch reviews for each artwork
      let allReviews: Review[] = [];
      for (const artwork of artistArtworksResponse.artworks) {
        try {
          const artworkReviews = await reviewAPI.getByArtwork(artwork.id);
          if (Array.isArray(artworkReviews)) {
            allReviews = [...allReviews, ...artworkReviews];
          } else {
            console.warn(`Unexpected reviews format for artwork ${artwork.id}:`, artworkReviews);
          }
        } catch (err) {
          console.error(`Error fetching reviews for artwork ${artwork.id}:`, err);
        }
      }
      
      // Sort reviews by date (newest first)
      allReviews.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setReviews(allReviews);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load reviews. Please try again later.');
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleArtworkFilter = (artworkId: string) => {
    setSelectedArtwork(artworkId);
  };

  const filteredReviews = selectedArtwork === 'all' 
    ? reviews 
    : reviews.filter(review => review.artworkId === selectedArtwork);

  const calculateAverageRating = (artworkId: string | null = null) => {
    const reviewsToAverage = artworkId 
      ? reviews.filter(review => review.artworkId === artworkId)
      : reviews;
      
    if (reviewsToAverage.length === 0) return 0;
    
    const sum = reviewsToAverage.reduce((total, review) => total + review.rating, 0);
    return sum / reviewsToAverage.length;
  };

  // Star rating display component
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={16} 
            className={`${
              star <= rating 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-gray-300'
            }`} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <button 
          onClick={fetchData} 
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 inline-flex p-3 rounded-full mb-4">
          <MessageCircle className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          When customers review your artwork, their feedback will appear here.
        </p>
      </div>
    );
  }

  const averageRating = calculateAverageRating();
  const totalReviews = reviews.length;
  const fiveStarReviews = reviews.filter(r => r.rating === 5).length;
  const fourStarReviews = reviews.filter(r => r.rating === 4).length;
  const threeStarReviews = reviews.filter(r => r.rating === 3).length;
  const twoStarReviews = reviews.filter(r => r.rating === 2).length;
  const oneStarReviews = reviews.filter(r => r.rating === 1).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Customer Reviews</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="col-span-1 bg-white rounded-lg border shadow-sm p-5">
          <h3 className="text-lg font-medium mb-4">Review Summary</h3>
          <div className="flex items-center mb-4">
            <div className="mr-2">
              <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <div>
              <StarRating rating={Math.round(averageRating)} />
              <p className="text-sm text-gray-500 mt-1">{totalReviews} reviews</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-16 text-sm text-gray-600">5 stars</div>
              <div className="flex-1 mx-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div 
                  className="h-full bg-yellow-500" 
                  style={{ width: `${(fiveStarReviews / totalReviews) * 100}%` }} 
                />
              </div>
              <div className="w-9 text-xs text-gray-500">{fiveStarReviews}</div>
            </div>
            <div className="flex items-center">
              <div className="w-16 text-sm text-gray-600">4 stars</div>
              <div className="flex-1 mx-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div 
                  className="h-full bg-yellow-500" 
                  style={{ width: `${(fourStarReviews / totalReviews) * 100}%` }} 
                />
              </div>
              <div className="w-9 text-xs text-gray-500">{fourStarReviews}</div>
            </div>
            <div className="flex items-center">
              <div className="w-16 text-sm text-gray-600">3 stars</div>
              <div className="flex-1 mx-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div 
                  className="h-full bg-yellow-500" 
                  style={{ width: `${(threeStarReviews / totalReviews) * 100}%` }} 
                />
              </div>
              <div className="w-9 text-xs text-gray-500">{threeStarReviews}</div>
            </div>
            <div className="flex items-center">
              <div className="w-16 text-sm text-gray-600">2 stars</div>
              <div className="flex-1 mx-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div 
                  className="h-full bg-yellow-500" 
                  style={{ width: `${(twoStarReviews / totalReviews) * 100}%` }} 
                />
              </div>
              <div className="w-9 text-xs text-gray-500">{twoStarReviews}</div>
            </div>
            <div className="flex items-center">
              <div className="w-16 text-sm text-gray-600">1 star</div>
              <div className="flex-1 mx-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div 
                  className="h-full bg-yellow-500" 
                  style={{ width: `${(oneStarReviews / totalReviews) * 100}%` }} 
                />
              </div>
              <div className="w-9 text-xs text-gray-500">{oneStarReviews}</div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="col-span-1 lg:col-span-2">
          {/* Filter by artwork */}
          <div className="mb-4 bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="font-medium mb-2">Filter by Artwork</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleArtworkFilter('all')}
                className={`px-3 py-1 rounded-full text-xs ${
                  selectedArtwork === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                All Artworks
              </button>
              {artworks.map(artwork => (
                <button
                  key={artwork.id}
                  onClick={() => handleArtworkFilter(artwork.id)}
                  className={`px-3 py-1 rounded-full text-xs truncate max-w-[150px] ${
                    selectedArtwork === artwork.id 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {artwork.title}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => {
                const artwork = artworks.find(a => a.id === review.artworkId);
                return (
                  <div key={review.id} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <StarRating rating={review.rating} />
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {artwork?.title}
                      </div>
                    </div>
                    <div className="flex items-start mt-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 text-sm font-medium overflow-hidden">
                        {review.customerProfileImage ? (
                          <img 
                            src={review.customerProfileImage} 
                            alt={review.customerName}
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <img 
                            src="https://via.placeholder.com/32x32/cccccc/666666?text=👤" 
                            alt="Default avatar"
                            className="h-full w-full object-cover rounded-full" 
                          />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">
                          {review.customerName}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 text-center">
                <ThumbsDown className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-gray-500">No reviews match your filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistReviews;
