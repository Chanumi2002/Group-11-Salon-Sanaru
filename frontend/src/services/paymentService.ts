import axios from 'axios';
import cartApi, { getAuthToken } from './cartService';

export type PayHereFields = Record<string, string>;

export interface PayHereCheckoutResponse {
  action: string;
  method: string;
  fields: PayHereFields;
}

export class PaymentRequestError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'PaymentRequestError';
    this.statusCode = statusCode;
  }
}

const tokenKeys = ['token', 'authToken', 'accessToken', 'jwtToken'] as const;

const resolveToken = (): string | null => {
  const primaryToken = getAuthToken();
  if (primaryToken) {
    return primaryToken;
  }

  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      return token;
    }
  }

  return null;
};

const getErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return 'Failed to prepare payment. Please try again.';
  }

  const responseData = error.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  return (
    responseData?.message ||
    responseData?.error ||
    responseData?.detail ||
    error.message ||
    'Failed to prepare payment. Please try again.'
  );
};

const assertValidResponse = (payload: unknown): PayHereCheckoutResponse => {
  const data = payload as Partial<PayHereCheckoutResponse>;
  const action = typeof data.action === 'string' ? data.action.trim() : '';
  const method = typeof data.method === 'string' ? data.method.trim().toUpperCase() : '';
  const fields = data.fields;

  if (!action || !method || !fields || typeof fields !== 'object') {
    throw new PaymentRequestError('Invalid payment data received from the server.');
  }

  return {
    action,
    method,
    fields: Object.entries(fields).reduce<PayHereFields>((acc, [key, value]) => {
      acc[key] = String(value ?? '');
      return acc;
    }, {}),
  };
};

export const paymentService = {
  preparePayHereCheckout: async (orderId: number): Promise<PayHereCheckoutResponse> => {
    const token = resolveToken();

    if (!token) {
      throw new PaymentRequestError('Your session has expired. Please log in again.', 401);
    }

    try {
      const response = await cartApi.post<PayHereCheckoutResponse>(
        `/v1/payments/payhere/checkout/${orderId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return assertValidResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new PaymentRequestError(getErrorMessage(error), error.response?.status);
      }

      throw new PaymentRequestError(getErrorMessage(error));
    }
  },
};

export default paymentService;
