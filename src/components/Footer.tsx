import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from './SvgIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-cafe-surface border-t border-cafe-border mt-auto pt-10 pb-8 text-sm text-cafe-text">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Business & Legal Identity */}
          <div>
            <div className="font-semibold text-cafe-accent text-base mb-2">Artisan Roast Cafe</div>
            <p className="text-xs text-cafe-textMuted mb-2">
              Legal entity: [[CLIENT_TO_PROVIDE: registered legal name]]
            </p>
            <p className="text-xs text-cafe-textMuted mb-1">
              FSSAI Licence: [[CLIENT_TO_PROVIDE: 14 digit FSSAI licence number]]
            </p>
            <p className="text-xs text-cafe-textMuted">
              GSTIN: [[CLIENT_TO_PROVIDE: GSTIN if registered]]
            </p>
          </div>

          {/* Location & Contact */}
          <div>
            <div className="font-semibold text-cafe-text text-sm mb-2">Location and Hours</div>
            <p className="text-xs text-cafe-textMuted mb-1.5 flex items-start gap-1.5">
              <Icons.MapPin className="w-3.5 h-3.5 text-cafe-textMuted mt-0.5 flex-shrink-0" />
              <span>[[CLIENT_TO_PROVIDE: full address, e.g. Shop 4, Lane 5, Koregaon Park, Pune 411001]]</span>
            </p>
            <p className="text-xs text-cafe-textMuted mb-1.5 flex items-center gap-1.5">
              <Icons.Clock className="w-3.5 h-3.5 text-cafe-textMuted flex-shrink-0" />
              <span>Mon to Fri: 8:00 AM to 10:00 PM | Sat to Sun: 8:00 AM to 11:00 PM</span>
            </p>
            <p className="text-xs text-cafe-textMuted flex items-center gap-1.5">
              <Icons.Phone className="w-3.5 h-3.5 text-cafe-textMuted flex-shrink-0" />
              <span>Phone: [[CLIENT_TO_PROVIDE: phone number]]</span>
            </p>
          </div>

          {/* Grievance & Compliance Contact */}
          <div>
            <div className="font-semibold text-cafe-text text-sm mb-2">Grievance and Privacy Officer</div>
            <p className="text-xs text-cafe-textMuted mb-1">
              Officer: [[CLIENT_TO_PROVIDE: grievance contact person name]]
            </p>
            <p className="text-xs text-cafe-textMuted mb-1">
              Email: [[CLIENT_TO_PROVIDE: grievance email]]
            </p>
            <p className="text-xs text-cafe-textMuted">
              Phone: [[CLIENT_TO_PROVIDE: grievance phone]]
            </p>
            <p className="text-xs text-cafe-textMuted mt-2">
              Complaints acknowledged within 48 hours and resolved within 30 days under the DPDP Act.
            </p>
          </div>
        </div>

        {/* Five Legal Policies Bar (Section 5.1 & Section 7) */}
        <div className="pt-6 border-t border-cafe-border flex flex-wrap gap-x-6 gap-y-2 text-xs text-cafe-textMuted">
          <Link to="/privacy" className="hover:text-cafe-accent underline transition-colors duration-150">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-cafe-accent underline transition-colors duration-150">
            Terms and Conditions
          </Link>
          <Link to="/cookies" className="hover:text-cafe-accent underline transition-colors duration-150">
            Cookie Policy
          </Link>
          <Link to="/order-policy" className="hover:text-cafe-accent underline transition-colors duration-150">
            Order Cancellation and Refund Policy
          </Link>
          <Link to="/accessibility" className="hover:text-cafe-accent underline transition-colors duration-150">
            Accessibility Statement
          </Link>
        </div>

        {/* Bottom developer & copyright note */}
        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-cafe-textMuted gap-2">
          <div>
            &copy; {new Date().getFullYear()} Artisan Roast Cafe. All rights reserved.
          </div>
          <div>
            Website by [[CLIENT_TO_PROVIDE: developer business name]]
          </div>
        </div>
      </div>
    </footer>
  );
};
