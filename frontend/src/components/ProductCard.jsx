import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

export default function ProductCard({ product, selectedCategoryId, detailsPath }) {
  const imagePath = product?.imageUrl || product?.image || product?.imagePath;
  const categoryQuery = selectedCategoryId ? `?categoryId=${encodeURIComponent(selectedCategoryId)}` : '';
  const fallbackPath = `/shop/products/${product.id}${categoryQuery}`;
  const productDetailsPath = detailsPath || fallbackPath;

  return (
    <Link to={productDetailsPath}>
      <motion.div
        whileTap={{ scale: 0.98, y: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="group overflow-hidden rounded-[16px] border border-[#E4D8D2] bg-[#FDFDFD] shadow-[0_10px_22px_-18px_rgba(75,58,58,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_30px_-18px_rgba(75,58,58,0.45)]"
      >
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
        </div>

        <div className="space-y-1.5 p-4">
          <h3 className="line-clamp-1 text-[1rem] font-medium text-[#1A1717]">{product.name}</h3>
          <p className="text-[1.05rem] font-semibold text-[#A31A11]">Rs. {Number(product.price || 0).toFixed(2)}</p>
        </div>
      </motion.div>
    </Link>
  );
}
