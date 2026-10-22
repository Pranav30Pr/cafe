# Meeva Greens — Cafe Profile & Operational Configuration

> Source of Truth for cafe details, brand identity, and operational constants.
> Injected into `/config/cafe.ts` for unified application runtime access.

---

## 1. Core Profile

| Parameter | Operational Setting |
|---|---|
| **Legal / Brand Name** | Meeva Greens |
| **Concept** | Contemporary Artisanal Cafe, Botanical Brunch & Specialty Coffee |
| **Tagline** | *Nourish. Brew. Gather.* |
| **Instagram** | [@meevagreens](https://www.instagram.com/meevagreens/) |
| **Location Coordinates** | 18.650537, 73.7658824 |
| **Region** | Pimpri-Chinchwad, Pune, Maharashtra 411033 |
| **Address** | Shop 4-6, Green Promenade, Near Spine Road, Pimpri-Chinchwad, Pune |
| **Contact Phone / WhatsApp** | +91 98230 45678 |
| **Order Hotline** | +91 98230 45679 |
| **Operating Hours** | Tuesday – Sunday: 8:00 AM – 10:30 PM (Mondays Closed) |

---

## 2. Fiscal & Regulatory Settings

| Parameter | Configuration | Notes |
|---|---|---|
| **GST Registration** | Inactive / Unregistered (0% default) | Rate decoupled in `/lib/pricing.ts` |
| **Default Tax Rate** | 0.00% | Configurable to 5.00% when GSTIN is provided |
| **GSTIN** | *Pending CA Confirmation* | Leave blank in invoices |
| **Pricing Model** | Prices displayed are net / tax-exclusive | Toggleable via `config.pricing.taxInclusive` |
| **Currency** | INR (₹) | Default currency symbol and rounding |

---

## 3. Floor Plan & Table Configuration

- **Total Dedicated Dine-in Tables**: 10
- **Table Identifiers & QR Tokens**:
  - `T1` (`token-mg-t01-dinein`)
  - `T2` (`token-mg-t02-dinein`)
  - `T3` (`token-mg-t03-dinein`)
  - `T4` (`token-mg-t04-dinein`)
  - `T5` (`token-mg-t05-dinein`)
  - `T6` (`token-mg-t06-dinein`)
  - `T7` (`token-mg-t07-dinein`)
  - `T8` (`token-mg-t08-dinein`)
  - `T9` (`token-mg-t09-dinein`)
  - `T10` (`token-mg-t10-dinein`)
- **Ordering Paradigm**: **Single Order per Table Session**.
  - All guests at a table order through one shared bill/session.
  - Customer contact details (Name and Phone) are captured at checkout for both Dine-in and Takeaway for order accountability and receipt delivery.

---

## 4. Menu Structure (High-Fidelity Seed)

### Categories
1. **Specialty Coffee** (Hot & Cold brews, espresso craft)
2. **Artisanal Teas & Matcha** (Single-estate, herbal infusions, ceremonial matcha)
3. **All-Day Botanical Brunch** (Sourdough toasts, eggs benedict, shakshuka)
4. **Gourmet Sandwiches & Paninis** (Artisan ciabatta, grilled focaccia)
5. **Greens & Nourish Bowls** (Superfoods, grains, seasonal produce)
6. **Handcrafted Pastries & Desserts** (Croissants, Basque cheesecake, tea cakes)

*(Full item catalogue with modifiers, dietary flags, and price snapshots defined in `/config/cafe.ts`)*
