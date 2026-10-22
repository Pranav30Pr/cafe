import { CAFE_CONFIG, MenuItem } from "@/config/cafe";
import { calculateOrderPricing, CalculatedLineItem, PriceCalculationResult } from "@/lib/pricing";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export interface MockOrder {
  id: string;
  orderNumber: number;
  orderType: "dine_in" | "takeaway";
  tableToken?: string;
  tableLabel?: string;
  pickupToken?: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  status: OrderStatus;
  items: CalculatedLineItem[];
  pricing: PriceCalculationResult;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "meeva_mock_orders_v1";

export function getStoredOrders(): MockOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredOrders(orders: MockOrder[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error("Failed to persist orders:", err);
  }
}

export function getOrderById(orderId: string): MockOrder | null {
  const orders = getStoredOrders();
  return orders.find((o) => o.id === orderId) || null;
}

export function createMockOrder(params: {
  orderType: "dine_in" | "takeaway";
  tableToken?: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  lineItems: { itemId: string; quantity: number; selectedOptionIds?: string[] }[];
}): MockOrder {
  const orders = getStoredOrders();
  const nextOrderNumber = 101 + orders.length;

  let tableLabel: string | undefined;
  if (params.orderType === "dine_in" && params.tableToken) {
    const matchedTable = CAFE_CONFIG.tables.find((t) => t.qrToken === params.tableToken);
    tableLabel = matchedTable ? matchedTable.label : "Dine-In Table";
  }

  const pickupToken =
    params.orderType === "takeaway"
      ? `TK-${Math.floor(100 + Math.random() * 900)}`
      : undefined;

  const pricing = calculateOrderPricing(params.lineItems);

  const newOrder: MockOrder = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    orderNumber: nextOrderNumber,
    orderType: params.orderType,
    tableToken: params.tableToken,
    tableLabel,
    pickupToken,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    notes: params.notes,
    status: "placed",
    items: pricing.items,
    pricing,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  saveStoredOrders(orders);
  return newOrder;
}

export function updateMockOrderStatus(orderId: string, newStatus: OrderStatus): MockOrder | null {
  const orders = getStoredOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  orders[index] = {
    ...orders[index],
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  saveStoredOrders(orders);
  return orders[index];
}
