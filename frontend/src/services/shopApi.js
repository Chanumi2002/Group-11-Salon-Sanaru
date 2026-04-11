import axios from 'axios';

const shopApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

// Add request interceptor to include auth token
shopApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to silently handle 401 for feedbacks/count endpoint
shopApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silently handle 401 for unread feedback count endpoint (user may not be logged in)
    if (error.response?.status === 401 && error.config?.url?.includes('/admin/feedbacks/count')) {
      return Promise.resolve({ data: { data: { unreadCount: 0, hasUnread: false } } });
    }
    return Promise.reject(error);
  }
);

export const shopService = {
  getCategories: async () => {
    const response = await shopApi.get('/categories');
    return response.data || [];
  },

  getProducts: async (categoryId) => {
    const response = await shopApi.get('/products', {
      params: categoryId ? { categoryId } : {},
    });
    return response.data || [];
  },

  getProductById: async (productId) => {
    const response = await shopApi.get(`/products/${productId}`);
    return response.data;
  },

  getServices: async () => {
    const response = await shopApi.get('/services');
    return response.data || [];
  },

  getServiceById: async (serviceId) => {
    const response = await shopApi.get(`/services/${serviceId}`);
    return response.data;
  },

  // Get reviews for a product
  getReviewsForTarget: async (targetId, feedbackType) => {
    const response = await shopApi.get(`/reviews/${feedbackType.toLowerCase()}/${targetId}`);
    return response.data?.data || response.data || [];
  },

  // Get review statistics for a product/service
  getReviewStats: async (targetId, feedbackType) => {
    const response = await shopApi.get(`/reviews/stats/${feedbackType.toLowerCase()}/${targetId}`);
    return response.data?.data || response.data || null;
  },

  // Get unread feedback count for admin badge
  getUnreadFeedbackCount: async () => {
    const response = await shopApi.get('/admin/feedbacks/count');
    return response.data?.data || { unreadCount: 0, hasUnread: false };
  },

  // Get all product reviews
  getAllProductReviews: async () => {
    const response = await shopApi.get('/reviews/product');
    return response.data?.data || [];
  },

  // Get all service reviews
  getAllServiceReviews: async () => {
    const response = await shopApi.get('/reviews/service');
    return response.data?.data || [];
  },
};

export default shopApi;
