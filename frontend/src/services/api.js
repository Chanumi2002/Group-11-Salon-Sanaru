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

// Admin Service - User Management
export const adminService = {
  // Get all users (paginated)
  getAllUsers: async (page = 0, size = 20) => {
    return await api.get(`/admin/users?page=${page}&size=${size}`);
  },

  // Get user details by ID
  getUserById: async (userId) => {
    return await api.get(`/admin/users/${userId}`);
  },

  // Block/Unblock user
  updateUserStatus: async (userId, status) => {
    return await api.put(`/admin/users/${userId}/status`, { status });
  },

  // Block user (convenience method)
  blockUser: async (userId) => {
    return await api.put(`/admin/users/${userId}/block`);
  },

  // Unblock user (convenience method)
  unblockUser: async (userId) => {
    return await api.put(`/admin/users/${userId}/unblock`);
  },

  // Delete user
  deleteUser: async (userId) => {
    return await api.delete(`/admin/users/${userId}`);
  },

  // Bulk delete users
  bulkDeleteUsers: async (userIds) => {
    return await api.post(`/admin/users/bulk-delete`, { ids: userIds });
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    return await api.get('/admin/dashboard/stats');
  },

  // Get recent users
  getRecentUsers: async (limit = 5) => {
    return await api.get(`/admin/users/recent?limit=${limit}`);
  },

  // Get recent orders
  getRecentOrders: async (limit = 5) => {
    return await api.get(`/admin/orders/recent?limit=${limit}`);
  },

  // Search users
  searchUsers: async (query) => {
    return await api.get(`/admin/users/search?q=${query}`);
  },

  // Export users (CSV/Excel)
  exportUsers: async (format = 'csv') => {
    return await api.get(`/admin/users/export?format=${format}`, {
      responseType: 'blob',
    });
  },
};

export default api;