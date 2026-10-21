import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Cafe } from '../../types';
import { Icons } from '../../components/Icon';

const SESSION_DETAILS_KEY = 'cafe_customer_details';

interface TableAppContextType {
  cafe: Cafe;
  token: string;
}

export const InfoTab: React.FC = () => {
  const { cafe } = useOutletContext<TableAppContextType>();
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClearDetails = () => {
    try {
      sessionStorage.removeItem(SESSION_DETAILS_KEY);
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      <h1 className="text-xl font-bold text-ink px-1 tracking-tight">Cafe information</h1>

      {clearedNotice && (
        <div
          role="status"
          className="p-3 rounded-[12px] bg-success/15 border border-success/30 text-success text-xs font-semibold animate-in fade-in duration-150"
        >
          Your temporary name and phone have been cleared from this browser session.
        </div>
      )}

      {/* Main Info Card */}
      <div className="p-5 glass-strong rounded-[16px] border border-glass-border shadow-sm space-y-4 text-xs text-ink">
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
      <div className="p-5 glass-strong rounded-[16px] border border-glass-border shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-ink">Saved details</h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          We temporarily keep your name and phone in this browser tab so you don't have to retype them on repeat orders.
        </p>
        <button
          type="button"
          onClick={handleClearDetails}
          className="h-10 px-4 rounded-[12px] glass text-xs font-semibold text-danger border border-danger/30 hover:bg-danger/10 transition-colors duration-150"
        >
          Clear my details
        </button>
      </div>

      {/* Policy Links */}
      <div className="p-5 glass-strong rounded-[16px] border border-glass-border shadow-sm space-y-2.5 text-xs">
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
      <div className="p-5 glass-strong rounded-[16px] border border-glass-border shadow-sm text-xs text-ink space-y-1">
        <h2 className="text-sm font-bold text-ink mb-1">Grievance and Privacy Officer</h2>
        <p className="text-ink-muted">Name: {cafe.grievance_name}</p>
        <p className="text-ink-muted">Email: {cafe.grievance_email}</p>
        <p className="text-ink-muted">Phone: {cafe.grievance_phone}</p>
      </div>
    </div>
  );
};
