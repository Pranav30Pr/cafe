# Meeva Greens — Staff & Cafe Operational Playbook

> Operational manual for floor managers, baristas, kitchen staff, and counter cashiers.

---

## 1. Morning Opening Routine (07:45 AM)

1. **Power On Dedicated Devices**:
   - Kitchen Display Tablet (placed next to espresso machine & pass).
   - Counter Billing PC / Tablet (connected to thermal printer).
2. **Kitchen Tablet Setup**:
   - Open Chrome and navigate to `https://meevagreens.com/kitchen`.
   - Tap the prominent button: **"Start Shift (Audio)"**.
   - Verify that the dual-tone botanical alert chime sounds through the tablet/soundbox speaker.
   - Verify the top badge reads **"Screen Wake Lock: Active"** so the tablet will not dim or sleep during peak service.
3. **Counter Portal Setup**:
   - Open `https://meevagreens.com/admin`.
   - On the **Floor Plan** tab, confirm all 10 table stations are marked green (**Available**).
   - On the **Menu Catalog** tab, check ingredient availability. If any dish or milk option is sold out, toggle **"86 / Out of Stock"**.
4. **Physical Check**:
   - Confirm all 10 acrylic QR table stands (`T1` through `T10`) are on their designated tables and clean.

---

## 2. Order Production Lifecycle

```
[PLACED] ────────► [ACCEPTED] ────────► [PREPARING] ────────► [READY] ────────► [SERVED]
   │                   │
   ▼                   ▼
[REJECTED]         [CANCELLED]
```

1. **Order Notification**:
   - When a customer scans a table QR code or takeaway code and places an order, the kitchen tablet sounds an audible chime.
   - The ticket appears in the **New Orders (Awaiting Acceptance)** column with elapsed timer starting at `00:00`.
2. **Acceptance Gate**:
   - Staff visually confirms guest physical presence at the designated table (or calls customer phone for takeaway).
   - Tap **"Accept & Send to Line"**. Ticket shifts to the **In Preparation** queue.
3. **Plating & Service**:
   - When drinks or dishes are ready, tap **"Mark Ready"**.
   - Floor staff delivers tray to the table and taps **"Mark Served"**.

---

## 3. Counter Billing & Settlement Procedure

1. **Guest Requests Bill**:
   - Guest requests the bill at their table or approaches the counter.
   - Counter staff navigates to `/admin` -> **Floor Plan**.
   - Click the occupied table card (highlighted in amber or orange).
   - Review all items ordered across the session.
   - Click **"Generate Bill & Settle Counter"**.
2. **Applying Discretionary Discounts**:
   - If applicable, click quick discount chips (`5%`, `10%`, `₹50`, `₹100`) or enter a custom amount with reason (e.g. "Staff courtesy").
3. **Collecting Payment**:
   - **Cash**: Enter amount tendered (e.g. ₹1000). The screen calculates exact change to return (e.g. ₹330).
   - **UPI**: Guest scans the displayed dynamic QR code or transfers to `meevagreens@okhdfcbank`. Confirm notification on Soundbox or UPI app.
   - **Card**: Swipe or tap card on POS terminal.
   - **Split**: Enter the exact amounts for Cash, UPI, and Card. The system verifies that the split matches the grand total.
4. **Finalizing Bill**:
   - Click **"Settle & Print Thermal Receipt"** to print directly to the 58mm/80mm roll printer.
   - Click **"WhatsApp"** to send a digital copy directly to the customer's phone number.
   - Tap **"Done / Close Session"** to free the table for incoming guests.

---

## 4. Evening Close & Daily Financial Audit (10:30 PM)

1. **Verify Open Tables**:
   - In `/admin` -> **Floor Plan**, ensure zero tables remain in an open or billed state. Settle any remaining orders.
2. **Reconcile Payment Totals**:
   - In `/admin` -> **Reports**, review the **Settled Collections** card:
     - Cash Collection total
     - UPI Collection total
     - Card Collection total
   - Match the physical cash in the till with the reported Cash Collection total.
   - Match the UPI merchant dashboard total with the reported UPI Collection total.
   - Match the Card POS settlement slip with the reported Card Collection total.
3. **Print Audit Ledger**:
   - Click **"Print Ledger"** in the Reports tab to generate a paper or PDF closing report.
4. **Power Off**:
   - Shut down thermal printer, kitchen tablet, and counter terminals.
