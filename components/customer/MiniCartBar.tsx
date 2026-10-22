"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CAFE_CONFIG } from "@/config/cafe";

export function MiniCartBar() {
  const { totalItemsCount, pricing, setIsCartOpen, isCartOpen } = useCart();

  if (totalItemsCount === 0 || isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none pb-safe">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="max-w-md mx-auto pointer-events-auto"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full p-4 rounded-2xl bg-[#1B382B] text-white shadow-2xl flex items-center justify-between hover:bg-[#12241C] transition-all border border-[#4E7A63]/30 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                <ShoppingBag className="w-5 h-5 text-[#8EBA9D]" />
              </div>
              <div className="text-left">
                <span className="text-[11px] text-[#8EBA9D] uppercase tracking-wider font-semibold block">
                  {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"} in Cart
                </span>
                <span className="font-serif text-lg font-bold text-white">
                  {CAFE_CONFIG.fiscal.currencySymbol}{pricing.grandTotal}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold bg-[#C4623F] text-white px-4 py-2 rounded-xl group-hover:bg-[#A84E2E] transition-colors shadow">
              <span>View Order</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
