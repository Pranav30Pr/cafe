# Cafe Website & Contactless QR Table Ordering System

Production-grade single cafe MVP website and contactless table QR ordering system built to strict data protection (DPDP Act 2023), accessibility (WCAG 2.2 Level AA), and performance standards.

---

## 1. Quick Start & Local Execution

### Prerequisites
- Node.js >= 18 (Tested on v24.16.0)
- npm >= 9

### Installation
```bash
# Clone the repository
git clone <repository_url>
cd cafe

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Build & Placeholder Audit
```bash
# Build production bundle
npm run build

# Run unit and compliance test suite
npm run test

# Run placeholder audit (reports pending client items in dev mode)
npm run check:placeholders

# Run strict placeholder check (blocks production build if any placeholders remain)
npm run check:placeholders -- --strict
```

---

## 2. Environment Variables

Create a `.env` file for live Supabase deployment (optional for local mock testing):

```env
# Supabase Project Configuration (Mumbai region ap-south-1 recommended)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Strict build configuration (optional)
STRICT_PLACEHOLDERS=false
```

> **Security Rule:** Never commit `.env` or service role keys to the repository. The service role key is NEVER exposed in the frontend.

---

## 3. Architecture & Key Routes

| Route | Role / Audience | Description |
|---|---|---|
| `/` | Public | Homepage: Cafe name, client tagline, hours, location, menu link |
| `/menu` | Public | Full cafe menu with categories, veg/non-veg/egg dietary badges, and prices in INR |
| `/about` | Public | Client-supplied story and cafe background |
| `/contact` | Public | Address, hours, phone, email, and direct map link (no iframe) |
| `/privacy` | Public | DPDP Act compliant privacy policy with interactive Data Rights Request form |
| `/terms` | Public | Terms and conditions governing table ordering and counter payments |
| `/cookies` | Public | Plain disclosure of strictly necessary storage (zero tracking cookies) |
| `/order-policy` | Public | Order cancellation and counter refund settlement policy |
| `/accessibility` | Public | WCAG 2.2 Level AA accessibility statement and barrier reporting |
| `/t/:token` | Customer | Contactless QR table ordering interface with 10-digit phone validation |
| `/order/:id` | Customer | Live order confirmation and status tracking for the placed order |
| `/kitchen` | Kitchen / Owner | Real-time kitchen tablet order queue with sound alerts and status updates |
| `/admin` | Owner | Price editing, availability toggle, table QR generator, sales analytics, and customer privacy erasure |

---

## 4. How to Add a Table

### In Supabase / Postgres:
Run the following SQL snippet:
```sql
insert into public.cafe_tables (cafe_id, label, token, is_active)
values (
  'a0000000-0000-0000-0000-000000000001',
  'Table 6',
  'tbl_tok_table_06_secure',
  true
);
```

### In Owner Dashboard (`/admin`):
Navigate to the **Tables & QR Codes** tab. All configured tables are automatically listed with their unique cryptographically secure URL token, with instant preview and download options for printable PNG and SVG formats.

---

## 5. How to Rotate a Table Token

If a table's physical QR code is damaged or compromised:
1. Sign in to `/admin` as Owner (`owner@cafe.local`).
2. Navigate to the **Tables & QR Codes** tab.
3. Click **Regenerate Token** for the respective table.
4. The database immediately updates the table with a new cryptographically secure 24-character token (`crypto.getRandomValues`).
5. Any scan of the previous token will display: *"This table link is not valid. Please ask a staff member."*
6. Download the updated PNG or SVG QR code and place it on the physical table.

---

## 6. Strict Privacy, Cookie & Third-Party Rules (Section 0.5 & 6.4)

- **Zero Third-Party Scripts:** No Google Analytics, Meta Pixel, Hotjar, session recorders, or chat widgets.
- **Zero Third-Party Embeds:** No Google Maps iframe, YouTube embeds, or social media widgets. Plain links opening with `rel="noopener noreferrer"` are used.
- **Zero Third-Party CDNs:** Fonts are self-hosted using native system font stacks; zero network requests to Google Fonts or CDN origins at runtime.
- **Browser Storage Minimisation:**
  - `sessionStorage`: Temporary table cart and customer name/phone convenience for current visit only. "Clear my details" button provided.
  - `localStorage`: Strictly for staff authenticated sessions (`kitchen` and `owner`).
- **No Cookie Banner Required:** Because only technical, strictly necessary storage is used, no intrusive cookie banners are legally required. If non-essential cookies are added in the future, the Cookie Policy must be updated first, and an explicit opt-in banner with equal "Accept" and "Reject" choices must be deployed.

---

## 7. Demo Staff Credentials (Local / Test Mode)

| Role | Email | Password | Access Scope |
|---|---|---|---|
| Kitchen Tablet | `kitchen@cafe.local` | `KitchenPass123!` | View live orders, advance workflow (accept, prepare, ready, serve, cancel). Customer phone numbers and owner analytics are strictly hidden. |
| Cafe Owner | `owner@cafe.local` | `OwnerPass123!` | Full access to kitchen screen, menu price editing, table QR codes, real sales analytics, consented customer CSV export, and customer record erasure. |

---

## 8. Supporting Documentation Files

- [PROJECT_SPEC.md](file:///d:/WORK/cafe/PROJECT_SPEC.md) - Master specification and acceptance criteria.
- [ASSETS_LOG.md](file:///d:/WORK/cafe/ASSETS_LOG.md) - Inventory of brand assets, licenses, and permissions.
- [ACCESSIBILITY_CHECKLIST.md](file:///d:/WORK/cafe/ACCESSIBILITY_CHECKLIST.md) - Contrast ratios and WCAG 2.2 AA audit.
- [INCIDENT_PLAN.md](file:///d:/WORK/cafe/INCIDENT_PLAN.md) - Security breach incident response plan under the DPDP Act.
- [supabase/schema.sql](file:///d:/WORK/cafe/supabase/schema.sql) - Postgres database schema, RLS policies, and RPC functions.
- [supabase/seed.sql](file:///d:/WORK/cafe/supabase/seed.sql) - Initial seed data for development and testing.
