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

export const InfoTab: React.FC = () => {
  const { cafe } = useOutletContext<TableAppContextType>();
  const [clearedNotice, setClearedNotice] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_DETAILS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setCustomerName(parsed.name);
        if (parsed.phone) {
          api.getCustomerLoyalty(parsed.phone).then((data) => {
            setLoyaltyPoints(data.points);
          });
        }
      }
    } catch {
      // Ignore
    }

    api.getLoyaltyRewards().then((list) => setRewards(list));
  }, []);

  const handleClearDetails = () => {
    try {
      sessionStorage.removeItem(SESSION_DETAILS_KEY);
      setCustomerName(null);
      setLoyaltyPoints(null);
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      <h1 className="text-xl font-bold text-ink px-1 tracking-tight">Cafe & Loyalty</h1>

      {clearedNotice && (
        <div
          role="status"
          className="p-3 rounded-[12px] bg-success/15 border border-success/30 text-success text-xs font-semibold animate-in fade-in duration-150"
        >
          Your temporary name and phone have been cleared from this browser session.
        </div>
      )}

      {/* Green Fuel Loyalty Card (Phase 4) */}
      <div className="p-4 glass-strong rounded-[6px] border border-accent/40 shadow-sm space-y-3.5 text-xs text-ink">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[6px] bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
              <Icons.Bolt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink">Green Fuel Club</h2>
              <p className="text-[11px] text-ink-muted">Athlete & Clean Nutrition Rewards</p>
            </div>
          </div>
          {loyaltyPoints !== null && (
            <span className="px-2.5 py-1 rounded-[4px] bg-accent/15 text-accent border border-accent/30 font-bold text-xs tabular-nums">
              {loyaltyPoints} pts
            </span>
          )}
        </div>

        {customerName && (
          <p className="text-xs font-medium text-ink">
            Welcome back, <span className="font-bold text-accent">{customerName}</span>!
          </p>
        )}

        <div className="p-3 rounded-[6px] glass border border-glass-border space-y-1 text-[11px] text-ink-muted leading-relaxed">
          <p className="font-semibold text-ink">How it works:</p>
          <p>• Earn 1 Green Fuel Point for every ₹10 spent on healthy snacks & bowls.</p>
          <p>• Redeem rewards directly at table checkout with zero coupon codes.</p>
        </div>

        <div className="pt-1 space-y-2">
          <span className="text-[11px] font-semibold text-ink block">Reward Milestones:</span>
          <div className="grid grid-cols-3 gap-2 text-center">
            {rewards.map((r) => (
              <div
                key={r.id}
                className="p-2.5 rounded-[6px] glass border border-glass-border space-y-1"
              >
                <span className="block font-bold text-accent text-xs tabular-nums">
                  {r.points_cost} pts
                </span>
                <span className="block text-[10px] font-semibold text-ink leading-tight">
                  {r.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="p-4 glass-strong rounded-[6px] border border-glass-border shadow-sm space-y-4 text-xs text-ink">
        <div>
          <h2 className="text-base font-bold text-ink mb-1">{cafe.name}</h2>
          <p className="text-ink-muted leading-relaxed">{cafe.address}</p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(cafe.name + ' ' + cafe.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-accent font-semibold mt-2 hover:underline"
          >
            <span>Open in Google Maps</span>
            <Icons.ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="pt-3 border-t border-glass-border">
          <span className="font-semibold text-ink block mb-1">Phone</span>
          <a
            href={`tel:${cafe.phone}`}
            className="inline-flex items-center gap-2 text-accent font-semibold text-sm hover:underline"
          >
            <Icons.Phone className="w-4 h-4" />
            <span>{cafe.phone}</span>
          </a>
        </div>

        <div className="pt-3 border-t border-glass-border">
          <span className="font-semibold text-ink block mb-1">Hours</span>
          <p className="text-ink-muted leading-relaxed">
            Monday to Friday: {cafe.opening_hours.weekdays || '8:00 AM to 10:00 PM'}<br />
            Saturday and Sunday: {cafe.opening_hours.weekends || '8:00 AM to 11:00 PM'}
          </p>
        </div>

        <div className="pt-3 border-t border-glass-border">
          <span className="font-semibold text-ink block mb-1">Legal Details</span>
          <p className="text-ink-muted">
            Legal Entity: {cafe.legal_name}<br />
            FSSAI Licence: {cafe.fssai_number}<br />
            {cafe.gstin && <>GSTIN: {cafe.gstin}<br /></>}
          </p>
        </div>
      </div>

      {/* Privacy and Preferences */}
      <div className="p-4 glass-strong rounded-[6px] border border-glass-border shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-ink">Saved details</h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          We temporarily keep your name and phone in this browser tab so you don't have to retype them on repeat orders.
        </p>
        <button
          type="button"
          onClick={handleClearDetails}
          className="h-9 px-4 rounded-[6px] glass text-xs font-semibold text-danger border border-danger/30 hover:bg-danger/10 transition-colors duration-150"
        >
          Clear my details
        </button>
      </div>


      {/* Policy Links */}
      <div className="p-4 glass-strong rounded-[6px] border border-glass-border shadow-sm space-y-2.5 text-xs">
        <h2 className="text-sm font-bold text-ink mb-1">Policies and terms</h2>
        <div className="flex flex-col space-y-2 text-accent font-medium">
          <Link to="/privacy" target="_blank" className="hover:underline flex items-center justify-between">
            <span>Privacy Policy</span>
            <Icons.ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
          </Link>
          <Link to="/terms" target="_blank" className="hover:underline flex items-center justify-between">
            <span>Terms and Conditions</span>
            <Icons.ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
          </Link>
          <Link to="/cookies" target="_blank" className="hover:underline flex items-center justify-between">
            <span>Cookie Policy</span>
            <Icons.ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
          </Link>
          <Link to="/order-policy" target="_blank" className="hover:underline flex items-center justify-between">
            <span>Order Cancellation and Refund Policy</span>
            <Icons.ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
          </Link>
          <Link to="/accessibility" target="_blank" className="hover:underline flex items-center justify-between">
            <span>Accessibility Statement</span>
            <Icons.ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
          </Link>
        </div>
      </div>

      {/* Grievance Contact */}
      <div className="p-4 glass-strong rounded-[6px] border border-glass-border shadow-sm text-xs text-ink space-y-1">
        <h2 className="text-sm font-bold text-ink mb-1">Grievance and Privacy Officer</h2>
        <p className="text-ink-muted">Name: {cafe.grievance_name}</p>
        <p className="text-ink-muted">Email: {cafe.grievance_email}</p>
        <p className="text-ink-muted">Phone: {cafe.grievance_phone}</p>
      </div>
    </div>
  );
};

