import { calculateOrderPricing, calculateBillPricingFromTotals } from "./pricing";
import { CAFE_CONFIG } from "@/config/cafe";
import {
  DatabaseOrder,
  DatabaseOrderItem,
  DatabaseTableSession,
  DatabaseBill,
  BillItemSnapshot,
  OrderStatus,
  PaymentMode,
} from "./supabase/types";

// In-memory server-side shared store across requests for local network realtime
interface ServerStoreState {
  orders: (DatabaseOrder & { items: DatabaseOrderItem[] })[];
  sessions: DatabaseTableSession[];
  bills: DatabaseBill[];
  invoiceSeq: number;
  subscribers: Set<(order: DatabaseOrder & { items: DatabaseOrderItem[] }) => void>;
}

declare global {
  // eslint-disable-next-line no-var
  var __meevaServerStore: ServerStoreState | undefined;
}

if (!global.__meevaServerStore) {
  global.__meevaServerStore = {
    orders: [],
    sessions: [],
    bills: [],
    invoiceSeq: 1001,
    subscribers: new Set(),
  };
}

const store = global.__meevaServerStore;
if (!Array.isArray(store.sessions)) store.sessions = [];
if (!Array.isArray(store.bills)) store.bills = [];
if (!store.invoiceSeq) store.invoiceSeq = 1001;
if (!store.subscribers) store.subscribers = new Set();
if (!Array.isArray(store.orders)) store.orders = [];

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

// -------------------------------------------------------------
// SESSIONS & ORDERS
// -------------------------------------------------------------

export function getActiveTableSession(tableToken: string) {
  return (
    store.sessions.find(
      (s) => s.tableToken === tableToken && s.status !== "closed"
    ) || null
  );
}

export function getAllTableSessions() {
  return [...store.sessions];
}

export function createServerOrder(params: {
  orderType: "dine_in" | "takeaway";
  tableToken?: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  lineItems: { itemId: string; quantity: number; selectedOptionIds?: string[] }[];
}) {
  let tableLabel: string | undefined;
  let activeSessionId: string | null = null;

  if (params.orderType === "dine_in" && params.tableToken) {
    const matchedTable = CAFE_CONFIG.tables.find((t) => t.qrToken === params.tableToken);
    tableLabel = matchedTable ? matchedTable.label : "Dine-In Table";

    // Check existing table session
    const existingSession = getActiveTableSession(params.tableToken);
    if (existingSession) {
      if (existingSession.status === "billed") {
        throw new Error(
          "TABLE_BILLED: Table session is currently undergoing settlement. Please settle bill at the counter before ordering more."
        );
      }
      activeSessionId = existingSession.id;
    }
  }

  const nextOrderNumber = 101 + store.orders.length;

  const pickupToken =
    params.orderType === "takeaway"
      ? `TK-${Math.floor(100 + Math.random() * 900)}`
      : undefined;

  // Authoritative server-side calculation
  const pricing = calculateOrderPricing(params.lineItems);

  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  // If new dine-in table session is required
  if (params.orderType === "dine_in" && params.tableToken && !activeSessionId) {
    const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newSession: DatabaseTableSession = {
      id: newSessionId,
      tableToken: params.tableToken,
      tableLabel: tableLabel || "Dine-In Table",
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      status: "active",
      orderIds: [orderId],
      openedAt: now,
      closedAt: null,
    };
    store.sessions.push(newSession);
    activeSessionId = newSessionId;
  } else if (activeSessionId) {
    const session = store.sessions.find((s) => s.id === activeSessionId);
    if (session && !session.orderIds.includes(orderId)) {
      session.orderIds.push(orderId);
    }
  }

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
    tableSessionId: activeSessionId,
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

// -------------------------------------------------------------
// BILLING & COUNTER SETTLEMENT ENGINE
// -------------------------------------------------------------

export function getServerBills() {
  return [...store.bills].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getServerBillById(billId: string) {
  return store.bills.find((b) => b.id === billId) || null;
}

export function getServerBillByInvoice(invoiceNumber: string) {
  return store.bills.find((b) => b.invoiceNumber === invoiceNumber) || null;
}

export function getServerBillBySessionId(sessionId: string) {
  return store.bills.find((b) => b.tableSessionId === sessionId) || null;
}

export function getServerBillByOrderId(orderId: string) {
  return (
    store.bills.find((b) => b.orderId === orderId || b.orderIds.includes(orderId)) || null
  );
}

/**
 * Consolidates all orders for a table session into a singular final bill.
 * Automatically groups identical items across multiple rounds of ordering.
 */
export function createOrGetTableBill(
  tableToken: string,
  discountAmount: number = 0,
  discountReason?: string
): DatabaseBill {
  const session = getActiveTableSession(tableToken);
  if (!session) {
    throw new Error(`No active session found for table token: ${tableToken}`);
  }

  // Find all non-cancelled/rejected orders belonging to this session
  const sessionOrders = store.orders.filter(
    (o) =>
      o.tableSessionId === session.id &&
      o.status !== "cancelled" &&
      o.status !== "rejected"
  );

  if (sessionOrders.length === 0) {
    throw new Error(`No active placed orders to bill for table ${session.tableLabel}`);
  }

  // Consolidate line items
  const consolidatedMap = new Map<string, BillItemSnapshot>();

  for (const ord of sessionOrders) {
    for (const item of ord.items) {
      const optKey = Array.isArray(item.selectedOptions)
        ? [...item.selectedOptions].sort().join(",")
        : "";
      const key = `${item.itemNameSnapshot}__${item.unitPriceSnapshot}__${optKey}`;

      if (consolidatedMap.has(key)) {
        const existing = consolidatedMap.get(key)!;
        existing.quantity += item.quantity;
        existing.itemTotal += item.itemTotal;
      } else {
        consolidatedMap.set(key, {
          name: item.itemNameSnapshot,
          unitPrice: item.unitPriceSnapshot,
          quantity: item.quantity,
          itemTotal: item.itemTotal,
          optionsSummary: item.selectedOptions || [],
        });
      }
    }
  }

  const consolidatedItems = Array.from(consolidatedMap.values());
  const rawSubtotal = consolidatedItems.reduce((acc, i) => acc + i.itemTotal, 0);

  // Authoritative financial totals
  const totals = calculateBillPricingFromTotals(rawSubtotal, discountAmount);

  // Check if an unfinalized pending bill already exists for this session
  let existingBill = store.bills.find(
    (b) => b.tableSessionId === session.id && b.paymentStatus === "pending"
  );

  if (existingBill) {
    existingBill.items = consolidatedItems;
    existingBill.subtotal = totals.subtotal;
    existingBill.discountAmount = totals.discountAmount;
    existingBill.discountReason = discountReason || existingBill.discountReason;
    existingBill.taxableAmount = totals.taxableAmount;
    existingBill.taxRatePercent = totals.taxRatePercent;
    existingBill.taxAmount = totals.taxAmount;
    existingBill.grandTotal = totals.grandTotal;
    existingBill.orderIds = sessionOrders.map((o) => o.id);
    return existingBill;
  }

  // Generate sequential gapless invoice number
  const invoiceNumber = `MG-2026-${store.invoiceSeq++}`;

  const newBill: DatabaseBill = {
    id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    invoiceNumber,
    tableSessionId: session.id,
    tableToken: session.tableToken,
    tableLabel: session.tableLabel,
    orderId: null,
    orderIds: sessionOrders.map((o) => o.id),
    orderType: "dine_in",
    customerName: session.customerName,
    customerPhone: session.customerPhone,
    items: consolidatedItems,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    discountReason,
    taxableAmount: totals.taxableAmount,
    taxRatePercent: totals.taxRatePercent,
    taxAmount: totals.taxAmount,
    grandTotal: totals.grandTotal,
    paymentStatus: "pending",
    paymentMode: null,
    splitBreakdown: null,
    settledAt: null,
    settledBy: null,
    voidReason: null,
    createdAt: new Date().toISOString(),
  };

  store.bills.unshift(newBill);

  // Transition table session to "billed"
  session.status = "billed";

  return newBill;
}

/**
 * Creates or retrieves a bill for a standalone takeaway order.
 */
export function createTakeawayBill(
  orderId: string,
  discountAmount: number = 0,
  discountReason?: string
): DatabaseBill {
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  if (order.status === "cancelled" || order.status === "rejected") {
    throw new Error(`Cannot bill a ${order.status} order`);
  }

  // Check if an existing bill exists
  let existingBill = store.bills.find(
    (b) => b.orderId === orderId && b.paymentStatus === "pending"
  );

  const consolidatedItems: BillItemSnapshot[] = order.items.map((item) => ({
    name: item.itemNameSnapshot,
    unitPrice: item.unitPriceSnapshot,
    quantity: item.quantity,
    itemTotal: item.itemTotal,
    optionsSummary: item.selectedOptions || [],
  }));

  const rawSubtotal = consolidatedItems.reduce((acc, i) => acc + i.itemTotal, 0);
  const totals = calculateBillPricingFromTotals(rawSubtotal, discountAmount);

  if (existingBill) {
    existingBill.items = consolidatedItems;
    existingBill.subtotal = totals.subtotal;
    existingBill.discountAmount = totals.discountAmount;
    existingBill.discountReason = discountReason || existingBill.discountReason;
    existingBill.taxableAmount = totals.taxableAmount;
    existingBill.taxRatePercent = totals.taxRatePercent;
    existingBill.taxAmount = totals.taxAmount;
    existingBill.grandTotal = totals.grandTotal;
    return existingBill;
  }

  // Generate sequential gapless invoice number
  const invoiceNumber = `MG-2026-${store.invoiceSeq++}`;

  const newBill: DatabaseBill = {
    id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    invoiceNumber,
    tableSessionId: null,
    tableToken: null,
    tableLabel: `Takeaway (${order.pickupToken || "Pickup"})`,
    orderId: order.id,
    orderIds: [order.id],
    orderType: "takeaway",
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    items: consolidatedItems,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    discountReason,
    taxableAmount: totals.taxableAmount,
    taxRatePercent: totals.taxRatePercent,
    taxAmount: totals.taxAmount,
    grandTotal: totals.grandTotal,
    paymentStatus: "pending",
    paymentMode: null,
    splitBreakdown: null,
    settledAt: null,
    settledBy: null,
    voidReason: null,
    createdAt: new Date().toISOString(),
  };

  store.bills.unshift(newBill);
  return newBill;
}

/**
 * Settles a bill at the counter.
 * Validates payment amounts, marks session as closed, and frees the table.
 */
export function settleBill(
  billId: string,
  paymentMode: PaymentMode,
  splitBreakdown?: { cash?: number; upi?: number; card?: number } | null,
  settledBy: string = "Counter Staff"
): DatabaseBill {
  const bill = store.bills.find((b) => b.id === billId);
  if (!bill) {
    throw new Error(`Bill ${billId} not found`);
  }

  if (bill.paymentStatus === "paid") {
    return bill; // Already settled idempotent
  }

  if (bill.paymentStatus === "void") {
    throw new Error(`Cannot settle a voided bill`);
  }

  // Validate split payment matching grand total
  if (paymentMode === "split") {
    if (!splitBreakdown) {
      throw new Error("Split payment requires breakdown of amounts");
    }
    const splitSum =
      (splitBreakdown.cash || 0) +
      (splitBreakdown.upi || 0) +
      (splitBreakdown.card || 0);

    if (Math.round(splitSum) !== Math.round(bill.grandTotal)) {
      throw new Error(
        `Split payment total (₹${splitSum}) does not equal bill grand total (₹${bill.grandTotal})`
      );
    }
  }

  const now = new Date().toISOString();
  bill.paymentStatus = "paid";
  bill.paymentMode = paymentMode;
  bill.splitBreakdown = paymentMode === "split" ? splitBreakdown : null;
  bill.settledAt = now;
  bill.settledBy = settledBy;

  // If table session is associated, close session and free the table
  if (bill.tableSessionId) {
    const session = store.sessions.find((s) => s.id === bill.tableSessionId);
    if (session) {
      session.status = "closed";
      session.closedAt = now;
    }

    // Mark orders as served / completed
    for (const ordId of bill.orderIds) {
      const ord = store.orders.find((o) => o.id === ordId);
      if (ord && (ord.status === "ready" || ord.status === "placed" || ord.status === "accepted" || ord.status === "preparing")) {
        ord.status = "served";
        ord.updatedAt = now;
        broadcastOrder(ord);
      }
    }
  } else if (bill.orderId) {
    const ord = store.orders.find((o) => o.id === bill.orderId);
    if (ord && ord.status !== "served") {
      ord.status = "served";
      ord.updatedAt = now;
      broadcastOrder(ord);
    }
  }

  return bill;
}

/**
 * Voids a bill. Enforces Rule #5: Finalized bills are immutable; corrections create void.
 */
export function voidBill(billId: string, voidReason: string): DatabaseBill {
  const bill = store.bills.find((b) => b.id === billId);
  if (!bill) {
    throw new Error(`Bill ${billId} not found`);
  }

  bill.paymentStatus = "void";
  bill.voidReason = voidReason;

  // Re-open table session if it was in billed status
  if (bill.tableSessionId) {
    const session = store.sessions.find((s) => s.id === bill.tableSessionId);
    if (session && session.status === "billed") {
      session.status = "active";
    }
  }

  return bill;
}
