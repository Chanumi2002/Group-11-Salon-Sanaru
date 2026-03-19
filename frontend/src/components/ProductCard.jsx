import { Link } from 'react-router-dom';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

export default function ProductCard({ product, selectedCategoryId }) {
  const imagePath = product?.imageUrl || product?.image || product?.imagePath;
  const categoryQuery = selectedCategoryId ? `?categoryId=${encodeURIComponent(selectedCategoryId)}` : '';

  return (
    <Link
      to={`/shop/products/${product.id}${categoryQuery}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-salon transition-all duration-300 hover:-translate-y-1 hover:shadow-salon-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-muted/70">
        {imagePath ? (
          <img
            src={resolveImageUrl(imagePath)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No image available
          </div>
        )}
      </div>

      <div className="space-y-1 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-foreground">{product.name}</h3>
        <p className="text-lg font-bold text-primary">Rs. {Number(product.price || 0).toFixed(2)}</p>
      </div>
    </Link>
  );
}
