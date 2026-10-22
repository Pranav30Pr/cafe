import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';
import { OrderWithDetails, Cafe } from '../../types';
import { formatRupees, formatMinutesAgo } from '../../utils/formatters';
import { Icons } from '../../components/Icon';

const ORDER_HISTORY_KEY = 'cafe_visit_orders';

interface TableAppContextType {
  cafe: Cafe;
  token: string;
}

export const StatusTab: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useOutletContext<TableAppContextType>();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitOrders = async () => {
      try {
        const raw = sessionStorage.getItem(ORDER_HISTORY_KEY);
        const orderIds: string[] = raw ? JSON.parse(raw) : [];

        if (orderIds.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        const loaded = await Promise.all(
          orderIds.map((id) => api.getOrderStatus(id))
        );
        const valid = loaded.filter((o): o is OrderWithDetails => o !== null);
        setOrders(valid);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitOrders();
    const interval = setInterval(fetchVisitOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-ink-muted">
        Loading orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-[6px] glass-strong border border-glass-border flex items-center justify-center mx-auto text-ink-muted">
          <Icons.StatusTab className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-ink">You have no orders yet.</h2>
        <p className="text-xs text-ink-muted max-w-[280px] mx-auto">
          When you place an order, its live progress will show here.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/t/${token}`)}
          className="h-11 px-6 rounded-[6px] bg-accent text-accent-ink text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-transform duration-100"
        >
          Browse menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 pt-2">
      <h1 className="text-xl font-bold text-ink px-1 tracking-tight">Your orders this visit</h1>

      <div className="space-y-3">
        {orders.map((order) => {
          const totalPaise = order.items.reduce(
            (sum, item) => sum + item.unit_price_paise * item.quantity,
            0
          );

          return (
            <article
              key={order.id}
              onClick={() => navigate(`/t/${token}/status/${order.id}`)}
              className="p-4 glass-strong rounded-[6px] border border-glass-border shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform duration-100"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-accent">
                    Ref: {order.short_ref}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    • {formatMinutesAgo(order.created_at)}
                  </span>
                </div>

                <div className="text-xs text-ink-muted line-clamp-1">
                  {order.items.map((i) => `${i.item_name} ×${i.quantity}`).join(', ')}
                </div>

                <div className="text-sm font-bold tabular-nums text-ink pt-1">
                  {formatRupees(totalPaise)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'ready'
                      ? 'bg-success/20 text-success border border-success/40'
                      : order.status === 'preparing'
                      ? 'bg-warning/20 text-warning border border-warning/40'
                      : order.status === 'cancelled'
                      ? 'bg-danger/20 text-danger border border-danger/40'
                      : 'bg-glass text-accent border border-glass-border'
                  }`}
                >
                  {order.status}
                </span>
                <Icons.ArrowRight className="w-4 h-4 text-ink-muted" />
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
};
