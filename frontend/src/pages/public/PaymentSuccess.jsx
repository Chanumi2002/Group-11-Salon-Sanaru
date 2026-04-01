import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Home, ShoppingBag } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { readAuthState } from '@/utils/authState';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || '';
  const authState = readAuthState();
  const dashboardPath = authState.isAdmin ? '/admin_dashboard' : '/customer_dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1EC]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-10">
        <section className="w-full rounded-3xl border border-[#E6D8CF] bg-white p-8 shadow-[0_24px_50px_-36px_rgba(45,33,30,0.45)] md:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF8EF] text-[#1F8A43]">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <h1 className="mt-5 text-center text-3xl font-semibold text-[#201A17]">Payment Successful</h1>
          <p className="mx-auto mt-2 max-w-xl text-center text-[#5E5048]">
            Thank you. Your payment was completed successfully and your order is now being processed.
          </p>

          {orderId ? (
            <p className="mt-4 text-center text-sm font-medium text-[#7A695E]">
              Reference: <span className="text-[#3A2F29]">{orderId}</span>
            </p>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              to={dashboardPath}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8E1616] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#D84040]"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E0CFC4] px-6 py-3 text-sm font-semibold text-[#3A2F29] transition hover:bg-[#FBF7F4]"
            >
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
