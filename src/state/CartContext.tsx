import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { MenuItem } from '../types';

const CART_STORAGE_KEY = 'cafe_cart';
const INSTRUCTIONS_STORAGE_KEY = 'cafe_cart_instructions';

export interface CartContextType {
  cart: Record<string, number>;
  cartItems: Array<{ item: MenuItem; quantity: number }>;
  totalItems: number;
  instructions: string;
  setInstructions: (note: string) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (item: MenuItem) => void;
  clearCart: () => void;
  toast: { message: string; undoAction?: () => void } | null;
  clearToast: () => void;
  liveAnnouncement: string;
  setAllMenuItems: (items: MenuItem[]) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode; initialItems?: MenuItem[] }> = ({
  children,
  initialItems = [],
}) => {
  const [cart, setCart] = useState<Record<string, number>>(() => {
    try {
      const stored = sessionStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [instructions, setInstructionsState] = useState<string>(() => {
    try {
      return sessionStorage.getItem(INSTRUCTIONS_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>(initialItems);
  const [itemsMap, setItemsMap] = useState<Record<string, MenuItem>>(() => {
    try {
      const stored = sessionStorage.getItem('cafe_cart_items_map');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (initialItems.length > 0) {
      setAllMenuItems(initialItems);
      setItemsMap((prev) => {
        const next = { ...prev };
        initialItems.forEach((it) => {
          next[it.id] = it;
        });
        return next;
      });
    }
  }, [initialItems]);

  const [toast, setToast] = useState<{ message: string; undoAction?: () => void } | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Persist cart to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  const setInstructions = (note: string) => {
    const trimmed = note.slice(0, 200);
    setInstructionsState(trimmed);
    try {
      sessionStorage.setItem(INSTRUCTIONS_STORAGE_KEY, trimmed);
    } catch {
      // Ignore
    }
  };

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const addItem = useCallback((item: MenuItem) => {
    setItemsMap((prev) => {
      const next = { ...prev, [item.id]: item };
      try {
        sessionStorage.setItem('cafe_cart_items_map', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });

    setCart((prev) => {
      const current = prev[item.id] || 0;
      if (current >= 20) return prev;
      const nextCount = current + 1;
      const total = Object.values(prev).reduce((a, b) => a + b, 0) + 1;
      setLiveAnnouncement(`Added ${item.name}. ${total} items in your order.`);
      return { ...prev, [item.id]: nextCount };
    });
  }, []);

  const removeItem = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const current = prev[item.id] || 0;
      if (current <= 0) return prev;

      if (current === 1) {
        const copy = { ...prev };
        delete copy[item.id];

        // Trigger undoable toast per UI_SPEC Section 5.2
        setToast({
          message: `Removed ${item.name}.`,
          undoAction: () => {
            setCart((c) => ({ ...c, [item.id]: 1 }));
            setToast(null);
            setLiveAnnouncement(`Restored ${item.name}.`);
          },
        });

        const total = Object.values(copy).reduce((a, b) => a + b, 0);
        setLiveAnnouncement(`Removed ${item.name}. ${total} items in your order.`);
        return copy;
      }

      const nextCount = current - 1;
      const total = Object.values(prev).reduce((a, b) => a + b, 0) - 1;
      setLiveAnnouncement(`Decreased ${item.name}. ${total} items in your order.`);
      return { ...prev, [item.id]: nextCount };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
    setInstructionsState('');
    try {
      sessionStorage.removeItem(CART_STORAGE_KEY);
      sessionStorage.removeItem(INSTRUCTIONS_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const totalItems = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, quantity]) => {
        const item = itemsMap[id] || allMenuItems.find((m) => m.id === id);
        return item ? { item, quantity } : null;
      })
      .filter((x): x is { item: MenuItem; quantity: number } => x !== null);
  }, [cart, itemsMap, allMenuItems]);


  const value = useMemo(
    () => ({
      cart,
      cartItems,
      totalItems,
      instructions,
      setInstructions,
      addItem,
      removeItem,
      clearCart,
      toast,
      clearToast,
      liveAnnouncement,
      setAllMenuItems,
    }),
    [cart, cartItems, totalItems, instructions, addItem, removeItem, clearCart, toast, clearToast, liveAnnouncement]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Polite live region for cart changes (UI_SPEC Section 10) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
