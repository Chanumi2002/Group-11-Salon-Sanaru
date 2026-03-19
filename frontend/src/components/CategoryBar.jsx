import { resolveImageUrl } from '@/utils/resolveImageUrl';
import { cn } from '@/lib/utils';

export default function CategoryBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  isLoading,
}) {
  return (
    <aside className="rounded-2xl border border-border bg-card/90 p-4 shadow-salon backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-foreground">Categories</h2>

      <div className="mt-4 md:hidden">
        <label htmlFor="mobile-category" className="mb-2 block text-sm text-muted-foreground">
          Filter by category
        </label>
        <select
          id="mobile-category"
          value={selectedCategoryId || ''}
          onChange={(event) => onSelectCategory(event.target.value || null)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring transition focus:ring-2"
        >
          <option value="">All products</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 hidden space-y-2 md:block">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all',
            !selectedCategoryId
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted/60 text-foreground hover:bg-muted'
          )}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 text-xs font-semibold text-foreground">
            All
          </span>
          <span className="font-medium">All products</span>
        </button>

        {isLoading && <p className="py-4 text-sm text-muted-foreground">Loading categories...</p>}

        {!isLoading &&
          categories.map((category) => {
            const imagePath =
              category?.imageUrl || category?.image || category?.imagePath || category?.thumbnail;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(String(category.id))}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all',
                  String(selectedCategoryId) === String(category.id)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/60 text-foreground hover:bg-muted'
                )}
              >
                {imagePath ? (
                  <img
                    src={resolveImageUrl(imagePath)}
                    alt={category.name}
                    loading="lazy"
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 text-xs font-semibold text-foreground">
                    {category.name?.charAt(0)?.toUpperCase() || 'C'}
                  </span>
                )}
                <span className="font-medium">{category.name}</span>
              </button>
            );
          })}
      </div>
    </aside>
  );
}
