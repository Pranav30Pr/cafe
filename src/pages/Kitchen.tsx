import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { OrderWithDetails, OrderStatus, StaffProfile } from '../types';
import { formatMinutesAgo } from '../utils/formatters';
import { soundManager } from '../utils/audio';
import { Icons } from '../components/SvgIcon';
import { StaffLoginModal } from '../components/StaffLoginModal';

export const Kitchen: React.FC = () => {
  const [profile, setProfile] = useState<StaffProfile | null>(api.getCurrentStaff());
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [filter, setFilter] = useState<'active' | 'served' | 'all'>('active');
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const prevOrderCountRef = useRef<number>(0);

  useEffect(() => {
    document.title = 'Kitchen Orders | Artisan Roast Cafe';
  }, []);

  const loadOrders = () => {
    api.getKitchenOrders().then((allOrders) => {
      // Check if new order arrived to trigger audio & visual alert
      const currentNewCount = allOrders.filter((o) => o.status === 'new').length;
      if (prevOrderCountRef.current > 0 && currentNewCount > prevOrderCountRef.current) {
        soundManager.playOrderAlert();
        setHasNewAlert(true);
        setTimeout(() => setHasNewAlert(false), 5000);
      }
      prevOrderCountRef.current = currentNewCount;
      setOrders(allOrders);
    });
  };

  useEffect(() => {
    if (!profile) return;
    loadOrders();

    const unsubscribe = api.subscribeToOrders(() => {
      loadOrders();
    });

    const timer = setInterval(() => {
      // Refresh time ago calculations
      setOrders((prev) => [...prev]);
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [profile]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <StaffLoginModal
          roleRequired="kitchen"
          onLoginSuccess={(prof) => setProfile(prof)}
        />
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return ['new', 'accepted', 'preparing', 'ready'].includes(o.status);
    if (filter === 'served') return o.status === 'served';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Top Bar with tablet & phone responsiveness */}
      <div className="border border-cafe-border bg-cafe-surface p-4 rounded mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-cafe-accent tracking-tight">
              Kitchen Orders
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-cafe-muted text-cafe-accent border border-cafe-border rounded">
              Logged in: {profile.email} ({profile.role})
            </span>
          </div>
          <p className="text-xs text-cafe-textMuted mt-0.5">
            Live orders feed. Touch buttons to advance order workflow.
          </p>
        </div>

        {/* Action Controls: Sound Mute & Logout */}
        <div className="flex items-center gap-2">
          {/* Section 5.3: Sound has a clearly labelled "Mute sound" toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            aria-pressed={isMuted}
            className={`touch-target px-3.5 py-1.5 rounded text-xs font-medium border flex items-center gap-1.5 transition-colors duration-150 ${
              isMuted
                ? 'bg-cafe-muted text-cafe-textMuted border-cafe-border'
                : 'bg-cafe-surface text-cafe-accent border-cafe-accent'
            }`}
          >
            {isMuted ? <Icons.VolumeX className="w-4 h-4" /> : <Icons.Volume2 className="w-4 h-4" />}
            <span>{isMuted ? 'Sound Muted' : 'Mute Sound'}</span>
          </button>

          {profile.role === 'owner' && (
            <a
              href="/admin"
              className="touch-target px-3 py-1.5 bg-cafe-surface border border-cafe-border text-cafe-text hover:bg-cafe-muted text-xs font-medium rounded transition-colors duration-150 flex items-center"
            >
              Owner Admin
            </a>
          )}

          <button
            type="button"
            onClick={() => {
              api.logoutStaff();
              setProfile(null);
            }}
            className="touch-target px-3 py-1.5 text-xs text-cafe-danger hover:bg-cafe-dangerBg border border-cafe-border rounded transition-colors duration-150"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Visual Order Alert Banner (Section 5.3: Sound must never be the only signal) */}
      {hasNewAlert && (
        <div
          role="alert"
          className="mb-6 p-4 bg-cafe-accent text-white font-semibold text-sm rounded flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Icons.AlertCircle className="w-5 h-5" />
            <span>New order received. Check the order queue below.</span>
          </div>
          <button
            type="button"
            onClick={() => setHasNewAlert(false)}
            className="touch-target text-xs text-white/80 hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* View Filter Tabs */}
      <div className="flex items-center gap-2 mb-6" role="tablist" aria-label="Order filters">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'active'}
          onClick={() => setFilter('active')}
          className={`touch-target px-4 py-2 text-xs font-semibold rounded border transition-colors duration-150 ${
            filter === 'active'
              ? 'bg-cafe-accent text-white border-cafe-accent'
              : 'bg-cafe-surface text-cafe-text border-cafe-border hover:bg-cafe-muted'
          }`}
        >
          Active Orders ({orders.filter((o) => ['new', 'accepted', 'preparing', 'ready'].includes(o.status)).length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={filter === 'served'}
          onClick={() => setFilter('served')}
          className={`touch-target px-4 py-2 text-xs font-semibold rounded border transition-colors duration-150 ${
            filter === 'served'
              ? 'bg-cafe-accent text-white border-cafe-accent'
              : 'bg-cafe-surface text-cafe-text border-cafe-border hover:bg-cafe-muted'
          }`}
        >
          Served ({orders.filter((o) => o.status === 'served').length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          onClick={() => setFilter('all')}
          className={`touch-target px-4 py-2 text-xs font-semibold rounded border transition-colors duration-150 ${
            filter === 'all'
              ? 'bg-cafe-accent text-white border-cafe-accent'
              : 'bg-cafe-surface text-cafe-text border-cafe-border hover:bg-cafe-muted'
          }`}
        >
          All Orders ({orders.length})
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="border border-cafe-border bg-cafe-surface p-12 text-center rounded text-sm text-cafe-textMuted">
          No orders found in this view.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isNew = order.status === 'new';

            return (
              <article
                key={order.id}
                className={`border bg-cafe-surface rounded p-5 flex flex-col justify-between ${
                  isNew
                    ? 'border-cafe-accent ring-2 ring-cafe-accent ring-offset-2'
                    : 'border-cafe-border'
                }`}
              >
                <div>
                  {/* Card Header: Table label, order ref, time, customer first name */}
                  <div className="flex items-start justify-between pb-3 border-b border-cafe-border mb-3">
                    <div>
                      <span className="text-xl font-bold text-cafe-accent tracking-tight block">
                        {order.table_label}
                      </span>
                      <span className="text-xs font-mono font-medium text-cafe-textMuted">
                        Ref: {order.short_ref}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded uppercase tracking-wider ${
                          order.status === 'new'
                            ? 'bg-cafe-accent text-white'
                            : order.status === 'preparing'
                            ? 'bg-cafe-warningBg text-cafe-warning border border-cafe-warning'
                            : order.status === 'ready'
                            ? 'bg-cafe-successBg text-cafe-success border border-cafe-success'
                            : order.status === 'cancelled'
                            ? 'bg-cafe-dangerBg text-cafe-danger border border-cafe-danger'
                            : 'bg-cafe-muted text-cafe-text border border-cafe-border'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-[11px] text-cafe-textMuted block mt-1">
                        {formatMinutesAgo(order.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Customer first name only (Section 5.3: NO PHONE NUMBER SHOWN TO KITCHEN) */}
                  <div className="text-xs text-cafe-text mb-3">
                    Customer: <strong>{order.customer_first_name}</strong>
                  </div>

                  {/* Items list with quantities */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm py-1 border-b border-cafe-border/50 last:border-0"
                      >
                        <span className="font-semibold text-cafe-text">
                          {item.item_name}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-bold bg-cafe-muted border border-cafe-border rounded text-cafe-accent">
                          × {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Note / Special Instructions */}
                  {order.note && (
                    <div className="p-2.5 bg-cafe-warningBg border border-cafe-warning text-cafe-text text-xs rounded mb-4">
                      <strong>Special note:</strong> {order.note}
                    </div>
                  )}
                </div>

                {/* Section 5.3 & 5.5: Clear workflow action buttons */}
                <div className="pt-3 border-t border-cafe-border space-y-2">
                  {order.status === 'new' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(order.id, 'accepted')}
                      className="touch-target w-full py-2 bg-cafe-accent text-white text-xs font-semibold rounded hover:bg-cafe-accentHover transition-colors duration-150"
                    >
                      Accept order for {order.table_label}
                    </button>
                  )}

                  {order.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                      className="touch-target w-full py-2 bg-cafe-accent text-white text-xs font-semibold rounded hover:bg-cafe-accentHover transition-colors duration-150"
                    >
                      Start preparing for {order.table_label}
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(order.id, 'ready')}
                      className="touch-target w-full py-2 bg-cafe-success text-white text-xs font-semibold rounded hover:opacity-90 transition-colors duration-150"
                    >
                      Mark ready for {order.table_label}
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(order.id, 'served')}
                      className="touch-target w-full py-2 bg-cafe-muted border border-cafe-border text-cafe-text text-xs font-semibold rounded hover:bg-cafe-border transition-colors duration-150"
                    >
                      Mark served for {order.table_label}
                    </button>
                  )}

                  {/* Cancel button: allowed from new, accepted, preparing */}
                  {['new', 'accepted', 'preparing'].includes(order.status) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to cancel the order for ${order.table_label}?`)) {
                          handleStatusChange(order.id, 'cancelled');
                        }
                      }}
                      className="touch-target w-full py-1.5 text-xs text-cafe-danger hover:bg-cafe-dangerBg border border-cafe-danger/30 rounded transition-colors duration-150"
                    >
                      Cancel order for {order.table_label}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
