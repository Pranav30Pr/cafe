import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext';
import { formatRupees } from '../utils/formatters';
import { Icons } from './Icon';

interface MiniCartBarProps {
  token: string;
}

export const MiniCartBar: React.FC<MiniCartBarProps> = ({ token }) => {
  const navigate = useNavigate();
  const { cartItems, totalItems } = useCart();

  if (totalItems === 0) return null;

  const totalPaise = cartItems.reduce(
    (sum, { item, quantity }) => sum + item.price_paise * quantity,
    0
  );

  return (
    <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom)+8px)] left-0 right-0 z-30 flex justify-center px-3 pointer-events-none">
      <button
        type="button"
        onClick={() => navigate(`/t/${token}/order`)}
        className="w-full max-w-[456px] pointer-events-auto h-12 glass-strong rounded-[14px] border border-glass-border px-4 flex items-center justify-between shadow-lg text-ink active:scale-[0.98] transition-all duration-100 focus-visible:outline-none"
        aria-label={`View your order with ${totalItems} items totaling ${formatRupees(totalPaise)}`}
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-[8px] bg-accent text-accent-ink text-xs font-bold flex items-center justify-center tabular-nums">
            {totalItems}
          </span>
          <span className="font-semibold text-sm">View order</span>
        </div>

        <div className="flex items-center gap-2 font-semibold text-sm text-accent tabular-nums">
          <span>{formatRupees(totalPaise)}</span>
          <Icons.ArrowRight className="w-4 h-4 text-accent" />
        </div>
      </button>
    </div>
  );
};
