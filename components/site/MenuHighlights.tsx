"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Plus } from "lucide-react";
import { CAFE_CONFIG, MenuItem } from "@/config/cafe";

export function MenuHighlights() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "All Signatures" },
    ...CAFE_CONFIG.categories,
  ];

  const filteredItems =
    selectedCategory === "all"
      ? CAFE_CONFIG.menuItems
      : CAFE_CONFIG.menuItems.filter((i) => i.categoryId === selectedCategory);

  return (
    <section id="highlights" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE6] text-[#4E7A63] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#D99B52]" />
          <span>Curated Offerings</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B382B]">
          Handcrafted with pure intent
        </h2>
        <p className="text-sm sm:text-base text-[#55635B]">
          Explore a selection of our most cherished botanical drinks, slow toasts, and superfood bowls.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap pb-2 mb-8 no-scrollbar scroll-smooth justify-start sm:justify-center">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#1B382B] text-white shadow-sm"
                  : "bg-white border border-[#E6E1D5] text-[#55635B] hover:border-[#4E7A63] hover:text-[#151E19]"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Menu Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-3xl bg-white border border-[#E6E1D5] p-5 flex flex-col justify-between hover:shadow-lg hover:border-[#4E7A63]/50 transition-all duration-300"
          >
            <div>
              {/* Badges strip */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  {/* Veg / Non-Veg Indicator */}
                  <span
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      item.isVeg
                        ? "border-[#2D8A4E] text-[#2D8A4E]"
                        : "border-[#C44A3F] text-[#C44A3F]"
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

              {/* Title & Description */}
              <h3 className="font-serif text-lg font-bold text-[#1B382B] group-hover:text-[#C4623F] transition-colors">
                {item.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#55635B] mt-1.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Price & Action Footer */}
            <div className="pt-4 mt-4 border-t border-[#F3EFE6] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#55635B]">Price</span>
                <p className="font-serif text-lg font-bold text-[#151E19]">
                  {CAFE_CONFIG.fiscal.currencySymbol}{item.basePrice}
                </p>
              </div>

              <Link
                href="/order/token-mg-t01-dinein"
                className="inline-flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#F3EFE6] text-[#1B382B] group-hover:bg-[#1B382B] group-hover:text-white transition-all"
              >
                <span>Order</span>
                <Plus className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Full Menu Call to Action Banner */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#1B382B] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-xl sm:text-2xl font-bold">
            Ready to explore our complete culinary menu?
          </h3>
          <p className="text-xs sm:text-sm text-[#8EBA9D]">
            Scan at your table or start a live ordering session directly on your phone.
          </p>
        </div>
        <Link
          href="/order/token-mg-t01-dinein"
          className="whitespace-nowrap px-6 py-3 rounded-full bg-[#C4623F] text-white text-xs sm:text-sm font-semibold hover:bg-[#A84E2E] shadow-md transition-all flex items-center gap-2"
        >
          <span>Open Digital Menu (Demo Table 1)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
