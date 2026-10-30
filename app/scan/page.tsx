"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { QrScannerModal } from "@/components/customer/QrScannerModal";
import { QrCode, ArrowLeft, Camera, Users, Sparkles, ShoppingBag, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { CAFE_CONFIG } from "@/config/cafe";
import { setTableSessionByToken } from "@/lib/session";

export default function ScanPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectTable = (qrToken: string) => {
    setTableSessionByToken(qrToken);
    router.push(`/order/${qrToken}`);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#151E19] flex flex-col selection:bg-[#8EBA9D] selection:text-[#1B382B]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full flex flex-col items-center">
        {/* Main Card */}
        <div className="w-full max-w-2xl p-6 sm:p-10 rounded-3xl bg-white border border-[#E6E1D5] shadow-xl space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[#1B382B] text-white flex items-center justify-center mx-auto shadow-md">
              <QrCode className="w-8 h-8 text-[#8EBA9D]" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E7A63] block">
              Dine-In Table Ordering
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1B382B]">
              Connect to Your Table
            </h1>
            <p className="text-xs sm:text-sm text-[#55635B] max-w-md mx-auto leading-relaxed">
              Scan the wooden/acrylic stand QR code on your table, or select your table number below to order directly to the kitchen.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid sm:grid-cols-2 gap-3.5">
            <button
              onClick={() => setModalOpen(true)}
              className="py-4 px-5 rounded-2xl bg-[#1B382B] text-white font-semibold text-sm flex items-center justify-center gap-2.5 hover:bg-[#12241C] shadow-md transition-all cursor-pointer group"
            >
              <Camera className="w-4 h-4 text-[#8EBA9D] group-hover:scale-110 transition-transform" />
              <span>Launch Live Camera Scanner</span>
            </button>

            <Link
              href="/order/takeaway"
              className="py-4 px-5 rounded-2xl border border-[#C4623F] text-[#C4623F] bg-[#FFFBF8] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#C4623F] hover:text-white transition-all shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Counter Takeaway Pickup</span>
            </Link>
          </div>

          {/* Direct Table Selector Grid */}
          <div className="space-y-4 pt-4 border-t border-[#E6E1D5]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1B382B]">
                <UtensilsCrossed className="w-4 h-4 text-[#4E7A63]" />
                <h3 className="font-serif text-base font-bold">
                  Or Pick Your Table Number Directly
                </h3>
              </div>
              <span className="text-[11px] text-[#55635B]">10 tables available</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {CAFE_CONFIG.tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleSelectTable(table.qrToken)}
                  className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#E6E1D5] hover:border-[#1B382B] hover:bg-[#1B382B] hover:text-white transition-all text-center group cursor-pointer shadow-2xs flex flex-col justify-between"
                >
                  <span className="font-serif font-bold text-sm block group-hover:text-white text-[#1B382B]">
                    {table.label}
                  </span>
                  <span className="text-[11px] text-[#55635B] group-hover:text-[#8EBA9D] block font-mono mt-1">
                    {table.capacity} Seats
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Stand Advice Tips */}
          <div className="p-4 rounded-2xl bg-[#F3EFE6]/70 border border-[#E6E1D5] text-xs text-[#55635B] space-y-1">
            <p className="font-semibold text-[#1B382B] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D99B52]" />
              <span>Did you know?</span>
            </p>
            <p>
              You don&apos;t need to install any app. Point your iPhone or Android camera at the QR code stand on your table, tap the banner, and you&apos;re instantly ready to order.
            </p>
          </div>

          {/* Footer Back Link */}
          <div className="pt-2 flex items-center justify-between text-xs text-[#55635B]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-[#1B382B] font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Cafe Home</span>
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="hover:text-[#1B382B] underline cursor-pointer"
            >
              QR Scanner Help & FAQ
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Interactive Scanner Modal */}
      <QrScannerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectTable={(token) => handleSelectTable(token)}
      />
    </div>
  );
}
