"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  User,
  Phone,
  Clock,
  CheckCircle2,
  Receipt,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { CAFE_CONFIG, TableConfig } from "@/config/cafe";
import { DatabaseOrder, DatabaseOrderItem } from "@/lib/supabase/types";

interface FloorPlanTabProps {
  orders: (DatabaseOrder & { items?: DatabaseOrderItem[] })[];
  onRefresh: () => void;
}

export function FloorPlanTab({ orders, onRefresh }: FloorPlanTabProps) {
  const [selectedTable, setSelectedTable] = useState<TableConfig | null>(null);

  // Group active orders by table token
  const getTableData = (tableToken: string) => {
    const tableOrders = orders.filter(
      (o) =>
        o.orderType === "dine_in" &&
        o.tableToken === tableToken &&
        o.status !== "cancelled" &&
        o.status !== "rejected"
    );

    // Filter active (unsettled) orders
    const activeOrders = tableOrders.filter((o) => o.status !== "served");
    const isOccupied = activeOrders.length > 0 || tableOrders.some((o) => o.status === "ready");

    const totalBill = tableOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const latestOrder = tableOrders[0];

    return {
      tableOrders,
      activeOrders,
      isOccupied,
      totalBill,
      latestOrder,
    };
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E6E1D5] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#4E7A63]">
            Dining Floor Map
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B382B]">
            10 Active Table Stations
          </h2>
          <p className="text-xs text-[#55635B] mt-0.5">
            Single-session ordering: all orders placed at a table merge into one unified account.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[#151E19]">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D99B52]" />
            <span className="text-[#151E19]">Dining / In Prep</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C4623F]" />
            <span className="text-[#151E19]">Ready for Bill</span>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {CAFE_CONFIG.tables.map((table) => {
          const { isOccupied, totalBill, latestOrder, tableOrders } = getTableData(
            table.qrToken
          );

          let statusBg = "bg-white border-[#E6E1D5]";
          let statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
          let statusLabel = "Available";

          if (isOccupied) {
            statusBg = "bg-[#FBF9F4] border-[#D99B52] shadow-sm";
            statusBadge = "bg-amber-50 text-amber-800 border-amber-200";
            statusLabel = "Occupied";
          }

          return (
            <div
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`rounded-3xl border ${statusBg} p-4 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer min-h-[170px] group`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif text-lg font-bold text-[#1B382B] group-hover:text-[#C4623F] transition-colors">
                    {table.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <span className="text-[11px] text-[#55635B] block">
                  Capacity: {table.capacity} guests
                </span>

                {isOccupied && latestOrder && (
                  <div className="mt-3 pt-2 border-t border-[#E6E1D5] space-y-1 text-xs">
                    <p className="font-medium text-[#151E19] truncate">
                      {latestOrder.customerName}
                    </p>
                    <p className="text-[11px] text-[#55635B] font-mono">
                      +91 {latestOrder.customerPhone}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-2 border-t border-[#F3EFE6] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#55635B] block">Current Bill</span>
                  <span className="font-mono font-bold text-sm text-[#1B382B]">
                    ₹{totalBill}
                  </span>
                </div>

                <span className="text-[11px] text-[#4E7A63] font-semibold group-hover:underline">
                  Details &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Table Drawer Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FBF9F4] rounded-3xl border border-[#E6E1D5] max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#4E7A63]">
                  Table Station View
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1B382B]">
                  {selectedTable.label}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-2 rounded-full hover:bg-[#F3EFE6] text-[#55635B]"
              >
                ✕
              </button>
            </div>

            {/* Table Details Content */}
            {(() => {
              const { tableOrders, totalBill, latestOrder } = getTableData(
                selectedTable.qrToken
              );

              return (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white border border-[#E6E1D5] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#55635B] block">QR Token</span>
                      <code className="text-xs font-mono font-bold text-[#1B382B]">
                        {selectedTable.qrToken}
                      </code>
                    </div>

                    <Link
                      href={`/order/${selectedTable.qrToken}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3EFE6] hover:bg-[#E6E1D5] text-xs font-semibold text-[#1B382B] transition-colors"
                    >
                      <span>Open Customer Menu</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {latestOrder ? (
                    <div className="p-4 rounded-2xl bg-white border border-[#E6E1D5] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#151E19]">
                          Active Guest Contact:
                        </span>
                        <span className="font-mono text-sm font-bold text-[#C4623F]">
                          Total: ₹{totalBill}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#1B382B]">
                        {latestOrder.customerName} • +91 {latestOrder.customerPhone}
                      </p>

                      <div className="pt-2 border-t border-[#F3EFE6] space-y-1.5">
                        <span className="text-xs text-[#55635B] font-semibold block">
                          Orders Placed ({tableOrders.length}):
                        </span>
                        {tableOrders.map((ord) => (
                          <div
                            key={ord.id}
                            className="text-xs flex justify-between text-[#55635B] py-1"
                          >
                            <span>Order #{ord.orderNumber} ({ord.status})</span>
                            <span className="font-mono font-bold">₹{ord.totalAmount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-[#55635B] bg-white rounded-2xl border border-[#E6E1D5]">
                      <p className="text-sm font-medium">Table is currently vacant.</p>
                      <p className="text-xs mt-1">Ready for incoming guest scan.</p>
                    </div>
                  )}

                  <div className="pt-3 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setSelectedTable(null)}
                      className="px-5 py-2.5 rounded-xl border border-[#E6E1D5] text-xs font-semibold text-[#55635B] hover:bg-[#F3EFE6]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
