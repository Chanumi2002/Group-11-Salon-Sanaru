import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';

export default function ProductList({
  products,
  isLoading,
  selectedCategoryId,
  selectedCategoryName,
  detailsPathBuilder,
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[16px] border border-[#E2D4CD] bg-[#FDFDFD]">
        <Loader2 className="h-8 w-8 animate-spin text-[#A31A11]" />
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-[16px] border border-dashed border-[#E2D4CD] bg-[#FDFDFD] p-10 text-center">
        <h3 className="text-lg font-medium text-[#1A1717]">No products found</h3>
        <p className="mt-2 text-sm text-[#7D746F]">
          {selectedCategoryId
            ? `There are no items available in ${selectedCategoryName || 'this category'} right now.`
            : 'There are no products available right now.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.38, delay: Math.min(index * 0.05, 0.35), ease: 'easeOut' }}
        >
          <ProductCard
            product={product}
            selectedCategoryId={selectedCategoryId}
            detailsPath={detailsPathBuilder ? detailsPathBuilder(product) : undefined}
          />
        </motion.div>
      ))}
    </div>
  );
}
