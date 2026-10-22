"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { DatabaseBill } from "@/lib/supabase/types";
import { ThermalReceipt } from "@/components/billing/ThermalReceipt";

export default function DigitalReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.billId as string;

  const [bill, setBill] = useState<DatabaseBill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!billId) return;

    const fetchBill = async () => {
      try {
        const res = await fetch(`/api/billing?id=${billId}`);
        if (!res.ok) {
          // Try fetching by invoice number
          const invRes = await fetch(`/api/billing?invoice=${billId}`);
          if (!invRes.ok) throw new Error("Invoice or receipt not found");
          const invData = await invRes.json();
          setBill(invData.bill);
          return;
        }
        const data = await res.json();
        setBill(data.bill);
      } catch (err: any) {
        setError(err.message || "Failed to load receipt");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [billId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-[#1B382B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-serif font-bold text-[#1B382B]">
          Fetching verified tax receipt...
        </p>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          ✕
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#1B382B] mb-2">
          Receipt Not Found
        </h1>
        <p className="text-sm text-[#55635B] max-w-sm mb-6">
          {error || "The requested bill could not be retrieved from the server."}
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-[#1B382B] text-white text-xs font-semibold hover:bg-[#2A5743]"
        >
          Return to Cafe Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#151E19] py-8 px-4 sm:px-6 selection:bg-[#8EBA9D] selection:text-[#1B382B]">
      {/* Top Banner */}
      <div className="max-w-md mx-auto mb-6 flex items-center justify-between no-print">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white border border-[#E6E1D5] hover:bg-[#F3EFE6] text-xs font-semibold text-[#151E19] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-[#4E7A63] font-semibold bg-white px-3 py-1.5 rounded-xl border border-[#E6E1D5]">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Digital Receipt</span>
        </div>
      </div>

      {/* Customer Confirmation Header */}
      <div className="max-w-md mx-auto text-center mb-6 no-print">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mb-3 shadow-xs">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#1B382B]">
          Thank You, {bill.customerName}!
        </h1>
        <p className="text-xs text-[#55635B] mt-1">
          Your order has been settled. Here is your official itemized receipt.
        </p>
      </div>

      {/* Thermal Receipt Component */}
      <div className="flex justify-center">
        <ThermalReceipt bill={bill} showControls={true} />
      </div>

      {/* Botanical Footer Note */}
      <div className="max-w-md mx-auto mt-8 text-center text-xs text-[#55635B] space-y-1 no-print">
        <p className="font-serif italic font-bold text-[#1B382B]">
          Meeva Greens • Botanical Brunch & Specialty Coffee
        </p>
        <p className="text-[11px]">
          Shop 4-6, Green Promenade, Pimpri-Chinchwad, Pune
        </p>
      </div>
    </div>
  );
}
