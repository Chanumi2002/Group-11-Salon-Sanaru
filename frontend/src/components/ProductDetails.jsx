import { ArrowLeft, Loader2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { resolveImageUrl } from '@/utils/resolveImageUrl';
import QuantitySelector from '@/components/QuantitySelector';

export default function ProductDetails({
  product,
  isLoading,
  onBack,
  quantity,
  onQuantityDecrease,
  onQuantityIncrease,
  onAddToCart,
  isAddingToCart,
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[20px] border border-[#8B1A1A]/30 bg-[linear-gradient(145deg,rgba(253,253,253,0.94),rgba(235,235,235,0.9))] shadow-[0_18px_40px_-24px_rgba(26,23,23,0.55)]">
        <Loader2 className="h-10 w-10 animate-spin text-[#E34F4F]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-[20px] border border-dashed border-[#8B1A1A]/35 bg-[linear-gradient(145deg,rgba(253,253,253,0.95),rgba(235,235,235,0.92))] p-10 text-center shadow-[0_14px_30px_-20px_rgba(26,23,23,0.45)]">
        <p className="text-[#1A1717]/75">Product details are not available.</p>
      </div>
    );
  }

  const imagePath = product?.imageUrl || product?.image || product?.imagePath;
  const categoryName =
    product?.categories?.[0]?.name || product?.category?.name || product?.categoryName || 'Unknown';

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.button
        type="button"
        onClick={onBack}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 rounded-full border border-[#8B1A1A]/35 bg-[#A31A11] px-5 py-2.5 text-sm font-medium text-[#FDFDFD] transition-all duration-300 hover:bg-[#E34F4F] hover:shadow-[0_10px_20px_-12px_rgba(227,79,79,0.8)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </motion.button>

      <div className="grid gap-7 rounded-[20px] border border-[#8B1A1A]/28 bg-[linear-gradient(145deg,rgba(253,253,253,0.96),rgba(235,235,235,0.93))] p-4 shadow-[0_22px_44px_-26px_rgba(26,23,23,0.6)] backdrop-blur-sm md:grid-cols-[0.95fr_1.05fr] md:p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
          className="flex items-center justify-center overflow-hidden rounded-[16px] md:min-h-[620px]"
        >
          {imagePath ? (
            <img
              src={resolveImageUrl(imagePath)}
              alt={product.name}
              loading="lazy"
              className="h-[500px] w-full max-w-[620px] object-contain transition-transform duration-500 hover:scale-[1.02] md:h-[600px]"
            />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center text-sm text-[#1A1717]/65">
              No image available
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: 'easeOut' }}
          className="flex flex-col justify-center"
        >
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[#8B1A1A]/50 bg-[#EBEBEB] px-3 py-1 text-xs text-[#8B1A1A]">
            <Tag className="h-3.5 w-3.5" />
            {categoryName}
          </p>
          <h1 className="mt-4 text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-tight text-[#1A1717]">{product.name}</h1>
          <p className="mt-3 text-[1.95rem] font-semibold text-[#E34F4F]">Rs. {Number(product.price || 0).toFixed(2)}</p>
          <p className="mt-6 text-[1.03rem] leading-[1.75] text-[#4C4542]">
            {product.description || 'No description available for this product.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <QuantitySelector
              quantity={quantity}
              onDecrease={onQuantityDecrease}
              onIncrease={onQuantityIncrease}
              disabled={isAddingToCart}
            />

            <motion.button
              type="button"
              onClick={onAddToCart}
              disabled={isAddingToCart}
              whileTap={{ scale: isAddingToCart ? 1 : 0.98 }}
              className="inline-flex min-w-[165px] items-center justify-center gap-2 rounded-full border border-[#8B1A1A]/35 bg-[#A31A11] px-6 py-2.5 text-sm font-semibold text-[#FDFDFD] transition-all duration-300 hover:bg-[#E34F4F] hover:shadow-[0_10px_20px_-12px_rgba(227,79,79,0.8)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Cart'
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
