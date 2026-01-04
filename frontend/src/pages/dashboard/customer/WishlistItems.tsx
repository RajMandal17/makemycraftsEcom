import React from 'react';
import { X, Heart, ArrowRight, Search } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getFullImageUrl } from '../../../services/api';
import { toast } from 'react-toastify';

const WishlistItems: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  const handleRemoveFromWishlist = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: itemId });
    toast.success('Item removed from wishlist');
  };

  const handleAddToCart = (index: number) => {
    const wishlistItem = state.wishlist[index];
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: `cart-${Date.now()}`,
        artwork: wishlistItem.artwork,
        quantity: 1,
        addedAt: new Date().toISOString()
      }
    });
    toast.success('Item added to cart');
  };

  if (state.wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 inline-flex p-3 rounded-full mb-4">
          <Heart className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Your wishlist is empty</h3>
        <p className="mt-1 text-sm text-gray-500 mb-6">
          Browse our collection and save your favorite artworks
        </p>
        <button
          onClick={() => navigate('/dashboard/customer/browse')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto"
        >
          <Search className="mr-2 h-4 w-4" />
          Browse Artworks
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Wishlist</h1>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Artwork
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Added
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {state.wishlist.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                      <img
                        src={getFullImageUrl(item.artwork.images[0])}
                        alt={item.artwork.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Artwork';
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.artwork.title}</div>
                      <div className="text-sm text-gray-500">by {item.artwork.artist.firstName} {item.artwork.artist.lastName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">₹{item.artwork.price.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.addedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleAddToCart(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => navigate('/dashboard/customer/browse')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Continue Shopping
        </button>

        <button
          onClick={() => navigate('/cart')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          View Cart
        </button>
      </div>
    </div>
  );
};

export default WishlistItems;
