-- Seed data for development and testing

-- 1. Insert Cafe record
insert into public.cafes (
  id, name, legal_name, address, phone, email,
  fssai_number, gstin, opening_hours,
  grievance_name, grievance_email, grievance_phone
) values (
  'a0000000-0000-0000-0000-000000000001',
  'Artisan Roast Cafe',
  '[[CLIENT_TO_PROVIDE: registered legal name]]',
  '[[CLIENT_TO_PROVIDE: full address, e.g. Shop 4, Lane 5, Koregaon Park, Pune 411001]]',
  '[[CLIENT_TO_PROVIDE: phone number]]',
  '[[CLIENT_TO_PROVIDE: email address]]',
  '[[CLIENT_TO_PROVIDE: 14 digit FSSAI licence number]]',
  '[[CLIENT_TO_PROVIDE: GSTIN if registered]]',
  '{"weekdays": "8:00 AM to 10:00 PM", "weekends": "8:00 AM to 11:00 PM"}'::jsonb,
  '[[CLIENT_TO_PROVIDE: grievance contact person name]]',
  '[[CLIENT_TO_PROVIDE: grievance email]]',
  '[[CLIENT_TO_PROVIDE: grievance phone]]'
) on conflict (id) do nothing;

-- 2. Insert Tables
insert into public.cafe_tables (id, cafe_id, label, token, is_active) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Table 1', 'tbl_tok_demo_table_01', true),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Table 2', 'tbl_tok_demo_table_02', true),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Table 3', 'tbl_tok_demo_table_03', true),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Table 4', 'tbl_tok_demo_table_04', true),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Table 5', 'tbl_tok_demo_table_05', true)
on conflict (id) do nothing;

-- 3. Insert Menu Categories
insert into public.menu_categories (id, cafe_id, name, sort_order, is_active) values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Hot Brews', 1, true),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Cold Brews & Iced Tea', 2, true),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Breakfast & Small Plates', 3, true),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Bakery', 4, true)
on conflict (id) do nothing;

-- 4. Insert Menu Items (prices in paise: ₹140 = 14000 paise)
insert into public.menu_items (id, cafe_id, category_id, name, description, price_paise, diet, allergen_note, is_available, sort_order) values
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Espresso', 'Double shot of single origin espresso', 12000, 'veg', null, true, 1),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Cappuccino', 'Espresso with steamed fresh milk and microfoam', 16000, 'veg', 'Contains dairy', true, 2),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Masala Chai', 'Slow-brewed Assam black tea with ginger and green cardamom', 10000, 'veg', 'Contains dairy', true, 3),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Classic Cold Brew', 'Steeped for 18 hours in cold filtered water', 18000, 'veg', null, true, 1),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Lemon Mint Iced Tea', 'Brewed black tea with fresh lemon juice and mint', 14000, 'veg', null, true, 2),
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Avocado Sourdough Toast', 'Toasted sourdough with crushed avocado and sea salt', 24000, 'veg', 'Contains gluten', true, 1),
  ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Scrambled Eggs on Toast', 'Farm eggs scrambled with butter on toasted brioche', 22000, 'egg', 'Contains egg, dairy, gluten', true, 2),
  ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Chicken Pesto Sandwich', 'Grilled chicken breast with basil pesto and buffalo mozzarella', 28000, 'non_veg', 'Contains pine nuts, dairy, gluten', true, 3),
  ('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'Butter Croissant', 'Flaky laminated French butter pastry', 15000, 'veg', 'Contains dairy, gluten', true, 1)
on conflict (id) do nothing;
