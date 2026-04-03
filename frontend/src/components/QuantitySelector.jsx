import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ quantity, onDecrease, onIncrease, disabled = false }) {
  return (
    <div className="inline-flex items-center rounded-full border border-[#8B1A1A]/35 bg-[#F5F2F1] p-1 shadow-[0_8px_18px_-14px_rgba(26,23,23,0.55)]">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || quantity <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#8B1A1A] transition hover:bg-[#E7DEDB] disabled:cursor-not-allowed disabled:opacity-45"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>

      <span className="min-w-[42px] select-none text-center text-sm font-semibold text-[#1A1717]">{quantity}</span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#8B1A1A] transition hover:bg-[#E7DEDB] disabled:cursor-not-allowed disabled:opacity-45"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
