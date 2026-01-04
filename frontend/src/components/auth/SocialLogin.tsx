import React, { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import API_CONFIG from '../../config/api';
import './SocialLogin.css';

interface SocialProvider {
  name: string;
  authorizationUrl: string;
  displayName: string;
  iconClass: string;
  buttonColor: string;
}

interface OAuth2ProvidersResponse {
  google: SocialProvider;
  facebook: SocialProvider;
  github: SocialProvider;
}

const SocialLogin: React.FC = () => {
  const [providers, setProviders] = useState<OAuth2ProvidersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await apiClient.get<OAuth2ProvidersResponse>('/oauth2/providers');
      setProviders(response.data);
    } catch (error) {
      console.error('Failed to fetch OAuth2 providers:', error);
      setError('Failed to load social login options');
    }
  };

  const handleSocialLogin = (authorizationUrl: string) => {
    setLoading(true);
    // Construct full backend URL for OAuth2 authorization
    const fullUrl = authorizationUrl.startsWith('http')
      ? authorizationUrl
      : `${API_CONFIG.BACKEND_URL}${authorizationUrl}`;

    // Redirect to OAuth2 provider via backend
    window.location.href = fullUrl;
  };

  if (error) {
    return (
      <div className="social-login-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!providers) {
    return (
      <div className="social-login-loading">
        <p>Loading social login options...</p>
      </div>
    );
  }

  return (
    <div className="social-login">
      <div className="social-login-divider">
        <span>Or continue with</span>
      </div>

      <div className="social-login-buttons">
        <button
          className="social-btn google"
          onClick={() => handleSocialLogin(providers.google.authorizationUrl)}
          disabled={loading}
          style={{ borderColor: providers.google.buttonColor }}
        >
          <i className={providers.google.iconClass}></i>
          <span>{providers.google.displayName}</span>
        </button>

        <button
          className="social-btn facebook"
          onClick={() => handleSocialLogin(providers.facebook.authorizationUrl)}
          disabled={loading}
          style={{ borderColor: providers.facebook.buttonColor }}
        >
          <i className={providers.facebook.iconClass}></i>
          <span>{providers.facebook.displayName}</span>
        </button>

        <button
          className="social-btn github"
          onClick={() => handleSocialLogin(providers.github.authorizationUrl)}
          disabled={loading}
          style={{ borderColor: providers.github.buttonColor }}
        >
          <i className={providers.github.iconClass}></i>
          <span>{providers.github.displayName}</span>
        </button>
      </div>

      {loading && (
        <div className="social-login-redirecting">
          <p>Redirecting to authentication provider...</p>
        </div>
      )}
    </div>
  );
};

export default SocialLogin;
