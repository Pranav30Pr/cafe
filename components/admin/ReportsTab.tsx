"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  UtensilsCrossed,
  Printer,
  Calendar,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  Banknote,
  QrCode,
  Split,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { DatabaseOrder, DatabaseOrderItem, DatabaseBill } from "@/lib/supabase/types";
import { CAFE_CONFIG } from "@/config/cafe";
import { ThermalReceipt } from "@/components/billing/ThermalReceipt";
import { SettlementModal } from "@/components/billing/SettlementModal";

interface ReportsTabProps {
  orders: (DatabaseOrder & { items?: DatabaseOrderItem[] })[];
  bills?: DatabaseBill[];
  onRefresh?: () => void;
}

export function ReportsTab({ orders, bills = [], onRefresh }: ReportsTabProps) {
  const [activeLedgerView, setActiveLedgerView] = useState<"invoices" | "orders">("invoices");
  const [previewBill, setPreviewBill] = useState<DatabaseBill | null>(null);
  const [settlingOrderId, setSettlingOrderId] = useState<string | null>(null);

  // Settlement Metrics
  const settledBills = bills.filter((b) => b.paymentStatus === "paid");

  const cashTotal = settledBills
    .filter((b) => b.paymentMode === "cash" || (b.paymentMode === "split" && b.splitBreakdown?.cash))
    .reduce((sum, b) => {
      if (b.paymentMode === "cash") return sum + b.grandTotal;
      return sum + (b.splitBreakdown?.cash || 0);
    }, 0);

  const upiTotal = settledBills
    .filter((b) => b.paymentMode === "upi" || (b.paymentMode === "split" && b.splitBreakdown?.upi))
    .reduce((sum, b) => {
      if (b.paymentMode === "upi") return sum + b.grandTotal;
      return sum + (b.splitBreakdown?.upi || 0);
    }, 0);

  const cardTotal = settledBills
    .filter((b) => b.paymentMode === "card" || (b.paymentMode === "split" && b.splitBreakdown?.card))
    .reduce((sum, b) => {
      if (b.paymentMode === "card") return sum + b.grandTotal;
      return sum + (b.splitBreakdown?.card || 0);
    }, 0);

  const totalSettledRevenue = settledBills.reduce((sum, b) => sum + b.grandTotal, 0);

  const dineInCount = orders.filter((o) => o.orderType === "dine_in").length;
  const takeawayCount = orders.filter((o) => o.orderType === "takeaway").length;
  const aov =
    settledBills.length > 0
      ? Math.round(totalSettledRevenue / settledBills.length)
      : orders.length > 0
      ? Math.round(
          orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0) / orders.length
        )
      : 0;

  // Unsettled takeaway orders
  const pendingTakeaways = orders.filter(
    (o) =>
      o.orderType === "takeaway" &&
      o.status !== "cancelled" &&
      o.status !== "rejected" &&
      !settledBills.some((b) => b.orderId === o.id || b.orderIds.includes(o.id))
  );

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E6E1D5] space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#55635B] block">
            Settled Collections
          </span>
          <p className="font-serif text-3xl font-bold text-[#1B382B]">
            ₹{totalSettledRevenue}
          </p>
          <span className="text-[11px] text-[#4E7A63] font-medium block">
            {settledBills.length} Closed Invoices Today
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E6E1D5] space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#55635B] block">
            Payment Breakdown
          </span>
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="font-mono font-bold text-[#1B382B]">
              Cash: ₹{cashTotal}
            </span>
            <span className="text-gray-300">•</span>
            <span className="font-mono font-bold text-emerald-700">
              UPI: ₹{upiTotal}
            </span>
          </div>
          <span className="text-[11px] text-[#55635B] block font-mono">
            Card: ₹{cardTotal}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E6E1D5] space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#55635B] block">
            Avg Ticket (AOV)
          </span>
          <p className="font-serif text-3xl font-bold text-[#C4623F]">
            ₹{aov}
          </p>
          <span className="text-[11px] text-[#55635B] block">
            {dineInCount} Dine-In • {takeawayCount} Takeaway
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E6E1D5] space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#55635B] block">
            Fiscal Compliance
          </span>
          <p className="font-serif text-2xl font-bold text-[#1B382B]">
            0% GST Decoupled
          </p>
          <span className="text-[11px] text-[#D99B52] block font-medium">
            Gapless Invoicing Sequence
          </span>
        </div>
      </div>

      {/* Pending Takeaway Counter Queue (If Any) */}
      {pendingTakeaways.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Unsettled Takeaway Orders ({pendingTakeaways.length})
            </span>
            <span className="text-[11px] text-amber-800">
              Collect payment at counter on pickup
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingTakeaways.map((ord) => (
              <div
                key={ord.id}
                className="p-3 rounded-2xl bg-white border border-amber-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-[#C4623F]">
                    {ord.pickupToken || `#${ord.orderNumber}`}
                  </span>
                  <p className="font-medium text-[#151E19] truncate max-w-[130px]">
                    {ord.customerName}
                  </p>
                  <p className="font-mono text-[10px] text-[#55635B]">
                    +91 {ord.customerPhone}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="font-mono font-bold text-sm block">
                    ₹{ord.totalAmount}
                  </span>
                  <button
                    onClick={() => setSettlingOrderId(ord.id)}
                    className="px-2.5 py-1 rounded-lg bg-[#1B382B] text-white text-[11px] font-bold hover:bg-[#2A5743]"
                  >
                    Settle Bill
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ledger Navigation Header */}
      <div className="rounded-3xl bg-white border border-[#E6E1D5] p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E6E1D5]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1B382B]">
              {activeLedgerView === "invoices"
                ? "Tax Invoices & Settlement Ledger"
                : "Live Placed Orders Audit"}
            </h3>
            <p className="text-xs text-[#55635B]">
              {activeLedgerView === "invoices"
                ? "Consecutive gap-free invoice register with payment mode reconciliation."
                : "Complete chronological audit trail of all kitchen-bound orders."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#F3EFE6] p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setActiveLedgerView("invoices")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeLedgerView === "invoices"
                    ? "bg-white text-[#1B382B] shadow-xs"
                    : "text-[#55635B] hover:text-[#151E19]"
                }`}
              >
                Invoices ({bills.length})
              </button>
              <button
                onClick={() => setActiveLedgerView("orders")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeLedgerView === "orders"
                    ? "bg-white text-[#1B382B] shadow-xs"
                    : "text-[#55635B] hover:text-[#151E19]"
                }`}
              >
                All Orders ({orders.length})
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl border border-[#E6E1D5] hover:bg-[#F3EFE6] text-xs font-semibold text-[#151E19] transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Ledger</span>
            </button>
          </div>
        </div>

        {/* INVOICES TABLE VIEW */}
        {activeLedgerView === "invoices" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6E1D5] text-[#55635B] uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Station</th>
                  <th className="py-2.5 px-3">Customer Contact</th>
                  <th className="py-2.5 px-3">Payment Mode</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Grand Total</th>
                  <th className="py-2.5 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EFE6]">
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#55635B]">
                      No bills generated yet today.
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-[#FBF9F4]">
                      <td className="py-3 px-3 font-mono font-bold text-[#1B382B]">
                        {bill.invoiceNumber}
                      </td>
                      <td className="py-3 px-3 text-[#55635B] font-mono">
                        {new Date(bill.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#1B382B]">
                          {bill.tableLabel || (bill.orderType === "dine_in" ? "Dine-In" : "Takeaway")}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#151E19]">
                          {bill.customerName}
                        </div>
                        <div className="text-[11px] text-[#55635B] font-mono">
                          +91 {bill.customerPhone}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {bill.paymentMode ? (
                          <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded-md bg-[#F3EFE6] text-[#1B382B]">
                            {bill.paymentMode}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`capitalize px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            bill.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : bill.paymentStatus === "void"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {bill.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#1B382B]">
                        ₹{bill.grandTotal}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setPreviewBill(bill)}
                          className="px-2.5 py-1 rounded-lg border border-[#E6E1D5] hover:bg-[#F3EFE6] text-xs font-semibold text-[#4E7A63] inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ALL ORDERS TABLE VIEW */}
        {activeLedgerView === "orders" && (
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
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#1B382B]">
                        ₹{ord.totalAmount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bill Preview Modal */}
      {previewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 my-auto">
            <ThermalReceipt
              bill={previewBill}
              showControls={true}
              onClose={() => setPreviewBill(null)}
            />
          </div>
        </div>
      )}

      {/* Takeaway Settlement Modal */}
      {settlingOrderId && (
        <SettlementModal
          isOpen={true}
          onClose={() => {
            setSettlingOrderId(null);
            if (onRefresh) onRefresh();
          }}
          orderId={settlingOrderId}
          onSettled={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}
