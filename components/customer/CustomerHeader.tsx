"use client";

import Link from "next/link";
import { ArrowLeft, Search, UtensilsCrossed, ShoppingBag } from "lucide-react";
import { CAFE_CONFIG } from "@/config/cafe";

interface CustomerHeaderProps {
  orderType: "dine_in" | "takeaway";
  tableLabel?: string;
  tableToken?: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function CustomerHeader({
  orderType,
  tableLabel,
  tableToken,
  searchQuery,
  setSearchQuery,
}: CustomerHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F4]/95 backdrop-blur-md border-b border-[#E6E1D5] px-4 pt-3 pb-3">
      <div className="max-w-3xl mx-auto space-y-3">
        {/* Top identity bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="w-8 h-8 rounded-full bg-[#1B382B]/10 flex items-center justify-center text-[#1B382B] hover:bg-[#1B382B]/20 transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-serif text-base sm:text-lg font-bold text-[#1B382B] leading-tight">
                {CAFE_CONFIG.identity.name}
              </h1>
              <p className="text-[10px] text-[#55635B] uppercase tracking-wider font-medium">
                Pimpri-Chinchwad • Botanical Brews
              </p>
            </div>
          </div>

          {/* Table / Order Type Badge */}
          {orderType === "dine_in" ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B382B] text-white text-xs font-semibold shadow-sm">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#8EBA9D]" />
              <span>{tableLabel || "Dine-In"}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C4623F] text-white text-xs font-semibold shadow-sm">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Counter Takeaway</span>
            </div>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#55635B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coffee, toasts, bowls, pastries..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-[#E6E1D5] text-xs sm:text-sm text-[#151E19] placeholder:text-[#55635B]/60 focus:outline-none focus:border-[#4E7A63] focus:ring-1 focus:ring-[#4E7A63] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#55635B] hover:text-[#151E19]"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
