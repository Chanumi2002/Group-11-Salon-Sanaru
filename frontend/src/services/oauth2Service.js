import axios from 'axios';

const BACKEND_BASE_URL = '' || 'http://localhost:8080';
const FRONTEND_BASE_URL = 'http://localhost:5173';

/**
 * OAuth2 Service for Google and Facebook authentication
 */
export const oauth2Service = {
  /**
   * Handle Google OAuth response
   * @param {Object} credentialResponse - Response from Google Sign-In
   */
  handleGoogleLogin: async (credentialResponse) => {
    try {
      // The credential is a JWT token from Google
      // We'll send it to our backend for verification
      const response = await axios.post(
        `${BACKEND_BASE_URL}/api/auth/oauth2/google`,
        { token: credentialResponse.credential },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.token) {
        // Store auth data
        localStorage.setItem('token', response.data.token);
        if (response.data.role) {
          localStorage.setItem('role', response.data.role);
        }
        if (response.data.gender) {
          localStorage.setItem('gender', response.data.gender);
        }
        return { success: true, data: response.data, provider: 'google' };
      }
      return { success: false, error: response.data.message || 'OAuth login failed' };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },



  /**
   * Handle OAuth callback from backend redirect
   * Parse token and user data from URL parameters
   */
  handleOAuthCallback: (searchParams) => {
    try {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        return { success: false, error: decodeURIComponent(error) };
      }

      if (token) {
        localStorage.setItem('token', token);
        
        const email = searchParams.get('email');
        const role = searchParams.get('role');
        const gender = searchParams.get('gender');

        if (email) localStorage.setItem('email', email);
        if (role) localStorage.setItem('role', role);
        if (gender) localStorage.setItem('gender', gender);

        return {
          success: true,
          data: { token, email, role, gender }
        };
      }

      return { success: false, error: 'No token received from OAuth provider' };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Initialize Google Sign-In
   */
  initializeGoogle: (clientId) => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: clientId || 'YOUR_GOOGLE_CLIENT_ID',
        callback: (response) => {
          // Callback handled by component
        },
      });
      return true;
    }
    console.warn('Google Sign-In SDK not loaded');
    return false;
  },



  /**
   * Render Google Sign-In button
   */
  renderGoogleButton: (elementId, options = {}) => {
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.renderButton(
          document.getElementById(elementId),
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            ...options,
          }
        );
        return true;
      } catch (error) {
        console.error('Error rendering Google button:', error);
        return false;
      }
    }
    return false;
  },

  /**
   * Check if user is authenticated via OAuth
   */
  isOAuthAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Clear OAuth session
   */
  clearOAuthSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('gender');
    localStorage.removeItem('email');
  },
};

export default oauth2Service;
