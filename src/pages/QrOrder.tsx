import React, { useEffect, useState, useId } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Cafe, CafeTable, MenuCategory, MenuItem } from '../types';
import { formatRupees, validateIndianMobile } from '../utils/formatters';
import { DietBadge } from '../components/DietBadge';
import { Icons } from '../components/SvgIcon';
import { CONSENT_TEXTS } from '../constants/consent';

const SESSION_DETAILS_KEY = 'cafe_customer_details';
const RATE_LIMIT_KEY = 'cafe_order_timestamps';
const MAX_ORDERS_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export const QrOrder: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [table, setTable] = useState<CafeTable | null>(null);
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Cart quantities: Map of menuItem.id -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false); // MUST BE UNTICKED BY DEFAULT

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nameErrorId = useId();
  const phoneErrorId = useId();
  const noteErrorId = useId();

  // Load table & menu
  useEffect(() => {
    if (!token) return;

    Promise.all([
      api.getTableByToken(token),
      api.getCafe(),
      api.getMenu(),
    ]).then(([tableData, cafeData, menuData]) => {
      setTable(tableData);
      setCafe(cafeData);
      setCategories(menuData.categories);
      setMenuItems(menuData.items);
      setLoading(false);

      if (tableData) {
        document.title = `Order for ${tableData.label} | ${cafeData.name}`;
      } else {
        document.title = 'Invalid Table Link | Artisan Roast Cafe';
      }
    });

    // Check sessionStorage for previous customer details
    try {
      const stored = sessionStorage.getItem(SESSION_DETAILS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
      }
    } catch {
      // Ignore storage errors
    }
  }, [token]);

  // Quantity controls
  const handleAdd = (item: MenuItem) => {
    setCart((prev) => {
      const current = prev[item.id] || 0;
      if (current >= 20) return prev; // max 20 per item per spec
      return { ...prev, [item.id]: current + 1 };
    });
  };

  const handleRemove = (item: MenuItem) => {
    setCart((prev) => {
      const current = prev[item.id] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return { ...prev, [item.id]: current - 1 };
    });
  };

  const handleClearDetails = () => {
    setName('');
    setPhone('');
    try {
      sessionStorage.removeItem(SESSION_DETAILS_KEY);
    } catch {
      // Ignore
    }
  };

  // Cart summary calculations
  const cartEntries = Object.entries(cart);
  const totalItemCount = cartEntries.reduce((sum, [, qty]) => sum + qty, 0);

  // Approximate total for customer UI (server recomputes authoritative total)
  const estimatedTotalPaise = cartEntries.reduce((sum, [itemId, qty]) => {
    const item = menuItems.find((mi) => mi.id === itemId);
    return sum + (item ? item.price_paise * qty : 0);
  }, 0);

  // Rate limit check
  const checkRateLimit = (): boolean => {
    try {
      const now = Date.now();
      const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
      const timestamps: number[] = raw ? JSON.parse(raw) : [];
      const recent = timestamps.filter((ts) => now - ts < WINDOW_MS);

      if (recent.length >= MAX_ORDERS_PER_WINDOW) {
        return false;
      }

      recent.push(now);
      sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
      return true;
    } catch {
      return true;
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const newErrors: Record<string, string> = {};

    if (cartEntries.length === 0) {
      setSubmitError('Please add at least one item to your order.');
      return;
    }

    if (cartEntries.length > 30) {
      setSubmitError('An order cannot contain more than 30 unique items.');
      return;
    }

    if (!name.trim()) {
      newErrors.name = 'Please enter your name.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Please enter your 10-digit mobile number.';
    } else if (!validateIndianMobile(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
    }

    if (note.length > 200) {
      newErrors.note = 'Special instructions cannot exceed 200 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!checkRateLimit()) {
      setSubmitError('Order limit reached (maximum 5 orders per 10 minutes). Please ask staff for assistance.');
      return;
    }

    try {
      setSubmitting(true);

      // Save name and phone in sessionStorage for current visit convenience (Section 5.2)
      try {
        sessionStorage.setItem(
          SESSION_DETAILS_KEY,
          JSON.stringify({ name: name.trim(), phone: phone.trim() })
        );
      } catch {
        // Ignore
      }

      const itemsPayload = cartEntries.map(([menu_item_id, quantity]) => ({
        menu_item_id,
        quantity,
      }));

      const res = await api.createOrder({
        token: token!,
        items: itemsPayload,
        name: name.trim(),
        phone: phone.trim(),
        note: note.trim() || undefined,
        marketing_consent: marketingConsent,
        consent_version: CONSENT_TEXTS.version,
      });

      // Navigate to dedicated confirmation page
      navigate(`/order/${res.order_id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-cafe-textMuted text-sm" role="status">
        Loading table menu...
      </div>
    );
  }

  // Section 5.2: If token is unknown or inactive, show exact plain message
  if (!table) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="border border-cafe-border bg-cafe-surface p-8 rounded">
          <h1 className="text-xl font-semibold text-cafe-danger mb-3">
            Table Link Not Valid
          </h1>
          <p className="text-sm text-cafe-text leading-relaxed mb-6">
            This table link is not valid. Please ask a staff member.
          </p>
          <Link
            to="/"
            className="touch-target inline-flex items-center gap-2 px-4 py-2 bg-cafe-surface text-cafe-text border border-cafe-border text-xs font-medium rounded hover:bg-cafe-muted transition-colors duration-150"
          >
            <span>Go to Cafe Website</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Table & Cafe Banner */}
      <div className="border border-cafe-border bg-cafe-surface p-5 rounded mb-6 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-cafe-textMuted block">
            {cafe?.name}
          </span>
          <h1 className="text-2xl font-bold text-cafe-accent tracking-tight">
            {table.label}
          </h1>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-cafe-success bg-cafe-successBg border border-cafe-success rounded">
            <span className="w-2 h-2 rounded-full bg-cafe-success" aria-hidden="true" />
            <span>Ordering Active</span>
          </span>
          <p className="text-[11px] text-cafe-textMuted mt-1">Pay at counter</p>
        </div>
      </div>

      {/* Menu Categories */}
      <div className="space-y-8 mb-10">
        {categories.map((cat) => {
          const catItems = menuItems.filter((i) => i.category_id === cat.id);
          if (catItems.length === 0) return null;

          return (
            <section key={cat.id} aria-labelledby={`cat-title-${cat.id}`}>
              <h2
                id={`cat-title-${cat.id}`}
                className="text-lg font-semibold text-cafe-text pb-1.5 mb-3 border-b border-cafe-border"
              >
                {cat.name}
              </h2>

              <div className="space-y-3">
                {catItems.map((item) => {
                  const qty = cart[item.id] || 0;

                  return (
                    <article
                      key={item.id}
                      className="border border-cafe-border bg-cafe-surface p-4 rounded flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium text-cafe-text text-sm leading-tight">
                            {item.name}
                          </h3>
                          <DietBadge diet={item.diet} />
                        </div>
                        {item.description && (
                          <p className="text-xs text-cafe-textMuted line-clamp-2 mb-1.5">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-cafe-accent text-sm">
                            {formatRupees(item.price_paise)}
                          </span>
                          {item.allergen_note && (
                            <span className="text-[11px] text-cafe-textMuted italic">
                              ({item.allergen_note})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {qty > 0 ? (
                          <div className="flex items-center gap-2 bg-cafe-muted border border-cafe-border rounded p-1">
                            <button
                              type="button"
                              onClick={() => handleRemove(item)}
                              aria-label={`Remove one ${item.name}`}
                              className="touch-target w-8 h-8 rounded bg-cafe-surface border border-cafe-border text-cafe-text flex items-center justify-center hover:bg-cafe-muted transition-colors duration-150"
                            >
                              <Icons.Minus className="w-3.5 h-3.5" />
                            </button>
                            <span
                              className="w-6 text-center font-semibold text-sm text-cafe-text"
                              aria-live="polite"
                              aria-label={`${qty} of ${item.name} in cart`}
                            >
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdd(item)}
                              disabled={qty >= 20}
                              aria-label={`Add one more ${item.name}`}
                              className="touch-target w-8 h-8 rounded bg-cafe-surface border border-cafe-border text-cafe-text flex items-center justify-center hover:bg-cafe-muted disabled:opacity-40 transition-colors duration-150"
                            >
                              <Icons.Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAdd(item)}
                            aria-label={`Add ${item.name} to order`}
                            className="touch-target px-3.5 py-1.5 text-xs font-medium text-cafe-accent border border-cafe-accent hover:bg-cafe-accent hover:text-white rounded transition-colors duration-150 flex items-center gap-1"
                          >
                            <Icons.Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Order Form & Checkout Section */}
      <section aria-labelledby="order-form-heading" className="border-t-2 border-cafe-border pt-6">
        <h2 id="order-form-heading" className="text-xl font-semibold text-cafe-accent mb-4">
          Order Summary & Details
        </h2>

        {totalItemCount === 0 ? (
          <div className="p-6 border border-cafe-border bg-cafe-surface text-center rounded text-sm text-cafe-textMuted mb-6">
            Your cart is currently empty. Please choose items from the menu above.
          </div>
        ) : (
          <div className="border border-cafe-border bg-cafe-surface p-4 rounded mb-6 divide-y divide-cafe-border">
            {cartEntries.map(([itemId, qty]) => {
              const item = menuItems.find((mi) => mi.id === itemId);
              if (!item) return null;

              return (
                <div key={itemId} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-cafe-text text-sm">{item.name}</span>
                    <span className="text-cafe-textMuted ml-2">× {qty}</span>
                  </div>
                  <span className="font-medium text-cafe-accent">
                    {formatRupees(item.price_paise * qty)}
                  </span>
                </div>
              );
            })}
            <div className="pt-3 flex items-center justify-between font-semibold text-sm text-cafe-text">
              <span>Estimated Total (payable at counter):</span>
              <span className="text-cafe-accent text-base">
                {formatRupees(estimatedTotalPaise)}
              </span>
            </div>
          </div>
        )}

        {/* The Order Form */}
        <form onSubmit={handleOrderSubmit} className="space-y-4 border border-cafe-border bg-cafe-surface p-5 rounded">
          {submitError && (
            <div
              className="p-3 bg-cafe-dangerBg border border-cafe-danger text-cafe-danger text-xs rounded"
              role="alert"
            >
              {submitError}
            </div>
          )}

          {/* Name Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="customer-name" className="text-xs font-medium text-cafe-text">
                Your Name <span className="text-cafe-danger">*</span>
              </label>
              {(name || phone) && (
                <button
                  type="button"
                  onClick={handleClearDetails}
                  className="text-[11px] text-cafe-textMuted hover:text-cafe-danger underline transition-colors duration-150"
                >
                  Clear my details
                </button>
              )}
            </div>
            <input
              id="customer-name"
              type="text"
              value={name}
              autoComplete="name"
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Aarav Sharma"
              aria-describedby={errors.name ? nameErrorId : undefined}
              aria-invalid={Boolean(errors.name)}
              className={`w-full px-3 py-2 text-sm bg-cafe-surface border rounded focus-visible:outline-none ${
                errors.name ? 'border-cafe-danger' : 'border-cafe-border'
              }`}
              required
            />
            {errors.name && (
              <p id={nameErrorId} className="text-xs text-cafe-danger mt-1" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="customer-phone" className="block text-xs font-medium text-cafe-text mb-1">
              Mobile Number (10 digits) <span className="text-cafe-danger">*</span>
            </label>
            <input
              id="customer-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              placeholder="e.g. 9876543210"
              maxLength={10}
              aria-describedby={errors.phone ? phoneErrorId : undefined}
              aria-invalid={Boolean(errors.phone)}
              className={`w-full px-3 py-2 text-sm bg-cafe-surface border rounded focus-visible:outline-none ${
                errors.phone ? 'border-cafe-danger' : 'border-cafe-border'
              }`}
              required
            />
            {errors.phone && (
              <p id={phoneErrorId} className="text-xs text-cafe-danger mt-1" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Special Instructions */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="order-note" className="text-xs font-medium text-cafe-text">
                Special Instructions (optional)
              </label>
              <span className="text-[11px] text-cafe-textMuted">{note.length}/200</span>
            </div>
            <textarea
              id="order-note"
              rows={2}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Less sugar in chai, extra hot"
              aria-describedby={errors.note ? noteErrorId : undefined}
              className="w-full px-3 py-2 text-sm bg-cafe-surface border border-cafe-border rounded focus-visible:outline-none"
            />
            {errors.note && (
              <p id={noteErrorId} className="text-xs text-cafe-danger mt-1" role="alert">
                {errors.note}
              </p>
            )}
          </div>

          {/* Marketing Checkbox (Section 5.2 & Section 7.6) */}
          {/* Strictly unticked by default, optional, clear wording */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-cafe-text leading-relaxed">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-cafe-border text-cafe-accent focus-visible:ring-2 focus-visible:ring-cafe-accent focus-visible:outline-none"
              />
              <span>{CONSENT_TEXTS.marketingCheckbox(cafe?.name || 'Artisan Roast Cafe')}</span>
            </label>
          </div>

          {/* Notice directly above the submit button (Section 5.2 & Section 7.6) */}
          <div className="pt-3 border-t border-cafe-border text-xs text-cafe-textMuted">
            {CONSENT_TEXTS.orderContactNotice}{' '}
            <Link to="/privacy" target="_blank" className="text-cafe-accent underline font-medium">
              Privacy Policy
            </Link>
            .
          </div>

          {/* Submit Button (Section 5.2) */}
          <button
            type="submit"
            disabled={submitting || totalItemCount === 0}
            className="touch-target w-full py-3 bg-cafe-accent text-white font-medium text-sm rounded hover:bg-cafe-accentHover disabled:opacity-50 transition-colors duration-150 flex items-center justify-center gap-2"
          >
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </form>
      </section>
    </div>
  );
};
