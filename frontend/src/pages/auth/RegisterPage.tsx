import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, Palette, User, Brush } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TokenManager from '../../utils/tokenManager';
import SocialLogin from '../../components/auth/SocialLogin';

const RegisterPage: React.FC = () => {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const defaultRole = searchParams.get('role') === 'artist' ? 'ARTIST' : 'CUSTOMER';

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: defaultRole,
      agreeToTerms: false,
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .min(2, 'First name must be at least 2 characters')
        .required('First name is required'),
      lastName: Yup.string()
        .min(2, 'Last name must be at least 2 characters')
        .required('Last name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
      role: Yup.string()
        .oneOf(['CUSTOMER', 'ARTIST'])
        .required('Please select a role'),
      agreeToTerms: Yup.boolean()
        .oneOf([true], 'You must agree to the terms and conditions'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        dispatch({ type: 'AUTH_START' });
        const { confirmPassword, agreeToTerms, ...registerData } = values;
        const result = await authAPI.register({
          ...registerData,
          role: registerData.role as 'CUSTOMER' | 'ARTIST'
        });
        if (result && result.user && result.tokens && result.tokens.accessToken) {
          
          TokenManager.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { 
              user: result.user, 
              token: result.tokens.accessToken,
              redirectUrl: result.redirectUrl 
            } 
          });
          toast.success('Registration successful! Welcome to ArtMarket!');
          
          
          if (result.redirectUrl) {
            navigate(result.redirectUrl, { replace: true });
          } else {
            
            if (result.user.role === 'ARTIST') {
              navigate('/dashboard/artist', { replace: true });
            } else if (result.user.role === 'ADMIN') {
              navigate('/dashboard/admin', { replace: true });
            } else if (result.user.role === 'CUSTOMER') {
              navigate('/dashboard/customer', { replace: true });
            } else {
              navigate('/');
            }
          }
          return; 
        } else {
          throw new Error('Registration failed - Invalid response format');
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Registration failed';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-600 p-3 rounded-full">
                <Palette className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Join ArtMarket</h2>
            <p className="text-gray-600 mt-2">Create your account to get started</p>
          </div>

          {}
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to join as a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('role', 'CUSTOMER')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formik.values.role === 'CUSTOMER'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <User className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Customer</div>
                  <div className="text-xs text-gray-500">Buy artworks</div>
                </button>
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('role', 'ARTIST')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formik.values.role === 'ARTIST'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Brush className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Artist</div>
                  <div className="text-xs text-gray-500">Sell artworks</div>
                </button>
              </div>
              {formik.touched.role && formik.errors.role && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.role}</p>
              )}
            </div>

            {}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...formik.getFieldProps('firstName')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formik.touched.firstName && formik.errors.firstName
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{formik.errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...formik.getFieldProps('lastName')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formik.touched.lastName && formik.errors.lastName
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{formik.errors.lastName}</p>
                )}
              </div>
            </div>

            {}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...formik.getFieldProps('email')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder="john@example.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>

            {}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...formik.getFieldProps('password')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Create a strong password"
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

            {}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...formik.getFieldProps('confirmPassword')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
              )}
            </div>

            {}
            <div className="flex items-start">
              <input
                id="agreeToTerms"
                type="checkbox"
                {...formik.getFieldProps('agreeToTerms')}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-purple-600 hover:text-purple-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-purple-600 hover:text-purple-500">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
              <p className="text-sm text-red-600">{formik.errors.agreeToTerms}</p>
            )}

            {}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {formik.isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {}
          <SocialLogin />

          {}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>
          </div>

          {}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;