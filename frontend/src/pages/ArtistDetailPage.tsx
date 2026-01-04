import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { artistsAPI } from '../services/artistsAPI';
import { artworkAPI } from '../services/api';
import { Artist, Artwork } from '../types';

const ArtistDetailPage: React.FC = () => {
  const { id, username } = useParams<{ id?: string; username?: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id && !username) return;

      setLoading(true);
      try {
        
        let artistData: Artist;
        if (username) {
          
          artistData = await artistsAPI.getArtistByUsername(username);
        } else if (id) {
          
          artistData = await artistsAPI.getArtistById(id);
        } else {
          throw new Error('No artist identifier provided');
        }

        setArtist(artistData);

        
        const { artworks } = await artworkAPI.getByArtist(artistData.id);
        setArtworks(artworks);

        setError(null);
      } catch (err) {
        console.error('Error fetching artist details:', err);
        setError('Failed to load artist details. Please try again later.');
        toast.error('Failed to load artist details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, username]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error || 'Artist not found'}</p>
        </div>
        <Link to="/artists" className="text-blue-600 hover:underline">
          ← Back to Artists
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/artists" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Artists
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3">
            <div className="h-72 md:h-full bg-gray-200 relative">
              {artist.profileImage ? (
                <img
                  src={artist.profileImage}
                  alt={`${artist.firstName} ${artist.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <span className="text-6xl text-gray-400">
                    {artist.firstName.charAt(0)}{artist.lastName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold mb-2">
              {artist.firstName} {artist.lastName}
            </h1>

            <div className="flex items-center mb-4">
              <div className="flex items-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-gray-700 ml-1">
                  {artist.averageRating ? artist.averageRating.toFixed(1) : 'N/A'}
                </span>
              </div>

              <div className="text-gray-700">
                {artist.artworkCount} {artist.artworkCount === 1 ? 'artwork' : 'artworks'}
              </div>
            </div>

            {artist.bio && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">About the Artist</h2>
                <p className="text-gray-600">{artist.bio}</p>
              </div>
            )}

            {artist.website && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Website</h2>
                <a
                  href={artist.website.startsWith('http') ? artist.website : `https:
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {artist.website}
                </a>
              </div>
            )}

            {}
            {artist.username && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Share Profile</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/artists/username/${artist.username}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/artists/username/${artist.username}`);
                      toast.success('Profile URL copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  makemycrafts.com/artists/username/{artist.username}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Artworks by {artist.firstName}</h2>

        {artworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                <Link to={`/artworks/${artwork.id}`}>
                  <div className="h-48 bg-gray-200">
                    {artwork.images && artwork.images.length > 0 ? (
                      <img
                        src={artwork.images[0]}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-200">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{artwork.title}</h3>
                    <p className="text-gray-500 text-sm mb-2">{artwork.medium}</p>
                    <p className="text-gray-900 font-bold">₹{artwork.price.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-lg text-gray-600">No artworks available from this artist yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistDetailPage;
