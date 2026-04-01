import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartService } from '@/services/cartService';
import { readAuthState } from '@/utils/authState';

const defaultCart = {
  items: [],
  totalAmount: 0,
};

const CartContext = createContext(null);

const normalizeCart = (payload) => {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const totalAmount = Number(payload?.totalAmount ?? 0);

  return {
    items,
    totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
  };
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(defaultCart);
  const [isFetchingCart, setIsFetchingCart] = useState(false);
  const [cartError, setCartError] = useState('');
  const [authState, setAuthState] = useState(() => readAuthState());

  useEffect(() => {
    const syncAuthState = () => {
      setAuthState(readAuthState());
    };

    window.addEventListener('storage', syncAuthState);
    window.addEventListener('focus', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('focus', syncAuthState);
    };
  }, []);

  const isCustomerLoggedIn = authState.isCustomer;

  const fetchCart = useCallback(async ({ silent = false } = {}) => {
    if (!cartService.getAuthToken()) {
      setCart(defaultCart);
      setCartError('');
      return defaultCart;
    }

    try {
      if (!silent) {
        setIsFetchingCart(true);
      }
      setCartError('');
      const payload = await cartService.getCart();
      const normalized = normalizeCart(payload);
      setCart(normalized);
      return normalized;
    } catch (error) {
      setCartError(error?.message || 'Failed to load cart');
      throw error;
    } finally {
      if (!silent) {
        setIsFetchingCart(false);
      }
    }
  }, []);

  const addItemToCart = useCallback(async ({ productId, quantity }) => {
    const payload = await cartService.addToCart({ productId, quantity });
    await fetchCart({ silent: true });
    return payload;
  }, [fetchCart]);

  const updateItemQuantity = useCallback(async (cartItemId, quantity) => {
    const payload = await cartService.updateCartItem(cartItemId, quantity);
    await fetchCart({ silent: true });
    return payload;
  }, [fetchCart]);

  const removeItem = useCallback(async (cartItemId) => {
    const payload = await cartService.removeCartItem(cartItemId);
    await fetchCart({ silent: true });
    return payload;
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    const currentItems = Array.isArray(cart?.items) ? cart.items : [];

    setCart(defaultCart);
    setCartError('');

    try {
      const payload = await cartService.clearCart();
      return payload;
    } catch (error) {
      const removableItemIds = currentItems
        .map((item) => item?.cartItemId)
        .filter((cartItemId) => Boolean(cartItemId));

      if (!removableItemIds.length) {
        return { message: 'Cart cleared successfully' };
      }

      try {
        await Promise.all(removableItemIds.map((cartItemId) => cartService.removeCartItem(cartItemId)));
        return { message: 'Cart cleared successfully' };
      } catch (fallbackError) {
        await fetchCart({ silent: true }).catch(() => {
          // Keep the latest error state from the throwing request.
        });
        throw fallbackError;
      }
    }
  }, [cart?.items, fetchCart]);

  const checkout = useCallback(async (checkoutPayload = {}) => {
    const payload = await cartService.checkout(checkoutPayload);
    setCart(defaultCart);
    return payload;
  }, []);

  useEffect(() => {
    if (!isCustomerLoggedIn) {
      setCart(defaultCart);
      setCartError('');
      return;
    }

    fetchCart().catch(() => {
      // Error state is already captured in cartError.
    });
  }, [isCustomerLoggedIn, fetchCart]);

  const cartCount = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
  }, [cart.items]);

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      isFetchingCart,
      cartError,
      isCustomerLoggedIn,
      fetchCart,
      addItemToCart,
      updateItemQuantity,
      removeItem,
      clearCart,
      checkout,
    }),
    [
      cart,
      cartCount,
      isFetchingCart,
      cartError,
      isCustomerLoggedIn,
      fetchCart,
      addItemToCart,
      updateItemQuantity,
      removeItem,
      clearCart,
      checkout,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
