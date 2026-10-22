"use client";

import { useEffect, useState } from "react";
import { CAFE_CONFIG, MenuItem } from "@/config/cafe";
import { DatabaseOrder, DatabaseOrderItem, DatabaseBill } from "@/lib/supabase/types";
import { AdminHeader, AdminTab } from "@/components/admin/AdminHeader";
import { FloorPlanTab } from "@/components/admin/FloorPlanTab";
import { MenuManagerTab } from "@/components/admin/MenuManagerTab";
import { QrSheetTab } from "@/components/admin/QrSheetTab";
import { ReportsTab } from "@/components/admin/ReportsTab";

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("floor");
  const [orders, setOrders] = useState<(DatabaseOrder & { items?: DatabaseOrderItem[] })[]>([]);
  const [bills, setBills] = useState<DatabaseBill[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([...CAFE_CONFIG.menuItems]);
  const [loading, setLoading] = useState(true);

  // Fetch orders, bills, and menu items
  const fetchData = async () => {
    try {
      // 1. Fetch live queue
      const qRes = await fetch("/api/kitchen/queue");
      if (qRes.ok) {
        const qData = await qRes.json();
        setOrders(qData.orders || []);
      }

      // 2. Fetch bills
      const bRes = await fetch("/api/billing");
      if (bRes.ok) {
        const bData = await bRes.json();
        setBills(bData.bills || []);
      }

      // 3. Fetch menu overrides
      const mRes = await fetch("/api/admin/menu");
      if (mRes.ok) {
        const mData = await mRes.json();
        if (Array.isArray(mData.items) && mData.items.length > 0) {
          setMenuItems(mData.items);
        }
      }
    } catch (err) {
      console.warn("Admin fetch warning:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // 8s polling
    return () => clearInterval(interval);
  }, []);

  const handleUpdateMenuItem = async (itemId: string, updates: Partial<MenuItem>) => {
    // Optimistic update
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i))
    );

    try {
      await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", itemId, updates }),
      });
    } catch {}
  };

  const handleCreateMenuItem = async (newItem: Partial<MenuItem>) => {
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", item: newItem }),
      });
      if (res.ok) {
        const data = await res.json();
        setMenuItems((prev) => [...prev, data.item]);
      }
    } catch {}
  };

  // Metrics: prioritize settled bills revenue plus active orders
  const settledRevenue = bills
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.grandTotal, 0);

  const totalRevenue =
    settledRevenue > 0
      ? settledRevenue
      : orders
          .filter((o) => o.status !== "cancelled" && o.status !== "rejected")
          .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  // Occupied tables count
  const occupiedTokens = new Set(
    orders
      .filter(
        (o) =>
          o.orderType === "dine_in" &&
          o.status !== "served" &&
          o.status !== "cancelled" &&
          o.status !== "rejected"
      )
      .map((o) => o.tableToken)
  );

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#151E19] flex flex-col selection:bg-[#8EBA9D] selection:text-[#1B382B]">
      {/* Header */}
      <AdminHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalRevenue={totalRevenue}
        occupiedTablesCount={occupiedTokens.size}
        totalOrdersCount={orders.length}
      />

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1">
        {activeTab === "floor" && (
          <FloorPlanTab orders={orders} bills={bills} onRefresh={fetchData} />
        )}

        {activeTab === "menu" && (
          <MenuManagerTab
            items={menuItems}
            onUpdateItem={handleUpdateMenuItem}
            onCreateItem={handleCreateMenuItem}
          />
        )}

        {activeTab === "qr" && <QrSheetTab />}

        {activeTab === "reports" && (
          <ReportsTab orders={orders} bills={bills} onRefresh={fetchData} />
        )}
      </main>
    </div>
  );
}
