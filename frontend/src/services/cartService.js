import axios from 'axios';

const cartApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

const tokenKeys = ['token', 'authToken', 'accessToken', 'jwtToken'];

export const getAuthToken = () => {
  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      return token;
    }
  }

  return null;
};

const getAuthConfig = () => {
  const token = getAuthToken();

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

const getErrorMessage = (error) => {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  return (
    responseData?.message ||
    responseData?.error ||
    responseData?.detail ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
};

const withErrorHandling = async (request) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const cartService = {
  getAuthToken,

  getCart: () => withErrorHandling(() => cartApi.get('/cart', getAuthConfig())),

  addToCart: ({ productId, quantity }) =>
    withErrorHandling(() =>
      cartApi.post(
        '/cart',
        {
          productId,
          quantity,
        },
        getAuthConfig(),
      ),
    ),

  updateCartItem: (cartItemId, quantity) =>
    withErrorHandling(() => cartApi.put(`/cart/${cartItemId}`, { quantity }, getAuthConfig())),

  removeCartItem: (cartItemId) => withErrorHandling(() => cartApi.delete(`/cart/${cartItemId}`, getAuthConfig())),

  clearCart: () => withErrorHandling(() => cartApi.delete('/cart/clear', getAuthConfig())),

  checkout: (payload) =>
    withErrorHandling(() => {
      if (payload === undefined || payload === null) {
        return cartApi.post('/orders/checkout', null, getAuthConfig());
      }

      return cartApi.post('/orders/checkout', payload, getAuthConfig());
    }),

  getOrderHistory: () => withErrorHandling(() => cartApi.get('/orders/history', getAuthConfig())),
};

export default cartApi;
