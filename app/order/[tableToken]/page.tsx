import Link from "next/link";
import { CAFE_CONFIG } from "@/config/cafe";
import { CartProvider } from "@/context/CartContext";
import { CustomerAppView } from "@/components/customer/CustomerAppView";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    tableToken: string;
  }>;
}

export default async function TableOrderPage({ params }: PageProps) {
  const { tableToken } = await params;

  // Resolve matching table
  const matchedTable = CAFE_CONFIG.tables.find((t) => t.qrToken === tableToken);

  if (!matchedTable) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] p-6 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#1B382B]">
          Unrecognized Table Token
        </h1>
        <p className="text-xs sm:text-sm text-[#55635B] max-w-sm mt-2 leading-relaxed">
          The table QR code scanned does not match an active table session at Meeva Greens.
        </p>

        <div className="mt-8 space-y-3 w-full max-w-xs">
          <Link
            href="/order/token-mg-t01-dinein"
            className="w-full py-3 px-4 rounded-2xl bg-[#1B382B] text-white text-xs font-semibold block hover:bg-[#12241C] transition-colors"
          >
            Open Demo Table 1 Menu
          </Link>

          <Link
            href="/"
            className="w-full py-3 px-4 rounded-2xl border border-[#E6E1D5] bg-white text-[#151E19] text-xs font-semibold block hover:bg-[#F3EFE6] transition-colors"
          >
            Return to Cafe Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <CustomerAppView
        orderType="dine_in"
        tableToken={tableToken}
        tableLabel={matchedTable.label}
      />
    </CartProvider>
  );
}
