"use client";

import Link from "next/link";
import {
  LayoutGrid,
  BookOpen,
  QrCode,
  BarChart3,
  ArrowLeft,
  ChefHat,
  Coffee,
} from "lucide-react";
import { CAFE_CONFIG } from "@/config/cafe";

export type AdminTab = "floor" | "menu" | "qr" | "reports";

interface AdminHeaderProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  totalRevenue: number;
  occupiedTablesCount: number;
  totalOrdersCount: number;
}

export function AdminHeader({
  activeTab,
  setActiveTab,
  totalRevenue,
  occupiedTablesCount,
  totalOrdersCount,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#1B382B] text-white border-b border-[#2D4E3E] px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-bold tracking-tight text-white">
                {CAFE_CONFIG.identity.name}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#D99B52] text-[#121A15]">
                Floor & Admin
              </span>
            </div>
            <p className="text-[11px] text-[#8EBA9D] font-mono">
              Pimpri-Chinchwad • Operations Portal
            </p>
          </div>
        </div>

        {/* Live metric pills */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-[#12241C] border border-[#2D4E3E]">
            <span className="text-[10px] text-[#8EBA9D] block uppercase font-medium">Today&apos;s Revenue</span>
            <span className="font-bold font-mono text-sm text-[#D99B52]">
              ₹{totalRevenue}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#12241C] border border-[#2D4E3E]">
            <span className="text-[10px] text-[#8EBA9D] block uppercase font-medium">Occupied Tables</span>
            <span className="font-bold font-mono text-sm text-emerald-400">
              {occupiedTablesCount} / 10
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#12241C] border border-[#2D4E3E]">
            <span className="text-[10px] text-[#8EBA9D] block uppercase font-medium">Orders Handled</span>
            <span className="font-bold font-mono text-sm text-white">
              {totalOrdersCount}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-[#12241C] p-1 rounded-2xl border border-[#2D4E3E]">
          <button
            onClick={() => setActiveTab("floor")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "floor"
                ? "bg-[#C4623F] text-white shadow"
                : "text-[#8EBA9D] hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Floor Plan</span>
          </button>

          <button
            onClick={() => setActiveTab("menu")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "menu"
                ? "bg-[#C4623F] text-white shadow"
                : "text-[#8EBA9D] hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Menu Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab("qr")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "qr"
                ? "bg-[#C4623F] text-white shadow"
                : "text-[#8EBA9D] hover:text-white"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Table QR Stands</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "reports"
                ? "bg-[#C4623F] text-white shadow"
                : "text-[#8EBA9D] hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Sales Ledger</span>
          </button>
        </div>
      </div>
    </header>
  );
}
