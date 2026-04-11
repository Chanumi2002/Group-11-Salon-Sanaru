import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { resolveImageUrl } from '@/utils/resolveImageUrl';
import { useCart } from '@/context/CartContext';
import { getStoredToken } from '@/utils/authState';
import { shopService } from '@/services/shopApi';

export default function ProductCard({ product, selectedCategoryId, detailsPath }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItemToCart } = useCart();
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);

  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const stats = await shopService.getReviewStats(product.id, 'PRODUCT');
        setReviewStats(stats);
      } catch (error) {
        // Silently fail - stats are optional
      }
    };
    if (product?.id) {
      fetchReviewStats();
    }
  }, [product?.id]);

  const imagePath = product?.imageUrl || product?.image || product?.imagePath;
  const categoryQuery = selectedCategoryId ? `?categoryId=${encodeURIComponent(selectedCategoryId)}` : '';
  const fallbackPath = `/shop/products/${product.id}${categoryQuery}`;
  const productDetailsPath = detailsPath || fallbackPath;

  const handleBuyNow = async (event) => {
    event.preventDefault();

    if (!product?.id) {
      toast.error('Unable to buy this item right now.');
      return;
    }

    if (!getStoredToken()) {
      toast.info('Please login to continue to payment.');
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    try {
      setIsBuyingNow(true);
      await addItemToCart({
        productId: product.id,
        quantity: 1,
      });
      navigate('/cart');
    } catch (error) {
      const message = String(error?.message || '').toLowerCase();
      const statusCode = Number(error?.statusCode || 0);
      const shouldRedirectToLogin = statusCode === 401 || message.includes('unauthorized');

      if (shouldRedirectToLogin) {
        toast.info('Please login to continue to payment.');
        navigate('/login', {
          state: { from: `${location.pathname}${location.search}` },
        });
        return;
      }

      toast.error(error?.message || 'Unable to start payment right now. Please try again.');
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98, y: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="group overflow-hidden rounded-[16px] border border-[#E4D8D2] bg-[#FDFDFD] shadow-[0_10px_22px_-18px_rgba(75,58,58,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_30px_-18px_rgba(75,58,58,0.45)]"
    >
      <Link to={productDetailsPath}>
        <div className="relative h-[220px] overflow-hidden rounded-b-none bg-[#F2ECE8]">
          {imagePath ? (
            <img
              src={resolveImageUrl(imagePath)}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-[#7B706B]">
              No image available
            </div>
          )}
          {product.outOfStock || product.stockQuantity === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] z-10 transition-all duration-300">
              <span className="px-4 py-1.5 bg-[#A31A11] text-white text-sm font-bold uppercase tracking-wider rounded-md shadow-lg rotate-12 scale-110">
                Out of Stock
              </span>
            </div>
          ) : null}
        </div>

        <div className="space-y-1.5 p-4 pb-2">
          <h3 className="line-clamp-1 text-[1rem] font-medium text-[#1A1717]">{product.name}</h3>
          <p className="text-[1.05rem] font-semibold text-[#A31A11]">Rs. {Number(product.price || 0).toFixed(2)}</p>
          {reviewStats && reviewStats.averageRating > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={
                      star <= Math.round(reviewStats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-[#7D746F]">
                {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalFeedbacks || 0})
              </span>
            </div>
          )}
          {((product.lowStock || product.stockQuantity <= product.lowStockThreshold) && product.stockQuantity > 0) && (
            <p className="text-[0.8rem] font-medium text-[#D92D20]">
              Only {product.stockQuantity} left
            </p>
          )}
        </div>
      </Link>

      <div className="p-4 pt-2">
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isBuyingNow || product.outOfStock || product.stockQuantity === 0}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
            product.outOfStock || product.stockQuantity === 0
              ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
              : 'border-[#8B1A1A]/35 bg-[#A31A11] text-[#FDFDFD] hover:bg-[#E34F4F] hover:shadow-[0_10px_20px_-12px_rgba(227,79,79,0.8)] disabled:cursor-not-allowed disabled:opacity-70'
          }`}
        >
          {isBuyingNow ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : product.outOfStock || product.stockQuantity === 0 ? (
            'Out of Stock'
          ) : (
            'Buy Now'
          )}
        </button>
      </div>
    </motion.div>
  );
}
