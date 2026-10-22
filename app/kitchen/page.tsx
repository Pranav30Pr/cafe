"use client";

import { useEffect, useState, useRef } from "react";
import {
  UtensilsCrossed,
  Filter,
  RefreshCw,
  AlertTriangle,
  WifiOff,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { DatabaseOrder, DatabaseOrderItem, OrderStatus } from "@/lib/supabase/types";
import { KitchenHeader } from "@/components/kitchen/KitchenHeader";
import { TicketCard } from "@/components/kitchen/TicketCard";
import { StockModal } from "@/components/kitchen/StockModal";
import { kitchenAudio } from "@/lib/utils/audio";

type FilterTab = "active" | "placed" | "preparing" | "ready" | "history";

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<(DatabaseOrder & { items?: DatabaseOrderItem[] })[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("active");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isStreamConnected, setIsStreamConnected] = useState<boolean>(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const previousOrderCountRef = useRef<number>(0);

  // 1. Fetch live queue from server
  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/kitchen/queue");
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: (DatabaseOrder & { items?: DatabaseOrderItem[] })[] =
          data.orders || [];

        // Check for new 'placed' orders to trigger the kitchen chime
        const placedCount = incomingOrders.filter((o) => o.status === "placed").length;
        if (placedCount > previousOrderCountRef.current) {
          kitchenAudio.playNewOrderChime();
        }
        previousOrderCountRef.current = placedCount;

        setOrders(incomingOrders);
        setLastRefreshed(new Date());
        setIsOnline(true);
      }
    } catch (err) {
      console.warn("Queue fetch error:", err);
      setIsOnline(false);
    }
  };

  // 2. Real-time SSE Stream Subscription + Polling Fallback
  useEffect(() => {
    // Initial fetch
    fetchQueue();

    // Listen to network status
    const handleOnline = () => {
      setIsOnline(true);
      fetchQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // SSE Realtime stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/kitchen/stream");

      eventSource.onopen = () => {
        setIsStreamConnected(true);
        setIsOnline(true);
      };

      eventSource.addEventListener("initial", (e: MessageEvent) => {
        try {
          const list = JSON.parse(e.data);
          setOrders(list);
        } catch {}
      });

      eventSource.addEventListener("update", (e: MessageEvent) => {
        try {
          const updatedOrder = JSON.parse(e.data);
          kitchenAudio.playNewOrderChime();
          setOrders((prev) => {
            const idx = prev.findIndex((o) => o.id === updatedOrder.id);
            if (idx !== -1) {
              const clone = [...prev];
              clone[idx] = updatedOrder;
              return clone;
            } else {
              return [updatedOrder, ...prev];
            }
          });
        } catch {}
      });

      eventSource.onerror = () => {
        setIsStreamConnected(false);
      };
    } catch (err) {
      console.warn("SSE init error:", err);
    }

    // 10-Second Resilient Polling Fallback (Survives Wi-Fi drops)
    const pollInterval = setInterval(() => {
      fetchQueue();
    }, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(pollInterval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Update order status action
  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      // Optimistic local update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );

      const res = await fetch("/api/order/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: nextStatus }),
      });

      if (!res.ok) {
        fetchQueue();
      }
    } catch {
      fetchQueue();
    }
  };

  // Filter orders based on active tab
  const activeOrders = orders.filter(
    (o) => o.status !== "served" && o.status !== "cancelled" && o.status !== "rejected"
  );
  const placedOrders = orders.filter((o) => o.status === "placed");
  const preparingOrders = orders.filter((o) => o.status === "accepted" || o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");
  const historyOrders = orders.filter(
    (o) => o.status === "served" || o.status === "cancelled" || o.status === "rejected"
  );

  let displayedOrders = activeOrders;
  if (activeTab === "placed") displayedOrders = placedOrders;
  if (activeTab === "preparing") displayedOrders = preparingOrders;
  if (activeTab === "ready") displayedOrders = readyOrders;
  if (activeTab === "history") displayedOrders = historyOrders;

  return (
    <div className="min-h-screen bg-[#101613] text-white flex flex-col selection:bg-[#D99B52] selection:text-[#101613]">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-[#E0533C] text-white py-2 px-4 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg">
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>Wi-Fi Offline: Reconnecting to Meeva Greens queue... (Local buffer active)</span>
        </div>
      )}

      {/* Header */}
      <KitchenHeader
        isOnline={isOnline}
        isStreamConnected={isStreamConnected}
        activeCount={activeOrders.length}
        placedCount={placedOrders.length}
        preparingCount={preparingOrders.length}
        readyCount={readyOrders.length}
        onOpenStockModal={() => setIsStockModalOpen(true)}
      />

      {/* Sub-navigation & Queue Filter Tabs */}
      <nav className="bg-[#17221C] border-b border-[#233128] px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "active"
                  ? "bg-[#C4623F] text-white shadow-sm"
                  : "bg-white/5 text-[#8EBA9D] hover:bg-white/10"
              }`}
            >
              Active Tickets ({activeOrders.length})
            </button>

            <button
              onClick={() => setActiveTab("placed")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "placed"
                  ? "bg-[#E0533C] text-white shadow-sm"
                  : "bg-white/5 text-[#8EBA9D] hover:bg-white/10"
              }`}
            >
              To Accept ({placedOrders.length})
            </button>

            <button
              onClick={() => setActiveTab("preparing")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "preparing"
                  ? "bg-[#D99B52] text-[#121A15] shadow-sm"
                  : "bg-white/5 text-[#8EBA9D] hover:bg-white/10"
              }`}
            >
              Preparing ({preparingOrders.length})
            </button>

            <button
              onClick={() => setActiveTab("ready")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "ready"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white/5 text-[#8EBA9D] hover:bg-white/10"
              }`}
            >
              Ready for Pickup ({readyOrders.length})
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "history"
                  ? "bg-white/20 text-white shadow-sm"
                  : "bg-white/5 text-[#8EBA9D] hover:bg-white/10"
              }`}
            >
              History ({historyOrders.length})
            </button>
          </div>

          <button
            onClick={fetchQueue}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8EBA9D] transition-colors shrink-0"
            title="Manual Queue Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Ticket Board Grid */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1">
        {displayedOrders.length === 0 ? (
          <div className="text-center py-24 text-[#8EBA9D] space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[#17221C] border border-[#2D3E34] flex items-center justify-center mx-auto text-3xl">
              🍳
            </div>
            <h3 className="font-serif text-xl font-bold text-white">
              No Tickets in This Category
            </h3>
            <p className="text-xs text-[#8EBA9D] max-w-sm mx-auto">
              {activeTab === "active"
                ? "The kitchen queue is completely clear. Incoming QR orders from tables and takeaway will chime automatically."
                : `No orders currently match the ${activeTab} filter.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
            {displayedOrders.map((order) => (
              <TicketCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </main>

      {/* 86 Out of Stock Slide-over */}
      <StockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
      />
    </div>
  );
}
