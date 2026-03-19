import { Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function ProductList({
  products,
  isLoading,
  selectedCategoryId,
  selectedCategoryName,
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-border bg-card/80">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/70 p-10 text-center">
        <h3 className="text-lg font-semibold text-foreground">No products found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {selectedCategoryId
            ? `There are no items available in ${selectedCategoryName || 'this category'} right now.`
            : 'There are no products available right now.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          selectedCategoryId={selectedCategoryId}
        />
      ))}
    </div>
  );
}
