// In-browser database store simulating Supabase Postgres + RPCs for development & test environments.
// Matches supabase/schema.sql exactly.

import {
  Cafe,
  CafeTable,
  MenuCategory,
  MenuItem,
  Customer,
  ConsentLog,
  Order,
  OrderItem,
  PrivacyRequest,
  OrderWithDetails,
  CreateOrderPayload,
  OrderStatus,
} from '../types';
import { getFirstName } from '../utils/formatters';

const STORAGE_KEY_PREFIX = 'cafe_db_';

// Initial seed data adhering to Section 10 and seed.sql
const DEFAULT_CAFE: Cafe = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Artisan Roast Cafe',
  legal_name: '[[CLIENT_TO_PROVIDE: registered legal name]]',
  address: '[[CLIENT_TO_PROVIDE: full address, e.g. Shop 4, Lane 5, Koregaon Park, Pune 411001]]',
  phone: '[[CLIENT_TO_PROVIDE: phone number]]',
  email: '[[CLIENT_TO_PROVIDE: email address]]',
  fssai_number: '[[CLIENT_TO_PROVIDE: 14 digit FSSAI licence number]]',
  gstin: '[[CLIENT_TO_PROVIDE: GSTIN if registered]]',
  opening_hours: {
    weekdays: '8:00 AM to 10:00 PM',
    weekends: '8:00 AM to 11:00 PM',
  },
  grievance_name: '[[CLIENT_TO_PROVIDE: grievance contact person name]]',
  grievance_email: '[[CLIENT_TO_PROVIDE: grievance email]]',
  grievance_phone: '[[CLIENT_TO_PROVIDE: grievance phone]]',
  created_at: new Date().toISOString(),
};

const DEFAULT_TABLES: CafeTable[] = [
  { id: 'b0000000-0000-0000-0000-000000000001', cafe_id: DEFAULT_CAFE.id, label: 'Table 1', token: 'tbl_tok_demo_table_01', is_active: true, created_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000002', cafe_id: DEFAULT_CAFE.id, label: 'Table 2', token: 'tbl_tok_demo_table_02', is_active: true, created_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000003', cafe_id: DEFAULT_CAFE.id, label: 'Table 3', token: 'tbl_tok_demo_table_03', is_active: true, created_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000004', cafe_id: DEFAULT_CAFE.id, label: 'Table 4', token: 'tbl_tok_demo_table_04', is_active: true, created_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000005', cafe_id: DEFAULT_CAFE.id, label: 'Table 5', token: 'tbl_tok_demo_table_05', is_active: true, created_at: new Date().toISOString() },
];

const DEFAULT_CATEGORIES: MenuCategory[] = [
  { id: 'c0000000-0000-0000-0000-000000000001', cafe_id: DEFAULT_CAFE.id, name: 'Hot Brews', sort_order: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000002', cafe_id: DEFAULT_CAFE.id, name: 'Cold Brews & Iced Tea', sort_order: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000003', cafe_id: DEFAULT_CAFE.id, name: 'Breakfast & Small Plates', sort_order: 3, is_active: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000004', cafe_id: DEFAULT_CAFE.id, name: 'Bakery', sort_order: 4, is_active: true, created_at: new Date().toISOString() },
];

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'd0000000-0000-0000-0000-000000000001', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000001', name: 'Espresso', description: 'Double shot of single origin espresso', price_paise: 12000, diet: 'veg', allergen_note: null, is_available: true, image_path: null, image_alt: null, sort_order: 1, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000002', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000001', name: 'Cappuccino', description: 'Espresso with steamed fresh milk and microfoam', price_paise: 16000, diet: 'veg', allergen_note: 'Contains dairy', is_available: true, image_path: null, image_alt: null, sort_order: 2, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000003', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000001', name: 'Masala Chai', description: 'Slow-brewed Assam black tea with ginger and green cardamom', price_paise: 10000, diet: 'veg', allergen_note: 'Contains dairy', is_available: true, image_path: null, image_alt: null, sort_order: 3, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000004', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000002', name: 'Classic Cold Brew', description: 'Steeped for 18 hours in cold filtered water', price_paise: 18000, diet: 'veg', allergen_note: null, is_available: true, image_path: null, image_alt: null, sort_order: 1, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000005', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000002', name: 'Lemon Mint Iced Tea', description: 'Brewed black tea with fresh lemon juice and mint', price_paise: 14000, diet: 'veg', allergen_note: null, is_available: true, image_path: null, image_alt: null, sort_order: 2, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000006', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000003', name: 'Avocado Sourdough Toast', description: 'Toasted sourdough with crushed avocado and sea salt', price_paise: 24000, diet: 'veg', allergen_note: 'Contains gluten', is_available: true, image_path: null, image_alt: null, sort_order: 1, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000007', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000003', name: 'Scrambled Eggs on Toast', description: 'Farm eggs scrambled with butter on toasted brioche', price_paise: 22000, diet: 'egg', allergen_note: 'Contains egg, dairy, gluten', is_available: true, image_path: null, image_alt: null, sort_order: 2, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000008', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000003', name: 'Chicken Pesto Sandwich', description: 'Grilled chicken breast with basil pesto and buffalo mozzarella', price_paise: 28000, diet: 'non_veg', allergen_note: 'Contains pine nuts, dairy, gluten', is_available: true, image_path: null, image_alt: null, sort_order: 3, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000009', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000004', name: 'Butter Croissant', description: 'Flaky laminated French butter pastry', price_paise: 15000, diet: 'veg', allergen_note: 'Contains dairy, gluten', is_available: true, image_path: null, image_alt: null, sort_order: 1, created_at: new Date().toISOString() },
];

class DatabaseStore {
  private listeners: Array<() => void> = [];

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
      this.notifyListeners();
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Listener callback error', err);
      }
    });
  }

  // --- Cafes ---
  getCafe(): Cafe {
    return this.getItem<Cafe>('cafe', DEFAULT_CAFE);
  }

  // --- Tables ---
  getTables(): CafeTable[] {
    return this.getItem<CafeTable[]>('tables', DEFAULT_TABLES);
  }

  getTableByToken(token: string): CafeTable | null {
    const tables = this.getTables();
    return tables.find((t) => t.token === token && t.is_active) || null;
  }

  regenerateTableToken(tableId: string, newToken: string): CafeTable {
    const tables = this.getTables();
    const idx = tables.findIndex((t) => t.id === tableId);
    if (idx === -1) throw new Error('Table not found');
    tables[idx] = {
      ...tables[idx],
      token: newToken,
    };
    this.setItem('tables', tables);
    return tables[idx];
  }

  // --- Categories & Menu Items ---
  getCategories(): MenuCategory[] {
    return this.getItem<MenuCategory[]>('categories', DEFAULT_CATEGORIES);
  }

  getMenuItems(): MenuItem[] {
    return this.getItem<MenuItem[]>('menu_items', DEFAULT_MENU_ITEMS);
  }

  updateMenuItem(id: string, updates: Partial<Pick<MenuItem, 'price_paise' | 'is_available'>>): MenuItem {
    const items = this.getMenuItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Menu item not found');

    if (updates.price_paise !== undefined && updates.price_paise < 0) {
      throw new Error('Price cannot be negative');
    }

    items[idx] = {
      ...items[idx],
      ...updates,
    };
    this.setItem('menu_items', items);
    return items[idx];
  }

  // --- Customers & Consent ---
  getCustomers(): Customer[] {
    return this.getItem<Customer[]>('customers', []);
  }

  getConsentLogs(): ConsentLog[] {
    return this.getItem<ConsentLog[]>('consent_log', []);
  }

  eraseCustomer(customerId: string): void {
    const customers = this.getCustomers();
    const idx = customers.findIndex((c) => c.id === customerId);
    if (idx === -1) throw new Error('Customer not found');

    customers[idx] = {
      ...customers[idx],
      name: null,
      phone: null,
      birthday: null,
      marketing_consent: false,
      deleted_at: new Date().toISOString(),
    };
    this.setItem('customers', customers);

    // Record append-only consent withdrawal log
    const logs = this.getConsentLogs();
    logs.push({
      id: crypto.randomUUID(),
      customer_id: customerId,
      purpose: 'marketing_whatsapp',
      granted: false,
      consent_text_version: 'withdrawn_by_erasure',
      created_at: new Date().toISOString(),
    });
    this.setItem('consent_log', logs);
  }

  // --- Orders & Items ---
  getOrders(): Order[] {
    return this.getItem<Order[]>('orders', []);
  }

  getOrderItems(): OrderItem[] {
    return this.getItem<OrderItem[]>('order_items', []);
  }

  // RPC: create_order implementation (Atomic server-side price calculation)
  createOrder(payload: CreateOrderPayload): { order_id: string; short_ref: string } {
    const table = this.getTableByToken(payload.token);
    if (!table) {
      throw new Error('Invalid or inactive table token');
    }

    // Limit check: 1 to 30 items
    if (!payload.items || payload.items.length === 0 || payload.items.length > 30) {
      throw new Error('Order must contain between 1 and 30 items');
    }

    // Phone validation
    const cleanPhone = payload.phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new Error('Invalid mobile number. Must be a 10-digit Indian mobile number.');
    }

    if (payload.note && payload.note.length > 200) {
      throw new Error('Special instructions cannot exceed 200 characters.');
    }

    const now = new Date().toISOString();
    const cafe = this.getCafe();

    // 1. Upsert customer
    const customers = this.getCustomers();
    let customer = customers.find((c) => c.phone === cleanPhone && c.deleted_at === null);

    if (customer) {
      customer.name = payload.name;
      customer.marketing_consent = payload.marketing_consent;
      if (payload.marketing_consent) {
        customer.marketing_consent_at = now;
      }
      customer.consent_text_version = payload.consent_version || 'v1.0';
      customer.last_order_at = now;
    } else {
      customer = {
        id: crypto.randomUUID(),
        cafe_id: cafe.id,
        name: payload.name,
        phone: cleanPhone,
        marketing_consent: payload.marketing_consent,
        marketing_consent_at: payload.marketing_consent ? now : null,
        consent_text_version: payload.consent_version || 'v1.0',
        birthday: null,
        loyalty_points: 0,
        last_order_at: now,
        deleted_at: null,
        created_at: now,
      };
      customers.push(customer);
    }
    this.setItem('customers', customers);

    // 2. Append consent log
    const consentLogs = this.getConsentLogs();
    consentLogs.push({
      id: crypto.randomUUID(),
      customer_id: customer.id,
      purpose: 'order_contact',
      granted: true,
      consent_text_version: payload.consent_version || 'v1.0',
      created_at: now,
    });
    consentLogs.push({
      id: crypto.randomUUID(),
      customer_id: customer.id,
      purpose: 'marketing_whatsapp',
      granted: payload.marketing_consent,
      consent_text_version: payload.consent_version || 'v1.0',
      created_at: now,
    });
    this.setItem('consent_log', consentLogs);

    // 3. Create Order
    const orderId = crypto.randomUUID();
    const newOrder: Order = {
      id: orderId,
      cafe_id: cafe.id,
      table_id: table.id,
      customer_id: customer.id,
      status: 'new',
      note: payload.note || null,
      created_at: now,
      updated_at: now,
    };

    const orders = this.getOrders();
    orders.unshift(newOrder); // newest first

    // 4. Create Order Items with SERVER-SIDE price lookup from menu items
    const menuItems = this.getMenuItems();
    const orderItems = this.getOrderItems();

    for (const itemPayload of payload.items) {
      if (itemPayload.quantity <= 0 || itemPayload.quantity > 20) {
        throw new Error('Item quantity must be between 1 and 20');
      }

      const menuItem = menuItems.find((mi) => mi.id === itemPayload.menu_item_id);
      if (!menuItem || !menuItem.is_available) {
        throw new Error(`Item "${menuItem ? menuItem.name : 'Unknown'}" is not available`);
      }

      // Record snapshot with server-side price
      orderItems.push({
        id: crypto.randomUUID(),
        order_id: orderId,
        menu_item_id: menuItem.id,
        item_name_snapshot: menuItem.name,
        unit_price_paise_snapshot: menuItem.price_paise,
        quantity: itemPayload.quantity,
      });
    }

    this.setItem('order_items', orderItems);
    this.setItem('orders', orders);

    return {
      order_id: orderId,
      short_ref: orderId.substring(0, 6).toUpperCase(),
    };
  }

  // Hydrated single order query for customer confirmation page (Customer privacy protected)
  getOrderStatus(orderId: string): OrderWithDetails | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const tables = this.getTables();
    const table = tables.find((t) => t.id === order.table_id);
    const orderItems = this.getOrderItems().filter((oi) => oi.order_id === order.id);

    return {
      id: order.id,
      short_ref: order.id.substring(0, 6).toUpperCase(),
      table_label: table ? table.label : 'Table',
      status: order.status,
      note: order.note,
      created_at: order.created_at,
      customer_first_name: '', // Empty for public read
      items: orderItems.map((oi) => ({
        id: oi.id,
        menu_item_id: oi.menu_item_id,
        item_name: oi.item_name_snapshot,
        quantity: oi.quantity,
        unit_price_paise: oi.unit_price_paise_snapshot,
      })),
    };
  }

  // Hydrated order list for kitchen & owner
  getKitchenOrders(): OrderWithDetails[] {
    const orders = this.getOrders();
    const tables = this.getTables();
    const customers = this.getCustomers();
    const orderItems = this.getOrderItems();

    return orders.map((o) => {
      const table = tables.find((t) => t.id === o.table_id);
      const customer = customers.find((c) => c.id === o.customer_id);
      const items = orderItems.filter((oi) => oi.order_id === o.id);

      return {
        id: o.id,
        short_ref: o.id.substring(0, 6).toUpperCase(),
        table_label: table ? table.label : 'Table',
        status: o.status,
        note: o.note,
        created_at: o.created_at,
        // Kitchen only sees first name, NEVER the phone number (Section 5.3)
        customer_first_name: getFirstName(customer?.name),
        customer_phone: customer?.phone || undefined,
        items: items.map((oi) => ({
          id: oi.id,
          menu_item_id: oi.menu_item_id,
          item_name: oi.item_name_snapshot,
          quantity: oi.quantity,
          unit_price_paise: oi.unit_price_paise_snapshot,
        })),
      };
    });
  }

  // Status transition validation (Section 5.5)
  // `new -> accepted -> preparing -> ready -> served`. `cancelled` allowed from `new`, `accepted`, `preparing`.
  updateOrderStatus(orderId: string, newStatus: OrderStatus): Order {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const currentStatus = orders[idx].status;
    if (currentStatus === newStatus) return orders[idx];

    if (newStatus === 'cancelled') {
      if (['new', 'accepted', 'preparing'].includes(currentStatus)) {
        orders[idx] = { ...orders[idx], status: 'cancelled', updated_at: new Date().toISOString() };
        this.setItem('orders', orders);
        return orders[idx];
      }
      throw new Error(`Cannot cancel order that is already ${currentStatus}`);
    }

    const validForward: Record<OrderStatus, OrderStatus> = {
      new: 'accepted',
      accepted: 'preparing',
      preparing: 'ready',
      ready: 'served',
      served: 'served',
      cancelled: 'cancelled',
    };

    if (validForward[currentStatus] === newStatus) {
      orders[idx] = { ...orders[idx], status: newStatus, updated_at: new Date().toISOString() };
      this.setItem('orders', orders);
      return orders[idx];
    }

    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }

  // --- Privacy Requests ---
  getPrivacyRequests(): PrivacyRequest[] {
    return this.getItem<PrivacyRequest[]>('privacy_requests', []);
  }

  submitPrivacyRequest(req: Omit<PrivacyRequest, 'id' | 'cafe_id' | 'status' | 'created_at' | 'resolved_at'>): PrivacyRequest {
    const cafe = this.getCafe();
    const requests = this.getPrivacyRequests();
    const newReq: PrivacyRequest = {
      id: crypto.randomUUID(),
      cafe_id: cafe.id,
      phone_or_email: req.phone_or_email,
      request_type: req.request_type,
      message: req.message,
      status: 'pending',
      created_at: new Date().toISOString(),
      resolved_at: null,
    };
    requests.unshift(newReq);
    this.setItem('privacy_requests', requests);
    return newReq;
  }

  resolvePrivacyRequest(id: string): PrivacyRequest {
    const requests = this.getPrivacyRequests();
    const idx = requests.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Privacy request not found');

    requests[idx] = {
      ...requests[idx],
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    };
    this.setItem('privacy_requests', requests);
    return requests[idx];
  }

  // Reset database to initial seed (useful in testing)
  resetToSeed(): void {
    this.setItem('cafe', DEFAULT_CAFE);
    this.setItem('tables', DEFAULT_TABLES);
    this.setItem('categories', DEFAULT_CATEGORIES);
    this.setItem('menu_items', DEFAULT_MENU_ITEMS);
    this.setItem('customers', []);
    this.setItem('consent_log', []);
    this.setItem('orders', []);
    this.setItem('order_items', []);
    this.setItem('privacy_requests', []);
  }
}

export const dbStore = new DatabaseStore();
