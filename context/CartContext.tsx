"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MenuItem, CAFE_CONFIG } from "@/config/cafe";
import { calculateOrderPricing, PriceCalculationResult } from "@/lib/pricing";

export interface CartItem {
  key: string;
  item: MenuItem;
  quantity: number;
  selectedOptionIds: string[];
  selectedOptionsSummary: string[];
  unitPrice: number;
  itemTotal: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, selectedOptionIds?: string[]) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  customizingItem: MenuItem | null;
  setCustomizingItem: (item: MenuItem | null) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  totalItemsCount: number;
  pricing: PriceCalculationResult;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // Load saved customer details from localStorage for repeat visits
  useEffect(() => {
    try {
      const savedName = localStorage.getItem("meeva_cust_name");
      const savedPhone = localStorage.getItem("meeva_cust_phone");
      if (savedName) setCustomerName(savedName);
      if (savedPhone) setCustomerPhone(savedPhone);
    } catch {}
  }, []);

  const buildCartKey = (itemId: string, optionIds: string[]) => {
    const sorted = [...optionIds].sort().join(",");
    return `${itemId}_${sorted}`;
  };

  const addItem = (item: MenuItem, selectedOptionIds: string[] = []) => {
    // Check if item has required option groups or options available
    if (item.optionGroups && item.optionGroups.length > 0 && selectedOptionIds.length === 0) {
      setCustomizingItem(item);
      return;
    }

    const key = buildCartKey(item.id, selectedOptionIds);

    // Calculate option cost & names
    let optionCost = 0;
    const optionNames: string[] = [];
    if (item.optionGroups && selectedOptionIds.length > 0) {
      for (const optId of selectedOptionIds) {
        for (const grp of item.optionGroups) {
          const opt = grp.options.find((o) => o.id === optId);
          if (opt) {
            optionCost += opt.priceDelta;
            optionNames.push(opt.name);
          }
        }
      }
    }

    const unitPrice = item.basePrice + optionCost;

    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key
            ? {
                ...i,
                quantity: i.quantity + 1,
                itemTotal: (i.quantity + 1) * unitPrice,
              }
            : i
        );
      } else {
        return [
          ...prev,
          {
            key,
            item,
            quantity: 1,
            selectedOptionIds,
            selectedOptionsSummary: optionNames,
            unitPrice,
            itemTotal: unitPrice,
          },
        ];
      }
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateQuantity = (key: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((i) => {
          if (i.key === key) {
            const nextQty = i.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...i,
              quantity: nextQty,
              itemTotal: nextQty * i.unitPrice,
            };
          }
          return i;
        })
        .filter((i): i is CartItem => i !== null);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Compute pricing through authoritative pricing engine
  const pricing = calculateOrderPricing(
    items.map((i) => ({
      itemId: i.item.id,
      quantity: i.quantity,
      selectedOptionIds: i.selectedOptionIds,
    }))
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        customizingItem,
        setCustomizingItem,
        customerName,
        setCustomerName: (name: string) => {
          setCustomerName(name);
          try {
            localStorage.setItem("meeva_cust_name", name);
          } catch {}
        },
        customerPhone,
        setCustomerPhone: (phone: string) => {
          setCustomerPhone(phone);
          try {
            localStorage.setItem("meeva_cust_phone", phone);
          } catch {}
        },
        orderNotes,
        setOrderNotes,
        totalItemsCount,
        pricing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
