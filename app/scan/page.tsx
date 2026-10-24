"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { QrScannerModal } from "@/components/customer/QrScannerModal";
import { QrCode, ArrowLeft, Camera, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { CAFE_CONFIG } from "@/config/cafe";

export default function ScanPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#151E19] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex flex-col items-center justify-center text-center">
        {/* Card */}
        <div className="w-full max-w-lg p-8 rounded-3xl bg-white border border-[#E6E1D5] shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#1B382B] text-white flex items-center justify-center mx-auto shadow-md">
            <QrCode className="w-8 h-8 text-[#8EBA9D]" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E7A63]">
              Dine-In Table Ordering
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B382B]">
              Scan Table QR Code
            </h1>
            <p className="text-xs sm:text-sm text-[#55635B] max-w-sm mx-auto">
              Scan the acrylic stand QR code on your table to browse the menu and order directly to the kitchen.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-[#1B382B] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#12241C] shadow-md transition-all"
            >
              <Camera className="w-4 h-4 text-[#8EBA9D]" />
              <span>Launch Camera Scanner</span>
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-3 rounded-2xl border border-[#4E7A63] text-[#1B382B] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#F3EFE6] transition-all"
            >
              <Users className="w-4 h-4 text-[#4E7A63]" />
              <span>Or Select Table Number Directly</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#E6E1D5] flex items-center justify-between text-xs text-[#55635B]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-[#1B382B]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/order/takeaway"
              className="hover:text-[#1B382B] font-medium underline"
            >
              Takeaway Self-Pickup →
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      {/* Interactive Scanner Modal */}
      <QrScannerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
