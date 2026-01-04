import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { artistsAPI } from '../services/artistsAPI';
import { Artist } from '../types';

const ArtistsPage: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState('name');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all artists with pagination
        const sort = getSortParam(sortOption);
        const result = await artistsAPI.getAllArtists({
          page: currentPage,
          size: 12,
          search: searchTerm,
          sort
        });

        setArtists(result.artists);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Error fetching artists:', error);
        toast.error('Failed to load artists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchTerm, sortOption]);

  const getSortParam = (option: string): string => {
    switch (option) {
      case 'name': return 'lastName,asc';
      case 'newest': return 'createdAt,desc';
      case 'rating': return 'averageRating,desc';
      default: return 'lastName,asc';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when changing page
  };

  if (loading && artists.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Artists</h1>


      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search artists by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-1 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">Sort by:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="newest">Newest</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {artists.length > 0 ? (
          artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-gray-600">No artists found matching your search criteria.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === i
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

// Artist Card Component
const ArtistCard: React.FC<{ artist: Artist }> = ({ artist }) => {
  // Use username URL if available (LinkedIn-style), otherwise fall back to ID
  const profileUrl = artist.username
    ? `/artists/username/${artist.username}`
    : `/artists/${artist.id}`;

  return (
    <Link to={profileUrl} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-48 bg-gray-200 relative">
          {artist.profileImage ? (
            <img
              src={artist.profileImage}
              alt={`${artist.firstName} ${artist.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="text-4xl text-gray-400">
                {artist.firstName.charAt(0)}{artist.lastName.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">
            {artist.firstName} {artist.lastName}
          </h3>
          {artist.username && (
            <p className="text-sm text-gray-500 mb-2">@{artist.username}</p>
          )}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-gray-600 text-sm ml-1">
                {artist.averageRating ? artist.averageRating.toFixed(1) : 'N/A'}
              </span>
            </div>
            <span className="text-gray-600 text-sm">
              {artist.artworkCount} {artist.artworkCount === 1 ? 'artwork' : 'artworks'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArtistsPage;
