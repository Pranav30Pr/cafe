"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, Phone, MessageSquare, ExternalLink, CheckCircle } from "lucide-react";
import { CAFE_CONFIG } from "@/config/cafe";

export function LocationHours() {
  const [isOpenNow, setIsOpenNow] = useState<boolean | null>(null);

  useEffect(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    // Monday is closed (day 1)
    if (day === 1) {
      setIsOpenNow(false);
      return;
    }

    // 8:00 AM = 480 mins, 10:30 PM = 1350 mins
    if (currentTime >= 480 && currentTime <= 1350) {
      setIsOpenNow(true);
    } else {
      setIsOpenNow(false);
    }
  }, []);

  return (
    <section id="hours-location" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Hours & Status Card */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-[#E6E1D5] p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            {/* Live Open / Closed indicator */}
            <div className="flex items-center justify-between pb-6 border-b border-[#E6E1D5]">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isOpenNow === true
                      ? "bg-[#2D8A4E] animate-pulse"
                      : "bg-[#C44A3F]"
                  }`}
                />
                <span className="font-semibold text-xs uppercase tracking-wider text-[#151E19]">
                  {isOpenNow === true ? "Serving Guests Now" : "Currently Closed"}
                </span>
              </div>
              <span className="text-xs text-[#55635B] bg-[#F3EFE6] px-2.5 py-1 rounded-full font-medium">
                Pimpri-Chinchwad
              </span>
            </div>

            {/* Operating Schedule */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-[#1B382B]">
                <Clock className="w-5 h-5 text-[#4E7A63]" />
                <h3 className="font-serif text-xl font-bold">Hours of Hospitality</h3>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-2 border-b border-[#F3EFE6]">
                  <span className="font-medium text-[#151E19]">Tuesday – Sunday</span>
                  <span className="font-mono text-[#55635B]">8:00 AM – 10:30 PM</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F3EFE6] text-[#C4623F]">
                  <span className="font-medium">Monday</span>
                  <span className="font-medium italic">Weekly Rest (Closed)</span>
                </div>
              </div>

              <p className="text-xs text-[#55635B] pt-2">
                * Kitchen accepts last food orders at 10:00 PM. Coffee & beverages served until closing.
              </p>
            </div>
          </div>

          {/* Quick Contact Action Buttons */}
          <div className="pt-8 mt-6 border-t border-[#E6E1D5] space-y-3">
            <a
              href={`https://wa.me/${CAFE_CONFIG.identity.whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#2D8A4E] text-white text-xs sm:text-sm font-semibold hover:bg-[#236F3E] transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat & Reserve on WhatsApp</span>
            </a>

            <a
              href={CAFE_CONFIG.identity.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#F3EFE6] border border-[#E6E1D5] text-[#151E19] text-xs sm:text-sm font-semibold hover:border-[#4E7A63] transition-colors"
            >
              <svg className="w-4 h-4 text-[#C4623F]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Follow {CAFE_CONFIG.identity.instagramHandle}</span>
            </a>
          </div>
        </div>

        {/* Right Column: Location & Directions */}
        <div className="lg:col-span-7 rounded-3xl bg-[#1B382B] text-white p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[#8EBA9D]">
              <MapPin className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest font-semibold">Location & Directions</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
              Find us in Pimpri-Chinchwad
            </h3>

            <div className="space-y-1 text-sm sm:text-base text-[#FBF9F4]/90">
              <p className="font-semibold text-white">{CAFE_CONFIG.identity.address.street}</p>
              <p>{CAFE_CONFIG.identity.address.area}</p>
              <p>{CAFE_CONFIG.identity.address.city}, {CAFE_CONFIG.identity.address.state} {CAFE_CONFIG.identity.address.pincode}</p>
            </div>

            {/* Coordinates Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 font-mono text-xs text-[#8EBA9D]">
              <span>Geo: 18.650537, 73.7658824</span>
            </div>

            {/* Mock Map Preview Frame */}
            <div className="rounded-2xl bg-[#12241C] border border-[#2D3E34] p-4 text-xs text-[#8EBA9D] flex items-center justify-between">
              <div>
                <span className="block font-semibold text-white">Google Maps Verified</span>
                <span className="text-[11px] text-[#8EBA9D]">Near Spine Road Promenade</span>
              </div>
              <a
                href={CAFE_CONFIG.identity.address.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#C4623F] text-white font-medium text-xs hover:bg-[#A84E2E] transition-colors flex items-center gap-1.5"
              >
                <span>Navigate</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8EBA9D]">
            <span>Ample Curbside & Valet Parking</span>
            <span>Free High-Speed Wi-Fi for Patrons</span>
          </div>
        </div>
      </div>
    </section>
  );
}
