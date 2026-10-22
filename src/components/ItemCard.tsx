import React, { useState } from 'react';
import { MenuItem } from '../types';
import { formatRupees } from '../utils/formatters';
import { DietMarker } from './DietMarker';
import { BottomSheet } from './BottomSheet';
import { useCart } from '../state/CartContext';

interface ItemCardProps {
  item: MenuItem;
}

export const getItemMacros = (item: MenuItem) => {
  const name = item.name.toLowerCase();
  if (name.includes('chicken')) {
    return { prot: '44g Protein', cal: '380 kcal', note: 'High Protein', badge: 'Best Seller' };
  }
  if (name.includes('tofu') || name.includes('avocado')) {
    return { prot: '26g Protein', cal: '320 kcal', note: 'Keto Friendly', badge: 'Chef Special' };
  }
  if (name.includes('eggs')) {
    return { prot: '22g Protein', cal: '340 kcal', note: 'Slow Carbs', badge: 'Popular' };
  }
  if (name.includes('peanut butter') || name.includes('whey')) {
    return { prot: '32g Protein', cal: '280 kcal', note: 'Whey Isolate', badge: 'Must Try' };
  }
  if (name.includes('energy') || name.includes('balls')) {
    return { prot: '24g Protein', cal: '190 kcal', note: 'Pre-Workout', badge: 'Best Seller' };
  }
  if (name.includes('edamame')) {
    return { prot: '18g Protein', cal: '140 kcal', note: 'High Fiber', badge: 'Healthy Snack' };
  }
  if (name.includes('sweet potato')) {
    return { prot: '6g Protein', cal: '210 kcal', note: 'Clean Carbs', badge: 'Chef Special' };
  }
  if (name.includes('detox') || name.includes('smoothie')) {
    return { prot: '8g Protein', cal: '160 kcal', note: 'Antioxidant', badge: 'Cold-Pressed' };
  }
  if (name.includes('espresso')) {
    return { prot: '0g Sugar', cal: '5 kcal', note: 'Pre-Workout', badge: 'Single Origin' };
  }
  if (name.includes('coconut')) {
    return { prot: '0g Fat', cal: '45 kcal', note: 'Hydration', badge: 'Natural Hydra' };
  }
  return { prot: 'Clean Fuel', cal: 'Nutrient Dense', note: 'Healthy', badge: null };
};

const FALLBACK_DISH_IMAGES: Record<string, string> = {
  espresso: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=400&q=80',
  edamame: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
  energy: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80',
  potato: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80',
  chicken: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
  tofu: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
  eggs: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80',
  smoothie: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=400&q=80',
  shake: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=400&q=80',
  coconut: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80',
  pesto: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80',
  butter: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80',
  chai: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80',
  tea: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80',
  toast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80',
  cappuccino: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=400&q=80',
  coffee: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=400&q=80',
  default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
};

export const getDishImageUrl = (item: MenuItem): string => {
  if (item.image_path && item.image_path.trim().length > 10) return item.image_path;
  const name = item.name.toLowerCase();
  for (const [key, url] of Object.entries(FALLBACK_DISH_IMAGES)) {
    if (name.includes(key)) return url;
  }
  return item.diet === 'non_veg'
    ? FALLBACK_DISH_IMAGES.chicken
    : item.diet === 'egg'
    ? FALLBACK_DISH_IMAGES.eggs
    : FALLBACK_DISH_IMAGES.default;
};


export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const { cart, addItem, removeItem } = useCart();
  const [sheetOpen, setSheetOpen] = useState(false);
  const quantity = cart[item.id] || 0;
  const macros = getItemMacros(item);
  const dishImage = getDishImageUrl(item);

  return (
    <>
      <article
        className={`py-4 border-b border-[#F1F5F9] last:border-b-0 flex items-start justify-between gap-3.5 transition-colors relative ${
          !item.is_available ? 'opacity-60 grayscale-[40%]' : ''
        }`}
      >
        {/* Left Column: Food info and nutritional tags (Swiggy / Zomato layout) */}
        <div className="flex-1 min-w-0 pr-1">
          {/* Diet Marker + Optional Bestseller Badge */}
          <div className="flex items-center gap-2 mb-1">
            <DietMarker diet={item.diet} />
            {macros.badge && (
              <span className="px-1.5 py-0.5 rounded-[4px] bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold tracking-tight">
                {macros.badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => setSheetOpen(true)}
            className="font-bold text-[15px] text-[#0F172A] leading-snug cursor-pointer hover:text-[#15803D] transition-colors"
          >
            {item.name}
          </h3>

          {/* Price */}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-extrabold text-[15px] text-[#0F172A] tabular-nums">
              {formatRupees(item.price_paise)}
            </span>
          </div>

          {/* High-Protein & Nutrition Badges */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]">
              {macros.prot}
            </span>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
              {macros.cal}
            </span>
            <span className="text-[#94A3B8]">•</span>
            <span className="text-[#64748B] font-semibold">{macros.note}</span>
          </div>

          {/* Description */}
          {item.description && (
            <p
              onClick={() => setSheetOpen(true)}
              className="mt-1.5 text-xs text-[#64748B] line-clamp-2 leading-relaxed cursor-pointer hover:text-[#334155]"
            >
              {item.description}
            </p>
          )}
        </div>

        {/* Right Column: Dish Photo & Iconic Swiggy/Zomato ADD Button */}
        <div className="flex-shrink-0 flex flex-col items-center relative">
          <div
            onClick={() => setSheetOpen(true)}
            className="w-[116px] h-[96px] rounded-[6px] overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer relative shadow-sm"
          >
            <img
              src={dishImage}
              alt={item.image_alt || item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Graceful fallback to default healthy food image if network fails
                (e.currentTarget as HTMLImageElement).src = FALLBACK_DISH_IMAGES.default;
              }}
            />
          </div>

          {/* Action Button: Swiggy/Zomato ADD button overlapping image */}
          <div className="-mt-3.5 z-10">
            {!item.is_available ? (
              <span className="px-2.5 py-1 rounded-[4px] bg-slate-100 border border-slate-300 text-[10px] font-bold text-red-600 block shadow-sm">
                Sold Out
              </span>
            ) : quantity > 0 ? (
              <div
                className="w-[96px] h-8 rounded-[6px] bg-[#15803D] text-white shadow-md flex items-center justify-between px-2 font-bold select-none"
                role="group"
                aria-label={`Quantity for ${item.name}`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item);
                  }}
                  aria-label={`Decrease ${item.name}`}
                  className="w-6 h-6 rounded-[4px] flex items-center justify-center text-white hover:bg-[#166534] active:scale-95 transition-all text-sm font-bold"
                >
                  −
                </button>
                <span className="text-xs font-bold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(item);
                  }}
                  aria-label={`Increase ${item.name}`}
                  className="w-6 h-6 rounded-[4px] flex items-center justify-center text-white hover:bg-[#166534] active:scale-95 transition-all text-sm font-bold"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addItem(item);
                }}
                className="w-[96px] h-8 rounded-[6px] bg-white border border-[#15803D] text-[#15803D] hover:bg-[#ECFDF5] shadow-md font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all"
                aria-label={`Add ${item.name}`}
              >
                <span>ADD</span>
                <span className="text-sm font-black leading-none">+</span>
              </button>
            )}
          </div>

          <span
            onClick={() => setSheetOpen(true)}
            className="text-[10px] text-slate-400 mt-1 select-none cursor-pointer hover:text-slate-600 font-medium"
          >
            customisable
          </span>
        </div>
      </article>


      {/* Item Detail Bottom Sheet (Swiggy / Zomato Customization Sheet) */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={item.name}
      >
        <div className="space-y-4 text-[#0F172A]">
          {item.image_path && (
            <div className="w-full h-48 rounded-[6px] overflow-hidden bg-slate-100 border border-slate-200">
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
              <span className="text-xs font-semibold text-[#64748B]">
                {item.diet === 'veg' ? 'Pure Vegetarian' : item.diet === 'non_veg' ? 'Non-Vegetarian' : 'Contains Egg'}
              </span>
            </div>
            <span className="text-lg font-bold tabular-nums text-[#0F172A]">
              {formatRupees(item.price_paise)}
            </span>
          </div>

          {/* Nutrition Callout Cards */}
          <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-around text-center">
            <div>
              <span className="block text-[#15803D] font-bold text-sm tabular-nums">{macros.prot}</span>
              <span className="text-[10px] text-[#64748B] uppercase font-semibold">Protein</span>
            </div>
            <div className="w-px h-6 bg-[#E2E8F0]" />
            <div>
              <span className="block text-[#0F172A] font-bold text-sm tabular-nums">{macros.cal}</span>
              <span className="text-[10px] text-[#64748B] uppercase font-semibold">Calories</span>
            </div>
            <div className="w-px h-6 bg-[#E2E8F0]" />
            <div>
              <span className="block text-[#059669] font-bold text-sm">{macros.note}</span>
              <span className="text-[10px] text-[#64748B] uppercase font-semibold">Benefit</span>
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-[#475569] leading-relaxed">
              {item.description}
            </p>
          )}

          {item.allergen_note && (
            <div className="p-3 rounded-[6px] bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E]">
              <strong className="text-[#78350F]">Allergen note:</strong> {item.allergen_note}
            </div>
          )}

          {/* Sticky Bottom Add Section */}
          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#64748B] uppercase font-semibold">Item Total</span>
              <span className="text-base font-bold text-[#0F172A] tabular-nums">
                {formatRupees(item.price_paise * (quantity > 0 ? quantity : 1))}
              </span>
            </div>

            {!item.is_available ? (
              <span className="text-xs text-red-600 font-bold">Unavailable today</span>
            ) : quantity > 0 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="w-10 h-10 rounded-[6px] border border-[#15803D] text-[#15803D] font-bold text-base flex items-center justify-center hover:bg-[#ECFDF5]"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-sm text-[#0F172A] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => addItem(item)}
                  className="w-10 h-10 rounded-[6px] bg-[#15803D] text-white font-bold text-base flex items-center justify-center hover:bg-[#166534]"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addItem(item)}
                className="h-11 px-7 rounded-[6px] bg-[#15803D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#166534] active:scale-95 transition-transform"
              >
                Add Item to Order
              </button>
            )}
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
