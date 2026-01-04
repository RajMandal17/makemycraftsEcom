import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAppContext } from '../../context/AppContext';
import { userAPI } from '../../services/userAPI';
import TokenManager from '../../utils/tokenManager';
import './OAuth2Callback.css';


const OAuth2CallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    handleOAuth2Callback();
  }, []);

  const handleOAuth2Callback = async () => {
    
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const role = searchParams.get('role');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    
    if (error) {
      setStatus('error');
      setErrorMessage(message || 'OAuth2 authentication failed. Please try again.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      return;
    }

    
    if (token && refreshToken) {
      try {
        
        TokenManager.setTokens(token, refreshToken);
        
        console.log('✅ OAuth2 tokens stored via TokenManager');
        console.log('🔍 Fetching user profile...');

        
        const userData = await userAPI.getProfile();
        
        console.log('✅ User profile fetched:', userData);
        
        
        TokenManager.setUserData(userData);
        
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: userData,
            token: token
          }
        });

        setStatus('success');

        
        setTimeout(() => {
          switch (role?.toUpperCase()) {
            case 'ADMIN':
              navigate('/dashboard/admin');
              break;
            case 'ARTIST':
              navigate('/dashboard/artist');
              break;
            case 'CUSTOMER':
              navigate('/dashboard/customer');
              break;
            default:
              navigate('/');
          }
        }, 1500);
      } catch (error) {
        console.error('❌ Failed to fetch user data:', error);
        setStatus('error');
        setErrorMessage('Failed to complete authentication. Please try logging in again.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } else {
      
      setStatus('error');
      setErrorMessage('Authentication tokens not found. Please try again.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="oauth2-callback-container">
      <div className="oauth2-callback-content">
        {status === 'processing' && (
          <>
            <LoadingSpinner />
            <h2>Completing authentication...</h2>
            <p>Please wait while we sign you in.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="oauth2-success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Authentication Successful!</h2>
            <p>Redirecting you to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="oauth2-error-icon">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2>Authentication Failed</h2>
            <p className="error-message">{errorMessage}</p>
            <p className="redirect-notice">Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuth2CallbackPage;
