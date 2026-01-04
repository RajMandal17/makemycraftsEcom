import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">MakeMyCrafts</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              India's premier marketplace for <strong>handmade artwork</strong>, <strong>custom made crafts</strong>,
              and <strong>homemade art</strong>. Buy unique handcrafted paintings, sculptures & artworks directly from skilled Indian artists.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/artworks" className="text-gray-300 hover:text-white transition-colors">
                  Browse Artworks
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-gray-300 hover:text-white transition-colors">
                  Featured Artists
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Artists</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register?role=artist" className="text-gray-300 hover:text-white transition-colors">
                  Become an Artist
                </Link>
              </li>
              <li>
                <Link to="/artist-guide" className="text-gray-300 hover:text-white transition-colors">
                  Artist Guide
                </Link>
              </li>
              <li>
                <Link to="/commission" className="text-gray-300 hover:text-white transition-colors">
                  Commission Info
                </Link>
              </li>
              <li>
                <Link to="/artist-resources" className="text-gray-300 hover:text-white transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">mail@makemycrafts.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">+91 8793148668</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">Bangalore, India</span>
            </div>
          </div>
        </div>

        {}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 MakeMyCrafts.com All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/refund-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Refund Policy
            </Link>
            <Link to="/shipping-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;