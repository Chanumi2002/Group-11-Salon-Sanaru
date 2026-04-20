import cartApi, { getAuthToken } from './cartService';

export interface PaymentTransactionRecord {
  id: number;
  orderId: number;
  userId: number;
  paymentProvider: string;
  merchantReference: string;
  transactionId: string | null;
  amount: number;
  currency: string;
  paymentStatus: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  statusMessage: string | null;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const getAuthConfig = () => {
  const token = getAuthToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const paymentTransactionService = {
  /** Admin only – fetch all stored transactions for auditing */
  getAllTransactions: async (): Promise<PaymentTransactionRecord[]> => {
    const response = await cartApi.get<PaymentTransactionRecord[]>(
      '/v1/payment-transactions',
      getAuthConfig(),
    );
    return response.data;
  },

  /** Admin only – fetch a single transaction by its DB id */
  getTransactionById: async (id: number): Promise<PaymentTransactionRecord> => {
    const response = await cartApi.get<PaymentTransactionRecord>(
      `/v1/payment-transactions/${id}`,
      getAuthConfig(),
    );
    return response.data;
  },
};

export default paymentTransactionService;
