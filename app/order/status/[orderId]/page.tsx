"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  Coffee,
  Printer,
  ArrowLeft,
  ShoppingBag,
  UtensilsCrossed,
  Sparkles,
  Phone,
  User,
  Receipt,
} from "lucide-react";
import { CAFE_CONFIG } from "@/config/cafe";
import {
  getOrderById,
  updateMockOrderStatus,
  MockOrder,
  OrderStatus,
} from "@/lib/mockStore";

const LIFECYCLE_STEPS: {
  status: OrderStatus;
  label: string;
  description: string;
  icon: any;
}[] = [
  {
    status: "placed",
    label: "Placed",
    description: "Order submitted to staff counter. Awaiting acceptance.",
    icon: Clock,
  },
  {
    status: "accepted",
    label: "Accepted",
    description: "Staff verified and sent ticket to the kitchen station.",
    icon: CheckCircle2,
  },
  {
    status: "preparing",
    label: "Preparing",
    description: "Baristas and chefs are crafting your fresh order.",
    icon: ChefHat,
  },
  {
    status: "ready",
    label: "Ready",
    description: "Plated & poured! Ready for service or pickup.",
    icon: BellRing,
  },
  {
    status: "served",
    label: "Served",
    description: "Delivered to table. Please settle bill at the counter.",
    icon: Coffee,
  },
];

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<MockOrder | null>(null);
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // 1. Initial fast local load
    const local = getOrderById(orderId);
    if (local) {
      setOrder(local);
      setLoading(false);
    }

    // 2. Server fetch
    const fetchFromServer = async () => {
      try {
        const res = await fetch(`/api/order/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setOrder((prev) => {
              if (!prev) return data.order;
              return {
                ...prev,
                status: data.order.status,
                items: data.order.items || prev.items,
              };
            });
          }
        }

        // Fetch associated invoice / bill if any
        const billRes = await fetch(`/api/billing?orderId=${orderId}`);
        if (billRes.ok) {
          const billData = await billRes.json();
          if (billData.bill) {
            setBill(billData.bill);
          }
        }
      } catch {}
      setLoading(false);
    };

    fetchFromServer();

    // 3. Resilient polling fallback every 3 seconds for status updates
    const interval = setInterval(fetchFromServer, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleSimulateStatus = async (nextStatus: OrderStatus) => {
    if (!order) return;
    const updated = updateMockOrderStatus(order.id, nextStatus);
    if (updated) {
      setOrder({ ...updated });
    }
    try {
      await fetch("/api/order/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: nextStatus }),
      });
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#1B382B] border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#55635B] font-medium">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] p-6 flex flex-col items-center justify-center text-center">
        <h1 className="font-serif text-2xl font-bold text-[#1B382B]">
          Order Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#55635B] mt-2">
          Unable to locate order reference #{orderId}.
        </p>
        <Link
          href="/"
          className="mt-6 px-6 py-3 rounded-full bg-[#1B382B] text-white text-xs font-semibold"
        >
          Return to Cafe Home
        </Link>
      </div>
    );
  }

  const currentStepIndex = LIFECYCLE_STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#151E19] flex flex-col pb-safe">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FBF9F4]/90 backdrop-blur-md border-b border-[#E6E1D5] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href={
              order.orderType === "dine_in"
                ? `/order/${order.tableToken || "token-mg-t01-dinein"}`
                : "/order/takeaway"
            }
            className="flex items-center gap-1.5 text-xs text-[#55635B] hover:text-[#1B382B] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Order More</span>
          </Link>

          <span className="font-serif text-sm font-bold text-[#1B382B]">
            {CAFE_CONFIG.identity.name}
          </span>

          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-lg border border-[#E6E1D5] hover:bg-[#F3EFE6] text-[#55635B] transition-colors"
            title="Print Receipt"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 py-6 space-y-6 flex-1">
        {/* Order Identifier Banner */}
        <div className="rounded-3xl bg-white border border-[#E6E1D5] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#1B382B]/10 text-[#1B382B]">
                Order #{order.orderNumber}
              </span>
              <span className="text-xs text-[#55635B] font-mono">
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#1B382B] mt-1.5">
              {order.orderType === "dine_in"
                ? `${order.tableLabel || "Dine-In Table"}`
                : `Takeaway: ${order.pickupToken || "Pickup"}`}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#55635B] mt-1">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-[#4E7A63]" />
                {order.customerName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-[#4E7A63]" />
                +91 {order.customerPhone}
              </span>
            </div>
          </div>

          <div className="w-full sm:w-auto text-left sm:text-right pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E6E1D5]">
            <span className="text-[11px] text-[#55635B] block">Grand Total</span>
            <span className="font-serif text-2xl font-bold text-[#1B382B]">
              {order.pricing.currencySymbol}{order.pricing.grandTotal}
            </span>
            <span className="block text-[10px] text-[#C4623F] font-semibold mt-0.5">
              Pay at Counter
            </span>
          </div>
        </div>

        {/* Verified Bill / Tax Invoice Banner */}
        {bill && (
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E6E1D5] shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1B382B] flex items-center justify-center shrink-0 border border-emerald-200">
                <Receipt className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#4E7A63] block">
                  {bill.paymentStatus === "paid"
                    ? "Tax Invoice Settled"
                    : "Bill Generated"}
                </span>
                <p className="font-mono text-sm font-bold text-[#1B382B]">
                  {bill.invoiceNumber} • ₹{bill.grandTotal}
                </p>
              </div>
            </div>

            <Link
              href={`/receipt/${bill.invoiceNumber}`}
              className="px-4 py-2 rounded-xl bg-[#1B382B] hover:bg-[#2A5743] text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
            >
              View Receipt &rarr;
            </Link>
          </div>
        )}

        {/* Real-time Order State Tracker Card */}
        <div className="rounded-3xl bg-[#1B382B] text-white p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-[#8EBA9D] font-semibold">
              Live Preparation Stage
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#8EBA9D] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Realtime Active
            </span>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-4">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPassed = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isFuture = idx > currentStepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.status} className="flex items-start gap-4 relative">
                  {/* Vertical connecting line */}
                  {idx < LIFECYCLE_STEPS.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-[1px] ${
                        isPassed ? "bg-emerald-400" : "bg-white/20"
                      }`}
                    />
                  )}

                  {/* Icon circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                      isCurrent
                        ? "bg-[#C4623F] text-white shadow-lg ring-4 ring-[#C4623F]/30"
                        : isPassed
                        ? "bg-emerald-500 text-white"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>

                  {/* Label & Description */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-bold ${
                          isCurrent
                            ? "text-white"
                            : isPassed
                            ? "text-emerald-300"
                            : "text-white/40"
                        }`}
                      >
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C4623F] text-white">
                          Current Stage
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8EBA9D] mt-0.5 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Lifecycle Simulator (Phase 2 Testing Control) */}
        <div className="rounded-3xl bg-[#F3EFE6] border border-[#E6E1D5] p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-1.5 text-[#1B382B]">
            <Sparkles className="w-4 h-4 text-[#D99B52]" />
            <h4 className="text-xs uppercase font-bold tracking-wider">
              Phase 2 Simulator: Advance Order Lifecycle
            </h4>
          </div>
          <p className="text-xs text-[#55635B]">
            Simulate kitchen and counter actions to test live status rendering:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => handleSimulateStatus("accepted")}
              className="py-2 px-3 rounded-xl bg-white border border-[#E6E1D5] text-xs font-semibold text-[#151E19] hover:bg-[#1B382B] hover:text-white transition-all shadow-2xs"
            >
              1. Accept
            </button>
            <button
              onClick={() => handleSimulateStatus("preparing")}
              className="py-2 px-3 rounded-xl bg-white border border-[#E6E1D5] text-xs font-semibold text-[#151E19] hover:bg-[#1B382B] hover:text-white transition-all shadow-2xs"
            >
              2. Prepare
            </button>
            <button
              onClick={() => handleSimulateStatus("ready")}
              className="py-2 px-3 rounded-xl bg-white border border-[#E6E1D5] text-xs font-semibold text-[#151E19] hover:bg-[#1B382B] hover:text-white transition-all shadow-2xs"
            >
              3. Ready
            </button>
            <button
              onClick={() => handleSimulateStatus("served")}
              className="py-2 px-3 rounded-xl bg-white border border-[#E6E1D5] text-xs font-semibold text-[#151E19] hover:bg-[#1B382B] hover:text-white transition-all shadow-2xs"
            >
              4. Served
            </button>
          </div>
        </div>

        {/* Digital Bill Receipt Details */}
        <div className="rounded-3xl bg-white border border-[#E6E1D5] p-5 sm:p-6 space-y-4 shadow-sm print:shadow-none print:border-none">
          <div className="border-b border-[#E6E1D5] pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1B382B]">
                Itemized Summary
              </h3>
              <p className="text-xs text-[#55635B]">
                {order.items.length} items ordered
              </p>
            </div>
            <span className="text-xs font-mono font-semibold bg-[#F3EFE6] px-2.5 py-1 rounded-full text-[#151E19]">
              Dine-In Session
            </span>
          </div>

          {/* Items */}
          <div className="divide-y divide-[#F3EFE6]">
            {order.items.map((lineItem, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs font-mono text-[#1B382B]">
                      {lineItem.quantity}x
                    </span>
                    <span className="text-sm font-semibold text-[#151E19]">
                      {lineItem.name}
                    </span>
                  </div>
                  {lineItem.selectedOptionsSummary.length > 0 && (
                    <p className="text-[11px] text-[#4E7A63] pl-5 font-medium">
                      {lineItem.selectedOptionsSummary.join(", ")}
                    </p>
                  )}
                </div>

                <span className="font-mono text-xs font-bold text-[#151E19] shrink-0">
                  {order.pricing.currencySymbol}{lineItem.itemTotal}
                </span>
              </div>
            ))}
          </div>

          {/* Kitchen Notes */}
          {order.notes && (
            <div className="p-3 rounded-xl bg-[#FBF9F4] border border-[#E6E1D5] text-xs">
              <span className="font-semibold text-[#55635B] block">Kitchen Notes:</span>
              <p className="text-[#151E19] italic mt-0.5">&ldquo;{order.notes}&rdquo;</p>
            </div>
          )}

          {/* Fiscal Totals */}
          <div className="pt-4 border-t border-[#E6E1D5] space-y-2 text-xs">
            <div className="flex justify-between text-[#55635B]">
              <span>Subtotal</span>
              <span className="font-mono">{order.pricing.currencySymbol}{order.pricing.subtotal}</span>
            </div>
            <div className="flex justify-between text-[#55635B]">
              <span>GST Tax (0% Default)</span>
              <span className="font-mono">{order.pricing.currencySymbol}0</span>
            </div>
            <div className="pt-2 border-t border-[#E6E1D5] flex justify-between text-base font-bold text-[#1B382B]">
              <span>Amount Due</span>
              <span className="font-mono text-lg">
                {order.pricing.currencySymbol}{order.pricing.grandTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-[#55635B] py-4 space-y-1">
          <p>Meeva Greens • Shop 4-6, Green Promenade, Pimpri-Chinchwad</p>
          <p>Need assistance? Contact cafe staff or message on WhatsApp.</p>
        </div>
      </main>
    </div>
  );
}
