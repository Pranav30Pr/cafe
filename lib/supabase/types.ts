export type OrderType = "dine_in" | "takeaway";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled"
  | "rejected";

export type SessionStatus = "active" | "billed" | "closed";

export type PaymentStatus = "pending" | "paid" | "void";

export type PaymentMode = "cash" | "upi" | "card" | "split";

export interface DatabaseOrder {
  id: string;
  orderNumber: number;
  orderType: OrderType;
  tableSessionId: string | null;
  pickupToken: string | null;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
}

export interface DatabaseTableSession {
  id: string;
  tableId: string;
  status: SessionStatus;
  customerName: string;
  customerPhone: string;
  openedAt: string;
  closedAt: string | null;
}
