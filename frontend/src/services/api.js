import axios from 'axios';

const API_BASE_URL = '/api';
const BACKEND_BASE_URL = '';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // Register a new user
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  // Login user
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  // Get current user profile
  getProfile: async () => {
    return await api.get('/auth/profile');
  },

  // Update user profile
  updateProfile: async (userData) => {
    return await api.put('/auth/profile', userData);
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return await api.put('/auth/change-password', { currentPassword, newPassword });
  },

  // Delete account
  deleteProfile: async () => {
    return await api.delete('/auth/profile');
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('gender');
  },

  // OAuth2: redirect to backend to start Google/Facebook login
  getOAuthLoginUrl: (provider) => {
    return `${BACKEND_BASE_URL}/oauth2/authorization/${provider}`;
  },
};

export default api;