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
  tableToken?: string | null;
  tableLabel?: string | null;
  pickupToken?: string | null;
  customerName: string;
  customerPhone: string;
  notes?: string | null;
  status: OrderStatus;
  subtotal: number;
  discountAmount?: number;
  taxableAmount?: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseOrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  itemNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  selectedOptions: any[];
  itemTotal: number;
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

export interface DatabaseBill {
  id: string;
  invoiceNumber: string;
  tableSessionId?: string | null;
  orderId?: string | null;
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMode?: PaymentMode | null;
  settledAt?: string | null;
  createdAt: string;
}
