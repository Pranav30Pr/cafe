-- Supabase / Postgres Schema for Cafe Website & QR Table Ordering System
-- Single source of truth complying with PROJECT_SPEC.md Sections 4, 5.5, 6.1, 6.5

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1. Cafes table
create table if not exists public.cafes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  legal_name text not null,
  address text not null,
  phone text not null,
  email text not null,
  fssai_number text not null,
  gstin text,
  opening_hours jsonb not null default '{"monday_to_friday": "8:00 AM - 10:00 PM", "saturday_sunday": "8:00 AM - 11:00 PM"}'::jsonb,
  grievance_name text not null,
  grievance_email text not null,
  grievance_phone text not null,
  created_at timestamptz not null default now()
);

-- 2. Staff Profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  role text not null check (role in ('kitchen', 'owner')),
  created_at timestamptz not null default now()
);

-- 3. Cafe Tables
create table if not exists public.cafe_tables (
  id uuid primary key default uuid_generate_v4(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  label text not null,
  token text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. Menu Categories
create table if not exists public.menu_categories (
  id uuid primary key default uuid_generate_v4(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. Menu Items
create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price_paise integer not null check (price_paise >= 0),
  diet text not null check (diet in ('veg', 'non_veg', 'egg')),
  allergen_note text,
  is_available boolean not null default true,
  image_path text,
  image_alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 6. Customers (minimised personal data per Section 6.3)
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  name text,
  phone text,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  consent_text_version text,
  birthday date,
  loyalty_points integer not null default 0,
  last_order_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

-- 7. Append-only Consent Log (Section 4 & 6.5)
create table if not exists public.consent_log (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  purpose text not null check (purpose in ('order_contact', 'marketing_whatsapp')),
  granted boolean not null,
  consent_text_version text not null,
  created_at timestamptz not null default now()
);

-- 8. Orders
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  table_id uuid not null references public.cafe_tables(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  status text not null default 'new' check (status in ('new', 'accepted', 'preparing', 'ready', 'served', 'cancelled')),
  note varchar(200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Status transition enforcement function (Section 5.5)
-- Valid transitions: new -> accepted -> preparing -> ready -> served
-- Cancelled allowed from: new, accepted, preparing
create or replace function public.validate_order_status_transition()
returns trigger as $$
begin
  if old.status = new.status then
    return new;
  end if;

  if new.status = 'cancelled' then
    if old.status in ('new', 'accepted', 'preparing') then
      return new;
    else
      raise exception 'Cannot cancel an order that is %', old.status;
    end if;
  end if;

  if (old.status = 'new' and new.status = 'accepted') or
     (old.status = 'accepted' and new.status = 'preparing') or
     (old.status = 'preparing' and new.status = 'ready') or
     (old.status = 'ready' and new.status = 'served') then
    return new;
  end if;

  raise exception 'Invalid status transition from % to %', old.status, new.status;
end;
$$ language plpgsql;

create or replace trigger trg_order_status_transition
  before update on public.orders
  for each row
  execute function public.validate_order_status_transition();

-- 9. Order Items (immutable snapshot of item and price in paise at order time)
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id),
  item_name_snapshot text not null,
  unit_price_paise_snapshot integer not null check (unit_price_paise_snapshot >= 0),
  quantity integer not null check (quantity > 0 and quantity <= 20)
);

-- 10. Privacy Requests (Section 4 & Section 7.1)
create table if not exists public.privacy_requests (
  id uuid primary key default uuid_generate_v4(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  phone_or_email text not null,
  request_type text not null check (request_type in ('access', 'correction', 'erasure', 'withdraw_consent', 'other')),
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ROW LEVEL SECURITY (RLS) POLICIES (Section 6.1)
alter table public.cafes enable row level security;
alter table public.profiles enable row level security;
alter table public.cafe_tables enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.customers enable row level security;
alter table public.consent_log enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.privacy_requests enable row level security;

-- Public read for cafes
create policy "Cafes are viewable by everyone" on public.cafes
  for select using (true);

-- Public read for active categories & available menu items
create policy "Public can read active categories" on public.menu_categories
  for select using (is_active = true);

create policy "Public can read active menu items" on public.menu_items
  for select using (is_available = true);

-- Staff access policies based on profiles.role
create policy "Staff can view their profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Staff can view cafe tables" on public.cafe_tables
  for select using (
    exists (select 1 from public.profiles where user_id = auth.uid() and cafe_id = cafe_tables.cafe_id)
  );

create policy "Owner can manage cafe tables" on public.cafe_tables
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and cafe_id = cafe_tables.cafe_id and role = 'owner')
  );

create policy "Owner can edit menu items" on public.menu_items
  for update using (
    exists (select 1 from public.profiles where user_id = auth.uid() and cafe_id = menu_items.cafe_id and role = 'owner')
  );

create policy "Staff can view orders" on public.orders
  for select using (
    exists (select 1 from public.profiles where user_id = auth.uid() and cafe_id = orders.cafe_id)
  );

create policy "Staff can update order status" on public.orders
  for update using (
    exists (select 1 from public.profiles where user_id = auth.uid() and cafe_id = orders.cafe_id)
  );

create policy "Staff can view order items" on public.order_items
  for select using (
    exists (select 1 from public.orders o join public.profiles p on p.cafe_id = o.cafe_id where o.id = order_items.order_id and p.user_id = auth.uid())
  );

create policy "Owner can view consented customers" on public.customers
  for select using (
    exists (select 1 from public.profiles where user_id = auth.uid() and cafe_id = customers.cafe_id and role = 'owner')
  );

create policy "Owner can manage privacy requests" on public.privacy_requests
  for all using (
    exists (select 1 from public.profiles where user_id = auth.uid() and cafe_id = privacy_requests.cafe_id and role = 'owner')
  );

-- RPC 1: create_order (Section 6.1)
-- Validates token, recomputes prices server-side, writes customer, consent_log and order in one atomic transaction
create or replace function public.create_order(
  p_token text,
  p_items jsonb, -- array of { menu_item_id: uuid, quantity: int }
  p_name text,
  p_phone text,
  p_note text default null,
  p_marketing_consent boolean default false,
  p_consent_version text default 'v1.0'
)
returns jsonb as $$
declare
  v_cafe_id uuid;
  v_table_id uuid;
  v_customer_id uuid;
  v_order_id uuid;
  v_item jsonb;
  v_menu_item record;
  v_item_count int;
  v_now timestamptz := now();
begin
  -- Validate table token
  select cafe_id, id into v_cafe_id, v_table_id
  from public.cafe_tables
  where token = p_token and is_active = true;

  if not found then
    raise exception 'Invalid or inactive table token';
  end if;

  -- Validate item counts
  v_item_count := jsonb_array_length(p_items);
  if v_item_count = 0 or v_item_count > 30 then
    raise exception 'Order must contain between 1 and 30 items';
  end if;

  -- Validate phone (10 digit Indian mobile)
  if p_phone !~ '^[6-9][0-9]{9}$' then
    raise exception 'Invalid mobile number. Must be a 10-digit Indian mobile number.';
  end if;

  -- Validate note length
  if length(coalesce(p_note, '')) > 200 then
    raise exception 'Special instructions cannot exceed 200 characters.';
  end if;

  -- Upsert customer
  select id into v_customer_id
  from public.customers
  where cafe_id = v_cafe_id and phone = p_phone and deleted_at is null;

  if found then
    update public.customers
    set name = p_name,
        marketing_consent = p_marketing_consent,
        marketing_consent_at = case when p_marketing_consent then v_now else marketing_consent_at end,
        consent_text_version = p_consent_version,
        last_order_at = v_now
    where id = v_customer_id;
  else
    insert into public.customers (
      cafe_id, name, phone, marketing_consent, marketing_consent_at,
      consent_text_version, last_order_at
    ) values (
      v_cafe_id, p_name, p_phone, p_marketing_consent,
      case when p_marketing_consent then v_now else null end,
      p_consent_version, v_now
    )
    returning id into v_customer_id;
  end if;

  -- Append to consent_log
  insert into public.consent_log (customer_id, purpose, granted, consent_text_version, created_at)
  values (v_customer_id, 'order_contact', true, p_consent_version, v_now);

  insert into public.consent_log (customer_id, purpose, granted, consent_text_version, created_at)
  values (v_customer_id, 'marketing_whatsapp', p_marketing_consent, p_consent_version, v_now);

  -- Create order
  insert into public.orders (cafe_id, table_id, customer_id, status, note, created_at, updated_at)
  values (v_cafe_id, v_table_id, v_customer_id, 'new', p_note, v_now, v_now)
  returning id into v_order_id;

  -- Insert order items with server-side price lookup
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    if (v_item->>'quantity')::int <= 0 or (v_item->>'quantity')::int > 20 then
      raise exception 'Item quantity must be between 1 and 20';
    end if;

    select id, name, price_paise, is_available into v_menu_item
    from public.menu_items
    where id = (v_item->>'menu_item_id')::uuid and cafe_id = v_cafe_id;

    if not found or not v_menu_item.is_available then
      raise exception 'Item is no longer available';
    end if;

    insert into public.order_items (
      order_id, menu_item_id, item_name_snapshot, unit_price_paise_snapshot, quantity
    ) values (
      v_order_id, v_menu_item.id, v_menu_item.name, v_menu_item.price_paise, (v_item->>'quantity')::int
    );
  end loop;

  -- Return only public reference
  return jsonb_build_object(
    'order_id', v_order_id,
    'short_ref', upper(substr(v_order_id::text, 1, 6))
  );
end;
$$ language plpgsql security definer;

-- RPC 2: get_order_status (Anonymous read limited to UUID, customer privacy preserved)
create or replace function public.get_order_status(p_order_id uuid)
returns jsonb as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'order_id', o.id,
    'short_ref', upper(substr(o.id::text, 1, 6)),
    'status', o.status,
    'created_at', o.created_at,
    'table_label', t.label,
    'items', (
      select jsonb_agg(jsonb_build_object(
        'name', oi.item_name_snapshot,
        'quantity', oi.quantity,
        'unit_price_paise', oi.unit_price_paise_snapshot
      ))
      from public.order_items oi
      where oi.order_id = o.id
    )
  ) into v_result
  from public.orders o
  join public.cafe_tables t on t.id = o.table_id
  where o.id = p_order_id;

  if not found then
    raise exception 'Order not found';
  end if;

  return v_result;
end;
$$ language plpgsql security definer;

-- RPC 3: erase_customer (Section 6.5 & Section 3)
create or replace function public.erase_customer(p_customer_id uuid)
returns void as $$
begin
  update public.customers
  set name = null,
      phone = null,
      birthday = null,
      marketing_consent = false,
      deleted_at = now()
  where id = p_customer_id;

  insert into public.consent_log (customer_id, purpose, granted, consent_text_version, created_at)
  values (p_customer_id, 'marketing_whatsapp', false, 'withdrawn_by_erasure', now());
end;
$$ language plpgsql security definer;
