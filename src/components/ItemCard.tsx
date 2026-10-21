import React, { useState } from 'react';
import { MenuItem } from '../types';
import { formatRupees } from '../utils/formatters';
import { DietMarker } from './DietMarker';
import { Stepper } from './Stepper';
import { BottomSheet } from './BottomSheet';
import { Icons } from './Icon';
import { useCart } from '../state/CartContext';

interface ItemCardProps {
  item: MenuItem;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const { cart, addItem, removeItem } = useCart();
  const [sheetOpen, setSheetOpen] = useState(false);
  const quantity = cart[item.id] || 0;

  return (
    <>
      <article
        onClick={() => setSheetOpen(true)}
        className={`glass-strong rounded-[16px] p-3 border border-glass-border shadow-sm flex gap-3 cursor-pointer transition-all active:scale-[0.99] duration-100 ${
          !item.is_available ? 'opacity-60 grayscale-[40%]' : ''
        }`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSheetOpen(true);
          }
        }}
        aria-label={`${item.name}, ${formatRupees(item.price_paise)}. Tap for item details.`}
      >
        {/* Left Column: Info & Action */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <DietMarker diet={item.diet} />
              <h3 className="font-semibold text-base text-ink leading-snug line-clamp-1">
                {item.name}
              </h3>
            </div>

            {item.description && (
              <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed mb-2">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 pt-1">
            <span className="font-semibold text-[15px] tabular-nums text-accent">
              {formatRupees(item.price_paise)}
            </span>

            {/* Action control */}
            {!item.is_available ? (
              <span className="text-xs text-danger font-medium select-none">
                Unavailable today
              </span>
            ) : quantity > 0 ? (
              <Stepper
                quantity={quantity}
                onIncrement={() => addItem(item)}
                onDecrement={() => removeItem(item)}
                itemName={item.name}
              />
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addItem(item);
                }}
                className="h-11 min-h-[44px] px-4 rounded-[12px] bg-accent text-accent-ink text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-1.5 active:scale-95 transition-transform duration-100 focus-visible:outline-none"
                aria-label={`Add ${item.name} to order`}
              >
                <Icons.Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Photo thumbnail (Only if client supplied photo per UI_SPEC 5.1) */}
        {item.image_path && (
          <div className="w-20 h-20 rounded-[12px] overflow-hidden flex-shrink-0 bg-glass border border-glass-border">
            <img
              src={item.image_path}
              alt={item.image_alt || item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </article>

      {/* Item Detail Bottom Sheet (UI_SPEC 5.1) */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={item.name}
      >
        <div className="space-y-4 text-ink">
          {item.image_path && (
            <div className="w-full h-44 rounded-[16px] overflow-hidden bg-glass border border-glass-border">
              <img
                src={item.image_path}
                alt={item.image_alt || item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DietMarker diet={item.diet} />
              <span className="text-xs font-medium text-ink-muted">
                {item.diet === 'veg' ? 'Vegetarian' : item.diet === 'non_veg' ? 'Non-Vegetarian' : 'Contains Egg'}
              </span>
            </div>
            <span className="text-lg font-bold tabular-nums text-accent">
              {formatRupees(item.price_paise)}
            </span>
          </div>

          {item.description && (
            <p className="text-sm text-ink leading-relaxed">
              {item.description}
            </p>
          )}

          {item.allergen_note && (
            <div className="p-3 rounded-[12px] glass border border-glass-border text-xs text-ink-muted">
              <strong className="text-ink">Allergen information:</strong> {item.allergen_note}
            </div>
          )}

          <div className="pt-4 border-t border-glass-border flex items-center justify-between">
            <span className="text-xs text-ink-muted">Quantity:</span>
            {!item.is_available ? (
              <span className="text-xs text-danger font-semibold">Unavailable today</span>
            ) : quantity > 0 ? (
              <Stepper
                quantity={quantity}
                onIncrement={() => addItem(item)}
                onDecrement={() => removeItem(item)}
                itemName={item.name}
              />
            ) : (
              <button
                type="button"
                onClick={() => addItem(item)}
                className="h-11 min-h-[44px] px-6 rounded-[12px] bg-accent text-accent-ink text-sm font-semibold hover:opacity-90 active:scale-95 transition-transform duration-100"
              >
                Add to order
              </button>
            )}
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
