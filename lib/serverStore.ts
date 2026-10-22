import { calculateOrderPricing } from "./pricing";
import { CAFE_CONFIG } from "@/config/cafe";
import { DatabaseOrder, DatabaseOrderItem, OrderStatus } from "./supabase/types";

// In-memory server-side shared store across requests for local network realtime
interface ServerStoreState {
  orders: (DatabaseOrder & { items: DatabaseOrderItem[] })[];
  subscribers: Set<(order: DatabaseOrder & { items: DatabaseOrderItem[] }) => void>;
}

declare global {
  // eslint-disable-next-line no-var
  var __meevaServerStore: ServerStoreState | undefined;
}

if (!global.__meevaServerStore) {
  global.__meevaServerStore = {
    orders: [],
    subscribers: new Set(),
  };
}

const store = global.__meevaServerStore;

export function getServerOrders() {
  return [...store.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getServerOrderById(orderId: string) {
  return store.orders.find((o) => o.id === orderId) || null;
}

export function subscribeToOrders(
  callback: (order: DatabaseOrder & { items: DatabaseOrderItem[] }) => void
) {
  store.subscribers.add(callback);
  return () => {
    store.subscribers.delete(callback);
  };
}

export function broadcastOrder(order: DatabaseOrder & { items: DatabaseOrderItem[] }) {
  store.subscribers.forEach((cb) => {
    try {
      cb(order);
    } catch (err) {
      console.error("Broadcast subscriber error:", err);
    }
  });
}

export function createServerOrder(params: {
  orderType: "dine_in" | "takeaway";
  tableToken?: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  lineItems: { itemId: string; quantity: number; selectedOptionIds?: string[] }[];
}) {
  const nextOrderNumber = 101 + store.orders.length;

  let tableLabel: string | undefined;
  if (params.orderType === "dine_in" && params.tableToken) {
    const matchedTable = CAFE_CONFIG.tables.find((t) => t.qrToken === params.tableToken);
    tableLabel = matchedTable ? matchedTable.label : "Dine-In Table";
  }

  const pickupToken =
    params.orderType === "takeaway"
      ? `TK-${Math.floor(100 + Math.random() * 900)}`
      : undefined;

  // Authoritative server-side calculation
  const pricing = calculateOrderPricing(params.lineItems);

  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const orderItems: DatabaseOrderItem[] = pricing.items.map((item, idx) => ({
    id: `item_${orderId}_${idx + 1}`,
    orderId,
    menuItemId: item.itemId,
    itemNameSnapshot: item.name,
    unitPriceSnapshot: item.unitPrice,
    quantity: item.quantity,
    selectedOptions: item.selectedOptionsSummary,
    itemTotal: item.itemTotal,
  }));

  const newOrder: DatabaseOrder & { items: DatabaseOrderItem[] } = {
    id: orderId,
    orderNumber: nextOrderNumber,
    orderType: params.orderType,
    tableSessionId: null,
    tableToken: params.tableToken,
    tableLabel,
    pickupToken,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    notes: params.notes || null,
    status: "placed",
    subtotal: pricing.subtotal,
    discountAmount: pricing.discountAmount,
    taxableAmount: pricing.taxableAmount,
    taxAmount: pricing.taxAmount,
    totalAmount: pricing.grandTotal,
    createdAt: now,
    updatedAt: now,
    items: orderItems,
  };

  store.orders.unshift(newOrder);
  broadcastOrder(newOrder);

  return newOrder;
}

export function updateServerOrderStatus(orderId: string, nextStatus: OrderStatus) {
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.status = nextStatus;
  order.updatedAt = new Date().toISOString();
  broadcastOrder(order);

  return order;
}
