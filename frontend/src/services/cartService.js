import axios from 'axios';

const cartApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://sa-b8f7feda25334cddb6709bee5393ffbd.ecs.ap-southeast-2.on.aws/api',
  timeout: 10000,
});

class CartServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'CartServiceError';
    this.statusCode = statusCode;
  }
}

export const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token && token.trim() ? token : null;
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
    throw new CartServiceError(getErrorMessage(error), error?.response?.status);
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

  getOrderByReference: (orderReference) =>
    withErrorHandling(() =>
      cartApi.get(`/orders/reference/${encodeURIComponent(orderReference)}`, getAuthConfig()),
    ),

  requestCancellation: (orderId) =>
    withErrorHandling(() =>
      cartApi.put(`/orders/${orderId}/cancel-request`, null, getAuthConfig()),
    ),

  markOrderAsReceived: (orderId) =>
    withErrorHandling(() =>
      cartApi.put(`/orders/${orderId}/mark-received`, null, getAuthConfig()),
    ),
};

export default cartApi;
