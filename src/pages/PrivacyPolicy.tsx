import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PrivacyRequestType } from '../types';
import { Icons } from '../components/SvgIcon';

export const PrivacyPolicy: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [requestType, setRequestType] = useState<PrivacyRequestType>('access');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = 'Privacy Policy | Artisan Roast Cafe';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneOrEmail.trim()) {
      setError('Please provide your mobile number or email address.');
      return;
    }

    if (!message.trim()) {
      setError('Please describe your request.');
      return;
    }

    try {
      setLoading(true);
      await api.submitPrivacyRequest({
        phone_or_email: phoneOrEmail.trim(),
        request_type: requestType,
        message: message.trim(),
      });
      setFormSubmitted(true);
      setPhoneOrEmail('');
      setMessage('');
    } catch {
      setError('Failed to submit request. Please try again or email the Grievance Officer directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="border border-cafe-border bg-cafe-surface p-6 sm:p-10 rounded">
        <div className="border-b border-cafe-border pb-6 mb-8">
          <h1 className="text-3xl font-semibold text-cafe-accent tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-cafe-textMuted">
            Last updated: 02 October 2026 | Version: 1.0
          </p>
        </div>

        <div className="space-y-8 text-sm text-cafe-text leading-relaxed">
          {/* 1. Who we are */}
          <section aria-labelledby="heading-1">
            <h2 id="heading-1" className="text-lg font-semibold text-cafe-accent mb-2">
              1. Who we are
            </h2>
            <p>
              This website and ordering service is operated by Artisan Roast Cafe (legal entity: [[CLIENT_TO_PROVIDE: registered legal name]]), located at [[CLIENT_TO_PROVIDE: full address, e.g. Shop 4, Lane 5, Koregaon Park, Pune 411001]].
            </p>
            <p className="mt-2">
              Under the Digital Personal Data Protection Act, 2023 (DPDP Act), the cafe is the <strong>Data Fiduciary</strong> that determines the purpose and means of processing your personal data. The website developer ([[CLIENT_TO_PROVIDE: developer business name]]) acts strictly as a <strong>Data Processor</strong> on our behalf.
            </p>
          </section>

          {/* 2. What we collect */}
          <section aria-labelledby="heading-2">
            <h2 id="heading-2" className="text-lg font-semibold text-cafe-accent mb-2">
              2. What personal data we collect
            </h2>
            <p>
              We practice strict data minimisation. When you place an order, we collect only:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-cafe-text">
              <li>Your name</li>
              <li>Your 10-digit mobile number</li>
              <li>The items you ordered and the table identifier</li>
              <li>Optional preparation notes or instructions you choose to provide</li>
              <li>Your marketing consent choice (whether you opted in to WhatsApp updates) and timestamp</li>
            </ul>
            <p className="mt-2">
              We do <strong>not</strong> collect your email address for ordering, physical residential address, location data, device fingerprints, demographic profile, or payment card details. Payment is always completed in person at our cafe counter.
            </p>
          </section>

          {/* 3. Why we collect each item (Purpose) */}
          <section aria-labelledby="heading-3">
            <h2 id="heading-3" className="text-lg font-semibold text-cafe-accent mb-2">
              3. Purpose of data collection
            </h2>
            <p>
              We use your name and mobile number strictly to identify your table and contact you regarding the preparation or service of your order.
            </p>
            <p className="mt-2">
              If, and only if, you explicitly tick the optional marketing checkbox during checkout, we may use your mobile number to send occasional offers and cafe updates over WhatsApp. Marketing is strictly optional; you can order without consenting to marketing.
            </p>
          </section>

          {/* 4. Who sees your data */}
          <section aria-labelledby="heading-4">
            <h2 id="heading-4" className="text-lg font-semibold text-cafe-accent mb-2">
              4. Who sees your data
            </h2>
            <p>
              Your data is accessed by authorised cafe staff only as needed to fulfill your order. On the kitchen screen, staff see only your first name and table number; phone numbers are hidden from kitchen staff.
            </p>
            <p className="mt-2">
              Our technical infrastructure partners who process data on our behalf are:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Supabase:</strong> database and backend hosting.</li>
              <li><strong>[[CLIENT_TO_PROVIDE: hosting provider]]:</strong> website hosting.</li>
            </ul>
            <p className="mt-2 font-medium">
              We do not sell, rent, or trade your personal data to any third party.
            </p>
          </section>

          {/* 5. Where data is stored */}
          <section aria-labelledby="heading-5">
            <h2 id="heading-5" className="text-lg font-semibold text-cafe-accent mb-2">
              5. Where your data is stored
            </h2>
            <p>
              Your data is stored in secure database servers located in [[CLIENT_TO_PROVIDE: region as configured, e.g. Mumbai, India (ap-south-1)]].
            </p>
          </section>

          {/* 6. How long we keep it (Retention) */}
          <section aria-labelledby="heading-6">
            <h2 id="heading-6" className="text-lg font-semibold text-cafe-accent mb-2">
              6. Data retention schedule
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Orders:</strong> Retained for 12 months for accounting reconciliation, after which they are anonymised.</li>
              <li><strong>Customer Profiles:</strong> Retained until you withdraw consent or request erasure, or for 24 months from your last order, after which personal fields are permanently cleared.</li>
              <li><strong>Consent Logs:</strong> Retained for the lifetime of the customer record plus 3 years as legal proof of consent under Indian law.</li>
            </ul>
          </section>

          {/* 7. Your rights */}
          <section aria-labelledby="heading-7">
            <h2 id="heading-7" className="text-lg font-semibold text-cafe-accent mb-2">
              7. Your rights under the DPDP Act
            </h2>
            <p>
              You have the right to access a summary of your personal data, request correction of inaccurate data, withdraw marketing consent, request erasure of your details, and nominate another individual to exercise these rights in the event of incapacity.
            </p>
            <p className="mt-2">
              You can exercise any of these rights using the interactive form below or by contacting our Grievance Officer.
            </p>
          </section>

          {/* Interactive Privacy Request Form */}
          <div className="my-6 p-6 border border-cafe-border bg-cafe-muted rounded">
            <h3 className="text-base font-semibold text-cafe-text mb-2">
              Submit a Data Request
            </h3>
            <p className="text-xs text-cafe-textMuted mb-4">
              Use this form to request access, correction, erasure, or withdrawal of consent.
            </p>

            {formSubmitted ? (
              <div className="p-4 bg-cafe-successBg border border-cafe-success text-cafe-success text-xs rounded flex items-start gap-2">
                <Icons.Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Request received.</strong> Our Grievance Officer will review and respond within 48 hours, and complete the resolution within 30 days.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-cafe-dangerBg border border-cafe-danger text-cafe-danger text-xs rounded">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="req-phone" className="block text-xs font-medium text-cafe-text mb-1">
                    Your Mobile Number or Email <span className="text-cafe-danger">*</span>
                  </label>
                  <input
                    id="req-phone"
                    type="text"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder="Enter the number used during ordering"
                    className="w-full px-3 py-2 text-sm bg-cafe-surface border border-cafe-border rounded focus-visible:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="req-type" className="block text-xs font-medium text-cafe-text mb-1">
                    Request Type
                  </label>
                  <select
                    id="req-type"
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as PrivacyRequestType)}
                    className="w-full px-3 py-2 text-sm bg-cafe-surface border border-cafe-border rounded focus-visible:outline-none"
                  >
                    <option value="access">Access my personal data</option>
                    <option value="withdraw_consent">Withdraw WhatsApp marketing consent</option>
                    <option value="erasure">Erase my customer record</option>
                    <option value="correction">Correct inaccurate details</option>
                    <option value="other">Other privacy question</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="req-message" className="block text-xs font-medium text-cafe-text mb-1">
                    Details of Request <span className="text-cafe-danger">*</span>
                  </label>
                  <textarea
                    id="req-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please specify any additional details..."
                    className="w-full px-3 py-2 text-sm bg-cafe-surface border border-cafe-border rounded focus-visible:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="touch-target px-4 py-2 bg-cafe-accent text-white text-xs font-medium rounded hover:bg-cafe-accentHover disabled:opacity-50 transition-colors duration-150"
                >
                  {loading ? 'Submitting...' : 'Submit Privacy Request'}
                </button>
              </form>
            )}
          </div>

          {/* 8. Children */}
          <section aria-labelledby="heading-8">
            <h2 id="heading-8" className="text-lg font-semibold text-cafe-accent mb-2">
              8. Children
            </h2>
            <p>
              Our WhatsApp promotional messages are strictly for individuals aged 18 and older. We do not knowingly target marketing communications to minors.
            </p>
          </section>

          {/* 9. Security */}
          <section aria-labelledby="heading-9">
            <h2 id="heading-9" className="text-lg font-semibold text-cafe-accent mb-2">
              9. Security measures
            </h2>
            <p>
              We protect your data using Row Level Security in Postgres, encrypted HTTPS transport, automated backups, and restricted staff roles. We do not store credit card numbers or banking credentials.
            </p>
          </section>

          {/* 10. Grievance Officer */}
          <section aria-labelledby="heading-10">
            <h2 id="heading-10" className="text-lg font-semibold text-cafe-accent mb-2">
              10. Grievance redressal mechanism
            </h2>
            <p>
              If you have any grievance regarding the processing of your personal data, you may contact our designated Grievance Officer:
            </p>
            <div className="mt-2 pl-4 border-l-2 border-cafe-accent text-xs space-y-1">
              <p><strong>Name:</strong> [[CLIENT_TO_PROVIDE: grievance contact person name]]</p>
              <p><strong>Email:</strong> [[CLIENT_TO_PROVIDE: grievance email]]</p>
              <p><strong>Phone:</strong> [[CLIENT_TO_PROVIDE: grievance phone]]</p>
            </div>
            <p className="mt-2 text-xs text-cafe-textMuted">
              All grievances are acknowledged within 48 hours and resolved within 30 days from receipt.
            </p>
          </section>

          {/* 11. Cookies */}
          <section aria-labelledby="heading-11">
            <h2 id="heading-11" className="text-lg font-semibold text-cafe-accent mb-2">
              11. Cookies and tracking
            </h2>
            <p>
              We use strictly necessary browser storage only (for table cart and staff authentication). We do not use advertising or third-party tracking cookies. Please review our full{' '}
              <Link to="/cookies" className="text-cafe-accent underline font-medium">
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          {/* 12. Changes */}
          <section aria-labelledby="heading-12">
            <h2 id="heading-12" className="text-lg font-semibold text-cafe-accent mb-2">
              12. Changes to this policy
            </h2>
            <p>
              Any updates to this policy will be posted on this page with an updated version number and date. If changes are material, we will post a notice on our website homepage.
            </p>
          </section>

          {/* 13. Data Protection Board */}
          <section aria-labelledby="heading-13">
            <h2 id="heading-13" className="text-lg font-semibold text-cafe-accent mb-2">
              13. Right to complain to the Data Protection Board of India
            </h2>
            <p>
              If you are not satisfied with the resolution provided by our Grievance Officer, you have the right to register a complaint with the Data Protection Board of India once operational under the DPDP Act.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
