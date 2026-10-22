"use client";

import { useState } from "react";
import { CAFE_CONFIG, MenuItem } from "@/config/cafe";
import { useCart } from "@/context/CartContext";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CategoryTabs } from "@/components/customer/CategoryTabs";
import { ItemCard } from "@/components/customer/ItemCard";
import { ItemCustomizerSheet } from "@/components/customer/ItemCustomizerSheet";
import { MiniCartBar } from "@/components/customer/MiniCartBar";
import { CartDrawer } from "@/components/customer/CartDrawer";

interface CustomerAppViewProps {
  orderType: "dine_in" | "takeaway";
  tableToken?: string;
  tableLabel?: string;
}

export function CustomerAppView({
  orderType,
  tableToken,
  tableLabel,
}: CustomerAppViewProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter items based on active category and search query
  const filteredItems = CAFE_CONFIG.menuItems.filter((item) => {
    const matchesCategory =
      activeCategoryId === "all" || item.categoryId === activeCategoryId;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col pb-24">
      {/* Header */}
      <CustomerHeader
        orderType={orderType}
        tableLabel={tableLabel}
        tableToken={tableToken}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Categories Bar */}
      <CategoryTabs
        categories={CAFE_CONFIG.categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
      />

      {/* Menu Catalog Section */}
      <main className="max-w-3xl mx-auto w-full px-4 pt-4 sm:pt-6 flex-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-[#55635B]">
            <p className="font-serif text-lg font-bold text-[#151E19]">
              No culinary items found
            </p>
            <p className="text-xs mt-1">Try modifying your search or selecting another category.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Elements */}
      <MiniCartBar />
      <ItemCustomizerSheet />
      <CartDrawer
        orderType={orderType}
        tableToken={tableToken}
        tableLabel={tableLabel}
      />
    </div>
  );
}
