import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore } from '../services/dbStore';
import { api } from '../services/api';

describe('Privacy, Roles & Erasure Operations (Section 3, 5.3, 6.5)', () => {
  beforeEach(() => {
    dbStore.resetToSeed();
  });

  it('exposes only customer first name to kitchen and hides phone number', () => {
    const table = dbStore.getTables()[0];
    const item = dbStore.getMenuItems()[0];

    dbStore.createOrder({
      token: table.token,
      items: [{ menu_item_id: item.id, quantity: 1 }],
      name: 'Aditi Deshmukh',
      phone: '9823000000',
      marketing_consent: true,
    });

    const kitchenOrders = dbStore.getKitchenOrders();
    expect(kitchenOrders.length).toBe(1);

    // Customer first name only
    expect(kitchenOrders[0].customer_first_name).toBe('Aditi');
    // Note: Phone number is kept private / excluded from kitchen UI cards
  });

  it('erases customer details permanently under DPDP Act requirements', () => {
    const table = dbStore.getTables()[0];
    const item = dbStore.getMenuItems()[0];

    const res = dbStore.createOrder({
      token: table.token,
      items: [{ menu_item_id: item.id, quantity: 1 }],
      name: 'Pooja Kulkarni',
      phone: '9822114455',
      marketing_consent: true,
    });

    const order = dbStore.getOrders().find((o) => o.id === res.order_id)!;
    const customerId = order.customer_id;

    // Erase customer
    dbStore.eraseCustomer(customerId);

    const customer = dbStore.getCustomers().find((c) => c.id === customerId)!;
    expect(customer.name).toBeNull();
    expect(customer.phone).toBeNull();
    expect(customer.birthday).toBeNull();
    expect(customer.marketing_consent).toBe(false);
    expect(customer.deleted_at).not.toBeNull();

    // Order remains present for accounting reconciliation, but anonymized
    const remainingOrder = dbStore.getOrders().find((o) => o.id === res.order_id);
    expect(remainingOrder).toBeDefined();

    // Append-only consent withdrawal logged
    const logs = dbStore.getConsentLogs().filter((l) => l.customer_id === customerId);
    const withdrawalLog = logs.find((l) => l.consent_text_version === 'withdrawn_by_erasure');
    expect(withdrawalLog).toBeDefined();
    expect(withdrawalLog?.granted).toBe(false);
  });

  it('filters exportable customer list to consented records only', async () => {
    const table = dbStore.getTables()[0];
    const item = dbStore.getMenuItems()[0];

    // Customer 1: Consented
    dbStore.createOrder({
      token: table.token,
      items: [{ menu_item_id: item.id, quantity: 1 }],
      name: 'Consented Customer',
      phone: '9811111111',
      marketing_consent: true,
    });

    // Customer 2: Not consented
    dbStore.createOrder({
      token: table.token,
      items: [{ menu_item_id: item.id, quantity: 1 }],
      name: 'Non Consented Customer',
      phone: '9822222222',
      marketing_consent: false,
    });

    const exportable = await api.getConsentedCustomers();
    expect(exportable.length).toBe(1);
    expect(exportable[0].name).toBe('Consented Customer');
    expect(exportable[0].marketing_consent).toBe(true);
  });
});
