-- ==========================================================
-- Meeva Greens Cafe — Production Database Seed
-- ==========================================================

-- 1. Insert Cafe Settings
INSERT INTO cafe_settings (
    name,
    tax_rate,
    tax_inclusive,
    gstin,
    currency,
    currency_symbol,
    operating_hours
) VALUES (
    'Meeva Greens',
    0.00,
    false,
    NULL,
    'INR',
    '₹',
    '{"schedule":"8:00 AM – 10:30 PM","openTime":"08:00","closeTime":"22:30","closedDay":"Monday"}'::jsonb
);

-- 2. Insert Dine-In Tables (10 Tables)
INSERT INTO tables (label, qr_token, capacity, is_active) VALUES
('Table 1', 'token-mg-t01-dinein', 2, true),
('Table 2', 'token-mg-t02-dinein', 2, true),
('Table 3', 'token-mg-t03-dinein', 4, true),
('Table 4', 'token-mg-t04-dinein', 4, true),
('Table 5', 'token-mg-t05-dinein', 4, true),
('Table 6', 'token-mg-t06-dinein', 6, true),
('Table 7', 'token-mg-t07-dinein', 2, true),
('Table 8', 'token-mg-t08-dinein', 2, true),
('Table 9', 'token-mg-t09-dinein', 4, true),
('Table 10 (Garden)', 'token-mg-t10-dinein', 6, true);
