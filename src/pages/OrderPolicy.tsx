import React, { useEffect } from 'react';

export const OrderPolicy: React.FC = () => {
  useEffect(() => {
    document.title = 'Order Policy & Refunds | Artisan Roast Cafe';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="border border-cafe-border bg-cafe-surface p-6 sm:p-10 rounded">
        <div className="border-b border-cafe-border pb-6 mb-8">
          <h1 className="text-3xl font-semibold text-cafe-accent tracking-tight mb-2">
            Order Cancellation and Refund Policy
          </h1>
          <p className="text-xs text-cafe-textMuted">
            Last updated: 02 October 2026 | Version: 1.0
          </p>
        </div>

        <div className="space-y-6 text-sm text-cafe-text leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              1. Payment and Refund Context
            </h2>
            <p className="p-3 bg-cafe-muted rounded border border-cafe-border font-medium">
              Because all payments are conducted in person at the physical cafe billing counter, no automated online refunds or electronic payment rollbacks exist on this website.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              2. Cancellation Before Kitchen Preparation Starts
            </h2>
            <p>
              If your order status is marked as <strong>New</strong> or <strong>Accepted</strong>, you may cancel your order without charge by notifying our floor staff or counter team immediately.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              3. Cancellation After Preparation Has Begun
            </h2>
            <p>
              Once your order has moved to <strong>Preparing</strong>, the kitchen has already commenced grinding beans, cooking, or plating. Cancellation at this stage is governed by the cafe policy:
            </p>
            <p className="mt-1 italic text-cafe-textMuted">
              [[CLIENT_TO_PROVIDE: cafe's rule on cancellations once food/beverage preparation has started]]
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              4. Unsatisfactory or Incorrect Items
            </h2>
            <p>
              If you receive an item that was prepared incorrectly or does not meet quality expectations, please notify our service team at once. We will promptly replace the item or adjust your counter bill at our discretion [[CLIENT_TO_PROVIDE: confirm resolution terms]].
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              5. Dispute Settlement & Counter Assistance
            </h2>
            <p>
              Any question regarding item pricing or final billing is settled directly at the counter with the manager on duty. You can also reach our management by phone at [[CLIENT_TO_PROVIDE: phone number]] or email at [[CLIENT_TO_PROVIDE: email address]].
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
