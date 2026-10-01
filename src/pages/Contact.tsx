import React, { useEffect } from 'react';
import { Icons } from '../components/SvgIcon';

export const Contact: React.FC = () => {
  useEffect(() => {
    document.title = 'Contact & Location | Artisan Roast Cafe';
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="border border-cafe-border bg-cafe-surface p-6 sm:p-10 rounded">
        <h1 className="text-3xl font-semibold text-cafe-accent tracking-tight mb-8">
          Contact and Location
        </h1>

        <div className="space-y-6 text-sm text-cafe-text">
          {/* Address */}
          <div className="flex items-start gap-3">
            <Icons.MapPin className="w-5 h-5 text-cafe-accent flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-base mb-1">Cafe Address</h2>
              <p className="text-cafe-textMuted leading-relaxed mb-2">
                [[CLIENT_TO_PROVIDE: full address, e.g. Shop 4, Lane 5, Koregaon Park, Pune 411001]]
              </p>
              {/* Plain link to map per Section 0.5 & 5.1 (NO IFRAME) */}
              <a
                href="https://maps.google.com/?q=[[CLIENT_TO_PROVIDE:+cafe+coordinates+or+address]]"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-cafe-accent font-medium hover:underline text-xs"
              >
                <span>View location on Google Maps</span>
                <Icons.ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="flex items-start gap-3 pt-6 border-t border-cafe-border">
            <Icons.Clock className="w-5 h-5 text-cafe-accent flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-base mb-1">Hours of Operation</h2>
              <p className="text-cafe-textMuted leading-relaxed">
                Monday to Friday: 8:00 AM to 10:00 PM<br />
                Saturday and Sunday: 8:00 AM to 11:00 PM
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3 pt-6 border-t border-cafe-border">
            <Icons.Phone className="w-5 h-5 text-cafe-accent flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-base mb-1">Telephone</h2>
              <p className="text-cafe-textMuted leading-relaxed">
                Phone: [[CLIENT_TO_PROVIDE: phone number]]
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3 pt-6 border-t border-cafe-border">
            <Icons.Mail className="w-5 h-5 text-cafe-accent flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-base mb-1">Email</h2>
              <p className="text-cafe-textMuted leading-relaxed">
                Email: [[CLIENT_TO_PROVIDE: email address]]
              </p>
            </div>
          </div>

          {/* Grievance Officer */}
          <div className="pt-6 border-t border-cafe-border bg-cafe-muted p-4 rounded text-xs">
            <h2 className="font-semibold text-cafe-text text-sm mb-1">
              Grievance and Privacy Officer
            </h2>
            <p className="text-cafe-textMuted mb-1">
              Officer: [[CLIENT_TO_PROVIDE: grievance contact person name]]
            </p>
            <p className="text-cafe-textMuted mb-1">
              Email: [[CLIENT_TO_PROVIDE: grievance email]]
            </p>
            <p className="text-cafe-textMuted">
              Phone: [[CLIENT_TO_PROVIDE: grievance phone]]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
