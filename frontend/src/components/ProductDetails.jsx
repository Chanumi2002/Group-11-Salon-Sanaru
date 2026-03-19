import { ArrowLeft, Loader2, Tag } from 'lucide-react';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

export default function ProductDetails({ product, isLoading, onBack }) {
  if (isLoading) {
    return (
      <div className="flex min-h-[380px] items-center justify-center rounded-3xl border border-border bg-card/80">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/70 p-10 text-center">
        <p className="text-muted-foreground">Product details are not available.</p>
      </div>
    );
  }

  const imagePath = product?.imageUrl || product?.image || product?.imagePath;
  const categoryName =
    product?.categories?.[0]?.name || product?.category?.name || product?.categoryName || 'Unknown';

  return (
    <section className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </button>

      <div className="grid gap-6 rounded-3xl border border-border bg-card/95 p-4 shadow-salon md:grid-cols-2 md:p-8">
        <div className="overflow-hidden rounded-2xl bg-muted/60">
          {imagePath ? (
            <img
              src={resolveImageUrl(imagePath)}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
              No image available
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            {categoryName}
          </p>
          <h1 className="mt-4 text-3xl font-bold text-foreground">{product.name}</h1>
          <p className="mt-3 text-2xl font-bold text-primary">Rs. {Number(product.price || 0).toFixed(2)}</p>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            {product.description || 'No description available for this product.'}
          </p>
        </div>
      </div>
    </section>
  );
}
