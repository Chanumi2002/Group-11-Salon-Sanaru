import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ReceiptText, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { cartService } from '@/services/cartService';

const toDisplayStatus = (value) => {
  const text = String(value || '').replace(/[_-]+/g, ' ').trim();

  if (!text) {
    return 'Unknown';
  }

  return text
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
};

const findField = (source, keys, fallback = '') => {
  if (!source || typeof source !== 'object') {
    return fallback;
  }

  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return fallback;
};

const toMoney = (value) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

export default function CustomerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const payload = await cartService.getOrderHistory();
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.orders)
            ? payload.orders
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

        if (active) {
          setOrders(list);
        }
      } catch (error) {
        const message = String(error?.message || '').toLowerCase();
        const statusCode = Number(error?.statusCode || 0);
        const shouldRedirectToLogin = statusCode === 401 || message.includes('unauthorized');

        if (shouldRedirectToLogin) {
          toast.info('Please login to view your orders.');
          navigate('/login', { replace: true, state: { from: '/customer_dashboard/orders' } });
          return;
        }

        toast.error(error?.message || 'Failed to load orders.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, [navigate]);

  const normalizedOrders = useMemo(() => {
    return orders.map((order) => {
      const reference = findField(order, ['orderReference', 'reference', 'orderCode', 'orderNumber'], 'N/A');
      const status = findField(order, ['status', 'orderStatus', 'paymentStatus', 'payment_status'], 'PENDING');
      const createdAt = findField(order, ['createdAt', 'orderDate', 'created_date'], '');
      const total = findField(order, ['totalAmount', 'amount', 'grandTotal', 'total'], '0');

      return {
        reference,
        status,
        createdAt,
        total,
      };
    });
  }, [orders]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-600">Track your recent purchases and payment status.</p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-gray-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-[#8E1616]" />
          </div>
        ) : !normalizedOrders.length ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <ReceiptText className="mx-auto h-9 w-9 text-gray-400" />
            <h2 className="mt-3 text-lg font-semibold text-gray-900">No orders yet</h2>
            <p className="mt-1 text-sm text-gray-600">Buy a product to see your order history here.</p>
            <Link
              to="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#8E1616] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D84040]"
            >
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
              <span className="col-span-5">Reference</span>
              <span className="col-span-3">Status</span>
              <span className="col-span-2">Date</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            <div className="divide-y divide-gray-100">
              {normalizedOrders.map((order) => (
                <div
                  key={`${order.reference}-${order.createdAt}`}
                  className="grid grid-cols-12 items-center px-4 py-3 text-sm text-gray-700"
                >
                  <span className="col-span-5 font-medium text-gray-900">{order.reference}</span>
                  <span className="col-span-3">{toDisplayStatus(order.status)}</span>
                  <span className="col-span-2 text-xs text-gray-600">{order.createdAt || '-'}</span>
                  <span className="col-span-2 text-right font-semibold text-[#8E1616]">Rs. {toMoney(order.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
