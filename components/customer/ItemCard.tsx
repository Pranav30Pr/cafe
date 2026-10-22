"use client";

import { Plus, Sparkles, SlidersHorizontal } from "lucide-react";
import { MenuItem, CAFE_CONFIG } from "@/config/cafe";
import { useCart } from "@/context/CartContext";

interface ItemCardProps {
  item: MenuItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const { addItem, items, setCustomizingItem } = useCart();

  // Calculate total quantity of this item across all modifier variants in cart
  const itemCartQuantity = items
    .filter((ci) => ci.item.id === item.id)
    .reduce((sum, ci) => sum + ci.quantity, 0);

  const hasOptions = Boolean(item.optionGroups && item.optionGroups.length > 0);

  const handleAddClick = () => {
    if (hasOptions) {
      setCustomizingItem(item);
    } else {
      addItem(item);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E6E1D5] p-4 sm:p-5 flex flex-col justify-between hover:border-[#4E7A63]/50 transition-all shadow-sm">
      <div>
        {/* Top Indicators */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            {/* Veg / Non-Veg Standard Marker */}
            <span
              className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                item.isVeg ? "border-[#2D8A4E]" : "border-[#C44A3F]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  item.isVeg ? "bg-[#2D8A4E]" : "bg-[#C44A3F]"
                }`}
              />
            </span>

            {item.isVegan && (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#4E7A63]/10 text-[#4E7A63]">
                Vegan
              </span>
            )}
          </div>

          {item.isChefSpecial && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#D99B52]/15 text-[#A86E20] flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Special
            </span>
          )}
        </div>

        {/* Name & Description */}
        <h3 className="font-serif text-base sm:text-lg font-bold text-[#1B382B] leading-snug">
          {item.name}
        </h3>
        <p className="text-xs text-[#55635B] mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Price & Action Button Footer */}
      <div className="pt-3.5 mt-3 border-t border-[#F3EFE6] flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#55635B] block -mb-0.5">Price</span>
          <span className="font-serif text-base sm:text-lg font-bold text-[#151E19]">
            {CAFE_CONFIG.fiscal.currencySymbol}{item.basePrice}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasOptions && (
            <button
              onClick={() => setCustomizingItem(item)}
              className="text-[11px] text-[#4E7A63] hover:text-[#1B382B] font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#F3EFE6] transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Options</span>
            </button>
          )}

          <button
            onClick={handleAddClick}
            className={`min-h-[36px] px-4 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              itemCartQuantity > 0
                ? "bg-[#1B382B] text-white"
                : "bg-[#F3EFE6] text-[#1B382B] hover:bg-[#1B382B] hover:text-white"
            }`}
          >
            <span>ADD</span>
            {itemCartQuantity > 0 ? (
              <span className="w-4 h-4 rounded-full bg-[#C4623F] text-white text-[10px] flex items-center justify-center font-bold">
                {itemCartQuantity}
              </span>
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
