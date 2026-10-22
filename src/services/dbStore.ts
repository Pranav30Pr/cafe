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
  LoyaltyReward,
  WhatsAppCampaign,
} from '../types';
import { getFirstName } from '../utils/formatters';

const STORAGE_KEY_PREFIX = 'cafe_db_';

// Initial seed data adhering to Section 10 and seed.sql
const DEFAULT_CAFE: Cafe = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Verde Fuel & Healthy Snack Bar',
  legal_name: '[[CLIENT_TO_PROVIDE: registered legal name]]',
  address: '[[CLIENT_TO_PROVIDE: full address, e.g. Shop 4, Lane 5, Koregaon Park, Pune 411001]]',
  phone: '[[CLIENT_TO_PROVIDE: phone number]]',
  email: '[[CLIENT_TO_PROVIDE: email address]]',
  fssai_number: '[[CLIENT_TO_PROVIDE: 14 digit FSSAI licence number]]',
  gstin: '[[CLIENT_TO_PROVIDE: GSTIN if registered]]',
  opening_hours: {
    weekdays: '7:00 AM to 10:00 PM',
    weekends: '7:00 AM to 11:00 PM',
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
  { id: 'c0000000-0000-0000-0000-000000000001', cafe_id: DEFAULT_CAFE.id, name: 'High-Protein Snacks', sort_order: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000002', cafe_id: DEFAULT_CAFE.id, name: 'Athlete Bowls & Fuel', sort_order: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000003', cafe_id: DEFAULT_CAFE.id, name: 'Superfood Smoothies', sort_order: 3, is_active: true, created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000004', cafe_id: DEFAULT_CAFE.id, name: 'Clean Cold Brews & Tonics', sort_order: 4, is_active: true, created_at: new Date().toISOString() },
];

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  // High-Protein Snacks
  { id: 'd0000000-0000-0000-0000-000000000002', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000001', name: 'Protein Energy Balls (3-pack)', description: 'Raw dates, organic almond butter, chia seeds and whey isolate', price_paise: 14000, diet: 'veg', allergen_note: 'Contains nuts, dairy', is_available: true, image_path: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=300&q=80', image_alt: 'Handmade protein energy balls', sort_order: 1, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000003', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000001', name: 'Roasted Paprika Edamame', description: 'Crunchy high-protein edamame with pink Himalayan salt and paprika', price_paise: 13000, diet: 'veg', allergen_note: 'Contains soy', is_available: true, image_path: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80', image_alt: 'Roasted seasoned edamame', sort_order: 2, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000004', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000001', name: 'Baked Sweet Potato Wedges', description: 'Air-crisped wedges with avocado dip for clean recovery carbs', price_paise: 16000, diet: 'veg', allergen_note: null, is_available: true, image_path: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=300&q=80', image_alt: 'Crispy sweet potato wedges', sort_order: 3, created_at: new Date().toISOString() },

  // Athlete Bowls & Fuel
  { id: 'd0000000-0000-0000-0000-000000000005', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000002', name: 'Grilled Herb Chicken Bowl', description: '200g lean chicken breast, warm quinoa, steamed broccoli & lemon tahini', price_paise: 28000, diet: 'non_veg', allergen_note: 'Contains sesame', is_available: true, image_path: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80', image_alt: 'Grilled herb chicken quinoa bowl', sort_order: 1, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000006', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000002', name: 'Tofu & Avocado Power Bowl', description: 'Grilled organic tofu, hass avocado, edamame, spinach and pumpkin seeds', price_paise: 24000, diet: 'veg', allergen_note: 'Contains soy', is_available: true, image_path: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80', image_alt: 'Fresh tofu and avocado bowl', sort_order: 2, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000007', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000002', name: 'Scrambled Eggs on Toast', description: 'Farm eggs scrambled with olive oil on toasted sourdough', price_paise: 22000, diet: 'egg', allergen_note: 'Contains egg, gluten', is_available: true, image_path: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=300&q=80', image_alt: 'Scrambled farm eggs on sourdough', sort_order: 3, created_at: new Date().toISOString() },

  // Superfood Smoothies
  { id: 'd0000000-0000-0000-0000-000000000008', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000003', name: 'Spirulina Green Detox Smoothie', description: 'Baby spinach, cucumber, green apple, organic spirulina and coconut water', price_paise: 19000, diet: 'veg', allergen_note: null, is_available: true, image_path: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=300&q=80', image_alt: 'Fresh green spirulina detox smoothie', sort_order: 1, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000009', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000003', name: 'Whey Protein Peanut Butter Shake', description: '32g whey protein isolate, crushed roasted peanuts and unsweetened almond milk', price_paise: 25000, diet: 'veg', allergen_note: 'Contains peanuts, dairy', is_available: true, image_path: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=300&q=80', image_alt: 'Rich peanut butter whey isolate shake', sort_order: 2, created_at: new Date().toISOString() },

  // Clean Cold Brews & Tonics (Espresso kept at sort 1 with 12000 paise for test suite compatibility)
  { id: 'd0000000-0000-0000-0000-000000000001', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000004', name: 'Espresso', description: 'Double shot of single origin pre-workout black espresso', price_paise: 12000, diet: 'veg', allergen_note: null, is_available: true, image_path: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=300&q=80', image_alt: 'Double shot espresso', sort_order: 1, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000010', cafe_id: DEFAULT_CAFE.id, category_id: 'c0000000-0000-0000-0000-000000000004', name: 'Electrolyte Fresh Coconut Water', description: 'Tender coconut water infused with lime zest and pink Himalayan salt', price_paise: 11000, diet: 'veg', allergen_note: null, is_available: true, image_path: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=300&q=80', image_alt: 'Chilled electrolyte fresh coconut water', sort_order: 2, created_at: new Date().toISOString() },
];


// Phase 4 Loyalty Rewards for Gym Members & Health-Conscious Customers
const DEFAULT_LOYALTY_REWARDS: LoyaltyReward[] = [
  {
    id: 'rew_electrolyte',
    title: 'Free Electrolyte Hydration Booster',
    points_cost: 20,
    discount_paise: 6000,
    badge: 'Hydration Boost',
    description: 'Add natural electrolytes & pink Himalayan minerals to any drink',
  },
  {
    id: 'rew_protein_snack',
    title: 'Free Protein Energy Snack',
    points_cost: 50,
    discount_paise: 14000,
    badge: 'Snack Reward',
    description: 'Complimentary 3-pack raw date & almond protein energy balls',
  },
  {
    id: 'rew_protein_shake',
    title: 'Free Superfood Protein Shake',
    points_cost: 100,
    discount_paise: 25000,
    badge: 'Athlete Shake',
    description: 'Full-size 32g Whey Isolate or Vegan Plant Protein Shake',
  },
];

// Phase 4 WhatsApp Campaigns (Meta Business Platform template style)
const DEFAULT_WHATSAPP_CAMPAIGNS: WhatsAppCampaign[] = [
  {
    id: 'camp_01',
    cafe_id: DEFAULT_CAFE.id,
    title: 'Post-Workout Fuel Special',
    target_audience: 'all_consented',
    template_name: 'meta_approved_post_workout_v1',
    message_text:
      'Hey athlete! Smashed your workout today? Fuel your recovery at Verde Fuel: get a complimentary Protein Energy Snack with any Smoothie or Fuel Bowl today. Show this message at the counter. Reply STOP to opt out.',
    recipient_count: 142,
    status: 'sent',
    sent_at: '2026-10-21T08:00:00.000Z',
  },
  {
    id: 'camp_02',
    cafe_id: DEFAULT_CAFE.id,
    title: 'Weekend 2x Loyalty Points for Healthy Snacks',
    target_audience: 'high_loyalty',
    template_name: 'meta_approved_loyalty_boost_v1',
    message_text:
      'Green Fuel VIP: Earn DOUBLE Green Points this weekend on all healthy snacks and protein bowls. Level up your gains faster! Reply STOP to opt out.',
    recipient_count: 58,
    status: 'sent',
    sent_at: '2026-10-18T10:30:00.000Z',
  },
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
    const rawItems = this.getItem<MenuItem[]>('menu_items', DEFAULT_MENU_ITEMS);
    return rawItems.map((item) => {
      const match = DEFAULT_MENU_ITEMS.find((d) => d.id === item.id) || DEFAULT_MENU_ITEMS.find((d) => d.name === item.name);
      return {
        ...item,
        category_id: (match && match.category_id) ? match.category_id : item.category_id,
        image_path: item.image_path || (match ? match.image_path : null),
        image_alt: item.image_alt || (match ? match.image_alt : item.name),
        description: item.description || (match ? match.description : ''),
      };
    });
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
  createOrder(payload: CreateOrderPayload): {
    order_id: string;
    short_ref: string;
    points_earned?: number;
    total_points?: number;
  } {
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

    // Calculate total order amount for points calculation
    const totalOrderPaise = orderItems
      .filter((oi) => oi.order_id === orderId)
      .reduce((sum, oi) => sum + oi.unit_price_paise_snapshot * oi.quantity, 0);

    // Phase 4: Earn 1 Green Fuel Point for every ₹10 (1000 paise) spent
    const pointsEarned = Math.max(1, Math.floor(totalOrderPaise / 1000));

    // Handle reward redemption if requested
    if (payload.redeem_reward_id) {
      const rewards = this.getLoyaltyRewards();
      const reward = rewards.find((r) => r.id === payload.redeem_reward_id);
      if (reward && (customer.loyalty_points || 0) >= reward.points_cost) {
        customer.loyalty_points = Math.max(0, (customer.loyalty_points || 0) - reward.points_cost);
      }
    }

    // Add points earned on this order
    customer.loyalty_points = (customer.loyalty_points || 0) + pointsEarned;
    this.setItem('customers', customers);

    return {
      order_id: orderId,
      short_ref: orderId.substring(0, 6).toUpperCase(),
      points_earned: pointsEarned,
      total_points: customer.loyalty_points,
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

  // --- Phase 4: Loyalty Points ---
  getLoyaltyRewards(): LoyaltyReward[] {
    return this.getItem<LoyaltyReward[]>('loyalty_rewards', DEFAULT_LOYALTY_REWARDS);
  }

  getCustomerLoyalty(phone: string): { customer: Customer | null; points: number; availableRewards: LoyaltyReward[] } {
    const cleanPhone = phone.replace(/\D/g, '');
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.phone === cleanPhone && c.deleted_at === null) || null;
    const points = customer ? customer.loyalty_points || 0 : 0;
    const rewards = this.getLoyaltyRewards();
    const availableRewards = rewards.filter((r) => points >= r.points_cost);

    return {
      customer,
      points,
      availableRewards,
    };
  }

  // --- Phase 4: WhatsApp Campaigns ---
  getWhatsAppCampaigns(): WhatsAppCampaign[] {
    return this.getItem<WhatsAppCampaign[]>('whatsapp_campaigns', DEFAULT_WHATSAPP_CAMPAIGNS);
  }

  createWhatsAppCampaign(campaign: Omit<WhatsAppCampaign, 'id' | 'cafe_id' | 'status' | 'sent_at'>): WhatsAppCampaign {
    const campaigns = this.getWhatsAppCampaigns();
    const newCamp: WhatsAppCampaign = {
      id: `camp_${Date.now()}`,
      cafe_id: this.getCafe().id,
      title: campaign.title,
      target_audience: campaign.target_audience,
      template_name: campaign.template_name,
      message_text: campaign.message_text,
      recipient_count: campaign.recipient_count,
      status: 'sent',
      sent_at: new Date().toISOString(),
    };
    campaigns.unshift(newCamp);
    this.setItem('whatsapp_campaigns', campaigns);
    return newCamp;
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
    this.setItem('loyalty_rewards', DEFAULT_LOYALTY_REWARDS);
    this.setItem('whatsapp_campaigns', DEFAULT_WHATSAPP_CAMPAIGNS);
  }
}

export const dbStore = new DatabaseStore();
