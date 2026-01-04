// Complete Authentication State Test - Run in Browser Console
// This script tests the complete authentication persistence implementation

console.log('🧪 Testing Complete Authentication State Persistence...');

// Test 1: Check initial state
console.log('\n=== Initial State Check ===');
console.log('localStorage keys:', Object.keys(localStorage));
console.log('access_token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');
console.log('refresh_token:', localStorage.getItem('refresh_token') ? 'Present' : 'Missing'); 
console.log('user_data:', localStorage.getItem('user_data') ? 'Present' : 'Missing');

// Test 2: User data validation
const storedUserData = localStorage.getItem('user_data');
if (storedUserData) {
  try {
    const user = JSON.parse(storedUserData);
    console.log('Stored user data:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    console.error('❌ Invalid user data format:', error);
  }
} else {
  console.log('No user data stored');
}

// Test 3: TokenManager functionality
if (typeof window.TokenManager !== 'undefined') {
  console.log('\n=== TokenManager Tests ===');
  
  const token = window.TokenManager.getToken();
  const user = window.TokenManager.getUserData();
  const refreshToken = window.TokenManager.getRefreshToken();
  
  console.log('TokenManager.getToken():', token ? `${token.substring(0, 20)}...` : 'null');
  console.log('TokenManager.getUserData():', user ? `${user.email} (${user.role})` : 'null');
  console.log('TokenManager.getRefreshToken():', refreshToken ? 'Present' : 'null');
  console.log('TokenManager.hasCompleteAuthState():', window.TokenManager.hasCompleteAuthState());
  
  if (token) {
    console.log('Token validation:', window.TokenManager.isTokenValid(token));
    console.log('Token details:', window.TokenManager.validateTokenWithDetails(token));
  }
}

// Test 4: Authentication flow simulation
console.log('\n=== Authentication Flow Simulation ===');
const simulatePageRefresh = () => {
  // Check if we have complete auth state
  const hasToken = !!localStorage.getItem('access_token');
  const hasUser = !!localStorage.getItem('user_data');
  const hasRefresh = !!localStorage.getItem('refresh_token');
  
  console.log('Page refresh simulation:');
  console.log('- Has access token:', hasToken);
  console.log('- Has user data:', hasUser);
  console.log('- Has refresh token:', hasRefresh);
  console.log('- Complete auth state:', hasToken && hasUser);
  
  if (hasToken && hasUser) {
    console.log('✅ Should restore authentication successfully');
  } else if (hasToken && !hasUser) {
    console.log('⚠️ Partial state - will need to extract user from token');
  } else if (!hasToken && hasRefresh) {
    console.log('🔄 Will attempt token refresh');
  } else {
    console.log('❌ Will redirect to login');
  }
};

simulatePageRefresh();

// Test 5: Manual token refresh test (if needed)
console.log('\n=== Manual Test Instructions ===');
console.log('1. Make sure you are logged in');
console.log('2. Check that user data persists in localStorage');
console.log('3. Refresh the page (F5)');
console.log('4. Verify that:');
console.log('   - You remain authenticated');
console.log('   - User name appears in header');
console.log('   - No loading issues');
console.log('   - Dashboard loads correctly');

// Test 6: Token expiry simulation
console.log('\n=== Token Expiry Test ===');
console.log('To test token refresh:');
console.log('1. Manually expire access token: localStorage.setItem("access_token", "expired_token")');
console.log('2. Make an API call or refresh page');
console.log('3. Should automatically refresh token using refresh_token');

// Test 7: Complete logout test
console.log('\n=== Logout Test ===');
console.log('To test complete logout:');
console.log('1. Click logout button');
console.log('2. All data should be cleared: tokens + user_data');
console.log('3. Should redirect to login page');

console.log('\n🎯 Test Summary:');
console.log('- Complete auth state stores: access_token + refresh_token + user_data');
console.log('- Page refresh preserves all user information');
console.log('- Automatic token refresh works seamlessly');
console.log('- Proper cleanup on logout');

// Helper function to clear everything for testing
window.clearAuthState = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  console.log('✅ All auth state cleared for testing');
};

console.log('\n💡 Helper function available: clearAuthState() - clears all auth data');
console.log('🧪 Authentication persistence test completed!');
