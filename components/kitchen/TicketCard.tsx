"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  Coffee,
  XCircle,
  AlertTriangle,
  User,
  Phone,
  UtensilsCrossed,
  ShoppingBag,
} from "lucide-react";
import { DatabaseOrder, DatabaseOrderItem, OrderStatus } from "@/lib/supabase/types";

interface TicketCardProps {
  order: DatabaseOrder & { items?: DatabaseOrderItem[] };
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function TicketCard({ order, onUpdateStatus }: TicketCardProps) {
  const [elapsedMins, setElapsedMins] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Compute live elapsed minutes since order placement
  useEffect(() => {
    const calc = () => {
      const created = new Date(order.createdAt).getTime();
      const now = Date.now();
      const diffMins = Math.floor((now - created) / 60000);
      setElapsedMins(Math.max(0, diffMins));
    };
    calc();
    const interval = setInterval(calc, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const handleAction = async (nextStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Border & urgency styling based on elapsed time and status
  let urgencyBorder = "border-[#2D3E34]";
  let timerBadgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

  if (order.status !== "served" && order.status !== "cancelled") {
    if (elapsedMins >= 20) {
      urgencyBorder = "border-[#E0533C] ring-2 ring-[#E0533C]/40 animate-pulse";
      timerBadgeColor = "bg-[#E0533C]/30 text-red-200 border-[#E0533C]/50";
    } else if (elapsedMins >= 10) {
      urgencyBorder = "border-[#D99B52]";
      timerBadgeColor = "bg-[#D99B52]/20 text-amber-200 border-[#D99B52]/40";
    }
  }

  return (
    <div
      className={`rounded-3xl bg-[#17221C] border ${urgencyBorder} p-5 flex flex-col justify-between shadow-lg text-white transition-all`}
    >
      <div>
        {/* Ticket Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#2D3E34] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-white">
                #{order.orderNumber}
              </span>

              {order.orderType === "dine_in" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1B382B] text-[#8EBA9D] border border-[#2D3E34]">
                  <UtensilsCrossed className="w-3 h-3" />
                  <span>{order.tableLabel || "Dine-In"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#C4623F]/30 text-[#F5A182] border border-[#C4623F]/40">
                  <ShoppingBag className="w-3 h-3" />
                  <span>Takeaway ({order.pickupToken || "Counter"})</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8EBA9D] mt-1.5 font-sans">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-[#D99B52]" />
                {order.customerName}
              </span>
              <span>•</span>
              <a
                href={`tel:${order.customerPhone}`}
                className="flex items-center gap-1 hover:text-white font-mono"
              >
                <Phone className="w-3 h-3 text-[#D99B52]" />
                {order.customerPhone}
              </a>
            </div>
          </div>

          {/* Live Timer Pill */}
          <div
            className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 shrink-0 ${timerBadgeColor}`}
          >
            <Clock className="w-3 h-3" />
            <span>{elapsedMins}m ago</span>
          </div>
        </div>

        {/* Special Instructions */}
        {order.notes && (
          <div className="my-3 p-2.5 rounded-xl bg-[#202F26] border border-[#2D3E34] text-xs text-[#D99B52] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium italic leading-relaxed">&ldquo;{order.notes}&rdquo;</p>
          </div>
        )}

        {/* Order Items List */}
        <div className="py-3 space-y-2.5 divide-y divide-[#202F26]">
          {order.items &&
            order.items.map((item, idx) => (
              <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-base font-bold text-emerald-400">
                      {item.quantity}x
                    </span>
                    <span className="font-serif text-sm font-semibold text-white">
                      {item.itemNameSnapshot}
                    </span>
                  </div>

                  {Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0 && (
                    <div className="pl-6 flex flex-wrap gap-1">
                      {item.selectedOptions.map((optName: string, oIdx: number) => (
                        <span
                          key={oIdx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#233128] text-[#8EBA9D]"
                        >
                          {optName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-xs font-mono text-[#8EBA9D]">
                  ₹{item.itemTotal}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Action Progression Footer */}
      <div className="pt-4 mt-3 border-t border-[#2D3E34]">
        {order.status === "placed" && (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAction("rejected")}
              disabled={isUpdating}
              className="py-2.5 px-3 rounded-xl border border-red-500/40 text-red-300 text-xs font-semibold hover:bg-red-500/20 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => handleAction("accepted")}
              disabled={isUpdating}
              className="col-span-2 py-2.5 px-4 rounded-xl bg-[#C4623F] hover:bg-[#A84E2E] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Ticket</span>
            </button>
          </div>
        )}

        {order.status === "accepted" && (
          <button
            onClick={() => handleAction("preparing")}
            disabled={isUpdating}
            className="w-full py-3 px-4 rounded-xl bg-[#D99B52] hover:bg-[#C0853E] text-[#121A15] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <ChefHat className="w-4 h-4" />
            <span>Start Preparing</span>
          </button>
        )}

        {order.status === "preparing" && (
          <button
            onClick={() => handleAction("ready")}
            disabled={isUpdating}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <BellRing className="w-4 h-4" />
            <span>Mark Ready for Service</span>
          </button>
        )}

        {order.status === "ready" && (
          <button
            onClick={() => handleAction("served")}
            disabled={isUpdating}
            className="w-full py-3 px-4 rounded-xl bg-[#1B382B] hover:bg-[#12241C] text-[#8EBA9D] border border-emerald-500/40 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Coffee className="w-4 h-4 text-emerald-400" />
            <span>Mark as Served / Collected</span>
          </button>
        )}

        {order.status === "served" && (
          <div className="text-center py-1 text-xs text-[#8EBA9D] font-mono">
            ✓ Served • Awaiting Counter Settlement
          </div>
        )}

        {order.status === "rejected" && (
          <div className="text-center py-1 text-xs text-red-400 font-mono">
            ✕ Order Rejected
          </div>
        )}
      </div>
    </div>
  );
}
