import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { OrderWithDetails } from '../../types';
import { formatRupees } from '../../utils/formatters';
import { StatusTracker } from '../../components/StatusTracker';
import { Icons } from '../../components/Icon';
import { useCart } from '../../state/CartContext';

export const OrderStatusScreen: React.FC = () => {
  const { orderId, token } = useParams<{ orderId: string; token: string }>();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemsExpanded, setItemsExpanded] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const data = await api.getOrderStatus(orderId);
        setOrder(data);
        setIsReconnecting(false);
      } catch {
        setIsReconnecting(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Subscribe to realtime order updates
    const unsubscribe = api.subscribeToOrders(() => {
      fetchOrder();
    });

    // Fallback polling every 10 seconds per UI_SPEC Section 5.3
    const interval = setInterval(fetchOrder, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-ink-muted">
        Loading order status...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 px-4 text-center space-y-4">
        <h2 className="text-lg font-bold text-ink">Order Not Found</h2>
        <p className="text-xs text-ink-muted">
          Could not locate an active order for this reference.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/t/${token}`)}
          className="h-11 px-5 rounded-[6px] bg-accent text-accent-ink text-xs font-bold uppercase tracking-wider"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const orderTotalPaise = order.items.reduce(
    (sum, item) => sum + item.unit_price_paise * item.quantity,
    0
  );

  return (
    <div className="space-y-5 pb-28 pt-2">
      {/* Header Block: Checkmark, Order received, Ref & Table */}
      <div className="p-6 glass-strong rounded-[6px] border border-glass-border text-center space-y-2 shadow-sm">
        <div className="w-14 h-14 rounded-[6px] bg-success/15 text-success border border-success/30 flex items-center justify-center mx-auto mb-2 animate-in zoom-in-75 duration-300">
          <Icons.Check className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-bold text-ink tracking-tight">Order received</h1>

        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="text-ink-muted">Ref:</span>
          <span className="font-mono font-bold text-accent px-1.5 py-0.5 bg-glass rounded-[4px] border border-glass-border">
            {order.short_ref}
          </span>
          <span className="text-ink-muted">•</span>
          <span className="font-semibold text-ink">{order.table_label}</span>
        </div>

        <div className="p-2 rounded-[4px] glass text-xs font-semibold text-ink border border-glass-border inline-block mt-2">
          Please pay at the counter.
        </div>

        {isReconnecting && (
          <p className="text-[11px] text-ink-muted animate-pulse mt-1">
            Reconnecting live updates...
          </p>
        )}
      </div>

      {/* Points Earned Banner (Phase 4 Loyalty) */}
      <div className="p-3.5 rounded-[6px] glass-strong border border-accent/40 flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[4px] bg-accent/20 text-accent flex items-center justify-center font-bold">
            <Icons.Bolt className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-ink block">Points Earned!</span>
            <span className="text-[11px] text-ink-muted">Added to your Green Fuel Club balance</span>
          </div>
        </div>
        <span className="font-bold text-accent text-sm tabular-nums">
          +{Math.max(1, Math.floor(orderTotalPaise / 1000))} pts
        </span>
      </div>

      {/* Primary Visual Focus: Status Tracker (UI_SPEC Section 5.3) */}
      <StatusTracker status={order.status} />

      {/* Expandable Items in this order */}
      <div className="glass-strong rounded-[6px] border border-glass-border overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setItemsExpanded(!itemsExpanded)}
          className="w-full p-4 flex items-center justify-between text-xs font-semibold text-ink text-left"
          aria-expanded={itemsExpanded}
        >
          <div className="flex items-center gap-2">
            <span>Items in this order ({order.items.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-accent tabular-nums">
              {formatRupees(orderTotalPaise)}
            </span>
            <Icons.ChevronDown
              className={`w-4 h-4 text-ink-muted transition-transform duration-150 ${
                itemsExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {itemsExpanded && (
          <div className="p-4 pt-0 border-t border-glass-border space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1">
                <span className="font-medium text-ink">
                  {item.item_name} <span className="text-ink-muted font-normal">× {item.quantity}</span>
                </span>
                <span className="font-semibold tabular-nums text-ink">
                  {formatRupees(item.unit_price_paise * item.quantity)}
                </span>
              </div>
            ))}

            {order.note && (
              <div className="mt-3 p-2.5 rounded-[4px] glass border border-glass-border text-xs text-ink-muted">
                <strong className="text-ink">Instructions:</strong> {order.note}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons: Order more & Back to status list */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={() => {
            clearCart();
            navigate(`/t/${token}`);
          }}
          className="w-full h-11 rounded-[6px] bg-accent text-accent-ink text-xs font-bold uppercase tracking-wider hover:opacity-95 active:scale-[0.98] transition-transform duration-100 flex items-center justify-center gap-2"
        >
          <span>Order more</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(`/t/${token}/status`)}
          className="w-full py-2.5 text-xs font-semibold text-accent hover:underline text-center"
        >
          Back to status
        </button>
      </div>
    </div>
  );
};

