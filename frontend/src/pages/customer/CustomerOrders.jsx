import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ReceiptText, ShoppingBag, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { cartService } from '@/services/cartService';

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING:                  { label: 'Pending',              badge: 'bg-gray-100 text-gray-700' },
  PENDING_PAYMENT:          { label: 'Pending Payment',      badge: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED:                { label: 'Confirmed',            badge: 'bg-green-100 text-green-700' },
  PAID:                     { label: 'Confirmed',            badge: 'bg-green-100 text-green-700' }, // legacy
  FAILED:                   { label: 'Failed',               badge: 'bg-red-100 text-red-700' },
  CANCELLED:                { label: 'Cancelled',            badge: 'bg-red-100 text-red-700' },
  CANCELLATION_REQUESTED:   { label: 'Cancellation Pending', badge: 'bg-orange-100 text-orange-700' },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] ?? { label: status ?? 'Unknown', badge: 'bg-gray-100 text-gray-600' };

/** Can the customer still request cancellation for this order? */
const canRequestCancellation = (status) =>
  status !== 'CANCELLED' && status !== 'CANCELLATION_REQUESTED' && status !== 'FAILED';

const toMoney = (value) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

// ── Component ─────────────────────────────────────────────────────────────────

export default function CustomerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
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
        if (active) setOrders(list);
      } catch (error) {
        const message = String(error?.message || '').toLowerCase();
        if (Number(error?.statusCode) === 401 || message.includes('unauthorized')) {
          toast.info('Please login to view your orders.');
          navigate('/login', { replace: true, state: { from: '/customer_dashboard/orders' } });
          return;
        }
        toast.error(error?.message || 'Failed to load orders.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [navigate]);

  const handleRequestCancellation = async (orderId) => {
    if (!window.confirm('Are you sure you want to request cancellation for this order?')) return;
    try {
      setCancellingId(orderId);
      await cartService.requestCancellation(orderId);
      toast.success('Cancellation request sent. An admin will review it shortly.');
      // Refresh list
      const payload = await cartService.getOrderHistory();
      const list = Array.isArray(payload) ? payload : (payload?.orders ?? payload?.data ?? []);
      setOrders(list);
    } catch (error) {
      toast.error(error?.message || 'Failed to submit cancellation request.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-600">Track your purchases and manage cancellation requests.</p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-gray-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-[#8E1616]" />
          </div>
        ) : !orders.length ? (
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
          <div className="space-y-3">
            {orders.map((order) => {
              const orderId = order.orderId ?? order.id;
              const reference = order.orderNumber ?? order.orderReference ?? order.reference ?? `#${orderId}`;
              const status = order.status ?? 'PENDING';
              const { label, badge } = getStatusConfig(status);
              const paymentStatus = order.paymentStatus;

              return (
                <div
                  key={`${orderId}-${reference}`}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    {/* Left: ref + dates */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{reference}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      {paymentStatus && (
                        <p className="mt-0.5 text-xs text-gray-400">
                          Payment: <span className="font-medium text-gray-600">{paymentStatus}</span>
                        </p>
                      )}
                    </div>

                    {/* Right: status badge + total + cancel button */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}>
                        {label}
                      </span>
                      <p className="text-sm font-bold text-[#8E1616]">
                        Rs. {toMoney(order.totalAmount ?? order.amount ?? order.total)}
                      </p>
                      {canRequestCancellation(status) && (
                        <button
                          onClick={() => handleRequestCancellation(orderId)}
                          disabled={cancellingId === orderId}
                          className="flex items-center gap-1.5 rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancellingId === orderId ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {cancellingId === orderId ? 'Requesting…' : 'Request Cancellation'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items summary */}
                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <ul className="space-y-2">
                        {order.items.map((item) => (
                          <li key={item.orderItemId ?? item.productId} className="flex items-center justify-between gap-3">
                            <div className="flex flex-1 flex-col gap-1">
                              <span className="text-xs text-gray-600">{item.productName} × {item.quantity}</span>
                              <span className="text-xs font-medium text-gray-500">Rs. {toMoney(item.subTotal)}</span>
                            </div>
                            {(status === 'CONFIRMED' || status === 'PAID') && (
                              <button
                                onClick={() => navigate(`/customer_dashboard/write-review?productId=${item.productId}&productName=${encodeURIComponent(item.productName)}`)}
                                className="flex items-center gap-1 rounded-full bg-[#8E1616] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#741212] whitespace-nowrap"
                              >
                                <MessageSquare className="h-3 w-3" />
                                Review
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
