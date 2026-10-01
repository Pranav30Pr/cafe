import React, { useEffect } from 'react';

export const CookiePolicy: React.FC = () => {
  useEffect(() => {
    document.title = 'Cookie Policy | Artisan Roast Cafe';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="border border-cafe-border bg-cafe-surface p-6 sm:p-10 rounded">
        <div className="border-b border-cafe-border pb-6 mb-8">
          <h1 className="text-3xl font-semibold text-cafe-accent tracking-tight mb-2">
            Cookie and Local Storage Policy
          </h1>
          <p className="text-xs text-cafe-textMuted">
            Last updated: 02 October 2026 | Version: 1.0
          </p>
        </div>

        <div className="space-y-6 text-sm text-cafe-text leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              1. Plain Statement
            </h2>
            <p>
              Artisan Roast Cafe uses <strong>only strictly necessary browser storage</strong> to make table ordering and staff management function. We do <strong>not</strong> use advertising cookies, third-party analytics pixels, trackers, or behavioral profiling tools.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              2. Complete Storage Inventory
            </h2>
            <p className="mb-3 text-xs text-cafe-textMuted">
              The following table discloses every storage key used by this website:
            </p>

            <div className="overflow-x-auto border border-cafe-border rounded">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-cafe-muted text-cafe-text font-semibold border-b border-cafe-border">
                  <tr>
                    <th className="p-3">Key / Item</th>
                    <th className="p-3">Technology</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Who Sets It</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cafe-border">
                  <tr>
                    <td className="p-3 font-mono">cafe_cart</td>
                    <td className="p-3">sessionStorage</td>
                    <td className="p-3">Preserves your current table order items during the visit</td>
                    <td className="p-3">Session only (cleared when browser tab is closed)</td>
                    <td className="p-3">First-party (Our site)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">cafe_customer_details</td>
                    <td className="p-3">sessionStorage</td>
                    <td className="p-3">Optional temporary convenience to save retyping name & phone for re-orders during the visit. A clear button is provided.</td>
                    <td className="p-3">Session only</td>
                    <td className="p-3">First-party (Our site)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">cafe_staff_auth</td>
                    <td className="p-3">localStorage / Supabase Auth</td>
                    <td className="p-3">Maintains authenticated session for kitchen and owner tablet staff</td>
                    <td className="p-3">Persistent until staff sign-out</td>
                    <td className="p-3">First-party (Staff only)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              3. Why There is No Cookie Banner
            </h2>
            <p>
              Under privacy regulations and the DPDP Act, cookie banners are required only when non-essential trackers, marketing cookies, or third-party analytics are deployed. Because our website relies purely on technical items required to deliver the service you requested, no consent banner is legally required.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              4. If We Ever Change This Policy
            </h2>
            <p>
              If we ever decide to integrate non-essential cookies in the future, we will update this policy first and introduce an explicit opt-in consent banner with equally prominent "Accept" and "Reject" choices before any such cookie is set.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
