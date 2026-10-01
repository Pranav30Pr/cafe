import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore } from '../services/dbStore';

describe('Order Status Flow Enforcement (Section 5.5)', () => {
  let orderId: string;

  beforeEach(() => {
    dbStore.resetToSeed();
    const table = dbStore.getTables()[0];
    const item = dbStore.getMenuItems()[0];
    const res = dbStore.createOrder({
      token: table.token,
      items: [{ menu_item_id: item.id, quantity: 1 }],
      name: 'Rohan Joshi',
      phone: '9822001122',
      marketing_consent: false,
    });
    orderId = res.order_id;
  });

  it('allows valid progressive forward transitions: new -> accepted -> preparing -> ready -> served', () => {
    // 1. new -> accepted
    let updated = dbStore.updateOrderStatus(orderId, 'accepted');
    expect(updated.status).toBe('accepted');

    // 2. accepted -> preparing
    updated = dbStore.updateOrderStatus(orderId, 'preparing');
    expect(updated.status).toBe('preparing');

    // 3. preparing -> ready
    updated = dbStore.updateOrderStatus(orderId, 'ready');
    expect(updated.status).toBe('ready');

    // 4. ready -> served
    updated = dbStore.updateOrderStatus(orderId, 'served');
    expect(updated.status).toBe('served');
  });

  it('disallows skipping steps forward (e.g. new directly to served)', () => {
    expect(() => {
      dbStore.updateOrderStatus(orderId, 'served');
    }).toThrow('Invalid status transition');
  });

  it('disallows moving backwards (e.g. preparing back to new)', () => {
    dbStore.updateOrderStatus(orderId, 'accepted');
    dbStore.updateOrderStatus(orderId, 'preparing');

    expect(() => {
      dbStore.updateOrderStatus(orderId, 'new');
    }).toThrow('Invalid status transition');
  });

  it('allows cancellation from new, accepted, or preparing', () => {
    // Cancel from new
    const updated = dbStore.updateOrderStatus(orderId, 'cancelled');
    expect(updated.status).toBe('cancelled');
  });

  it('disallows cancellation once order is marked ready or served', () => {
    dbStore.updateOrderStatus(orderId, 'accepted');
    dbStore.updateOrderStatus(orderId, 'preparing');
    dbStore.updateOrderStatus(orderId, 'ready');

    expect(() => {
      dbStore.updateOrderStatus(orderId, 'cancelled');
    }).toThrow('Cannot cancel order that is already ready');

    dbStore.updateOrderStatus(orderId, 'served');
    expect(() => {
      dbStore.updateOrderStatus(orderId, 'cancelled');
    }).toThrow('Cannot cancel order that is already served');
  });
});
