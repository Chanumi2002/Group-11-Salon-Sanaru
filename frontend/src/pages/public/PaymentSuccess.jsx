import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Home, Loader2, ReceiptText, ShoppingBag } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { readAuthState } from '@/utils/authState';
import { cartService } from '@/services/cartService';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 20000;

const toDisplayStatus = (value) => {
  const text = String(value || '').replace(/[_-]+/g, ' ').trim();

  if (!text) {
    return '';
  }

  return text
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
};

const findField = (source, keys) => {
  if (!source || typeof source !== 'object') {
    return '';
  }

  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return '';
};

const generateFallbackReference = () => {
  const now = new Date();
  const two = (value) => String(value).padStart(2, '0');

  return `ORD-${now.getFullYear()}${two(now.getMonth() + 1)}${two(now.getDate())}${two(now.getHours())}${two(now.getMinutes())}${two(now.getSeconds())}`;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const queryReference =
    searchParams.get('reference') ||
    searchParams.get('order_reference') ||
    searchParams.get('ref') ||
    searchParams.get('orderId') ||
    searchParams.get('order_id') ||
    '';
  const queryStatus =
    searchParams.get('status') ||
    searchParams.get('paymentStatus') ||
    searchParams.get('payment_status') ||
    '';

  const authState = readAuthState();
  const dashboardPath = authState.isAdmin ? '/admin_dashboard' : '/customer_dashboard';
  const [reference, setReference] = useState(queryReference || generateFallbackReference());
  const [paymentStatus, setPaymentStatus] = useState('PENDING_PAYMENT');
  const [isSyncingStatus, setIsSyncingStatus] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('Confirming payment...');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  const shouldShowOrdersButton = useMemo(() => authState.isCustomer, [authState.isCustomer]);

  useEffect(() => {
    if (queryReference) {
      setReference(queryReference);
    }

    if (queryStatus) {
      setPaymentStatus(String(queryStatus).toUpperCase());
    }
  }, [queryReference, queryStatus]);

  useEffect(() => {
    let cancelled = false;

    const confirmOrderStatus = async () => {
      const effectiveReference = String(queryReference || '').trim();

      if (!effectiveReference) {
        setConfirmationMessage(
          'Payment received. Order confirmation is still processing. Please refresh or check My Orders.',
        );
        return;
      }

      if (!authState.isAuthenticated) {
        setConfirmationMessage(
          'Payment received. Order confirmation is still processing. Please refresh or check My Orders.',
        );
        return;
      }

      setReference(effectiveReference);

      const maxAttempts = Math.ceil(POLL_TIMEOUT_MS / POLL_INTERVAL_MS);

      try {
        setIsSyncingStatus(true);

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const order = await cartService.getOrderByReference(effectiveReference);

          if (cancelled) {
            return;
          }

          const backendReference =
            findField(order, ['reference', 'orderReference', 'orderCode', 'orderNumber']) || effectiveReference;
          const backendStatus = String(
            findField(order, ['status', 'orderStatus', 'paymentStatus', 'payment_status', 'paymentState']) ||
              'PENDING_PAYMENT',
          ).toUpperCase();
          const backendTransactionId = findField(order, ['transactionId', 'transaction_id', 'paymentTransactionId'], '');
          const backendPaymentDate = findField(order, ['paymentDate', 'payment_date'], '');

          setReference(backendReference);
          setPaymentStatus(backendStatus);
          setTransactionId(backendTransactionId);
          setPaymentDate(backendPaymentDate);

          if (backendStatus === 'PAID') {
            setIsConfirmed(true);
            setConfirmationMessage('Payment successful. Order confirmed.');
            return;
          }

          setConfirmationMessage('Confirming payment...');

          if (attempt < maxAttempts - 1) {
            await wait(POLL_INTERVAL_MS);
          }
        }

        if (!cancelled) {
          setIsConfirmed(false);
          setConfirmationMessage(
            'Payment received. Order confirmation is still processing. Please refresh or check My Orders.',
          );
        }
      } catch {
        if (!cancelled) {
          setIsConfirmed(false);
          setConfirmationMessage(
            'Payment received. Order confirmation is still processing. Please refresh or check My Orders.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsSyncingStatus(false);
        }
      }
    };

    confirmOrderStatus();

    return () => {
      cancelled = true;
    };
  }, [authState.isAuthenticated, queryReference]);

  const statusChipClass = isConfirmed
    ? 'rounded-full bg-[#E8F7EE] px-2.5 py-0.5 text-xs font-semibold text-[#1E8140]'
    : 'rounded-full bg-[#FFF3E8] px-2.5 py-0.5 text-xs font-semibold text-[#9A5A10]';

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(246,241,236,0.92)_42%,rgba(240,232,225,0.96)_100%)]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-12">
        <section className="w-full rounded-[32px] border border-[#E8DBD2] bg-white/95 p-7 shadow-[0_28px_55px_-34px_rgba(72,56,49,0.4)] backdrop-blur-sm md:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#CDEAD8] bg-[#EAF9F0] text-[#1F8A43] shadow-[0_14px_26px_-18px_rgba(31,138,67,0.65)]">
            {isConfirmed ? <CheckCircle2 className="h-11 w-11" /> : <Loader2 className="h-11 w-11 animate-spin" />}
          </div>

          <h1 className="mt-6 text-center text-3xl font-semibold tracking-tight text-[#201A17] md:text-[2.05rem]">
            {isConfirmed ? 'Payment Successful' : 'Confirming Payment...'}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-center text-[0.97rem] text-[#5E5048] md:text-base">
            {isConfirmed
              ? 'Thank you. Your payment was completed successfully and your order has been confirmed.'
              : confirmationMessage}
          </p>

          <div className="mx-auto mt-6 max-w-lg space-y-3 rounded-2xl border border-[#EFE3DB] bg-[#FFFCFA] p-4 md:p-5">
            <p className="text-center text-sm text-[#6A5B53]">
              Reference:{' '}
              <span className="font-semibold tracking-wide text-[#2D2521]">{reference}</span>
            </p>
            <p className="flex items-center justify-center gap-1.5 text-center text-sm text-[#6A5B53]">
              Status:{' '}
              <span className={statusChipClass}>
                {isConfirmed ? 'Paid' : toDisplayStatus(paymentStatus) || 'Pending Payment'}
              </span>
              {isSyncingStatus ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#7A695E]" /> : null}
            </p>
            {transactionId ? (
              <p className="text-center text-sm text-[#6A5B53]">
                Transaction ID: <span className="font-semibold text-[#2D2521]">{transactionId}</span>
              </p>
            ) : null}
            {paymentDate ? (
              <p className="text-center text-sm text-[#6A5B53]">
                Payment date:{' '}
                <span className="font-semibold text-[#2D2521]">{new Date(paymentDate).toLocaleString()}</span>
              </p>
            ) : null}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              to={dashboardPath}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8E1616] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#D84040]"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E0CFC4] bg-white px-6 py-3 text-sm font-semibold text-[#3A2F29] transition duration-200 hover:bg-[#FBF7F4]"
            >
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>

          {shouldShowOrdersButton ? (
            <div className="mt-3">
              <Link
                to="/customer_dashboard/orders"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D7C9C1] bg-[#FFF9F6] px-6 py-3 text-sm font-semibold text-[#4A3B34] transition duration-200 hover:bg-[#FBF3EE]"
              >
                <ReceiptText className="h-4 w-4" />
                View My Orders
              </Link>
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  );
}
