// Domain types matching PROJECT_SPEC.md Section 4 & 5

export type DietType = 'veg' | 'non_veg' | 'egg';

export type OrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export type StaffRole = 'kitchen' | 'owner';

export type PrivacyRequestType =
  | 'access'
  | 'correction'
  | 'erasure'
  | 'withdraw_consent'
  | 'other';

export type PrivacyRequestStatus = 'pending' | 'resolved';

export interface Cafe {
  id: string;
  name: string;
  legal_name: string;
  address: string;
  phone: string;
  email: string;
  fssai_number: string;
  gstin: string | null;
  opening_hours: Record<string, string>;
  grievance_name: string;
  grievance_email: string;
  grievance_phone: string;
  created_at: string;
}

export interface StaffProfile {
  user_id: string;
  cafe_id: string;
  role: StaffRole;
  email: string;
}

export interface CafeTable {
  id: string;
  cafe_id: string;
  label: string;
  token: string;
  is_active: boolean;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  cafe_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  cafe_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_paise: number; // Always integer paise, never float
  diet: DietType;
  allergen_note: string | null;
  is_available: boolean;
  image_path: string | null;
  image_alt: string | null;
  sort_order: number;
  created_at: string;
}

export interface Customer {
  id: string;
  cafe_id: string;
  name: string | null;
  phone: string | null;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  consent_text_version: string | null;
  birthday: string | null;
  loyalty_points: number;
  last_order_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface ConsentLog {
  id: string;
  customer_id: string;
  purpose: 'order_contact' | 'marketing_whatsapp';
  granted: boolean;
  consent_text_version: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name_snapshot: string;
  unit_price_paise_snapshot: number;
  quantity: number;
}

export interface Order {
  id: string; // UUID used as public reference
  cafe_id: string;
  table_id: string;
  customer_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

// Full hydrated order used in kitchen & order status displays
export interface OrderWithDetails {
  id: string;
  short_ref: string;
  table_label: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
  customer_first_name: string; // Only first name shown to kitchen (Section 5.3)
  customer_phone?: string; // Stored, but hidden from kitchen role
  items: Array<{
    id?: string;
    menu_item_id?: string;
    item_name: string;
    quantity: number;
    unit_price_paise: number;
  }>;
}

export interface PrivacyRequest {
  id: string;
  cafe_id: string;
  phone_or_email: string;
  request_type: PrivacyRequestType;
  message: string;
  status: PrivacyRequestStatus;
  created_at: string;
  resolved_at: string | null;
}

// Shopping cart item
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

// Submission payload for create_order RPC
export interface CreateOrderPayload {
  token: string;
  items: Array<{
    menu_item_id: string;
    quantity: number;
  }>;
  name: string;
  phone: string;
  note?: string;
  marketing_consent: boolean;
  consent_version?: string;
  redeem_reward_id?: string;
}

// Phase 4: Loyalty Points & Rewards
export interface LoyaltyReward {
  id: string;
  title: string;
  points_cost: number;
  discount_paise: number;
  badge: string;
  description: string;
}

// Phase 4: WhatsApp Campaigns (Meta Business Platform template style)
export type CampaignTargetAudience = 'all_consented' | 'high_loyalty' | 'athletes';

export interface WhatsAppCampaign {
  id: string;
  cafe_id: string;
  title: string;
  target_audience: CampaignTargetAudience;
  template_name: string;
  message_text: string;
  recipient_count: number;
  status: 'sent' | 'scheduled';
  sent_at: string;
}

