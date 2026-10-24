"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles, MapPin, Clock, QrCode } from "lucide-react";
import { CAFE_CONFIG } from "@/config/cafe";
import { QrScannerModal } from "@/components/customer/QrScannerModal";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FBF9F4]/90 backdrop-blur-md border-b border-[#E6E1D5] transition-all">
      {/* Top micro-announcement bar */}
      <div className="bg-[#1B382B] text-[#8EBA9D] text-[11px] sm:text-xs py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#D99B52]" />
        <span>Pimpri-Chinchwad&apos;s Botanical Cafe & Specialty Coffee Sanctuary</span>
        <span className="hidden md:inline text-white/40">•</span>
        <span className="hidden md:inline text-white/80">Tue–Sun: 8:00 AM – 10:30 PM</span>
      </div>

      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1B382B] text-[#FBF9F4] flex items-center justify-center font-serif text-xl font-bold shadow-sm transition-transform group-hover:scale-105">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#1B382B]">
              {CAFE_CONFIG.identity.name}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#4E7A63] font-semibold -mt-1">
              Botanical Cafe & Brews
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#151E19]">
          <Link href="#story" className="hover:text-[#4E7A63] transition-colors">
            Our Story
          </Link>
          <Link href="#highlights" className="hover:text-[#4E7A63] transition-colors">
            Menu Highlights
          </Link>
          <Link href="#gallery" className="hover:text-[#4E7A63] transition-colors">
            The Space
          </Link>
          <Link href="#hours-location" className="hover:text-[#4E7A63] transition-colors">
            Hours & Location
          </Link>
        </div>

        {/* Desktop Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/order/takeaway"
            className="px-4 py-2 rounded-full border border-[#4E7A63] text-[#1B382B] text-xs font-semibold hover:bg-[#F3EFE6] transition-colors"
          >
            Takeaway
          </Link>
          <button
            onClick={() => setScannerOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1B382B] text-white text-xs font-semibold shadow hover:bg-[#12241C] transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-[#8EBA9D]" />
            <span>Scan Table QR</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-[#1B382B] hover:bg-[#F3EFE6] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FBF9F4] border-b border-[#E6E1D5] px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3 text-base font-medium text-[#151E19]">
            <Link
              href="#story"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#4E7A63]"
            >
              Our Story
            </Link>
            <Link
              href="#highlights"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#4E7A63]"
            >
              Menu Highlights
            </Link>
            <Link
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#4E7A63]"
            >
              The Space
            </Link>
            <Link
              href="#hours-location"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#4E7A63]"
            >
              Hours & Location
            </Link>
          </div>

          <div className="pt-4 border-t border-[#E6E1D5] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setScannerOpen(true);
              }}
              className="w-full text-center py-3 rounded-xl bg-[#1B382B] text-white font-medium text-sm shadow flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4 text-[#8EBA9D]" />
              <span>Scan Table QR Code</span>
            </button>
            <Link
              href="/order/takeaway"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-[#4E7A63] text-[#1B382B] font-medium text-sm"
            >
              Counter Takeaway Pickup
            </Link>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
    </header>
  );
}
