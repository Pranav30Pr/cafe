# Meeva Greens — Functional Specification (SPEC.md)

> Scope: Phase 0 to Phase 8 Core Product Lifecycle  
> Source: Distilled from MEEVA_GREENS_PROJECT.md with user architectural decisions applied.

---

## 1. Executive Summary

Meeva Greens is a mobile-first digital presence and QR-based ordering platform for an artisanal cafe. The platform eliminates physical paper menus, accelerates kitchen turnaround, and provides instant order transparency without requiring guests to install native mobile applications.

Payment is handled **at the counter** (Cash, UPI, Card) in v1. The system delivers an app-grade touch experience in standard mobile browsers.

---

## 2. In-Scope Features (v1)

1. **Brand Storytelling Landing Page (`/`)**:
   - Modern, high-aesthetic showcase.
   - Botanical visual identity, cafe story, signature menu carousel, ambience gallery, live hours, Google Maps locator, direct WhatsApp and Instagram hooks.

2. **Customer Dine-In App (`/order/[tableToken]`)**:
   - Resolved dynamically via QR scan at table.
   - Visual category navigation, item cards with badges (Veg / Vegan / Chef's Special).
   - Bottom sheet modifier customizer (Milk options, sweetness, add-ons).
   - Sticky cart tray with real-time subtotal calculation.
   - Checkout modal capturing **Customer Name & Phone Number** for order tracking & receipt delivery.
   - **One order session per table**: All table orders merge into one active session.

3. **Customer Takeaway App (`/order/takeaway`)**:
   - Counter QR or direct website link entry point.
   - Requires Customer Name & Verified 10-digit Phone Number.
   - Generates unique Pickup Token (e.g. `TK-104`).
   - Live status tracker with estimated pickup time.

4. **Live Order Status Tracking (`/order/status/[orderId]`)**:
   - Step-by-step visual tracker (Placed → Accepted → Preparing → Ready → Served/Picked Up).
   - Polling and WebSocket updates.
   - Print/Save digital bill receipt.

5. **Staff & Kitchen Dashboard (`/kitchen`)**:
   - Real-time order queue with visual urgency badges.
   - Audio alert chime upon new order placement with wake-lock support.
   - One-touch progression buttons:
     - `Accept` (Anti-prank confirmation gate)
     - `Start Preparing`
     - `Mark Ready`
     - `Complete / Served`
   - Real-time Item Out-of-Stock (86) toggle.

6. **Admin & Floor Manager Console (`/admin`)**:
   - Live table overview (Occupied, Billed, Available).
   - Menu catalog management (Prices, Availability, Descriptions).
   - QR code generation and printable table card sheets.
   - Daily sales reconciliation report and bill closure.

7. **Counter Billing & Settlement**:
   - Consolidates table orders into a singular final bill.
   - Generates gap-free consecutive invoice numbers.
   - Printable 58mm/80mm thermal receipt view.
   - Settlement recording: Cash, UPI, Card, or Split.

---

## 3. Explicitly Out of Scope (v1)

- Online payment gateway integration (Razorpay/Stripe) — deferred to v2.
- Loyalty stamps/points engine — architecture isolated in docs, implementation deferred.
- Direct raw thermal ESC/POS network socket integration (uses standard browser print dialog).
- Third-party delivery aggregators (Swiggy / Zomato sync).
- Multi-tenant multi-location switching UI (codebase is parameterized, UI is single-brand).

---

## 4. Order Lifecycle State Machine

```
[PLACED] ────────► [ACCEPTED] ────────► [PREPARING] ────────► [READY] ────────► [SERVED] ────────► [BILLED] ────────► [PAID]
   │                   │
   ▼                   ▼
[REJECTED]         [CANCELLED]
```

- **PLACED**: Submitted by customer with phone and name. Staff chime triggers.
- **ACCEPTED**: Staff confirms physical presence and approves order for production.
- **PREPARING**: Kitchen actively preparing order.
- **READY**: Order plated or packed for pickup; customer status screen alerts.
- **SERVED / PICKED UP**: Delivered to table or handed over at counter.
- **BILLED**: Final invoice generated; table locked from further ordering.
- **PAID**: Cash/UPI settlement received at counter; table session marked closed and vacated.
