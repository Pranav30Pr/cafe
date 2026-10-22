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
  tableToken: string;
  tableLabel: string;
  customerName: string;
  customerPhone: string;
  status: SessionStatus;
  orderIds: string[];
  openedAt: string;
  closedAt: string | null;
}

export interface BillItemSnapshot {
  name: string;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
  optionsSummary?: string[];
}

export interface DatabaseBill {
  id: string;
  invoiceNumber: string;
  tableSessionId?: string | null;
  tableToken?: string | null;
  tableLabel?: string | null;
  orderId?: string | null;
  orderIds: string[];
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  items: BillItemSnapshot[];
  subtotal: number;
  discountAmount: number;
  discountReason?: string;
  taxableAmount: number;
  taxRatePercent: number;
  taxAmount: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMode?: PaymentMode | null;
  splitBreakdown?: {
    cash?: number;
    upi?: number;
    card?: number;
  } | null;
  settledAt?: string | null;
  settledBy?: string | null;
  voidReason?: string | null;
  createdAt: string;
}
