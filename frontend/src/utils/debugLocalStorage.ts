

console.group('🔍 LocalStorage Debug');
console.log('token:', localStorage.getItem('access_token'));
console.log('refreshToken:', localStorage.getItem('refresh_token'));


const token = localStorage.getItem('access_token');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Token expiry:', new Date(payload.exp * 1000).toLocaleString());
    console.log('Token role:', payload.role);
    console.log('Is expired:', payload.exp < (Date.now() / 1000));
  } catch (e) {
    console.error('Failed to parse token:', e);
  }
} else {
  console.log('❌ No token found in localStorage');
}

console.groupEnd();

export {}; 
