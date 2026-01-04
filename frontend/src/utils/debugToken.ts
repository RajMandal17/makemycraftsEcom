
interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

export const debugToken = (): TokenPayload | null => {
  const token = localStorage.getItem('access_token');
  console.log('Current token in localStorage:', token);
  
  if (token) {
    try {
      
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1])) as TokenPayload;
        console.log('Token payload:', payload);
        console.log('Token expiry:', new Date(payload.exp * 1000).toLocaleString());
        console.log('Token role:', payload.role);
        return payload;
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  } else {
    console.log('No token found in localStorage');
  }
  return null;
};
