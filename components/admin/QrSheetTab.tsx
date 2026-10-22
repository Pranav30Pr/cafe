"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Printer, Download, Sparkles, ExternalLink, QrCode as QrIcon } from "lucide-react";
import { CAFE_CONFIG, TableConfig } from "@/config/cafe";

export function QrSheetTab() {
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const generateAll = async () => {
      const generated: Record<string, string> = {};
      for (const table of CAFE_CONFIG.tables) {
        const orderUrl = `${baseUrl}/order/${table.qrToken}`;
        try {
          const dataUrl = await QRCode.toDataURL(orderUrl, {
            width: 320,
            margin: 2,
            color: {
              dark: "#1B382B", // Forest green
              light: "#FFFFFF",
            },
            errorCorrectionLevel: "H",
          });
          generated[table.id] = dataUrl;
        } catch (err) {
          console.error("QR generation error:", err);
        }
      }
      setQrMap(generated);
    };

    generateAll();
  }, [baseUrl]);

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E6E1D5] flex flex-wrap items-center justify-between gap-4 shadow-sm print:hidden">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#4E7A63]">
            Physical Touchpoints
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B382B]">
            Printable Acrylic Table Stands
          </h2>
          <p className="text-xs text-[#55635B] mt-0.5">
            Formatted for standard 4x6 inch acrylic or wooden table stands. Guests scan directly from camera.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-2xl bg-[#C4623F] hover:bg-[#A84E2E] text-white text-xs font-bold transition-all shadow flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print All 10 Table Stands</span>
        </button>
      </div>

      {/* Printable Grid of Stand Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
        {CAFE_CONFIG.tables.map((table, idx) => {
          const qrDataUrl = qrMap[table.id];
          const tableNumber = (idx + 1).toString().padStart(2, "0");

          return (
            <div
              key={table.id}
              className="rounded-3xl bg-white border-2 border-[#1B382B] p-6 flex flex-col items-center text-center justify-between shadow-md print:shadow-none print:border-2 print:border-black print:break-inside-avoid relative overflow-hidden"
            >
              {/* Corner botanical accent */}
              <div className="w-full flex items-center justify-between pb-3 border-b border-[#E6E1D5]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1B382B] text-white flex items-center justify-center font-serif text-xs font-bold">
                    M
                  </div>
                  <span className="font-serif text-sm font-bold text-[#1B382B]">
                    {CAFE_CONFIG.identity.name}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-[#4E7A63]">
                  Botanical Cafe
                </span>
              </div>

              {/* Table Number Title */}
              <div className="py-4">
                <span className="text-[11px] uppercase tracking-widest text-[#55635B] font-semibold block">
                  Dine-In Station
                </span>
                <h3 className="font-serif text-3xl font-extrabold text-[#1B382B] mt-0.5">
                  TABLE {tableNumber}
                </h3>
              </div>

              {/* QR Code Container */}
              <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#E6E1D5] inline-block shadow-inner my-2">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${table.label}`}
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-[#55635B]">
                    Rendering QR...
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="pt-3 space-y-1 w-full border-t border-[#E6E1D5]">
                <p className="text-xs font-bold text-[#151E19]">
                  Point camera to scan & order
                </p>
                <p className="text-[11px] text-[#55635B]">
                  No app download needed • Settle bill at counter
                </p>
                <div className="pt-2 flex items-center justify-center gap-3 text-[10px] text-[#8EBA9D] font-mono">
                  <span>Instagram: {CAFE_CONFIG.identity.instagramHandle}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
