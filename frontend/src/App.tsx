import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AppProvider } from './context/AppContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { registerLoadingCallbacks } from './services/api';
import Header from './components/common/Header';
import CategoryBar from './components/common/CategoryBar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRedirect from './components/common/RoleBasedRedirect';
import ProfileRedirect from './components/common/ProfileRedirect';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';


import './utils/debugLocalStorage';


import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OAuth2CallbackPage from './pages/auth/OAuth2CallbackPage';
import OAuth2RoleSelectionPage from './pages/auth/OAuth2RoleSelectionPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';


const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ArtworksPage = lazy(() => import('./pages/ArtworksPage'));
const ArtistsPage = lazy(() => import('./pages/ArtistsPage'));
const ArtistDetailPage = lazy(() => import('./pages/ArtistDetailPage'));
const ArtworkDetailPage = lazy(() => import('./pages/ArtworkDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));


const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'));
const ShippingPolicyPage = lazy(() => import('./pages/ShippingPolicyPage'));


const ArtistDashboard = lazy(() => import('./pages/dashboard/artist'));
const CustomerDashboard = lazy(() => import('./pages/dashboard/customer'));
const AdminDashboard = lazy(() => import('./pages/dashboard/admin'));
const AuthDebugger = lazy(() => import('./components/debug/AuthDebugger'));


const LoadingFallback = () => (
  <div className="flex justify-center items-center h-[50vh]">
    <LoadingSpinner size="lg" />
  </div>
);


const AppContent = () => {
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    
    registerLoadingCallbacks(showLoading, hideLoading);
  }, [showLoading, hideLoading]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <CategoryBar />
        <main className="flex-1">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {}
                <Route path="/" element={<HomePage />} />

                {}
                <Route path="/login" element={<RoleBasedRedirect><LoginPage /></RoleBasedRedirect>} />
                <Route path="/register" element={<RoleBasedRedirect><RegisterPage /></RoleBasedRedirect>} />
                <Route path="/auth/oauth2/callback" element={<OAuth2CallbackPage />} />
                <Route path="/auth/oauth2/select-role" element={<OAuth2RoleSelectionPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {}
                <Route
                  path="/dashboard/customer/*"
                  element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />

                {}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <ProfileRedirect />
                    </ProtectedRoute>
                  }
                />

                {}
                <Route
                  path="/dashboard/artist/*"
                  element={
                    <ProtectedRoute roles={['ARTIST']}>
                      <ArtistDashboard />
                    </ProtectedRoute>
                  }
                />

                {}
                <Route
                  path="/dashboard/admin/*"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {}
                <Route
                  path="/artworks"
                  element={<ArtworksPage />}
                />
                <Route
                  path="/artworks/:id"
                  element={<ArtworkDetailPage />}
                />

                {}
                <Route
                  path="/showcase"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      {React.createElement(
                        React.lazy(() => import('./pages/ComponentShowcase'))
                      )}
                    </Suspense>
                  }
                />

                <Route
                  path="/artists"
                  element={<ArtistsPage />}
                />

                {}
                <Route
                  path="/artists/username/:username"
                  element={<ArtistDetailPage />}
                />

                {}
                <Route
                  path="/artists/:id"
                  element={<ArtistDetailPage />}
                />

                {}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {}
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />

                {}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />

                {}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute roles={['CUSTOMER']}>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />

                {}
                <Route
                  path="/wishlist"
                  element={<Navigate to="/dashboard/customer/wishlist" replace />}
                />

                {}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">404: Not Found</h1>
                        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                        <p className="text-sm text-gray-500 mb-4">
                          Current URL: {window.location.pathname}
                        </p>
                        <div className="space-y-2 mb-4">
                          <a href="/" className="block text-blue-600 hover:text-blue-800">Go back home</a>
                          <button
                            onClick={() => window.location.reload()}
                            className="block w-full text-gray-600 hover:text-gray-800"
                          >
                            Reload page
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {}
      <AuthDebugger />
    </Router>
  );
};

function App() {
  return (
    <AppProvider>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </AppProvider>
  );
}

export default App;
