import { resolveImageUrl } from '@/utils/resolveImageUrl';
import { cn } from '@/lib/utils';

export default function CategoryBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  isLoading,
}) {
  return (
    <aside className="rounded-[16px] border border-[#DAD6D3] bg-[#E5E3E1] p-4 shadow-[0_14px_24px_-20px_rgba(58,48,48,0.28)]">
      <h2 className="text-lg font-medium text-[#1A1717]">Categories</h2>

      <div className="mt-4 md:hidden">
        <label htmlFor="mobile-category" className="mb-2 block text-sm text-[#5D5653]">
          Filter by category
        </label>
        <select
          id="mobile-category"
          value={selectedCategoryId || ''}
          onChange={(event) => onSelectCategory(event.target.value || null)}
          className="w-full rounded-xl border border-[#D8D1CC] bg-[#FFFFFF] px-3 py-2 text-sm text-[#1A1717] outline-none transition focus:border-[#A31A11]"
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
              ? 'bg-[#8B1A1A] text-[#F7F1EF] shadow-[0_0_0_1px_rgba(227,79,79,0.22),0_14px_22px_-18px_rgba(227,79,79,0.55)]'
              : 'bg-[#FFFFFF] text-[#1A1717] hover:bg-[#F2EEEB] hover:shadow-[0_0_0_1px_rgba(163,26,17,0.18)]'
          )}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F1EF] text-xs font-semibold text-[#1A1717]">
            All
          </span>
          <span className="font-medium">All products</span>
        </button>

        {isLoading && <p className="py-4 text-sm text-[#6A625E]">Loading categories...</p>}

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
                    ? 'bg-[#8B1A1A] text-[#F7F1EF] shadow-[0_0_0_1px_rgba(227,79,79,0.22),0_14px_22px_-18px_rgba(227,79,79,0.55)]'
                    : 'bg-[#FFFFFF] text-[#1A1717] hover:bg-[#F2EEEB] hover:shadow-[0_0_0_1px_rgba(163,26,17,0.18)]'
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
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F1EF] text-xs font-semibold text-[#1A1717]">
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
