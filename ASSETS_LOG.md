# ASSETS_LOG.md

Single cafe MVP asset inventory, copyright ownership, licensing, and permissions log.
Every asset loaded or bundled in the project is recorded here.

---

## 1. Brand Assets & Logos

| File Path | Description | Owner | Source / Provenance | Written Permission Given? | Date | Notes |
|---|---|---|---|---|---|---|
| `/public/favicon.svg` | Vector minimalist cafe mark (coffee cup silhouette, neutral geometric) | Developer / Project | Created for MVP to serve as default until client brand logo supplied | Yes | 2026-10-02 | Simplified mark for 16px/32px legibility. Section 0.4. Flagged for client review. |
| `/public/favicon.ico` | Multi-resolution icon (16, 32, 48) | Developer / Project | Generated from vector favicon.svg | Yes | 2026-10-02 | Standard browser tab icon |
| `/public/apple-touch-icon.png` | 180x180 mobile touch icon | Developer / Project | Derived from vector favicon.svg | Yes | 2026-10-02 | iOS Home screen touch icon |
| `/public/icon-192.png` | 192x192 PWA manifest icon | Developer / Project | Derived from vector favicon.svg | Yes | 2026-10-02 | Android home screen / PWA |
| `/public/icon-512.png` | 512x512 PWA manifest icon | Developer / Project | Derived from vector favicon.svg | Yes | 2026-10-02 | Android splash / PWA |
| `/assets/brand/logo.svg` | Client official logo | Client | Pending client delivery | No (`[[CLIENT_TO_PROVIDE: logo files]]`) | Pending | Must be provided in `/assets/brand/` before production release |

---

## 2. Photography & Menu Images

> **Rule (Section 0.1 & Section 9):**
> No AI images. No stock photos. Photos come only from the client.
> Any file without "Yes" written permission will NOT ship to production.
> In development, missing photos are represented by a flat grey box labelled "Photo to be added".

| File Path | Description | Owner | Source | Written Permission Given? | Date | Status |
|---|---|---|---|---|---|---|
| *(None yet supplied)* | Client cafe photos & food items | Client | Client direct upload | Pending client submission | Pending | Flat grey placeholder "Photo to be added" displayed in dev |

---

## 3. Fonts & Typography

> **Rule (Section 0.5):**
> Zero third-party font CDNs. No runtime Google Fonts requests.
> High-performance, zero-latency system font stack used.

| Font Family | Scope | License | Hosting Method | Compliant with Section 0.5? |
|---|---|---|---|---|
| System Font Stack (`system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `Arial`, `sans-serif`) | Entire UI | Native OS Fonts / Apache 2.0 / SIL OFL | Local / OS Native (Zero network requests) | Yes (100% self-hosted/native, 0 external requests) |

---

## 4. Icons

> **Rule (Section 0.2):**
> Simple inline SVG only. No emoji used as icons or decoration anywhere in the UI.
> Always paired with visible text label or an `aria-label`.

| Icon Identifier | Purpose | License | Provenance |
|---|---|---|---|
| Inline SVG (Diet markers: Veg, Non-Veg, Egg) | Food safety dietary classification | MIT / Public Domain | Custom geometric SVG with descriptive text label and aria-label |
| Inline SVG (Navigation, Cart, Check, Alert, Volume, Arrow) | UI state and controls | MIT | Hand-crafted minimal SVG with text / `aria-label` |

---

## 5. Third-Party Code & NPM Dependencies

> Audited via `npx license-checker --summary`. All production dependencies use permissive open-source licenses (MIT, ISC, Apache-2.0).

| Package | Purpose | License |
|---|---|---|
| `react` | UI Library | MIT |
| `react-dom` | React DOM bindings | MIT |
| `react-router-dom` | Client-side routing | MIT |
| `@supabase/supabase-js` | Supabase Postgres/Auth/Realtime client | MIT |
| `qrcode` | QR code generation for table links | MIT |
| `tailwindcss` | Utility-first CSS engine (build time) | MIT |
| `vite` | Build tool and dev server | MIT |
| `typescript` | Static type checking (dev time) | Apache-2.0 |
