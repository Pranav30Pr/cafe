# Meeva Greens: Cafe Website + QR Ordering System

> Status: Phase 0 (planning). No code yet.
> Use this file as the source of truth. Split it into `SPEC.md`, `ARCHITECTURE.md`, `DESIGN.md`, `CAFE.md` when the project folder is created.

---

## 1. Project summary

A mobile-first website for a local cafe, **Meeva Greens**, with a QR-based ordering system built in as a feature of the site.

- Every table has a QR code. Scanning it opens the menu in the phone browser, where the customer places an order directly.
- Orders appear live on a kitchen/staff screen (computer, tablet or phone, in the browser).
- Payment is **at the counter** (no online payment in v1).
- The site also has a landing page with the cafe's story, info and photos.
- The UI must feel like a native app: elegant, modern, aesthetic, mobile-first.

Built once as a reusable codebase, so cafe #2 means a config change, not a fork.

---

## 2. Cafe details (CAFE.md)

| Field | Value |
|---|---|
| Name | Meeva Greens |
| Instagram | https://www.instagram.com/meevagreens/ |
| Google Maps | Place "Meeva Greens", coordinates 18.650537, 73.7658824 (Pimpri-Chinchwad area, Maharashtra) |
| Tagline | **TBD** |
| Full address | **TBD** (confirm from Maps listing) |
| Phone / WhatsApp | **TBD** |
| Opening hours | **TBD** |
| Number of tables | **TBD** |
| Dine-in / takeaway | Both (decided) |
| Logo (SVG / high-res PNG) | **TBD** |
| Photos (8-10 real ones) | **TBD** (pull from owner, not stock) |
| Brand colors / vibe | **TBD** (review Instagram feed with the owner; name suggests a green, natural palette, but confirm) |
| GST registered? | **TBD** (decides whether tax is in v1) |
| Menu | **TBD** (categories, items, prices, veg/non-veg, sizes, add-ons) |

> Note: the Instagram page and Maps listing could not be read automatically, so nothing above is assumed beyond the name, handle and map location. Fill the TBDs from the owner.

---

## 3. Scope

### In v1
1. Landing page: hero, about, menu highlights, gallery, hours, location, contact, WhatsApp button
2. Customer ordering app: dine-in (QR → menu → cart → place order → live status) and takeaway (no table token, name and phone required, pickup number)
3. Kitchen/staff dashboard (live queue, sound alert, status buttons, out-of-stock toggle)
4. Admin panel (menu editing, table QR generation)
5. Basic billing (bill per table session, printable)
6. Staff mark orders as paid at the counter

### Not in v1
- Online payments (Razorpay/UPI)
- Loyalty points or stamps (**deferred; design later**, see section 9)
- Inventory management
- Multi-cafe / multi-tenant support (structure the code for it, don't build it)
- Direct thermal printer integration
- Delivery app integrations (Zomato/Swiggy)

---

## 4. Order lifecycle

```
PLACED → ACCEPTED → PREPARING → READY → SERVED → BILLED → PAID
              ↘ REJECTED / CANCELLED
```

- **PLACED**: customer submits. Staff screen alerts, kitchen does not start yet.
- **ACCEPTED**: staff confirm the order is real (anti-prank gate, because anyone can scan or photograph a QR code).
- **BILLED / PAID**: staff close the bill at the counter and mark it paid.

---

## 5. Architecture (ARCHITECTURE.md)

### Stack
Next.js (App Router, TypeScript) · Tailwind · Framer Motion · Supabase (Postgres, Realtime, Auth, Storage) · Vercel

### System layout
```
Customer phone ──► Next.js (Vercel) ──► Supabase
 /order/[token]     server routes        Postgres + RLS
                    (validate, price)    Realtime
Staff device   ◄── Supabase Realtime     Auth (staff only)
 /kitchen, /admin                        Storage (images)
```

### Routes
| Route | Purpose |
|---|---|
| `/` | Landing page (static, SEO) |
| `/order/[tableToken]` | Customer app shell |
| `/order/takeaway` | Takeaway ordering (no table) |
| `/order/status/[orderId]` | Live order tracking |
| `/kitchen` | Live queue (staff login) |
| `/admin` | Menu, tables and QR codes, reports |

Landing page and ordering app stay on separate routes. They have different needs (SEO and storytelling vs. app-shell behavior).

### Folder structure
```
/app/(site)/        landing page
/app/order/         customer app
/app/kitchen/       staff queue
/app/admin/
/lib/supabase/      clients + types
/lib/pricing.ts     server-side price calculation
/config/cafe.ts     cafe details + theme tokens
/docs/              SPEC, ARCHITECTURE, DESIGN, CAFE
```

### Data model (draft; finalize after open decisions)
- `cafe_settings`: single row for now (name, theme, hours, tax settings)
- `tables`: id, label, `qr_token`
- `table_sessions`: groups all orders at a table until the bill is closed
- `categories`, `menu_items` (price, veg flag, `available`), `item_options` (size, add-ons)
- `orders`: id (UUID), `order_type` (dine_in/takeaway), session_id (null for takeaway), customer_name/phone (required for takeaway), status, total, timestamps
- `order_items`: order_id, snapshot of name/price/options, qty
- `bills`: id, invoice_number, subtotal, discount, taxable_value, tax_breakup, grand_total, status (`draft`, `final`, `void`)
- `bill_items`: snapshot of name, price, qty, tax rate
- `payments`: bill_id, mode (cash, UPI, card), amount (supports split payments)

Customers/loyalty tables are added later (section 9).

### Server-side rules (never trust the frontend)
1. Client sends item IDs and quantities only. The server recalculates all prices and totals.
2. Order creation goes through an API route that validates the table token, checks availability, and rate-limits per table and IP.
3. Row Level Security: customers can only see their own order (unguessable UUID). Only authenticated staff can read the full queue and change statuses.
4. Past orders never change when the menu changes (`order_items` stores a price snapshot).
5. Finalized bills are immutable. Corrections create a void plus a new bill (or credit note).
6. Invoice numbers are sequential with no gaps, generated by the database.
7. Discounts apply before tax.

### Kitchen screen reliability
- Realtime subscription plus a 10-second polling fallback
- "Start shift" button to unlock browser audio, with a looping alert until the new order is acknowledged
- Screen Wake Lock API so the device doesn't sleep
- Visible "offline" banner when the connection drops

### Takeaway flow (decided: dine-in and takeaway both in v1)
- Separate entry point, for example `/order/takeaway` (linked from the landing page and a counter QR), with no table token.
- Orders carry `order_type` (`dine_in` or `takeaway`). Dine-in orders belong to a table session; takeaway orders get their own bill.
- Takeaway has no physical-presence check, so it is the easiest route for fake orders. Require a name and phone number, rate-limit per phone and IP, and keep the staff ACCEPT step. Staff can call the number to confirm if an order looks suspicious.
- Pay at the counter on pickup. Show a pickup number on the status page and on the kitchen screen.

### Billing notes
- Multiple orders per table merge into one bill via `table_sessions`
- Tax is a per-cafe setting (on/off, rate, GSTIN), not hardcoded
- Printing: print-friendly page for 58mm/80mm thermal paper plus WhatsApp/PDF copy
- Confirm GST requirements with the owner's CA

---

## 6. Design (DESIGN.md)

**Goals:** elegant, modern, aesthetic; feels like an app, not a website.

**Customer ordering UI**
- Bottom tab bar, bottom sheets instead of modals, sticky "View cart" bar
- Category chips, item cards, bottom-sheet item customizer
- Skeleton loaders instead of spinners
- Page transitions and tap feedback (Framer Motion)
- Full-height app shell, safe-area padding, large touch targets
- Web app manifest so it can be added to the home screen, but never required (customers won't install anything)

**Landing page**
- Photo-led, real cafe images, storytelling hero
- Menu highlights, gallery, hours, Google Maps embed, WhatsApp button, Instagram link

**Design tokens (to define before any screens):** palette, fonts, radius, spacing, shadows, motion rules. Derive from the cafe's Instagram and logo.

---

## 7. Phased plan

| Phase | What | Done when |
|---|---|---|
| 0 | Cafe details, brand direction, design tokens, folder structure, rules file for Antigravity | Spec docs exist and owner has signed off |
| 1 | Landing page | Looks good on a real phone |
| 2 | Ordering UI with mock data | Full flow works without a backend |
| 3 | Backend: Supabase tables, realtime orders, table tokens | Order from a phone appears on another device instantly |
| 4 | Kitchen dashboard | Survives Wi-Fi drop and page refresh |
| 5 | Admin: menu editing, QR generation | Owner can edit the menu without you |
| 6 | Billing | Bill closes, prints, and invoice numbers are gap-free |
| 7 | Loyalty (once decided) | Abuse rules enforced |
| 8 | Deploy: Vercel, domain, printed QR stands, on-site test | A real customer places a real order |

Backend comes after the UI looks right, because layout changes are cheap and database changes are not.

---

## 8. Working with Antigravity

- Put the docs in `/docs` and reference them in the project rules file.
- Give it **one phase per prompt**. Never "build the whole system".
- First coding task (skeleton only):
  1. Create a Next.js project (App Router, TypeScript, Tailwind)
  2. Create the folder structure above
  3. Create `/config/cafe.ts` from `CAFE.md`
  4. Add Framer Motion and nothing else
  5. Create empty placeholder pages for each route
- Provide design tokens before any screens, otherwise the output will look generic.
- Run `git init` first and commit after each working step.
- Test each phase on a real phone over the same Wi-Fi before moving on.
- Do not create the Supabase project or tables until the open decisions below are settled.

---

## 9. Deferred: loyalty system

Discussed, not in scope for now. Notes to preserve when it is revisited:

- Original idea: 5 visits, then a free item or discount on the 6th. Customers also get vouchers/coupons.
- Stamps (visit-based) and points (spend-based) are different models; pick one for v1 of loyalty.
- Identity is the phone number (no OTP initially; staff redeem at the counter).
- Rewards are earned only when an order is marked **PAID**, never on PLACED.
- Use an **append-only ledger** (`loyalty_ledger`: earn, redeem, reverse, adjust, expire) so rule changes never rewrite old balances. Add a unique constraint so one order can't earn twice.
- Points are calculated on net amount paid, after discount and before tax.
- Need a "visit" definition (for example one per phone per day, with a minimum order value).
- Redemption must be atomic. Manual `adjust` entries must be audit-logged with the staff member's name.
- Past paper-era orders can't be credited retroactively without phone numbers.

---

## 10. Known risks

| Risk | Mitigation |
|---|---|
| Fake or prank orders (QR can be photographed) | Staff ACCEPT step, rate limiting, unique token per table |
| Unpaid orders reaching the kitchen | Same acceptance gate; payment status tracked per bill |
| Kitchen device sleeps, loses Wi-Fi or is silent | Wake lock, polling fallback, looping alert, offline banner |
| Staff forget to mark orders paid | Daily reconciliation view in admin; tell the owner this is a discipline issue |
| Generic AI-generated design | Design tokens first, real photos, review on a real phone |
| Scope creep into "full cafe management" | Stick to section 3 |
| Tax compliance | Tax as a setting; confirm with the owner's CA |

---

## 11. Open decisions

1. **Decided: both dine-in and takeaway.** Takeaway has no table token, so it needs its own identity gate (see section 5, "Takeaway flow"). Still open: whether takeaway is paid at the counter on pickup (current plan) and how pickup is announced.
2. Should staff accept every order manually, or auto-accept for known regulars?
3. Several people at one table: separate orders merged into one bill (current plan) or a single running tab?
4. GST registered, and under which scheme?
5. Loyalty model: stamps or points? (Later.)
6. Customer name/phone collected at order time, or not at all in v1?

---

## 12. Immediate next steps

1. Get the TBD items in section 2 from the owner (menu, photos, logo, hours, table count, GST status).
2. Review the Instagram feed with the owner and note the colors, fonts and mood he likes.
3. Share the details so `DESIGN.md` can be drafted.
4. `git init`, create the `/docs` folder, split this file into the four docs.
5. Run the skeleton task in Antigravity and confirm the routes load on your phone.
