"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CAFE_CONFIG, MenuItem } from "@/config/cafe";
import { useCart } from "@/context/CartContext";
import { setTableSessionByToken, setTakeawaySession } from "@/lib/session";
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

function AutoAddItemEffect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { addItem, setCustomizingItem } = useCart();
  const processedItemRef = useRef<string | null>(null);

  useEffect(() => {
    const addItemId = searchParams.get("addItem");
    if (addItemId && processedItemRef.current !== addItemId) {
      processedItemRef.current = addItemId;
      const targetItem = CAFE_CONFIG.menuItems.find((i) => i.id === addItemId);
      if (targetItem) {
        if (targetItem.optionGroups && targetItem.optionGroups.length > 0) {
          // Open customization sheet with options immediately
          setCustomizingItem(targetItem);
        } else {
          // Directly add to cart
          addItem(targetItem);
        }
      }
      // Clean query parameter from URL without page reload
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router, addItem, setCustomizingItem]);

  return null;
}

export function CustomerAppView({
  orderType,
  tableToken,
  tableLabel,
}: CustomerAppViewProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Keep client session synchronized
  useEffect(() => {
    if (orderType === "dine_in" && tableToken) {
      setTableSessionByToken(tableToken);
    } else if (orderType === "takeaway") {
      setTakeawaySession();
    }
  }, [orderType, tableToken]);

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
      {/* Auto add item handler with Suspense */}
      <Suspense fallback={null}>
        <AutoAddItemEffect />
      </Suspense>

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
