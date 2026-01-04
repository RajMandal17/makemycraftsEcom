
import axios from 'axios';
import { API_CONFIG } from '../config/api';


const API_BASE_URL = API_CONFIG.API_BASE_URL;


export const runAuthDiagnostics = async (): Promise<void> => {
  console.group('🔍 Authentication Diagnostics');
  console.log('Starting authentication diagnostics...');

  
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.error('❌ No token found in localStorage!');
    console.groupEnd();
    return;
  }

  console.log(`✓ Token found: ${token.substring(0, 20)}...`);

  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('✓ Token payload:', payload);
    console.log(`✓ User ID: ${payload.sub}`);
    console.log(`✓ User role: ${payload.role}`);

    const expiryDate = new Date(payload.exp * 1000);
    const now = new Date();
    const isExpired = expiryDate < now;

    console.log(`${isExpired ? '❌' : '✓'} Token expiry: ${expiryDate.toLocaleString()} (${isExpired ? 'EXPIRED' : 'valid'})`);
  } catch (err) {
    console.error('❌ Error decoding JWT:', err);
  }

  
  try {
    console.log('Testing /api/auth/verify endpoint...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✓ Verify endpoint response:', verifyResponse.data);
  } catch (err: any) {
    console.error('❌ Verify endpoint error:', err.response?.status, err.response?.data || err.message);
  }

  
  try {
    console.log('Testing /api/debug/auth endpoint...');
    const debugResponse = await axios.get(`${API_BASE_URL}/debug/auth`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✓ Debug endpoint response:', debugResponse.data);

    
    const authInfo = debugResponse.data;
    if (authInfo.isAuthenticated) {
      console.log('✓ User is authenticated');
      console.log(`✓ Authentication type: ${authInfo.authType}`);
      console.log(`✓ Authorities: ${authInfo.authorities.join(', ')}`);
    } else {
      console.error('❌ User is NOT authenticated!');
    }

  } catch (err: any) {
    console.error('❌ Debug endpoint error:', err.response?.status, err.response?.data || err.message);
  }

  
  try {
    console.log('Testing /api/artworks/my-artworks endpoint...');
    const artworksResponse = await axios.get(`${API_BASE_URL}/artworks/my-artworks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✓ My artworks endpoint response:', artworksResponse.data);
  } catch (err: any) {
    console.error('❌ My artworks endpoint error:', err.response?.status, err.response?.data || err.message);
  }

  console.log('Authentication diagnostics completed');
  console.groupEnd();
};

export default runAuthDiagnostics;
