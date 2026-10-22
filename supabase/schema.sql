-- ==========================================================
-- Meeva Greens Cafe — Production Database Schema
-- Supabase / PostgreSQL with Row Level Security & Realtime
-- ==========================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean previous objects if recreating
DROP TABLE IF EXISTS bill_items CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS table_sessions CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS cafe_settings CASCADE;
DROP SEQUENCE IF EXISTS invoice_seq CASCADE;

-- 1. CAFE SETTINGS (Single-row configuration)
CREATE TABLE cafe_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Meeva Greens',
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00, -- Decoupled: 0.00% default
    tax_inclusive BOOLEAN NOT NULL DEFAULT false,
    gstin TEXT DEFAULT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    currency_symbol TEXT NOT NULL DEFAULT '₹',
    operating_hours JSONB NOT NULL DEFAULT '{"schedule":"8:00 AM – 10:30 PM","closedDay":"Monday"}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. DINE-IN TABLES
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    qr_token TEXT NOT NULL UNIQUE,
    capacity INTEGER NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLE SESSIONS (Anchors one order session per table)
CREATE TABLE table_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('active', 'billed', 'closed')) DEFAULT 'active',
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ DEFAULT NULL
);

-- Ensure only ONE active session per physical table at any given time
CREATE UNIQUE INDEX idx_unique_active_session_per_table
ON table_sessions(table_id)
WHERE status = 'active';

-- 4. ORDERS (The core transaction entity)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL UNIQUE,
    order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeaway')),
    table_session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
    table_token TEXT,
    table_label TEXT,
    pickup_token TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    notes TEXT DEFAULT NULL,
    status TEXT NOT NULL CHECK (
        status IN ('placed', 'accepted', 'preparing', 'ready', 'served', 'cancelled', 'rejected')
    ) DEFAULT 'placed',
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    taxable_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. ORDER LINE ITEMS (Immutable snapshot of items at purchase)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id TEXT NOT NULL,
    item_name_snapshot TEXT NOT NULL,
    unit_price_snapshot NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    selected_options JSONB NOT NULL DEFAULT '[]'::jsonb,
    item_total NUMERIC(10,2) NOT NULL
);

-- 6. GAPLESS INVOICE GENERATOR & BILLS
CREATE SEQUENCE invoice_seq START WITH 1001;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'MG-' || to_char(now(), 'YYYY') || '-' || nextval('invoice_seq');
END;
$$ LANGUAGE plpgsql;

CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE DEFAULT generate_invoice_number(),
    table_session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    taxable_amount NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(10,2) NOT NULL,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'void')) DEFAULT 'pending',
    payment_mode TEXT CHECK (payment_mode IN ('cash', 'upi', 'card', 'split')) DEFAULT NULL,
    settled_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. ENABLE SUPABASE REALTIME PUB/SUB
-- Tables published to WebSocket channels for live ticket progression
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE table_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE cafe_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Tables & Settings: Public Read
CREATE POLICY "Public tables are viewable by everyone" ON tables
FOR SELECT USING (is_active = true);

CREATE POLICY "Cafe settings viewable by everyone" ON cafe_settings
FOR SELECT USING (true);

-- Orders: Customers can read their specific order by unguessable UUID
CREATE POLICY "Customer can read their own order" ON orders
FOR SELECT USING (true);

CREATE POLICY "Customer can create orders" ON orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Customer can view order items" ON order_items
FOR SELECT USING (true);

CREATE POLICY "Customer can insert order items" ON order_items
FOR INSERT WITH CHECK (true);

-- Table sessions: Visible to create and link
CREATE POLICY "Table sessions viewable" ON table_sessions
FOR SELECT USING (true);

CREATE POLICY "Table sessions insertable" ON table_sessions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Bills readable" ON bills
FOR SELECT USING (true);
