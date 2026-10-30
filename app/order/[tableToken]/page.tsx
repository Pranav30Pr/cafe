import Link from "next/link";
import { CAFE_CONFIG, resolveTable } from "@/config/cafe";
import { CartProvider } from "@/context/CartContext";
import { CustomerAppView } from "@/components/customer/CustomerAppView";
import { AlertCircle, QrCode, ArrowLeft, UtensilsCrossed, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    tableToken: string;
  }>;
}

export default async function TableOrderPage({ params }: PageProps) {
  const { tableToken } = await params;

  // Resolve matching table flexibly (accepts qrToken, T01, tbl-01, 1, etc.)
  const matchedTable = resolveTable(tableToken);

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
          The code <span className="font-mono font-semibold text-[#1B382B] bg-[#E6E1D5]/40 px-1.5 py-0.5 rounded">&ldquo;{tableToken}&rdquo;</span> does not match any cafe table stand.
        </p>

        {/* Quick Table Selection Grid */}
        <div className="mt-6 w-full max-w-sm bg-white rounded-2xl border border-[#E6E1D5] p-4 text-left shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <UtensilsCrossed className="w-4 h-4 text-[#4E7A63]" />
            <span className="text-xs font-bold text-[#1B382B]">
              Pick your table number directly:
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {CAFE_CONFIG.tables.map((t) => (
              <Link
                key={t.id}
                href={`/order/${t.qrToken}`}
                className="py-2 text-center rounded-xl bg-[#FBF9F4] border border-[#E6E1D5] hover:border-[#1B382B] hover:bg-[#1B382B] hover:text-white transition-all text-xs font-serif font-bold text-[#1B382B]"
              >
                {t.label.replace("Table ", "T")}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3 w-full max-w-xs">
          <Link
            href="/scan"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#1B382B] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#12241C] transition-colors shadow-sm"
          >
            <QrCode className="w-4 h-4 text-[#8EBA9D]" />
            <span>Launch Camera Scanner</span>
          </Link>

          <Link
            href="/order/takeaway"
            className="w-full py-3 px-4 rounded-2xl border border-[#C4623F] text-[#C4623F] bg-[#FFFBF8] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#C4623F] hover:text-white transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Self-Pickup Takeaway</span>
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
        tableToken={matchedTable.qrToken}
        tableLabel={matchedTable.label}
      />
    </CartProvider>
  );
}
