import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import CartItemRow from '@/components/CartItemRow';
import { useCart } from '@/context/CartContext';
import { paymentService } from '@/services/paymentService';
import { submitPayHereForm } from '@/utils/payHereRedirect';

export default function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cart,
    isFetchingCart,
    cartError,
    isCustomerLoggedIn,
    fetchCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    checkout,
  } = useCart();

  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);

  useEffect(() => {
    if (!isCustomerLoggedIn) {
      navigate('/login', {
        replace: true,
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    fetchCart().catch(() => {
      // Error is surfaced through cartError state.
    });
  }, [isCustomerLoggedIn, fetchCart, navigate, location.pathname, location.search]);

  const cartItems = useMemo(() => (Array.isArray(cart?.items) ? cart.items : []), [cart?.items]);

  const handleQuantityChange = async (item, nextQuantity) => {
    if (!item?.cartItemId || nextQuantity < 1) {
      return;
    }

    try {
      setUpdatingItemId(item.cartItemId);
      await updateItemQuantity(item.cartItemId, nextQuantity);
    } catch (error) {
      toast.error(error?.message || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      setRemovingItemId(cartItemId);
      await removeItem(cartItemId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error?.message || 'Failed to remove item');
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (!cartItems.length) {
      return;
    }

    try {
      setIsClearingCart(true);
      await clearCart();
      toast.success('Cart cleared successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to clear cart');
    } finally {
      setIsClearingCart(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!cartItems.length) {
      return;
    }

    try {
      setIsPreparingPayment(true);

      const orderResponse = await checkout();
      const orderId = Number(orderResponse?.orderId);

      if (!orderId) {
        throw new Error('Order was created, but payment session could not be prepared.');
      }

      const payHereCheckout = await paymentService.preparePayHereCheckout(orderId);
      submitPayHereForm(payHereCheckout);
    } catch (error) {
      const message = String(error?.message || '').toLowerCase();
      const statusCode = Number(error?.statusCode || 0);
      const shouldRedirectToLogin =
        statusCode === 401 ||
        message.includes('jwt') ||
        message.includes('token') ||
        message.includes('unauthorized') ||
        message.includes('authentication failed') ||
        message.includes('401');

      if (shouldRedirectToLogin) {
        toast.info('Please login to continue with payment.');
        navigate('/login', {
          replace: true,
          state: { from: `${location.pathname}${location.search}` },
        });
        return;
      }

      toast.error(error?.message || 'Unable to start payment right now. Please try again.');
    } finally {
      setIsPreparingPayment(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EBEBEB]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1380px] flex-1 px-4 py-8 md:px-6 lg:px-10">
        <section className="rounded-[20px] border border-[#DED6D2] bg-[#FDFDFD] p-5 shadow-[0_16px_30px_-22px_rgba(73,61,61,0.4)] md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7DEDB] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-full bg-[#F7E4E2] p-2 text-[#8B1A1A]">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[#1A1717] md:text-3xl">My Cart</h1>
                <p className="text-sm text-[#7D746F]">Review your products before checkout</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearCart}
              disabled={!cartItems.length || isClearingCart || isPreparingPayment}
              className="inline-flex items-center gap-2 rounded-full border border-[#E6C7C7] px-4 py-2 text-sm font-semibold text-[#A72B2B] transition hover:bg-[#FCEEEE] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isClearingCart ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Clear cart
            </button>
          </div>

          {isFetchingCart ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <Loader2 className="h-9 w-9 animate-spin text-[#D84040]" />
            </div>
          ) : cartError ? (
            <div className="mt-6 rounded-xl border border-dashed border-[#D84040]/40 bg-[#FFF7F7] p-6 text-center">
              <p className="text-[#8B1A1A]">{cartError}</p>
              <button
                type="button"
                onClick={() => {
                  fetchCart().catch(() => {
                    // Error is surfaced through cartError state.
                  });
                }}
                className="mt-3 rounded-full bg-[#8E1616] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#D84040]"
              >
                Retry
              </button>
            </div>
          ) : !cartItems.length ? (
            <div className="mt-6 rounded-xl border border-dashed border-[#D7CFCC] bg-[#FAF9F8] px-6 py-12 text-center">
              <ShoppingCart className="mx-auto h-10 w-10 text-[#B8ADAA]" />
              <h2 className="mt-4 text-xl font-semibold text-[#1A1717]">Your cart is empty</h2>
              <p className="mt-2 text-sm text-[#7D746F]">Add products from the shop to see them here.</p>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="mt-5 rounded-full bg-[#8E1616] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D84040]"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.cartItemId}
                  item={item}
                  isUpdating={updatingItemId === item.cartItemId}
                  isRemoving={removingItemId === item.cartItemId}
                  onDecrease={() => handleQuantityChange(item, Number(item.quantity || 1) - 1)}
                  onIncrease={() => handleQuantityChange(item, Number(item.quantity || 1) + 1)}
                  onRemove={() => handleRemove(item.cartItemId)}
                />
              ))}

              <div className="mt-3 rounded-2xl border border-[#E1D6D2] bg-[#F9F6F5] p-5">
                <div className="flex items-center justify-between text-sm text-[#6C6461]">
                  <span>Total items</span>
                  <span>{cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xl font-semibold text-[#8B1A1A]">
                  <span>Total amount</span>
                  <span>Rs. {Number(cart.totalAmount || 0).toFixed(2)}</span>
                </div>

                <p className="mt-3 text-xs text-[#7D746F]">
                  You will be redirected to PayHere Sandbox to complete your secure payment.
                </p>

                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={isPreparingPayment || isClearingCart || !cartItems.length}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#8E1616] px-6 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-white transition-all duration-300 hover:bg-[#D84040] disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {isPreparingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isPreparingPayment ? 'Preparing payment...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
