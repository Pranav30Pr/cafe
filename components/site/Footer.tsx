import Link from "next/link";
import { CAFE_CONFIG } from "@/config/cafe";

export function Footer() {
  return (
    <footer className="bg-[#12241C] text-[#FBF9F4] border-t border-[#1B382B] pt-14 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8EBA9D] text-[#1B382B] flex items-center justify-center font-serif text-xl font-bold">
                M
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                {CAFE_CONFIG.identity.name}
              </span>
            </div>
            <p className="text-sm text-[#8EBA9D] max-w-sm leading-relaxed">
              {CAFE_CONFIG.identity.description}
            </p>
            <p className="text-xs text-[#8EBA9D]/80">
              {CAFE_CONFIG.identity.address.street}, {CAFE_CONFIG.identity.address.city},{" "}
              {CAFE_CONFIG.identity.address.state}
            </p>
          </div>

          {/* Guest Services */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#D99B52] font-semibold">
              Guest Ordering
            </h4>
            <ul className="space-y-2 text-sm text-[#FBF9F4]/80">
              <li>
                <Link
                  href="/scan"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>Scan Table QR Code (Live Camera & Table Selector)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/order/takeaway"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>Self-Pickup Counter Takeaway</span>
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${CAFE_CONFIG.identity.whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Direct WhatsApp Assistance
                </a>
              </li>
              <li>
                <a
                  href={CAFE_CONFIG.identity.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram Feed ({CAFE_CONFIG.identity.instagramHandle})
                </a>
              </li>
            </ul>
          </div>

          {/* Operational Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#D99B52] font-semibold">
              Staff & Management
            </h4>
            <ul className="space-y-2 text-xs text-[#8EBA9D]">
              <li>
                <Link
                  href="/kitchen"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Kitchen Display System (KDS)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D99B52]" />
                  <span>Manager Console & Billing</span>
                </Link>
              </li>
            </ul>

            <div className="pt-3">
              <span className="text-[11px] text-white/40 block">Operational Status:</span>
              <span className="text-xs text-[#8EBA9D] font-mono">Single Session per Table • 0% GST</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8EBA9D]/60 gap-4">
          <p>© {new Date().getFullYear()} {CAFE_CONFIG.identity.name}. All rights reserved.</p>
          <p>Bespoke Digital Experience for Contemporary Hospitality.</p>
        </div>
      </div>
    </footer>
  );
}
