"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles } from "lucide-react";
import { MenuItem, CAFE_CONFIG } from "@/config/cafe";
import { useCart } from "@/context/CartContext";

export function ItemCustomizerSheet() {
  const { customizingItem, setCustomizingItem, addItem } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  // Reset or initialize default options when customizingItem changes
  useEffect(() => {
    if (customizingItem && customizingItem.optionGroups) {
      const defaults: Record<string, string[]> = {};
      for (const group of customizingItem.optionGroups) {
        if (group.required && group.options.length > 0) {
          defaults[group.id] = [group.options[0].id];
        } else {
          defaults[group.id] = [];
        }
      }
      setSelectedOptions(defaults);
    } else {
      setSelectedOptions({});
    }
  }, [customizingItem]);

  if (!customizingItem) return null;

  const handleOptionToggle = (
    groupId: string,
    optionId: string,
    isRequired: boolean
  ) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];

      if (isRequired) {
        // Radio behavior: exactly one must be selected
        return {
          ...prev,
          [groupId]: [optionId],
        };
      } else {
        // Checkbox toggle behavior
        const exists = current.includes(optionId);
        const updated = exists
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return {
          ...prev,
          [groupId]: updated,
        };
      }
    });
  };

  // Flatten all selected option IDs
  const allSelectedOptionIds = Object.values(selectedOptions).flat();

  // Compute calculated unit price
  let totalDelta = 0;
  if (customizingItem.optionGroups) {
    for (const optId of allSelectedOptionIds) {
      for (const group of customizingItem.optionGroups) {
        const match = group.options.find((o) => o.id === optId);
        if (match) {
          totalDelta += match.priceDelta;
        }
      }
    }
  }

  const finalUnitPrice = customizingItem.basePrice + totalDelta;

  const handleConfirm = () => {
    addItem(customizingItem, allSelectedOptionIds);
    setCustomizingItem(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCustomizingItem(null)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Sheet Drawer */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="relative z-10 w-full max-w-lg bg-[#FBF9F4] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E6E1D5] max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E6E1D5] bg-white flex items-center justify-between shrink-0">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#4E7A63] font-semibold">
                Customize Recipe
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1B382B]">
                {customizingItem.name}
              </h2>
            </div>
            <button
              type="button"
              id="close-customizer-btn"
              onClick={() => setCustomizingItem(null)}
              className="p-2 rounded-full hover:bg-[#F3EFE6] text-[#55635B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form container */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Option Groups Scroll Area */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {customizingItem.optionGroups &&
                customizingItem.optionGroups.map((group) => {
                  const groupSelected = selectedOptions[group.id] || [];

                  return (
                    <div key={group.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-sm font-bold text-[#151E19]">
                          {group.name}
                        </h4>
                        <span className="text-[11px] text-[#55635B]">
                          {group.required ? (
                            <span className="text-[#C4623F] font-medium">Required (Choose 1)</span>
                          ) : (
                            "Optional"
                          )}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {group.options.map((opt) => {
                          const isChecked = groupSelected.includes(opt.id);

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() =>
                                handleOptionToggle(group.id, opt.id, group.required)
                              }
                              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                                isChecked
                                  ? "bg-white border-[#1B382B] shadow-sm"
                                  : "bg-white/60 border-[#E6E1D5] hover:border-[#8EBA9D]"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                    isChecked
                                      ? "bg-[#1B382B] border-[#1B382B] text-white"
                                      : "border-[#E6E1D5]"
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3" />}
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-[#151E19]">
                                  {opt.name}
                                </span>
                              </div>

                              <span className="text-xs font-semibold text-[#55635B]">
                                {opt.priceDelta > 0
                                  ? `+${CAFE_CONFIG.fiscal.currencySymbol}${opt.priceDelta}`
                                  : "Included"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Action Footer */}
            <div className="p-4 sm:p-5 border-t border-[#E6E1D5] bg-white flex items-center justify-between gap-4 pb-safe shrink-0">
              <div>
                <span className="text-[11px] text-[#55635B] block">Total Item Price</span>
                <span className="font-serif text-xl font-bold text-[#1B382B]">
                  {CAFE_CONFIG.fiscal.currencySymbol}{finalUnitPrice}
                </span>
              </div>

              <button
                type="submit"
                id="add-customized-order-btn"
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#1B382B] text-white text-xs sm:text-sm font-semibold hover:bg-[#12241C] shadow-md transition-all text-center cursor-pointer"
              >
                Add to Order
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
