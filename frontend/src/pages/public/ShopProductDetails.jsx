import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import ProductDetails from '@/components/ProductDetails';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { shopService } from '@/services/shopApi';
import { useCart } from '@/context/CartContext';

export default function ShopProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { isCustomerLoggedIn, addItemToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await shopService.getProductById(id);
        setProduct(data || null);
      } catch (error) {
        console.error('Failed to load product details:', error);
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleBack = () => {
    const categoryId = searchParams.get('categoryId');
    const target = categoryId ? `/shop?categoryId=${encodeURIComponent(categoryId)}` : '/shop';
    navigate(target);
  };

  const handleQuantityDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleQuantityIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = async () => {
    if (!product?.id) {
      toast.error('Unable to add this item to cart right now.');
      return;
    }

    if (!isCustomerLoggedIn) {
      toast.info('Please login to add items to cart.');
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      await addItemToCart({
        productId: product.id,
        quantity,
      });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      const message = String(error?.message || '').toLowerCase();
      const shouldRedirectToLogin =
        message.includes('jwt') ||
        message.includes('token') ||
        message.includes('unauthorized') ||
        message.includes('authentication failed') ||
        message.includes('401');

      if (shouldRedirectToLogin) {
        toast.info('Please login to add items to cart.');
        navigate('/login', {
          state: { from: `${location.pathname}${location.search}` },
        });
        return;
      }

      toast.error(error?.message || 'Failed to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(130deg, #2A2323 0%, #3B2A2A 45%, #6B2A2A 100%)',
      }}
    >
      <Navbar />

      <main className="mx-auto w-full max-w-[1380px] flex-1 px-4 py-8 md:px-6 lg:px-10">
        <ProductDetails
          product={product}
          isLoading={isLoading}
          onBack={handleBack}
          quantity={quantity}
          onQuantityDecrease={handleQuantityDecrease}
          onQuantityIncrease={handleQuantityIncrease}
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
        />
      </main>

      <Footer />
    </div>
  );
}
