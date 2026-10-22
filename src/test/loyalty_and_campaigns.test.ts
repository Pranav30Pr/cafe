import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore } from '../services/dbStore';
import { api } from '../services/api';

describe('Phase 4: Loyalty Points & WhatsApp Campaigns', () => {
  beforeEach(() => {
    dbStore.resetToSeed();
  });

  it('automatically accrues 1 Green Fuel Point per ₹10 spent on healthy snacks and bowls', () => {
    const table = dbStore.getTables()[0];
    const items = dbStore.getMenuItems();
    // Espresso is ₹120 (12000 paise). 2 espressos = ₹240.
    const espresso = items.find((i) => i.name === 'Espresso')!;

    const res = dbStore.createOrder({
      token: table.token,
      items: [{ menu_item_id: espresso.id, quantity: 2 }],
      name: 'Sahil Fitness',
      phone: '9876543210',
      marketing_consent: true,
    });

    expect(res.points_earned).toBe(24); // 240 / 10 = 24 points
    expect(res.total_points).toBe(24);

    const loyalty = dbStore.getCustomerLoyalty('9876543210');
    expect(loyalty.points).toBe(24);
    // At 24 pts, 20 pt reward (Electrolyte Booster) should be unlocked
    expect(loyalty.availableRewards.length).toBeGreaterThanOrEqual(1);
    expect(loyalty.availableRewards[0].id).toBe('rew_electrolyte');
  });

  it('allows redeeming available rewards and deducts loyalty points', () => {
    const table = dbStore.getTables()[0];
    const items = dbStore.getMenuItems();
    const edamame = items.find((i) => i.name === 'Roasted Paprika Edamame')!; // ₹130

    // Initial order to earn 52 points (4 * 130 = ₹520 => 52 points)
    dbStore.createOrder({
      token: table.token,
      items: [{ menu_item_id: edamame.id, quantity: 4 }],
      name: 'Priya Athlete',
      phone: '9822334455',
      marketing_consent: true,
    });

    let loyalty = dbStore.getCustomerLoyalty('9822334455');
    expect(loyalty.points).toBe(52);

    // Place a second order and redeem 50 pt Free Protein Energy Snack ('rew_protein_snack')
    const res2 = dbStore.createOrder({
      token: table.token,
      items: [{ menu_item_id: edamame.id, quantity: 1 }], // ₹130 = +13 pts
      name: 'Priya Athlete',
      phone: '9822334455',
      marketing_consent: true,
      redeem_reward_id: 'rew_protein_snack', // costs 50 pts
    });

    // 52 - 50 + 13 = 15 points remaining
    loyalty = dbStore.getCustomerLoyalty('9822334455');
    expect(loyalty.points).toBe(15);
    expect(res2.total_points).toBe(15);
  });

  it('creates and records WhatsApp campaigns targeting consented members with mandatory opt-out', async () => {
    const campaign = await api.createWhatsAppCampaign({
      title: 'Post-Workout Fuel Special',
      target_audience: 'all_consented',
      template_name: 'meta_approved_post_workout_v1',
      message_text: 'Fuel your workout at Verde Fuel! Reply STOP to opt out.',
      recipient_count: 45,
    });

    expect(campaign.id).toBeDefined();
    expect(campaign.status).toBe('sent');
    expect(campaign.message_text).toContain('Reply STOP to opt out');

    const allCampaigns = await api.getWhatsAppCampaigns();
    expect(allCampaigns.some((c) => c.id === campaign.id)).toBe(true);
  });
});
