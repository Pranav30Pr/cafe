"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ArrowRight, User, Phone, FileText, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CAFE_CONFIG } from "@/config/cafe";
import { createMockOrder } from "@/lib/mockStore";

interface CartDrawerProps {
  orderType: "dine_in" | "takeaway";
  tableToken?: string;
  tableLabel?: string;
}

export function CartDrawer({ orderType, tableToken, tableLabel }: CartDrawerProps) {
  const router = useRouter();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    pricing,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    orderNotes,
    setOrderNotes,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handlePlaceOrder = async () => {
    setErrorMessage(null);

    // Validate customer contact capture
    if (!customerName.trim()) {
      setErrorMessage("Please enter your name to place the order.");
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Please provide a valid 10-digit mobile number for order updates.");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit to server API route for pricing verification & real-time broadcast
      const res = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType,
          tableToken,
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          notes: orderNotes.trim() || undefined,
          lineItems: items.map((i) => ({
            itemId: i.item.id,
            quantity: i.quantity,
            selectedOptionIds: i.selectedOptionIds,
          })),
        }),
      });

      let orderId: string;
      let orderNumber: number;

      if (res.ok) {
        const data = await res.json();
        orderId = data.order.id;
        orderNumber = data.order.orderNumber;
      } else {
        // Fallback local ID if offline
        orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        orderNumber = 101;
      }

      // 2. Persist locally for immediate offline/client cache
      createMockOrder({
        orderType,
        tableToken,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        notes: orderNotes.trim() || undefined,
        lineItems: items.map((i) => ({
          itemId: i.item.id,
          quantity: i.quantity,
          selectedOptionIds: i.selectedOptionIds,
        })),
        forcedId: orderId,
        forcedOrderNumber: orderNumber,
      });

      clearCart();
      setIsCartOpen(false);
      router.push(`/order/status/${orderId}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Drawer Sheet */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="relative z-10 w-full max-w-lg bg-[#FBF9F4] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E6E1D5] max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E6E1D5] bg-white flex items-center justify-between shrink-0">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#4E7A63] font-semibold">
                {orderType === "dine_in"
                  ? `${tableLabel || "Table Session"} Order`
                  : "Self-Pickup Takeaway"}
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1B382B]">
                Your Order Tray
              </h2>
            </div>
            <button
              type="button"
              id="close-cart-btn"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-[#F3EFE6] text-[#55635B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form wrapping scrollable content and sticky footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePlaceOrder();
            }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Scrollable Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1">
              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Line Items List */}
              {items.length === 0 ? (
                <div className="text-center py-8 text-[#55635B]">
                  <p className="text-sm font-medium">Your tray is empty.</p>
                  <p className="text-xs mt-1">Browse the menu to add botanical creations.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#55635B]">
                    Selected Items ({items.length})
                  </h4>

                  {items.map((cartItem) => (
                    <div
                      key={cartItem.key}
                      className="p-3.5 rounded-2xl bg-white border border-[#E6E1D5] flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-3 h-3 rounded border flex items-center justify-center ${
                              cartItem.item.isVeg ? "border-[#2D8A4E]" : "border-[#C44A3F]"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cartItem.item.isVeg ? "bg-[#2D8A4E]" : "bg-[#C44A3F]"
                              }`}
                            />
                          </span>
                          <h4 className="text-sm font-bold text-[#151E19]">
                            {cartItem.item.name}
                          </h4>
                        </div>

                        {cartItem.selectedOptionsSummary.length > 0 && (
                          <p className="text-[11px] text-[#4E7A63] mt-0.5 font-medium">
                            {cartItem.selectedOptionsSummary.join(", ")}
                          </p>
                        )}

                        <span className="text-xs font-semibold text-[#1B382B] mt-1 block font-mono">
                          {CAFE_CONFIG.fiscal.currencySymbol}{cartItem.unitPrice} each
                        </span>
                      </div>

                      {/* Stepper Buttons */}
                      <div className="flex items-center gap-2 bg-[#F3EFE6] rounded-xl p-1 border border-[#E6E1D5]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(cartItem.key, -1)}
                          className="w-7 h-7 rounded-lg bg-white text-[#151E19] flex items-center justify-center hover:bg-[#E6E1D5] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          {cartItem.quantity === 1 ? (
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <span className="w-6 text-center text-xs font-bold font-mono">
                          {cartItem.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(cartItem.key, 1)}
                          className="w-7 h-7 rounded-lg bg-white text-[#151E19] flex items-center justify-center hover:bg-[#E6E1D5] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Contact Details (Mandatory per architectural directives) */}
              <div className="p-4 rounded-2xl bg-white border border-[#E6E1D5] space-y-3">
                <div className="flex items-center gap-1.5 text-[#1B382B]">
                  <User className="w-4 h-4 text-[#4E7A63]" />
                  <h4 className="font-serif text-sm font-bold">Contact for Order & Receipt</h4>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] text-[#55635B] font-semibold block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="customer-name-input"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Avani Patel"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#FBF9F4] border border-[#E6E1D5] text-xs sm:text-sm text-[#151E19] focus:outline-none focus:border-[#1B382B]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#55635B] font-semibold block mb-1">
                      Mobile Phone (for digital WhatsApp bill & updates) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#55635B]">
                        +91
                      </span>
                      <input
                        type="tel"
                        id="customer-phone-input"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="9823012345"
                        className="w-full pl-11 pr-3 py-2.5 rounded-xl bg-[#FBF9F4] border border-[#E6E1D5] text-xs sm:text-sm text-[#151E19] font-mono focus:outline-none focus:border-[#1B382B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#55635B] font-semibold block mb-1">
                      Kitchen Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      id="customer-notes-input"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Extra hot flat white, dressing on side"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#FBF9F4] border border-[#E6E1D5] text-xs sm:text-sm text-[#151E19] focus:outline-none focus:border-[#1B382B]"
                    />
                  </div>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="p-4 rounded-2xl bg-[#F3EFE6] border border-[#E6E1D5] space-y-2 text-xs">
                <div className="flex justify-between text-[#55635B]">
                  <span>Items Subtotal</span>
                  <span className="font-mono">{CAFE_CONFIG.fiscal.currencySymbol}{pricing.subtotal}</span>
                </div>
                <div className="flex justify-between text-[#55635B]">
                  <span>GST Tax (0% Default)</span>
                  <span className="font-mono">{CAFE_CONFIG.fiscal.currencySymbol}{pricing.taxAmount}</span>
                </div>
                <div className="pt-2 border-t border-[#E6E1D5] flex justify-between text-sm font-bold text-[#151E19]">
                  <span>Grand Total</span>
                  <span className="font-mono text-base text-[#1B382B]">
                    {CAFE_CONFIG.fiscal.currencySymbol}{pricing.grandTotal}
                  </span>
                </div>
                <p className="text-[10px] text-[#55635B] text-center pt-1 italic">
                  * Settle bill at cafe counter via UPI, Cash, or Card upon completion.
                </p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 sm:p-5 border-t border-[#E6E1D5] bg-white pb-safe shrink-0">
              <button
                type="submit"
                id="place-order-btn"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#C4623F] text-white text-sm font-semibold hover:bg-[#A84E2E] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Submitting to Kitchen...</span>
                ) : (
                  <>
                    <span>Place Order • {CAFE_CONFIG.fiscal.currencySymbol}{pricing.grandTotal}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
