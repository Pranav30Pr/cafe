"use client";

import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  UtensilsCrossed,
  Printer,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { DatabaseOrder, DatabaseOrderItem } from "@/lib/supabase/types";
import { CAFE_CONFIG } from "@/config/cafe";

interface ReportsTabProps {
  orders: (DatabaseOrder & { items?: DatabaseOrderItem[] })[];
}

export function ReportsTab({ orders }: ReportsTabProps) {
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "rejected")
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const completedOrders = orders.filter(
    (o) => o.status === "served" || o.status === "ready"
  );

  const dineInCount = orders.filter((o) => o.orderType === "dine_in").length;
  const takeawayCount = orders.filter((o) => o.orderType === "takeaway").length;
  const aov = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E6E1D5] space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#55635B] block">
            Gross Sales
          </span>
          <p className="font-serif text-3xl font-bold text-[#1B382B]">
            ₹{totalRevenue}
          </p>
          <span className="text-[11px] text-[#4E7A63] font-medium block">
            0% GST Decoupled Baseline
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E6E1D5] space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#55635B] block">
            Total Orders
          </span>
          <p className="font-serif text-3xl font-bold text-[#151E19]">
            {orders.length}
          </p>
          <span className="text-[11px] text-[#55635B] block font-mono">
            {dineInCount} Dine-In • {takeawayCount} Takeaway
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E6E1D5] space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#55635B] block">
            Avg Order Value (AOV)
          </span>
          <p className="font-serif text-3xl font-bold text-[#C4623F]">
            ₹{aov}
          </p>
          <span className="text-[11px] text-[#55635B] block">
            Per transaction basket
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E6E1D5] space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#55635B] block">
            Fiscal Scheme
          </span>
          <p className="font-serif text-2xl font-bold text-[#1B382B]">
            Unregistered
          </p>
          <span className="text-[11px] text-[#D99B52] block font-medium">
            CA Review Pending (0% Tax)
          </span>
        </div>
      </div>

      {/* Orders Ledger Table */}
      <div className="rounded-3xl bg-white border border-[#E6E1D5] p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D5]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1B382B]">
              Daily Transaction Ledger
            </h3>
            <p className="text-xs text-[#55635B]">
              Complete chronological audit trail of all placed orders.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl border border-[#E6E1D5] hover:bg-[#F3EFE6] text-xs font-semibold text-[#151E19] transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ledger</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6E1D5] text-[#55635B] uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Type / Station</th>
                <th className="py-2.5 px-3">Customer Contact</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EFE6]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#55635B]">
                    No transactions recorded today.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FBF9F4]">
                    <td className="py-3 px-3 font-mono font-bold text-[#1B382B]">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-3 px-3 text-[#55635B] font-mono">
                      {new Date(ord.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3">
                      {ord.orderType === "dine_in" ? (
                        <span className="font-semibold text-[#1B382B]">
                          {ord.tableLabel || "Dine-In"}
                        </span>
                      ) : (
                        <span className="text-[#C4623F] font-semibold">
                          Takeaway ({ord.pickupToken || "Pickup"})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#151E19]">
                        {ord.customerName}
                      </div>
                      <div className="text-[11px] text-[#55635B] font-mono">
                        +91 {ord.customerPhone}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3EFE6] text-[#1B382B]">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#1B382B]">
                      ₹{ord.totalAmount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
