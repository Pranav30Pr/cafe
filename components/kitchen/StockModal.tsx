"use client";

import { useState, useEffect } from "react";
import { X, Check, AlertOctagon, RefreshCw } from "lucide-react";
import { CAFE_CONFIG, MenuItem } from "@/config/cafe";

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StockModal({ isOpen, onClose }: StockModalProps) {
  const [stockMap, setStockMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load local stock overrides
    try {
      const stored = localStorage.getItem("meeva_stock_overrides");
      if (stored) {
        setStockMap(JSON.parse(stored));
      } else {
        const initial: Record<string, boolean> = {};
        CAFE_CONFIG.menuItems.forEach((i) => {
          initial[i.id] = i.isAvailable;
        });
        setStockMap(initial);
      }
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (itemId: string) => {
    setStockMap((prev) => {
      const current = prev[itemId] !== false; // default true
      const updated = { ...prev, [itemId]: !current };
      try {
        localStorage.setItem("meeva_stock_overrides", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs p-0">
      <div className="w-full max-w-md h-full bg-[#121A15] border-l border-[#2D3E34] text-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#2D3E34] flex items-center justify-between bg-[#17221C]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#D99B52]">
              Kitchen Inventory
            </span>
            <h2 className="font-serif text-xl font-bold text-white">
              86 Out-of-Stock Items
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#8EBA9D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          <p className="text-xs text-[#8EBA9D] leading-relaxed">
            Toggle items currently unavailable in the kitchen. 86&apos;d items will immediately prevent customer ordering on all devices.
          </p>

          <div className="space-y-2 pt-2">
            {CAFE_CONFIG.menuItems.map((item) => {
              const isAvailable = stockMap[item.id] !== false;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#17221C] border border-[#2D3E34] flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {item.name}
                    </h4>
                    <span className="text-xs text-[#8EBA9D] font-mono">
                      ₹{item.basePrice}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggle(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isAvailable
                        ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50"
                        : "bg-[#E0533C]/30 text-red-300 border border-[#E0533C]/50"
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>In Stock</span>
                      </>
                    ) : (
                      <>
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>86&apos;d</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#2D3E34] bg-[#17221C]">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#C4623F] text-white text-xs font-bold hover:bg-[#A84E2E] transition-colors shadow"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
