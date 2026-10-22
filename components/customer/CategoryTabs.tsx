"use client";

import { CAFE_CONFIG, MenuCategory } from "@/config/cafe";

interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="sticky top-[105px] z-30 bg-[#FBF9F4]/95 backdrop-blur-md border-b border-[#E6E1D5] px-4 py-2.5">
      <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => onSelectCategory("all")}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeCategoryId === "all"
              ? "bg-[#1B382B] text-white shadow-sm"
              : "bg-white border border-[#E6E1D5] text-[#55635B] hover:border-[#4E7A63] hover:text-[#151E19]"
          }`}
        >
          All Items
        </button>

        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
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
    </div>
  );
}
