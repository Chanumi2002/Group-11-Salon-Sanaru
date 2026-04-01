import { Loader2, Trash2 } from 'lucide-react';
import QuantitySelector from '@/components/QuantitySelector';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

export default function CartItemRow({
  item,
  isUpdating,
  isRemoving,
  onDecrease,
  onIncrease,
  onRemove,
}) {
  const imagePath = item?.imagePath || item?.imageUrl || item?.image;

  return (
    <div className="grid gap-4 rounded-2xl border border-[#E1D6D2] bg-[#FDFDFD] p-4 shadow-[0_12px_24px_-20px_rgba(73,61,61,0.35)] md:grid-cols-[92px_1fr_auto] md:items-center md:gap-5">
      <div className="h-24 w-24 overflow-hidden rounded-xl border border-[#E7DEDB] bg-[#F5F0EE]">
        {imagePath ? (
          <img src={resolveImageUrl(imagePath)} alt={item.productName} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#7D746F]">No image</div>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-2 text-base font-semibold text-[#1A1717]">{item.productName}</h3>
        <p className="mt-1 text-sm text-[#7B6F6A]">Rs. {Number(item.unitPrice || 0).toFixed(2)} each</p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <QuantitySelector
            quantity={Number(item.quantity || 1)}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            disabled={isUpdating || isRemoving}
          />

          <button
            type="button"
            onClick={onRemove}
            disabled={isRemoving || isUpdating}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E7C9C9] px-3 py-1.5 text-xs font-semibold text-[#A72B2B] transition hover:bg-[#FBEDED] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRemoving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Remove
          </button>
        </div>
      </div>

      <div className="text-left md:text-right">
        <p className="text-xs uppercase tracking-[0.08em] text-[#8F807A]">Subtotal</p>
        <p className="mt-1 text-lg font-semibold text-[#8B1A1A]">Rs. {Number(item.subTotal || 0).toFixed(2)}</p>
      </div>
    </div>
  );
}
