import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Cafe, LoyaltyReward } from '../../types';
import { Icons } from '../../components/Icon';
import { api } from '../../services/api';

const SESSION_DETAILS_KEY = 'cafe_customer_details';

interface TableAppContextType {
  cafe: Cafe;
  token: string;
}

export const LoyaltyClubTab: React.FC = () => {
  const { cafe } = useOutletContext<TableAppContextType>();
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(140);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [optInSuccess, setOptInSuccess] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_DETAILS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setCustomerName(parsed.name);
        if (parsed.phone) {
          setCustomerPhone(parsed.phone);
          api.getCustomerLoyalty(parsed.phone).then((data) => {
            if (data && data.points) setLoyaltyPoints(data.points);
          });
        }
      }
    } catch {
      // Ignore
    }

    api.getLoyaltyRewards().then((list) => setRewards(list));
  }, []);

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;

    try {
      const existing = sessionStorage.getItem(SESSION_DETAILS_KEY);
      const parsed = existing ? JSON.parse(existing) : {};
      sessionStorage.setItem(
        SESSION_DETAILS_KEY,
        JSON.stringify({
          ...parsed,
          phone: customerPhone.trim(),
          opt_in_marketing: whatsappOptIn,
        })
      );
      setOptInSuccess(true);
      setTimeout(() => setOptInSuccess(false), 3000);
    } catch {
      // Ignore
    }
  };

  const handleClearDetails = () => {
    try {
      sessionStorage.removeItem(SESSION_DETAILS_KEY);
      setCustomerName(null);
      setCustomerPhone('');
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    } catch {
      // Ignore
    }
  };

  const pointsTarget = 200;
  const progressPercent = Math.min(100, Math.round((loyaltyPoints / pointsTarget) * 100));

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Header title */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">Athlete Club</h1>
          <p className="text-xs text-ink-muted">High performance nutrition rewards</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] glass-strong border border-accent/30 text-accent font-bold text-xs tabular-nums">
          <Icons.Bolt className="w-3.5 h-3.5" />
          <span>{loyaltyPoints} PTS</span>
        </div>
      </div>

      {clearedNotice && (
        <div
          role="status"
          className="p-3 rounded-[6px] bg-success/15 border border-success/30 text-success text-xs font-semibold"
        >
          Your temporary name and phone have been cleared from this browser session.
        </div>
      )}

      {/* Main Athlete Pro Tier Card (Obsidian Glass Tier) */}
      <section className="glass-strong rounded-[6px] p-5 border border-accent/40 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[6px] bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
              <Icons.ClubTab className="w-5 h-5" filled={true} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-accent block">
                Green Fuel Card
              </span>
              <h2 className="text-base font-bold text-ink leading-tight">
                Athlete Pro : Tier 2
              </h2>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-[4px] bg-accent text-accent-ink">
            Active Member
          </span>
        </div>

        {customerName && (
          <p className="text-xs text-ink">
            Welcome, <span className="font-bold text-accent">{customerName}</span>
          </p>
        )}

        <p className="text-xs text-ink-muted leading-relaxed">
          Next Milestone: <strong className="text-accent font-semibold">{pointsTarget - loyaltyPoints} pts to Free Protein Shake</strong>. Maintain 4 weekly visits to trigger 2x recovery multiplier.
        </p>

        {/* Solid Emerald Progress Bar (complying with Section 0.2: zero gradients) */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-slate-100 h-2.5 rounded-[4px] p-0.5 border border-[#E2E8F0]">
            <div
              className="bg-[#15803D] h-full rounded-[2px] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              aria-valuenow={loyaltyPoints}
              aria-valuemin={0}
              aria-valuemax={pointsTarget}
              role="progressbar"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-[#64748B] tabular-nums">
            <span>{loyaltyPoints} PTS EARNED</span>
            <span className="text-[#15803D]">{pointsTarget} PTS TARGET</span>
          </div>
        </div>
      </section>


      {/* Rewards Catalog */}
      <section className="glass-strong rounded-[6px] p-4 border border-glass-border space-y-3">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
          Redeemable Fuel Milestones
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          {rewards.map((r) => {
            const isUnlocked = loyaltyPoints >= r.points_cost;
            return (
              <div
                key={r.id}
                className={`p-2.5 rounded-[6px] border space-y-1 transition-colors ${
                  isUnlocked
                    ? 'glass border-accent/40 bg-accent/5'
                    : 'glass-subtle border-glass-border opacity-70'
                }`}
              >
                <span className="block font-bold text-accent text-xs tabular-nums">
                  {r.points_cost} pts
                </span>
                <span className="block text-[11px] font-semibold text-ink leading-tight">
                  {r.badge}
                </span>
                <span className="block text-[9px] text-ink-muted uppercase">
                  {isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* WhatsApp VIP Drops Form */}
      <section className="glass-strong rounded-[6px] p-4 border border-glass-border space-y-3">
        <div className="flex items-center gap-2">
          <Icons.Bolt className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
            WhatsApp Recovery Perks
          </h3>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          Link your mobile number to get automatic point credits on table orders and receive Sunday athlete nutrition drops.
        </p>

        {optInSuccess && (
          <div
            role="status"
            className="p-2.5 rounded-[6px] bg-success/15 border border-success/30 text-success text-xs font-semibold"
          >
            Your number has been saved for table points.
          </div>
        )}

        <form onSubmit={handleSavePhone} className="space-y-3">
          <div>
            <label htmlFor="customer-phone" className="block text-xs font-semibold text-ink mb-1">
              Mobile Number
            </label>
            <input
              id="customer-phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full h-11 px-3 rounded-[6px] bg-white border border-[#CBD5E1] text-sm text-[#0F172A] placeholder:text-slate-400 focus-visible:outline-none focus:border-[#15803D]"
            />

          </div>

          <label className="flex items-start gap-2.5 text-xs text-ink-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={whatsappOptIn}
              onChange={(e) => setWhatsappOptIn(e.target.checked)}
              className="mt-0.5 rounded-[4px] border-glass-border text-accent focus:ring-accent"
            />
            <span>Receive recovery meal drops, nutrition tips, and birthday shake perks on WhatsApp</span>
          </label>

          <button
            type="submit"
            className="w-full h-11 rounded-[6px] bg-accent text-accent-ink text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-transform flex items-center justify-center gap-1.5"
          >
            <Icons.Check className="w-4 h-4" />
            <span>Update Club Profile</span>
          </button>
        </form>
      </section>

      {/* Cafe Information & Support */}
      <section className="glass-strong rounded-[6px] p-4 border border-glass-border space-y-3 text-xs text-ink">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
          Cafe Location & Hours
        </h3>
        <p className="text-ink-muted leading-relaxed">{cafe.address}</p>

        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(cafe.name + ' ' + cafe.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-accent font-semibold hover:underline"
          >
            <Icons.MapPin className="w-3.5 h-3.5" />
            <span>Directions</span>
          </a>
          <a
            href={`tel:${cafe.phone}`}
            className="inline-flex items-center gap-1.5 text-accent font-semibold hover:underline"
          >
            <Icons.Phone className="w-3.5 h-3.5" />
            <span>{cafe.phone}</span>
          </a>
        </div>

        <div className="pt-2 border-t border-glass-border space-y-1 text-ink-muted">
          <p>Weekdays: {cafe.opening_hours.weekdays || '8:00 AM to 10:00 PM'}</p>
          <p>Weekends: {cafe.opening_hours.weekends || '8:00 AM to 11:00 PM'}</p>
        </div>
      </section>

      {/* Privacy Clear & Legal Links */}
      <section className="glass-strong rounded-[6px] p-4 border border-glass-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
            Privacy & Session
          </h3>
          <button
            type="button"
            onClick={handleClearDetails}
            className="text-[11px] text-danger hover:underline font-semibold"
          >
            Clear saved details
          </button>
        </div>

        <div className="pt-2 border-t border-glass-border grid grid-cols-2 gap-2 text-[11px] text-accent">
          <Link to="/privacy" target="_blank" className="hover:underline">Privacy Policy</Link>
          <Link to="/terms" target="_blank" className="hover:underline">Terms & Conditions</Link>
          <Link to="/cookies" target="_blank" className="hover:underline">Cookie Policy</Link>
          <Link to="/order-policy" target="_blank" className="hover:underline">Refund Policy</Link>
        </div>
      </section>
    </div>
  );
};
