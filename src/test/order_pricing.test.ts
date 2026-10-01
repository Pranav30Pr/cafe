import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore } from '../services/dbStore';

describe('Order Creation & Authoritative Server-Side Pricing', () => {
  beforeEach(() => {
    dbStore.resetToSeed();
  });

  it('calculates order prices strictly from menu_items, ignoring client prices', () => {
    const table = dbStore.getTables()[0]; // Table 1 (tbl_tok_demo_table_01)
    const items = dbStore.getMenuItems();
    const espresso = items.find((i) => i.name === 'Espresso')!; // 12000 paise (₹120)

    const payload = {
      token: table.token,
      items: [{ menu_item_id: espresso.id, quantity: 2 }],
      name: 'Aarav Sharma',
      phone: '9876543210',
      marketing_consent: false,
    };

    const res = dbStore.createOrder(payload);
    expect(res.order_id).toBeDefined();

    // Verify order item price snapshot is 12000 paise (authoritative)
    const orderItems = dbStore.getOrderItems().filter((oi) => oi.order_id === res.order_id);
    expect(orderItems.length).toBe(1);
    expect(orderItems[0].unit_price_paise_snapshot).toBe(12000);
    expect(orderItems[0].quantity).toBe(2);
  });

  it('rejects order if table token is invalid or inactive', () => {
    const items = dbStore.getMenuItems();
    expect(() => {
      dbStore.createOrder({
        token: 'invalid_non_existent_token_123',
        items: [{ menu_item_id: items[0].id, quantity: 1 }],
        name: 'Test Customer',
        phone: '9876543210',
        marketing_consent: false,
      });
    }).toThrow('Invalid or inactive table token');
  });

  it('rejects order with invalid Indian mobile number', () => {
    const table = dbStore.getTables()[0];
    const items = dbStore.getMenuItems();

    // Not 10 digits
    expect(() => {
      dbStore.createOrder({
        token: table.token,
        items: [{ menu_item_id: items[0].id, quantity: 1 }],
        name: 'Test Customer',
        phone: '12345',
        marketing_consent: false,
      });
    }).toThrow('Invalid mobile number');

    // Does not start with 6, 7, 8, or 9
    expect(() => {
      dbStore.createOrder({
        token: table.token,
        items: [{ menu_item_id: items[0].id, quantity: 1 }],
        name: 'Test Customer',
        phone: '5876543210',
        marketing_consent: false,
      });
    }).toThrow('Invalid mobile number');
  });

  it('rejects items that are marked unavailable', () => {
    const table = dbStore.getTables()[0];
    const items = dbStore.getMenuItems();
    const item = items[0];

    // Mark unavailable
    dbStore.updateMenuItem(item.id, { is_available: false });

    expect(() => {
      dbStore.createOrder({
        token: table.token,
        items: [{ menu_item_id: item.id, quantity: 1 }],
        name: 'Test Customer',
        phone: '9876543210',
        marketing_consent: false,
      });
    }).toThrow('is not available');
  });

  it('records correct consent logs with marketing box unticked', () => {
    const table = dbStore.getTables()[0];
    const items = dbStore.getMenuItems();

    const res = dbStore.createOrder({
      token: table.token,
      items: [{ menu_item_id: items[0].id, quantity: 1 }],
      name: 'Unconsenting User',
      phone: '9988776655',
      marketing_consent: false,
    });

    const orders = dbStore.getOrders();
    const order = orders.find((o) => o.id === res.order_id)!;
    const customer = dbStore.getCustomers().find((c) => c.id === order.customer_id)!;

    expect(customer.marketing_consent).toBe(false);
    expect(customer.marketing_consent_at).toBeNull();

    const consentLogs = dbStore.getConsentLogs().filter((l) => l.customer_id === customer.id);
    const mktLog = consentLogs.find((l) => l.purpose === 'marketing_whatsapp')!;
    expect(mktLog.granted).toBe(false);
  });

  it('records correct consent logs with marketing box explicitly ticked', () => {
    const table = dbStore.getTables()[0];
    const items = dbStore.getMenuItems();

    const res = dbStore.createOrder({
      token: table.token,
      items: [{ menu_item_id: items[0].id, quantity: 1 }],
      name: 'Consenting User',
      phone: '9911223344',
      marketing_consent: true,
    });

    const orders = dbStore.getOrders();
    const order = orders.find((o) => o.id === res.order_id)!;
    const customer = dbStore.getCustomers().find((c) => c.id === order.customer_id)!;

    expect(customer.marketing_consent).toBe(true);
    expect(customer.marketing_consent_at).not.toBeNull();

    const consentLogs = dbStore.getConsentLogs().filter((l) => l.customer_id === customer.id);
    const mktLog = consentLogs.find((l) => l.purpose === 'marketing_whatsapp')!;
    expect(mktLog.granted).toBe(true);
  });
});
