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
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    return await api.put('/auth/change-password', { currentPassword, newPassword, confirmPassword });
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

export const adminService = {
  // Get all customers
  getCustomers: async () => {
    return await api.get('/admin/customers');
  },

  // Get customer count
  getCustomerCount: async () => {
    return await api.get('/admin/customers/count');
  },

  // Block a customer
  blockCustomer: async (customerId) => {
    return await api.put(`/admin/customers/${customerId}/block`);
  },

  // Unblock a customer
  unblockCustomer: async (customerId) => {
    return await api.put(`/admin/customers/${customerId}/unblock`);
  },

  // Delete a customer
  deleteCustomer: async (customerId) => {
    return await api.delete(`/admin/customers/${customerId}`);
  },

  // ==================== ORDER & PAYMENT OPERATIONS ====================

  // Get all orders for admin management
  getOrders: async () => {
    return await api.get('/admin/orders');
  },

  // Story 5: Admin approves a cancellation request → CANCELLED
  cancelOrder: async (orderId) => {
    return await api.put(`/admin/orders/${orderId}/cancel`);
  },

  // Story 5: Admin rejects a cancellation request → reverts to CONFIRMED
  rejectCancelOrder: async (orderId) => {
    return await api.put(`/admin/orders/${orderId}/reject-cancel`);
  },

  // Admin manually approves an order
  approveOrder: async (orderId) => {
    return await api.put(`/admin/orders/${orderId}/approve`);
  },

  // ==================== CATEGORY OPERATIONS ====================

  // Get all categories
  getCategories: async () => {
    return await api.get('/categories');
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    return await api.get(`/categories/${categoryId}`);
  },

  // Create new category with image
  createCategory: async (formData) => {
    return await api.post('/admin/categories', formData, {
    });
  },

  // Update category with image
  updateCategory: async (categoryId, formData) => {
    return await api.put(`/admin/categories/${categoryId}`, formData, {
    });
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    return await api.delete(`/admin/categories/${categoryId}`);
  },

  // ==================== PRODUCT OPERATIONS ====================

  // Get all products
  getProducts: async () => {
    return await api.get('/products');
  },

  // Get product by ID
  getProductById: async (productId) => {
    return await api.get(`/products/${productId}`);
  },

  // Create new product with image
  createProduct: async (formData) => {
    return await api.post('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update product with image
  updateProduct: async (productId, formData) => {
    return await api.put(`/admin/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete product
  deleteProduct: async (productId) => {
    return await api.delete(`/admin/products/${productId}`);
  },

  // ==================== INVENTORY OPERATIONS (STORY 1) ====================

  // Get low stock alerts
  getLowStockAlerts: async () => {
    return await api.get('/admin/inventory/low-stock');
  },

  // Update product stock
  updateProductStock: async (productId, updateData) => {
    return await api.patch(`/admin/products/${productId}/stock`, updateData);
  },

  // ==================== SERVICE OPERATIONS ====================

  // Get all services
  getServices: async () => {
    return await api.get('/admin/services');
  },

  // Get service by ID
  getServiceById: async (serviceId) => {
    return await api.get(`/admin/services/${serviceId}`);
  },

  // Create new service with image
  createService: async (formData) => {
    return await api.post('/admin/services', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update service with image
  updateService: async (serviceId, formData) => {
    return await api.put(`/admin/services/${serviceId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete service
  deleteService: async (serviceId) => {
    return await api.delete(`/admin/services/${serviceId}`);
  },

  // ==================== FEEDBACK/REVIEW OPERATIONS ====================

  // Get all feedbacks for admin moderation
  getAllFeedbacks: async () => {
    return await api.get('/admin/feedbacks');
  },

  // Get feedbacks by type
  getFeedbacksByType: async (feedbackType) => {
    return await api.get('/admin/feedbacks/type', { params: { type: feedbackType } });
  },

  // Get feedbacks for a specific target
  getFeedbacksForTarget: async (targetId, feedbackType) => {
    return await api.get(`/admin/feedbacks/target/${targetId}`, { params: { type: feedbackType } });
  },

  // Get feedback statistics
  getFeedbackStats: async () => {
    return await api.get('/admin/feedbacks/stats/general');
  },

  // Delete feedback (admin moderation)
  deleteFeedback: async (feedbackId) => {
    return await api.delete(`/admin/feedback/${feedbackId}`);
  },

  // Mark feedback as read
  markFeedbackAsRead: async (feedbackId) => {
    return await api.put(`/admin/feedback/${feedbackId}/mark-read`);
  },

  // Get unread feedbacks count
  getUnreadFeedbackCount: async () => {
    return await api.get('/admin/feedbacks/unread/count');
  },
};

export const customerService = {
  // Submit feedback/review
  submitFeedback: async (feedbackData) => {
    return await api.post('/customer/feedback', feedbackData);
  },

  // Get customer's feedbacks
  getMyFeedbacks: async () => {
    return await api.get('/customer/feedbacks');
  },

  // Delete customer's own feedback
  deleteMyFeedback: async (feedbackId) => {
    return await api.delete(`/customer/feedback/${feedbackId}`);
  },

  // Book an appointment
  bookAppointment: async (appointmentData) => {
    return await api.post('/appointments', appointmentData);
  },

  // Get my appointments
  getMyBookings: async () => {
    return await api.get('/appointments');
  },
};

export default api;
