"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, UtensilsCrossed, ShoppingBag, ChevronDown, RefreshCw, X, QrCode } from "lucide-react";
import { CAFE_CONFIG } from "@/config/cafe";
import { setTableSessionByToken, setTakeawaySession } from "@/lib/session";
import { QrScannerModal } from "@/components/customer/QrScannerModal";

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
  const router = useRouter();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleSwitchTable = (token: string) => {
    setTableSessionByToken(token);
    setSwitcherOpen(false);
    router.push(`/order/${token}`);
  };

  const handleSwitchTakeaway = () => {
    setTakeawaySession();
    setSwitcherOpen(false);
    router.push("/order/takeaway");
  };

  return (
    <>
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

            {/* Interactive Table / Order Type Badge */}
            <button
              onClick={() => setSwitcherOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer hover:opacity-90 ${
                orderType === "dine_in"
                  ? "bg-[#1B382B] text-white"
                  : "bg-[#C4623F] text-white"
              }`}
              title="Click to switch table or switch between Dine-in & Takeaway"
            >
              {orderType === "dine_in" ? (
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#8EBA9D]" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" />
              )}
              <span>{orderType === "dine_in" ? tableLabel || "Dine-In" : "Takeaway"}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#55635B] hover:text-[#151E19] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Table / Dining Switcher Modal */}
      {switcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSwitcherOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-md bg-[#FBF9F4] rounded-3xl p-6 border border-[#E6E1D5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D5]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1B382B]">
                  Change Table or Mode
                </h3>
                <p className="text-xs text-[#55635B]">
                  Currently ordering for: <span className="font-bold text-[#151E19]">{orderType === "dine_in" ? tableLabel : "Counter Takeaway"}</span>
                </p>
              </div>
              <button
                onClick={() => setSwitcherOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F3EFE6] text-[#55635B] hover:text-[#151E19] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dine-In Tables */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1B382B] uppercase tracking-wider">
                  Dine-In Tables
                </span>
                <button
                  onClick={() => {
                    setSwitcherOpen(false);
                    setScannerOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-[#4E7A63] font-semibold underline cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan Stand QR</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {CAFE_CONFIG.tables.map((table) => {
                  const isCurrent = table.qrToken === tableToken;
                  return (
                    <button
                      key={table.id}
                      onClick={() => handleSwitchTable(table.qrToken)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#1B382B] text-white border-[#1B382B]"
                          : "bg-white border-[#E6E1D5] text-[#151E19] hover:border-[#1B382B]"
                      }`}
                    >
                      <span className="font-serif font-bold text-xs">{table.label}</span>
                      <span className={`text-[10px] font-mono ${isCurrent ? "text-[#8EBA9D]" : "text-[#55635B]"}`}>
                        {table.capacity}p
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Takeaway Option */}
            <div className="pt-2 border-t border-[#E6E1D5]">
              <button
                onClick={handleSwitchTakeaway}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  orderType === "takeaway"
                    ? "bg-[#C4623F] text-white border-[#C4623F]"
                    : "bg-white border-[#E6E1D5] text-[#151E19] hover:border-[#C4623F]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-xs font-bold">Switch to Counter Takeaway</span>
                </div>
                <span className="text-xs font-mono">Pickup &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner */}
      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSelectTable={(token) => handleSwitchTable(token)}
      />
    </>
  );
}
