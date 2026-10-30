"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, UtensilsCrossed, ShoppingBag, QrCode, Sparkles, ArrowRight } from "lucide-react";
import { MenuItem, CAFE_CONFIG } from "@/config/cafe";
import { setTableSessionByToken, setTakeawaySession } from "@/lib/session";
import { QrScannerModal } from "@/components/customer/QrScannerModal";

interface OrderContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: MenuItem | null;
}

export function OrderContextModal({
  isOpen,
  onClose,
  selectedItem,
}: OrderContextModalProps) {
  const router = useRouter();
  const [scannerOpen, setScannerOpen] = useState(false);

  if (!isOpen || !selectedItem) return null;

  const handleSelectTable = (qrToken: string) => {
    setTableSessionByToken(qrToken);
    onClose();
    router.push(`/order/${qrToken}?addItem=${encodeURIComponent(selectedItem.id)}`);
  };

  const handleSelectTakeaway = () => {
    setTakeawaySession();
    onClose();
    router.push(`/order/takeaway?addItem=${encodeURIComponent(selectedItem.id)}`);
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1B382B]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative z-10 w-full max-w-lg bg-[#FBF9F4] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E6E1D5] max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#E6E1D5] bg-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1B382B] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                  M
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#4E7A63] block">
                    Select Your Dining Experience
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#1B382B]">
                    Where are you seated today?
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F3EFE6] text-[#55635B] hover:text-[#1B382B] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Item Preview Pill */}
            <div className="px-5 py-3 bg-[#F3EFE6]/80 border-b border-[#E6E1D5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    selectedItem.isVeg ? "border-[#2D8A4E]" : "border-[#C44A3F]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      selectedItem.isVeg ? "bg-[#2D8A4E]" : "bg-[#C44A3F]"
                    }`}
                  />
                </span>
                <span className="text-xs font-semibold text-[#151E19]">
                  Adding: <span className="font-bold">{selectedItem.name}</span>
                </span>
              </div>
              <span className="text-xs font-bold text-[#1B382B] font-mono">
                {CAFE_CONFIG.fiscal.currencySymbol}{selectedItem.basePrice}
              </span>
            </div>

            {/* Content Scroll Area */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Option A: Dine-in Table Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#1B382B]">
                    <UtensilsCrossed className="w-4 h-4 text-[#4E7A63]" />
                    <h4 className="font-serif text-sm font-bold">
                      Dine-In: Select Table (1 to 10)
                    </h4>
                  </div>
                  <button
                    onClick={() => setScannerOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B382B] hover:text-[#4E7A63] underline cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan Stand QR</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {CAFE_CONFIG.tables.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => handleSelectTable(table.qrToken)}
                      className="p-2.5 rounded-xl bg-white border border-[#E6E1D5] hover:border-[#1B382B] hover:bg-[#1B382B] hover:text-white transition-all text-center group cursor-pointer shadow-2xs"
                    >
                      <span className="font-serif font-bold text-xs block group-hover:text-white text-[#1B382B]">
                        {table.label}
                      </span>
                      <span className="text-[10px] text-[#55635B] group-hover:text-[#8EBA9D] block font-mono">
                        {table.capacity}p
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#E6E1D5] w-full" />
                <span className="bg-[#FBF9F4] px-3 text-[10px] uppercase font-bold text-[#55635B] tracking-wider shrink-0">
                  Or
                </span>
              </div>

              {/* Option B: Counter Takeaway Pickup */}
              <div>
                <button
                  onClick={handleSelectTakeaway}
                  className="w-full p-4 rounded-2xl bg-white border border-[#E6E1D5] hover:border-[#C4623F] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C4623F]/10 text-[#C4623F] flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#151E19] group-hover:text-[#C4623F] transition-colors">
                        Self-Pickup Takeaway
                      </h4>
                      <p className="text-[11px] text-[#55635B]">
                        Order ahead and pick up directly at the barista counter
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#55635B] group-hover:translate-x-1 group-hover:text-[#C4623F] transition-all" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Embedded Camera Scanner if user chooses to scan stand */}
      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        pendingItemId={selectedItem?.id}
        onSelectTable={(token) => handleSelectTable(token)}
      />
    </>
  );
}
