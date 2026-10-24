"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, QrCode, ShoppingBag, Coffee, Sparkles } from "lucide-react";
import { CAFE_CONFIG } from "@/config/cafe";
import { QrScannerModal } from "@/components/customer/QrScannerModal";

export function Hero() {
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EFE6] border border-[#E6E1D5] text-[#1B382B] text-xs font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#2D8A4E] animate-pulse" />
              <span>Specialty Coffee & Botanical Eatery</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1B382B] leading-[1.15] tracking-tight">
              An urban sanctuary of{" "}
              <span className="italic font-normal text-[#C4623F]">slow brews</span> &{" "}
              living greens.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#55635B] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Escape the city bustle. Meeva Greens brings artisanal single-estate
              pour-overs, house-crafted sourdough toasts, and farm-fresh superfood bowls
              into a serene sun-drenched garden cafe.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => setScannerOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#1B382B] text-white font-medium text-sm sm:text-base hover:bg-[#12241C] shadow-md hover:shadow-lg transition-all group"
              >
                <QrCode className="w-4 h-4 text-[#8EBA9D]" />
                <span>Scan Table QR Code</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/order/takeaway"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FFFFFF] border border-[#E6E1D5] text-[#151E19] font-medium text-sm sm:text-base hover:bg-[#F3EFE6] hover:border-[#4E7A63] transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-[#C4623F]" />
                <span>Self-Pickup Takeaway</span>
              </Link>
            </div>

            {/* Micro Feature Strip */}
            <div className="pt-4 border-t border-[#E6E1D5] grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#1B382B]">100%</span>
                <span className="text-xs text-[#55635B]">Arabica Single-Estate</span>
              </div>
              <div>
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#1B382B]">Wild-Yeast</span>
                <span className="text-xs text-[#55635B]">Artisanal Sourdoughs</span>
              </div>
              <div>
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#1B382B]">Zero</span>
                <span className="text-xs text-[#55635B]">Chemical Additives</span>
              </div>
            </div>
          </div>

          {/* Right Visual Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]">
                <Image
                  src="/images/interior.jpg"
                  alt="Meeva Greens Botanical Cafe Interior in Pimpri-Chinchwad"
                  fill
                  priority
                  className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Floating Badge on Image */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1B382B] text-white flex items-center justify-center">
                      <Coffee className="w-5 h-5 text-[#8EBA9D]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#151E19]">Daily Fresh Roasts</h4>
                      <p className="text-[11px] text-[#55635B]">Chikmagalur & Coorg Estates</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#C4623F] bg-[#FBF9F4] px-2.5 py-1 rounded-full border border-[#E6E1D5]">
                    Open Now
                  </span>
                </div>
              </div>

              {/* Decorative background blur shape */}
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#8EBA9D]/30 blur-2xl -z-10" />
              <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full bg-[#C4623F]/20 blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>

      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
    </section>
  );
}
