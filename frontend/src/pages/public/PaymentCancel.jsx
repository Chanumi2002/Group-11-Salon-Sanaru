import { Link } from 'react-router-dom';
import { AlertTriangle, RotateCcw, ShoppingCart } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1EC]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-10">
        <section className="w-full rounded-3xl border border-[#E6D8CF] bg-white p-8 shadow-[0_24px_50px_-36px_rgba(45,33,30,0.45)] md:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF4E8] text-[#C8751A]">
            <AlertTriangle className="h-9 w-9" />
          </div>

          <h1 className="mt-5 text-center text-3xl font-semibold text-[#201A17]">Payment Cancelled</h1>
          <p className="mx-auto mt-2 max-w-xl text-center text-[#5E5048]">
            Your payment was not completed. You can safely return to your cart and try again.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              to="/cart"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8E1616] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#D84040]"
            >
              <RotateCcw className="h-4 w-4" />
              Try Payment Again
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E0CFC4] px-6 py-3 text-sm font-semibold text-[#3A2F29] transition hover:bg-[#FBF7F4]"
            >
              <ShoppingCart className="h-4 w-4" />
              Back to Products
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
