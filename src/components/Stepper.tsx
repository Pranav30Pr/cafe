import React from 'react';
import { Icons } from './Icon';

interface StepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  itemName: string;
  max?: number;
}

export const Stepper: React.FC<StepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  itemName,
  max = 20,
}) => {
  return (
    <div
      className="inline-flex items-center gap-1.5 p-1 glass-strong rounded-[6px] border border-glass-border shadow-sm"
      role="group"
      aria-label={`Quantity stepper for ${itemName}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        aria-label={`Remove one ${itemName}`}
        className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-[6px] bg-glass hover:bg-accent hover:text-white text-ink flex items-center justify-center transition-transform active:scale-95 duration-100 focus-visible:outline-none"
      >
        <Icons.Minus className="w-4 h-4" />
      </button>

      <span
        className="w-7 text-center font-semibold text-sm tabular-nums text-ink select-none"
        aria-label={`${quantity} in order`}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        disabled={quantity >= max}
        aria-label={`Add one more ${itemName}`}
        className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-[6px] bg-accent text-accent-ink hover:opacity-90 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 duration-100 focus-visible:outline-none"
      >
        <Icons.Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
