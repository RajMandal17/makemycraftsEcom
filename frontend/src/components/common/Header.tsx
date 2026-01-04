import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';


const Header: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'LOGOUT' });
      navigate('/');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/artworks?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getDashboardRoute = () => {
    if (!state.auth.user) return '/login';
    switch (state.auth.user.role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'ARTIST':
        return '/dashboard/artist';
      case 'CUSTOMER':
        return '/dashboard/customer';
      default:
        return '/dashboard/customer';
    }
  };

  return (
    <header className="bg-white dark:bg-dark-bg shadow-soft sticky top-0 z-50 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {}
          <Link to="/" className="flex items-center group">
            <img
              src="/favicon.svg"
              alt="MakeMyCrafts Logo"
              className="h-12 w-12 -mr-1 group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent pt-1">
              akeMyCrafts
            </span>
          </Link>

          {}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artworks, artists..."
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              </div>
            </form>
          </div>

          {}
          <nav className="hidden md:flex items-center space-x-6">


            <Link to="/artworks" className="text-neutral-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors font-medium">
              Browse Art
            </Link>
            <Link to="/artists" className="text-neutral-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors font-medium">
              Gallery
            </Link>

            {state.auth.isAuthenticated ? (
              <>
                {}
                <div className="flex items-center space-x-4">
                  <Link to="/wishlist" className="relative text-neutral-700 hover:text-red-500 transition-colors">
                    <Heart className="h-6 w-6" />
                    {state.wishlist.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">
                        {state.wishlist.length}
                      </span>
                    )}
                  </Link>

                  <Link to="/cart" className="relative text-neutral-700 hover:text-primary-600 transition-colors">
                    <ShoppingCart className="h-6 w-6" />
                    {state.cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">
                        {state.cart.length}
                      </span>
                    )}
                  </Link>
                </div>

                {}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600 transition-colors">
                    <User className="h-6 w-6" />
                    <span className="hidden lg:block font-medium">
                      {state.auth.user?.firstName || 'User'} {state.auth.user?.lastName || ''}
                    </span>
                  </button>

                  {}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-neutral-100">
                    <Link
                      to={getDashboardRoute()}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-neutral-700 hover:text-primary-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artworks, artists..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>

            {}
            <div className="space-y-2">
              <Link
                to="/artworks"
                className="block py-2 text-gray-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Art
              </Link>
              <Link
                to="/artists"
                className="block py-2 text-gray-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>

              {state.auth.isAuthenticated ? (
                <>
                  <Link
                    to="/wishlist"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wishlist ({state.wishlist.length})
                  </Link>
                  <Link
                    to="/cart"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cart ({state.cart.length})
                  </Link>
                  <Link
                    to={getDashboardRoute()}
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-gray-700 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;