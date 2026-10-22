import {
  Cafe,
  CafeTable,
  MenuCategory,
  MenuItem,
  Customer,
  OrderWithDetails,
  CreateOrderPayload,
  OrderStatus,
  StaffProfile,
  PrivacyRequest,
  PrivacyRequestType,
  LoyaltyReward,
  WhatsAppCampaign,
} from '../types';
import { dbStore } from './dbStore';
import { generateSecureTableToken } from '../utils/formatters';

const STAFF_AUTH_KEY = 'cafe_staff_auth';

export interface SalesSummary {
  todayOrderCount: number;
  todaySalesPaise: number;
  ordersByHour: Array<{ hour: string; count: number }>;
  topItems: Array<{ name: string; quantity: number; totalPaise: number }>;
}

export const api = {
  // --- Public Cafe & Menu ---
  async getCafe(): Promise<Cafe> {
    return dbStore.getCafe();
  },

  async getMenu(): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> {
    const categories = dbStore.getCategories().filter((c) => c.is_active);
    const items = dbStore.getMenuItems().filter((i) => i.is_available);
    return { categories, items };
  },

  // Owner view of all menu items (including unavailable)
  async getAllMenuItems(): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> {
    return {
      categories: dbStore.getCategories(),
      items: dbStore.getMenuItems(),
    };
  },

  async updateMenuItem(
    id: string,
    updates: Partial<Pick<MenuItem, 'price_paise' | 'is_available'>>
  ): Promise<MenuItem> {
    return dbStore.updateMenuItem(id, updates);
  },

  // --- Table and QR Ordering ---
  async getTableByToken(token: string): Promise<CafeTable | null> {
    return dbStore.getTableByToken(token);
  },

  async getTables(): Promise<CafeTable[]> {
    return dbStore.getTables();
  },

  async regenerateTableToken(tableId: string): Promise<CafeTable> {
    const newToken = generateSecureTableToken(24);
    return dbStore.regenerateTableToken(tableId, newToken);
  },

  async createOrder(payload: CreateOrderPayload): Promise<{
    order_id: string;
    short_ref: string;
    points_earned?: number;
    total_points?: number;
  }> {
    return dbStore.createOrder(payload);
  },

  async getOrderStatus(orderId: string): Promise<OrderWithDetails | null> {
    return dbStore.getOrderStatus(orderId);
  },

  // --- Kitchen Live Orders ---
  async getKitchenOrders(): Promise<OrderWithDetails[]> {
    return dbStore.getKitchenOrders();
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    return dbStore.updateOrderStatus(orderId, newStatus);
  },

  subscribeToOrders(callback: () => void): () => void {
    return dbStore.subscribe(callback);
  },

  // --- Owner Operations & Privacy ---
  async getConsentedCustomers(): Promise<Customer[]> {
    return dbStore.getCustomers().filter((c) => c.marketing_consent && c.deleted_at === null);
  },

  async eraseCustomer(customerId: string): Promise<void> {
    dbStore.eraseCustomer(customerId);
  },

  async getSalesSummary(): Promise<SalesSummary> {
    const orders = dbStore.getOrders();
    const orderItems = dbStore.getOrderItems();

    const todayDate = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(
      (o) => o.created_at.slice(0, 10) === todayDate && o.status !== 'cancelled'
    );

    const todayOrderIds = new Set(todayOrders.map((o) => o.id));
    const todayItems = orderItems.filter((oi) => todayOrderIds.has(oi.order_id));

    const todaySalesPaise = todayItems.reduce(
      (sum, item) => sum + item.unit_price_paise_snapshot * item.quantity,
      0
    );

    // Orders by hour
    const hourMap = new Map<number, number>();
    for (let h = 8; h <= 23; h++) {
      hourMap.set(h, 0);
    }
    todayOrders.forEach((o) => {
      const orderHour = new Date(o.created_at).getHours();
      hourMap.set(orderHour, (hourMap.get(orderHour) || 0) + 1);
    });

    const ordersByHour = Array.from(hourMap.entries()).map(([hour, count]) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count,
    }));

    // Top items
    const itemMap = new Map<string, { quantity: number; totalPaise: number }>();
    todayItems.forEach((oi) => {
      const existing = itemMap.get(oi.item_name_snapshot) || { quantity: 0, totalPaise: 0 };
      itemMap.set(oi.item_name_snapshot, {
        quantity: existing.quantity + oi.quantity,
        totalPaise: existing.totalPaise + oi.unit_price_paise_snapshot * oi.quantity,
      });
    });

    const topItems = Array.from(itemMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      todayOrderCount: todayOrders.length,
      todaySalesPaise,
      ordersByHour,
      topItems,
    };
  },

  async submitPrivacyRequest(req: {
    phone_or_email: string;
    request_type: PrivacyRequestType;
    message: string;
  }): Promise<PrivacyRequest> {
    return dbStore.submitPrivacyRequest(req);
  },

  async getPrivacyRequests(): Promise<PrivacyRequest[]> {
    return dbStore.getPrivacyRequests();
  },

  async resolvePrivacyRequest(id: string): Promise<PrivacyRequest> {
    return dbStore.resolvePrivacyRequest(id);
  },

  // --- Staff Auth ---
  getCurrentStaff(): StaffProfile | null {
    try {
      const saved = localStorage.getItem(STAFF_AUTH_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  async loginStaff(email: string, role: 'kitchen' | 'owner'): Promise<StaffProfile> {
    const profile: StaffProfile = {
      user_id: crypto.randomUUID(),
      cafe_id: dbStore.getCafe().id,
      role,
      email,
    };
    localStorage.setItem(STAFF_AUTH_KEY, JSON.stringify(profile));
    return profile;
  },

  logoutStaff(): void {
    localStorage.removeItem(STAFF_AUTH_KEY);
  },

  // --- Phase 4: Loyalty Points ---
  async getLoyaltyRewards(): Promise<LoyaltyReward[]> {
    return dbStore.getLoyaltyRewards();
  },

  async getCustomerLoyalty(phone: string): Promise<{ customer: Customer | null; points: number; availableRewards: LoyaltyReward[] }> {
    return dbStore.getCustomerLoyalty(phone);
  },

  // --- Phase 4: WhatsApp Campaigns ---
  async getWhatsAppCampaigns(): Promise<WhatsAppCampaign[]> {
    return dbStore.getWhatsAppCampaigns();
  },

  async createWhatsAppCampaign(campaign: Omit<WhatsAppCampaign, 'id' | 'cafe_id' | 'status' | 'sent_at'>): Promise<WhatsAppCampaign> {
    return dbStore.createWhatsAppCampaign(campaign);
  },
};

