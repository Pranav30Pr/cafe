import React, { useState, useEffect, useId } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useCart } from '../../state/CartContext';
import { formatRupees, validateIndianMobile } from '../../utils/formatters';
import { Stepper } from '../../components/Stepper';
import { BottomSheet } from '../../components/BottomSheet';
import { Icons } from '../../components/Icon';
import { api } from '../../services/api';
import { CONSENT_TEXTS } from '../../constants/consent';
import { Cafe } from '../../types';

const SESSION_DETAILS_KEY = 'cafe_customer_details';
const ORDER_HISTORY_KEY = 'cafe_visit_orders';

interface TableAppContextType {
  cafe: Cafe;
  token: string;
}

export const OrderTab: React.FC = () => {
  const navigate = useNavigate();
  const { cafe, token } = useOutletContext<TableAppContextType>();
  const { cartItems, totalItems, instructions, setInstructions, addItem, removeItem, clearCart } = useCart();

  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [instructionsExpanded, setInstructionsExpanded] = useState(Boolean(instructions));

  // Customer form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false); // strictly unticked by default
  const [isEditingStoredDetails, setIsEditingStoredDetails] = useState(false);
  const [hasStoredDetails, setHasStoredDetails] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameErrorId = useId();
  const phoneErrorId = useId();

  // Load stored details from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_DETAILS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name && parsed.phone) {
          setName(parsed.name);
          setPhone(parsed.phone);
          setHasStoredDetails(true);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const totalPaise = cartItems.reduce(
    (sum, { item, quantity }) => sum + item.price_paise * quantity,
    0
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('Enter your name.');
      return;
    }

    if (!cleanPhone || !validateIndianMobile(cleanPhone)) {
      setError('Enter a 10 digit mobile number.');
      return;
    }

    try {
      setSubmitting(true);

      // Save customer name and phone in sessionStorage for repeat visits
      try {
        sessionStorage.setItem(
          SESSION_DETAILS_KEY,
          JSON.stringify({ name: cleanName, phone: cleanPhone })
        );
      } catch {
        // Ignore
      }

      // Generate client_request_id for idempotency (UI_SPEC Section 7)
      const clientRequestId = crypto.randomUUID();

      const itemsPayload = cartItems.map(({ item, quantity }) => ({
        menu_item_id: item.id,
        quantity,
      }));

      const res = await api.createOrder({
        token,
        items: itemsPayload,
        name: cleanName,
        phone: cleanPhone,
        note: instructions.trim() || undefined,
        marketing_consent: marketingConsent,
        consent_version: CONSENT_TEXTS.version,
      });

      // Save order ID to visit orders in sessionStorage
      try {
        const raw = sessionStorage.getItem(ORDER_HISTORY_KEY);
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(res.order_id)) {
          list.unshift(res.order_id);
          sessionStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(list));
        }
      } catch {
        // Ignore
      }

      // Clear the cart on successful order placement (UI_SPEC Section 7)
      clearCart();
      setDetailsSheetOpen(false);

      // Navigate to live order status screen
      navigate(`/t/${token}/status/${res.order_id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'We could not place your order. Please try again or call a staff member.';
      setError(msg);
      setSubmitting(false);
    }
  };

  if (totalItems === 0) {
    return (
      <div className="py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-[16px] glass-strong border border-glass-border flex items-center justify-center mx-auto text-ink-muted">
          <Icons.OrderTab className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-ink">Your order is empty.</h2>
        <p className="text-xs text-ink-muted max-w-[280px] mx-auto">
          Explore our menu and add items to your table order.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/t/${token}`)}
          className="h-12 px-6 rounded-[14px] bg-accent text-accent-ink text-sm font-semibold hover:opacity-90 active:scale-95 transition-transform duration-100"
        >
          Browse menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 pt-2">
      <h1 className="text-xl font-bold text-ink px-1 tracking-tight">Your order</h1>

      {/* Review List */}
      <div className="space-y-2.5">
        {cartItems.map(({ item, quantity }) => (
          <div
            key={item.id}
            className="p-3.5 glass-strong rounded-[16px] border border-glass-border flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-ink truncate">{item.name}</h3>
              <p className="text-xs text-ink-muted tabular-nums mt-0.5">
                {formatRupees(item.price_paise)} each
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Stepper
                quantity={quantity}
                onIncrement={() => addItem(item)}
                onDecrement={() => removeItem(item)}
                itemName={item.name}
              />
              <span className="w-16 text-right font-bold text-sm text-accent tabular-nums">
                {formatRupees(item.price_paise * quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Kitchen Instructions Collapsible Row */}
      <div className="glass-strong rounded-[16px] border border-glass-border overflow-hidden">
        <button
          type="button"
          onClick={() => setInstructionsExpanded(!instructionsExpanded)}
          className="w-full p-4 flex items-center justify-between text-xs font-semibold text-ink text-left"
          aria-expanded={instructionsExpanded}
        >
          <span>Special instructions for kitchen (optional)</span>
          <Icons.ChevronDown
            className={`w-4 h-4 text-ink-muted transition-transform duration-150 ${
              instructionsExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        {instructionsExpanded && (
          <div className="p-4 pt-0 border-t border-glass-border space-y-1">
            <textarea
              rows={2}
              maxLength={200}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Less sugar, extra hot"
              className="w-full p-3 rounded-[12px] glass border border-glass-border text-xs text-ink placeholder:text-ink-muted/70 focus-visible:outline-none"
            />
            <div className="text-right text-[10px] text-ink-muted">
              {instructions.length}/200
            </div>
          </div>
        )}
      </div>

      {/* Payment Note (UI_SPEC Section 5.2) */}
      <div className="p-3.5 glass-strong rounded-[14px] border border-glass-border text-center text-xs text-ink-muted">
        Pay at the counter after your order.
      </div>

      {/* Order Total */}
      <div className="p-4 glass-strong rounded-[16px] border border-glass-border flex items-center justify-between">
        <div>
          <span className="text-xs text-ink-muted block">Total (payable at counter)</span>
          <span className="text-[11px] text-ink-muted">Taxes included</span>
        </div>
        <span className="text-2xl font-bold tabular-nums text-accent">
          {formatRupees(totalPaise)}
        </span>
      </div>

      {/* Fixed Primary Button Above TabBar */}
      <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom)+8px)] left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
        <button
          type="button"
          onClick={() => setDetailsSheetOpen(true)}
          className="w-full max-w-[448px] pointer-events-auto h-[52px] rounded-[14px] bg-accent text-accent-ink text-base font-semibold shadow-lg hover:opacity-95 active:scale-[0.98] transition-all duration-100 flex items-center justify-center gap-2"
        >
          <span>Continue</span>
          <Icons.ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Details Sheet ("Almost done") */}
      <BottomSheet
        isOpen={detailsSheetOpen}
        onClose={() => setDetailsSheetOpen(false)}
        title="Almost done"
      >
        <form onSubmit={handlePlaceOrder} className="space-y-4 text-ink">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-[12px] bg-danger/10 border border-danger/30 text-danger text-xs font-medium"
            >
              {error}
            </div>
          )}

          {/* Stored Customer Summary (UI_SPEC Section 5.2: Repeat order shortcut) */}
          {hasStoredDetails && !isEditingStoredDetails ? (
            <div className="p-3.5 rounded-[12px] glass border border-glass-border flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-ink">{name}</div>
                <div className="text-xs text-ink-muted font-mono">+91 {phone}</div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingStoredDetails(true)}
                className="text-xs font-semibold text-accent underline hover:opacity-80"
              >
                Edit
              </button>
            </div>
          ) : (
            <>
              {/* Field 1: Name */}
              <div>
                <label htmlFor="customer-name" className="block text-xs font-semibold text-ink mb-1">
                  Name
                </label>
                <input
                  id="customer-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full h-[52px] px-3.5 rounded-[12px] glass border border-ink-muted/40 text-ink text-base focus-visible:outline-none"
                  required
                />
              </div>

              {/* Field 2: Mobile Number */}
              <div>
                <label htmlFor="customer-phone" className="block text-xs font-semibold text-ink mb-1">
                  Mobile number
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-ink-muted text-base font-semibold select-none">
                    +91
                  </span>
                  <input
                    id="customer-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full h-[52px] pl-14 pr-3.5 rounded-[12px] glass border border-ink-muted/40 text-ink text-base tabular-nums focus-visible:outline-none"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Notice line with link to Privacy Policy */}
          <p className="text-xs text-ink-muted leading-relaxed">
            We use your name and number only to contact you about this order.{' '}
            <Link to="/privacy" target="_blank" className="text-accent underline font-medium">
              Privacy Policy
            </Link>
          </p>

          {/* Marketing Consent Row (UI_SPEC Section 5.2 & Section 6.7) */}
          <label className="min-h-[44px] p-3 rounded-[12px] glass border border-glass-border flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded-[4px] border-ink-muted text-accent focus-visible:ring-2 focus-visible:ring-accent"
            />
            <span className="text-xs text-ink leading-relaxed">
              {CONSENT_TEXTS.marketingCheckbox(cafe.name)}
            </span>
          </label>

          {/* Place Order Primary Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-[52px] rounded-[14px] bg-accent text-accent-ink text-base font-semibold shadow-lg hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all duration-100 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin w-5 h-5 text-accent-ink"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Placing order</span>
              </>
            ) : (
              <span>Place order</span>
            )}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
};
