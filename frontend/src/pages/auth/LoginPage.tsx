import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, Palette } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TokenManager from '../../utils/tokenManager';
import SocialLogin from '../../components/auth/SocialLogin';

const LoginPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = React.useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  // Redirect if already authenticated
  React.useEffect(() => {
    if (state.auth.isAuthenticated && state.auth.user) {
      const role = state.auth.user.role;
      if (role === 'ARTIST') {
        navigate('/dashboard/artist', { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/dashboard/admin', { replace: true });
      } else if (role === 'CUSTOMER') {
        navigate('/dashboard/customer', { replace: true });
      }
    }
  }, [state.auth.isAuthenticated, state.auth.user, navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        dispatch({ type: 'AUTH_START' });
        const result = await authAPI.login(values);
        console.log('🔐 Login API response:', result);
        
        if (result && result.user && result.tokens && result.tokens.accessToken) {
          // Store both access and refresh tokens using TokenManager
          console.log('💾 Storing tokens:', {
            accessToken: `${result.tokens.accessToken.substring(0, 20)}...`,
            refreshToken: result.tokens.refreshToken ? `${result.tokens.refreshToken.substring(0, 20)}...` : 'None'
          });
          
          TokenManager.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
          
          // Verify the token was stored
          const storedToken = TokenManager.getToken();
          console.log('✅ Token stored successfully:', storedToken ? 'Yes' : 'No');
          // Pass the correct token to the AUTH_SUCCESS action
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { 
              user: result.user, 
              token: result.tokens.accessToken,
              redirectUrl: result.redirectUrl 
            } 
          });
          toast.success('Login successful!');
          if (result.redirectUrl) {
            navigate(result.redirectUrl, { replace: true });
          } else if (result.user.role === 'ARTIST') {
            navigate('/dashboard/artist', { replace: true });
          } else if (result.user.role === 'ADMIN') {
            navigate('/dashboard/admin', { replace: true });
          } else if (result.user.role === 'CUSTOMER') {
            navigate('/dashboard/customer', { replace: true });
          } else {
            navigate(from, { replace: true });
          }
          return; // Prevent error toast
        } else {
          throw new Error('Login failed - Invalid response format');
        }
      } catch (error: any) {
        const message = error.response?.data?.message || error.message || 'Login failed';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Palette className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...formik.getFieldProps('email')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...formik.getFieldProps('password')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {formik.isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Social Login */}
          <SocialLogin />

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Create new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;