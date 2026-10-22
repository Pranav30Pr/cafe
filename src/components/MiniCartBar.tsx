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
    <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom)+10px)] left-0 right-0 z-30 flex justify-center px-3 pointer-events-none">
      <button
        type="button"
        onClick={() => navigate(`/t/${token}/order`)}
        className="w-full max-w-[456px] pointer-events-auto h-12 rounded-[6px] bg-[#15803D] text-white px-4 flex items-center justify-between shadow-[0_8px_20px_rgba(21,128,61,0.30)] active:scale-[0.98] transition-all duration-100 focus-visible:outline-none"
        aria-label={`View your cart with ${totalItems} items totaling ${formatRupees(totalPaise)}`}
      >
        {/* Left: Swiggy/Zomato style items and total */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider">
            {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
          </span>
          <span className="text-white/60">|</span>
          <span className="font-extrabold text-sm tabular-nums">
            {formatRupees(totalPaise)}
          </span>
        </div>

        {/* Right: View Cart CTA */}
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
          <span>View Cart</span>
          <Icons.ArrowRight className="w-4 h-4 text-white" />
        </div>
      </button>
    </div>
  );
};
