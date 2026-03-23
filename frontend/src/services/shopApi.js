import axios from 'axios';

const shopApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

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
};

export default shopApi;
