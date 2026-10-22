import Link from "next/link";
import { CAFE_CONFIG } from "@/config/cafe";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 sm:p-12 max-w-4xl mx-auto">
      <header className="w-full text-center py-10">
        <span className="text-xs uppercase tracking-widest text-[#4E7A63] font-semibold">
          {CAFE_CONFIG.identity.tagline}
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif text-[#1B382B] mt-2 mb-3">
          {CAFE_CONFIG.identity.name}
        </h1>
        <p className="text-[#55635B] max-w-lg mx-auto text-sm sm:text-base">
          {CAFE_CONFIG.identity.description}
        </p>
      </header>

      <section className="w-full grid gap-4 sm:grid-cols-2 max-w-xl my-8">
        <Link
          href="/order/token-mg-t01-dinein"
          className="p-5 rounded-2xl bg-[#1B382B] text-white flex flex-col justify-between hover:bg-[#12241C] transition-colors"
        >
          <div>
            <span className="text-xs text-[#8EBA9D] uppercase tracking-wider font-medium">Demo Dine-in</span>
            <h2 className="text-lg font-semibold mt-1">Table 1 Menu & QR Order</h2>
          </div>
          <span className="text-sm text-[#8EBA9D] mt-4 inline-flex items-center gap-1 font-medium">
            Scan & Order Experience &rarr;
          </span>
        </Link>

        <Link
          href="/order/takeaway"
          className="p-5 rounded-2xl bg-[#F3EFE6] border border-[#E6E1D5] text-[#151E19] flex flex-col justify-between hover:border-[#4E7A63] transition-colors"
        >
          <div>
            <span className="text-xs text-[#4E7A63] uppercase tracking-wider font-semibold">Self-Pickup</span>
            <h2 className="text-lg font-semibold mt-1">Takeaway Order</h2>
          </div>
          <span className="text-sm text-[#C4623F] mt-4 inline-flex items-center gap-1 font-medium">
            Order for Counter Pickup &rarr;
          </span>
        </Link>

        <Link
          href="/kitchen"
          className="p-5 rounded-2xl bg-[#151E19] text-[#FBF9F4] flex flex-col justify-between hover:bg-[#101613] transition-colors"
        >
          <div>
            <span className="text-xs text-[#D99B52] uppercase tracking-wider font-medium">Staff & Kitchen</span>
            <h2 className="text-lg font-semibold mt-1">Kitchen Display System</h2>
          </div>
          <span className="text-sm text-[#D99B52] mt-4 inline-flex items-center gap-1 font-medium">
            Live Ticket Queue &rarr;
          </span>
        </Link>

        <Link
          href="/admin"
          className="p-5 rounded-2xl bg-white border border-[#E6E1D5] text-[#151E19] flex flex-col justify-between hover:border-[#1B382B] transition-colors"
        >
          <div>
            <span className="text-xs text-[#55635B] uppercase tracking-wider font-medium">Floor Manager</span>
            <h2 className="text-lg font-semibold mt-1">Admin & QR Console</h2>
          </div>
          <span className="text-sm text-[#1B382B] mt-4 inline-flex items-center gap-1 font-medium">
            Tables, Menu & Billing &rarr;
          </span>
        </Link>
      </section>

      <footer className="w-full text-center text-xs text-[#55635B] py-6 border-t border-[#E6E1D5]">
        <p>{CAFE_CONFIG.identity.address.street}, {CAFE_CONFIG.identity.address.city}</p>
        <p className="mt-1">Hours: {CAFE_CONFIG.identity.operatingHours.daysOpen} ({CAFE_CONFIG.identity.operatingHours.schedule})</p>
      </footer>
    </main>
  );
}
