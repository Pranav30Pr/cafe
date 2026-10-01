import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms & Conditions | Artisan Roast Cafe';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="border border-cafe-border bg-cafe-surface p-6 sm:p-10 rounded">
        <div className="border-b border-cafe-border pb-6 mb-8">
          <h1 className="text-3xl font-semibold text-cafe-accent tracking-tight mb-2">
            Terms and Conditions
          </h1>
          <p className="text-xs text-cafe-textMuted">
            Last updated: 02 October 2026 | Version: 1.0
          </p>
        </div>

        <div className="space-y-6 text-sm text-cafe-text leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">1. Operating Entity</h2>
            <p>
              These Terms govern your use of the website and QR table ordering service provided by Artisan Roast Cafe (legal entity: [[CLIENT_TO_PROVIDE: registered legal name]]), located at [[CLIENT_TO_PROVIDE: full address, e.g. Shop 4, Lane 5, Koregaon Park, Pune 411001]].
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">2. How Ordering Works</h2>
            <p>
              Orders placed through the table QR code system are requests submitted to our kitchen. An order is confirmed only once accepted by cafe staff on the kitchen screen. An item may occasionally become unavailable due to stock depletion.
            </p>
            <p className="mt-2 font-medium">
              Payment is strictly conducted at our cafe counter upon completion or delivery of service. No online financial transactions or payment gateway integrations exist on this website.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">3. Prices and Taxes</h2>
            <p>
              Menu prices are displayed in Indian Rupees (INR) [[CLIENT_TO_PROVIDE: inclusive or exclusive of taxes]]. The final invoice including applicable GST and charges will be issued at the physical counter.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">4. Order Cancellation and Refunds</h2>
            <p>
              Please refer to our{' '}
              <Link to="/order-policy" className="text-cafe-accent underline font-medium">
                Order Cancellation and Refund Policy
              </Link>{' '}
              for details on cancellations and item replacement procedures.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">5. Dietary and Allergen Notice</h2>
            <p>
              Dietary markers (Vegetarian, Non-Vegetarian, Egg) and allergen warnings are displayed in good faith based on recipe standards. If you have severe food allergies or medical dietary requirements, please inform a staff member in person before ordering.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">6. Acceptable Use</h2>
            <p>
              You agree not to place fraudulent or test orders without intention to consume, interfere with our ordering network, or use automated scripts to access the system. Abuse may result in order rejection.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">7. Intellectual Property</h2>
            <p>
              All menu copy, photographs, trademarks, and branding displayed on this website belong to Artisan Roast Cafe or its licensors.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">8. Limitation of Liability</h2>
            <p>
              To the extent permitted under applicable law, Artisan Roast Cafe is not liable for temporary technical interruptions to the ordering platform. Our liability regarding food items ordered is limited to replacing the item or adjusting your bill at the counter.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">9. Governing Law & Jurisdiction</h2>
            <p>
              These terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the competent courts in [[CLIENT_TO_PROVIDE: city, for example Pune]].
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">10. Contact Information</h2>
            <p>
              For questions regarding these terms, contact us at [[CLIENT_TO_PROVIDE: email address]] or speak to the cafe manager at the counter.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
