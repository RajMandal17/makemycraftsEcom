import React from 'react';
import { useAppContext } from '../../context/AppContext';

// Simplified JWT decoder function
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode token:', e);
    return null;
  }
};

const TokenDebugger: React.FC = () => {
  const { state } = useAppContext();
  const token = state.auth.token;
  
  const handleCheckToken = () => {
    if (!token) {
      alert('No token found in auth context');
      return;
    }

    try {
      const decoded = decodeJWT(token);
      console.log('Decoded token:', decoded);
      alert(`Token valid: \nUser ID: ${decoded?.sub || 'N/A'}\nRole: ${decoded?.role || 'N/A'}\nExpires: ${decoded?.exp ? new Date(decoded.exp * 1000).toLocaleString() : 'N/A'}`);
    } catch (error) {
      console.error('Token decoding error:', error);
      alert('Failed to decode token: ' + (error as Error).message);
    }
  };

  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px dashed #ccc' }}>
      <h4>Token Debugger</h4>
      <button 
        onClick={handleCheckToken}
        style={{ padding: '8px 16px', background: '#f5f5f5', border: '1px solid #ddd' }}
      >
        Check Auth Token
      </button>
    </div>
  );
};

export default TokenDebugger;
