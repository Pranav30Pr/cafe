import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useCart } from '../../state/CartContext';
import { formatRupees, validateIndianMobile } from '../../utils/formatters';
import { Stepper } from '../../components/Stepper';
import { BottomSheet } from '../../components/BottomSheet';
import { Icons } from '../../components/Icon';
import { api } from '../../services/api';
import { CONSENT_TEXTS } from '../../constants/consent';
import { Cafe, LoyaltyReward } from '../../types';

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

  // Phase 4 Loyalty state
  const [loyaltyData, setLoyaltyData] = useState<{ points: number; availableRewards: LoyaltyReward[] } | null>(null);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch customer loyalty data when phone number is complete
  useEffect(() => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10) {
      api.getCustomerLoyalty(clean).then((data) => {
        setLoyaltyData({ points: data.points, availableRewards: data.availableRewards });
      });
    } else {
      setLoyaltyData(null);
      setSelectedRewardId(null);
    }
  }, [phone]);

  const rawTotalPaise = cartItems.reduce(
    (sum, { item, quantity }) => sum + item.price_paise * quantity,
    0
  );

  const selectedReward = loyaltyData?.availableRewards.find((r) => r.id === selectedRewardId);
  const discountPaise = selectedReward ? Math.min(rawTotalPaise, selectedReward.discount_paise) : 0;
  const totalPaise = Math.max(0, rawTotalPaise - discountPaise);
  const pointsToEarn = Math.max(1, Math.floor(totalPaise / 1000));


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
        redeem_reward_id: selectedRewardId || undefined,
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
        <div className="w-16 h-16 rounded-[6px] glass-strong border border-glass-border flex items-center justify-center mx-auto text-ink-muted">
          <Icons.OrderTab className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-ink">Your order is empty.</h2>
        <p className="text-xs text-ink-muted max-w-[280px] mx-auto">
          Explore our menu and add items to your table order.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/t/${token}`)}
          className="h-11 px-6 rounded-[6px] bg-accent text-accent-ink text-sm font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-transform duration-100"
        >
          Browse menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 pt-2">
      <h1 className="text-xl font-bold text-ink px-1 tracking-tight">Your Fuel Order</h1>

      {/* Review List */}
      <div className="space-y-2.5">
        {cartItems.map(({ item, quantity }) => (
          <div
            key={item.id}
            className="p-3.5 glass-strong rounded-[6px] border border-glass-border flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-ink truncate">{item.name}</h3>
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
      <div className="glass-strong rounded-[6px] border border-glass-border overflow-hidden">
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
              className="w-full p-3 rounded-[6px] glass border border-glass-border text-xs text-ink placeholder:text-ink-muted/70 focus-visible:outline-none"
            />
            <div className="text-right text-[10px] text-ink-muted">
              {instructions.length}/200
            </div>
          </div>
        )}
      </div>

      {/* Green Fuel Points Preview Card */}
      <div className="p-3.5 glass-strong rounded-[6px] border border-glass-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[4px] bg-accent/15 text-accent flex items-center justify-center font-bold">
            <Icons.Bolt className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-ink block">Green Fuel Points</span>
            <span className="text-[11px] text-ink-muted">Earn clean rewards on every healthy snack and bowl</span>
          </div>
        </div>
        <span className="font-bold text-accent text-sm tabular-nums">
          +{pointsToEarn} pts
        </span>
      </div>

      {discountPaise > 0 && (
        <div className="p-3 rounded-[6px] bg-accent/10 border border-accent/30 flex items-center justify-between text-xs text-ink font-semibold">
          <span>Loyalty Reward Applied</span>
          <span className="text-accent tabular-nums">-{formatRupees(discountPaise)}</span>
        </div>
      )}

      {/* Payment Note (UI_SPEC Section 5.2) */}
      <div className="p-3.5 glass-strong rounded-[6px] border border-glass-border text-center text-xs text-ink-muted">
        Pay at the counter after your order.
      </div>

      {/* Order Total */}
      <div className="p-4 glass-strong rounded-[6px] border border-glass-border flex items-center justify-between">
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
          className="w-full max-w-[448px] pointer-events-auto h-[50px] rounded-[6px] bg-accent text-accent-ink text-sm font-bold uppercase tracking-wider shadow-lg hover:opacity-95 active:scale-[0.98] transition-all duration-100 flex items-center justify-center gap-2"
        >
          <span>Continue</span>
          <Icons.ArrowRight className="w-4 h-4" />
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
              className="p-3 rounded-[6px] bg-danger/10 border border-danger/30 text-danger text-xs font-medium"
            >
              {error}
            </div>
          )}

          {/* Stored Customer Summary (UI_SPEC Section 5.2: Repeat order shortcut) */}
          {hasStoredDetails && !isEditingStoredDetails ? (
            <div className="p-3.5 rounded-[6px] glass border border-glass-border flex items-center justify-between">
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
                  className="w-full h-11 px-3.5 rounded-[6px] bg-white border border-[#CBD5E1] text-[#0F172A] text-sm focus:border-[#15803D] focus-visible:outline-none"
                  required
                />
              </div>

              {/* Field 2: Mobile Number */}
              <div>
                <label htmlFor="customer-phone" className="block text-xs font-semibold text-ink mb-1">
                  Mobile number
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-sm font-semibold select-none">
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
                    className="w-full h-11 pl-12 pr-3.5 rounded-[6px] bg-white border border-[#CBD5E1] text-[#0F172A] text-sm tabular-nums focus:border-[#15803D] focus-visible:outline-none"
                    required
                  />
                </div>
              </div>

            </>
          )}

          {/* Loyalty Points & Reward Redemption (Phase 4) */}
          {loyaltyData && loyaltyData.points > 0 && (
            <div className="p-3.5 rounded-[6px] glass-strong border border-accent/40 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink flex items-center gap-1.5">
                  <Icons.Bolt className="w-3.5 h-3.5 text-accent" />
                  <span>Green Fuel Points</span>
                  <span className="px-2 py-0.5 rounded-[4px] bg-accent text-accent-ink text-[10px] font-bold">
                    {loyaltyData.points} pts
                  </span>
                </span>
                <span className="text-[11px] text-accent font-semibold">
                  {loyaltyData.availableRewards.length > 0 ? 'Reward Available' : 'Keep Fueling'}
                </span>
              </div>

              {loyaltyData.availableRewards.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-ink-muted block font-medium">
                    Tap to redeem a reward:
                  </span>
                  {loyaltyData.availableRewards.map((reward) => {
                    const isSelected = selectedRewardId === reward.id;
                    return (
                      <button
                        key={reward.id}
                        type="button"
                        onClick={() => setSelectedRewardId(isSelected ? null : reward.id)}
                        className={`w-full p-2.5 rounded-[6px] border text-left flex items-center justify-between text-xs transition-colors duration-150 ${
                          isSelected
                            ? 'bg-accent/15 border-accent text-ink font-semibold'
                            : 'glass border-glass-border text-ink-muted hover:text-ink'
                        }`}
                      >
                        <div className="pr-2">
                          <span className="block font-semibold text-ink">{reward.title}</span>
                          <span className="text-[10px] text-ink-muted leading-tight block">
                            {reward.description}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-accent tabular-nums flex-shrink-0">
                          {isSelected ? 'Applied ✓' : `-${reward.points_cost} pts`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-ink-muted">
                  Earn {20 - (loyaltyData.points % 20)} more points to unlock your first free snack reward!
                </p>
              )}
            </div>
          )}

          {/* Notice line with link to Privacy Policy */}
          <p className="text-xs text-ink-muted leading-relaxed">
            We use your name and number only to contact you about this order.{' '}
            <Link to="/privacy" target="_blank" className="text-accent underline font-medium">
              Privacy Policy
            </Link>
          </p>

          {/* Marketing Consent Row (UI_SPEC Section 5.2 & Section 6.7) */}
          <label className="min-h-[44px] p-3 rounded-[6px] glass border border-glass-border flex items-start gap-3 cursor-pointer select-none">
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
            className="w-full h-11 rounded-[6px] bg-accent text-accent-ink text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all duration-100 flex items-center justify-center gap-2"
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
