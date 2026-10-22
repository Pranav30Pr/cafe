# Meeva Greens — Technical Architecture (ARCHITECTURE.md)

---

## 1. Technology Stack

- **Framework**: Next.js 14+ (App Router, Server Components & Route Handlers)
- **Language**: TypeScript 5+ (Strict Mode)
- **Styling**: Tailwind CSS + Custom CSS Variables for Theme Tokens
- **Animation & Micro-interactions**: Framer Motion
- **Database & Realtime Backend**: Supabase (PostgreSQL, Row Level Security, Realtime Pub/Sub)
- **State Management**: React Context + optimistic UI updates
- **Deployment**: Vercel (Edge runtime for static/hybrid routes, Node runtime for pricing/billing)

---

## 2. Directory Hierarchy

```
├── app/
│   ├── (site)/                  # Public Storytelling & Marketing routes
│   │   ├── layout.tsx
│   │   └── page.tsx             # Landing Page
│   ├── order/                   # Customer Application Shell
│   │   ├── [tableToken]/
│   │   │   └── page.tsx         # Dine-in QR Menu & Ordering
│   │   ├── takeaway/
│   │   │   └── page.tsx         # Counter Takeaway Ordering
│   │   └── status/[orderId]/
│   │       └── page.tsx         # Real-time Order Tracking
│   ├── kitchen/                 # Staff Order Queue & Kitchen Display System
│   │   └── page.tsx
│   ├── admin/                   # Operations, Menu Management & Analytics
│   │   └── page.tsx
│   ├── api/
│   │   ├── order/create/        # Server-validated Order Creation
│   │   ├── order/status/        # Protected Status Transitions
│   │   ├── bill/close/          # Billing Finalization & Receipt Generation
│   │   └── admin/               # Administrative CRUD
│   ├── layout.tsx               # Root Layout with Font & Meta setup
│   └── globals.css
├── components/
│   ├── customer/                # Item cards, Cart tray, Customizer bottom sheet
│   ├── kitchen/                 # Live ticket cards, Audio chimer, Urgent badges
│   ├── admin/                   # QR builder, Menu editor, Session overview
│   ├── site/                    # Hero, Story, Menu Carousel, Location map
│   └── ui/                      # Buttons, Dialogs, Sheets, Badges, Loaders
├── config/
│   └── cafe.ts                  # Centralized Cafe Identity & Menu Seed
├── docs/                        # SPEC.md, ARCHITECTURE.md, DESIGN.md, CAFE.md
├── lib/
│   ├── pricing.ts               # Authoritative Server Pricing & Calculation Engine
│   ├── supabase/
│   │   ├── client.ts            # Client-side Supabase Browser Client
│   │   ├── server.ts            # Server-side Supabase Server Client
│   │   └── types.ts             # Strongly Typed Database Entities
│   └── utils/
│       ├── audio.ts             # Audio alert chime & unlock utilities
│       └── formatters.ts        # Currency (₹), Dates, Phone formatters
└── types/                       # Shared TypeScript Interfaces & Enums
```

---

## 3. Data Schema & Relational Integrity

### Primary Entities
1. **`cafe_settings`**:
   - `id`: UUID (Primary Key)
   - `name`: string
   - `tax_rate`: numeric (Default: 0.00)
   - `tax_inclusive`: boolean
   - `gstin`: string (Nullable)
   - `operating_hours`: jsonb

2. **`tables`**:
   - `id`: UUID (PK)
   - `label`: string (`T1`, `T2`, etc.)
   - `qr_token`: string (Indexed, Unique)
   - `is_active`: boolean

3. **`table_sessions`**:
   - `id`: UUID (PK)
   - `table_id`: UUID (FK -> `tables.id`)
   - `status`: enum (`active`, `billed`, `closed`)
   - `customer_name`: string
   - `customer_phone`: string
   - `opened_at`: timestamptz
   - `closed_at`: timestamptz (Nullable)
   - *Rule: Only one `active` session per table allowed at any moment.*

4. **`orders`**:
   - `id`: UUID (PK)
   - `order_number`: serial (Human readable: #101, #102...)
   - `order_type`: enum (`dine_in`, `takeaway`)
   - `table_session_id`: UUID (FK -> `table_sessions.id`, Nullable for takeaway)
   - `pickup_token`: string (Nullable, for takeaway: e.g. `TK-101`)
   - `customer_name`: string
   - `customer_phone`: string
   - `status`: enum (`placed`, `accepted`, `preparing`, `ready`, `served`, `cancelled`)
   - `subtotal`: numeric
   - `tax_amount`: numeric (Default 0.00)
   - `total_amount`: numeric
   - `created_at`: timestamptz

5. **`order_items`**:
   - `id`: UUID (PK)
   - `order_id`: UUID (FK -> `orders.id` ON DELETE CASCADE)
   - `menu_item_id`: string
   - `item_name_snapshot`: string
   - `unit_price_snapshot`: numeric
   - `quantity`: integer
   - `selected_options`: jsonb (Size, milk choice, add-ons)
   - `item_total`: numeric

6. **`bills`**:
   - `id`: UUID (PK)
   - `invoice_number`: string (Sequential gapless, e.g. `INV-2026-0001`)
   - `table_session_id`: UUID (Nullable)
   - `order_id`: UUID (Nullable, for takeaway direct billing)
   - `subtotal`: numeric
   - `discount_amount`: numeric (Default 0)
   - `taxable_amount`: numeric
   - `tax_amount`: numeric (0.00 default)
   - `grand_total`: numeric
   - `payment_status`: enum (`pending`, `paid`, `void`)
   - `payment_mode`: enum (`cash`, `upi`, `card`, `split`)
   - `settled_at`: timestamptz

---

## 4. Server-Side Security & Pricing Guarantees

1. **Zero Client Trust**:
   - The browser never submits prices or line item totals. It submits `{ itemId, quantity, optionIds }`.
   - `/lib/pricing.ts` executes exclusively on the server, fetching verified unit prices and option costs from the database/config snapshot.
2. **Deterministic Rounding & Tax**:
   - Discounts apply prior to tax calculation: `Taxable = Math.max(0, Subtotal - Discount)`.
   - Tax = `Taxable * (TaxRate / 100)`. (Currently `TaxRate = 0`).
   - Grand Total = `Math.round(Taxable + Tax)`.
3. **Session Ordering Locks**:
   - Once staff transitions a `table_session` to `billed`, further incoming orders on that `tableToken` are rejected with HTTP 409 Conflict until the bill is settled (`paid`) and a new session initiated.
4. **Anti-Prank & Rate Limiting**:
   - Rate limit by IP and phone number: maximum 3 order submissions per 10-minute window.
   - Staff `ACCEPTED` manual gate is mandatory before kitchen ticket execution starts.
