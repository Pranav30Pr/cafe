import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { OrderWithDetails, OrderStatus } from '../types';
import { formatRupees } from '../utils/formatters';
import { Icons } from '../components/SvgIcon';

const STATUS_LABELS: Record<OrderStatus, { label: string; description: string; step: number }> = {
  new: { label: 'Order Received', description: 'Your order was sent to the kitchen.', step: 1 },
  accepted: { label: 'Accepted', description: 'The kitchen has accepted your order.', step: 2 },
  preparing: { label: 'Preparing', description: 'Our baristas/chefs are crafting your order.', step: 3 },
  ready: { label: 'Ready', description: 'Your order is ready! A server will bring it to your table.', step: 4 },
  served: { label: 'Served', description: 'Served at your table. Enjoy your meal!', step: 5 },
  cancelled: { label: 'Cancelled', description: 'This order was cancelled.', step: 0 },
};

export const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Order Confirmation | Artisan Roast Cafe';

    if (!id) return;

    const fetchOrder = () => {
      api.getOrderStatus(id).then((data) => {
        setOrder(data);
        setLoading(false);
      });
    };

    fetchOrder();

    // Subscribe to updates for this order
    const unsubscribe = api.subscribeToOrders(() => {
      fetchOrder();
    });

    const interval = setInterval(fetchOrder, 3000); // 3s polling fallback

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-cafe-textMuted text-sm" role="status">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="border border-cafe-border bg-cafe-surface p-8 rounded">
          <h1 className="text-lg font-semibold text-cafe-text mb-2">Order Not Found</h1>
          <p className="text-xs text-cafe-textMuted mb-6">
            We could not find an order matching this reference.
          </p>
          <Link
            to="/"
            className="touch-target inline-flex items-center gap-1.5 px-4 py-2 bg-cafe-accent text-white text-xs font-medium rounded hover:bg-cafe-accentHover transition-colors duration-150"
          >
            Return to Cafe Website
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusInfo = STATUS_LABELS[order.status];
  const orderTotalPaise = order.items.reduce(
    (sum, item) => sum + item.unit_price_paise * item.quantity,
    0
  );

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div className="border border-cafe-border bg-cafe-surface p-6 sm:p-8 rounded">
        {/* Success header strictly matching Section 5.2 */}
        <div className="text-center pb-6 border-b border-cafe-border">
          <div className="w-12 h-12 rounded bg-cafe-successBg border border-cafe-success text-cafe-success flex items-center justify-center mx-auto mb-3">
            <Icons.Check className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-cafe-accent mb-1">
            Order received.
          </h1>
          <p className="text-sm font-semibold text-cafe-text mb-1">
            Order reference: <span className="font-mono text-cafe-accent">{order.short_ref}</span>
          </p>
          <p className="text-sm font-medium text-cafe-textMuted mb-3">
            Table: <strong className="text-cafe-text">{order.table_label}</strong>
          </p>
          <div className="p-2.5 bg-cafe-muted border border-cafe-border rounded text-xs font-semibold text-cafe-text">
            Please pay at the counter.
          </div>
        </div>

        {/* Live Order Status Indicator */}
        <div className="py-6 border-b border-cafe-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-cafe-textMuted">
              Live Order Status
            </h2>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded ${
                order.status === 'cancelled'
                  ? 'bg-cafe-dangerBg text-cafe-danger border border-cafe-danger'
                  : 'bg-cafe-muted text-cafe-accent border border-cafe-border'
              }`}
            >
              {currentStatusInfo.label}
            </span>
          </div>

          <p className="text-xs text-cafe-text mb-4">
            {currentStatusInfo.description}
          </p>

          {/* Simple step visualizer (zero animations, purely state feedback) */}
          {order.status !== 'cancelled' && (
            <div className="grid grid-cols-4 gap-1 text-[11px] font-medium text-center">
              {['Received', 'Accepted', 'Preparing', 'Ready'].map((stepName, idx) => {
                const stepNumber = idx + 1;
                const isPassedOrActive = currentStatusInfo.step >= stepNumber;
                return (
                  <div key={stepName} className="flex flex-col items-center">
                    <div
                      className={`w-full h-1.5 rounded-sm mb-1 ${
                        isPassedOrActive ? 'bg-cafe-accent' : 'bg-cafe-border'
                      }`}
                      aria-hidden="true"
                    />
                    <span className={isPassedOrActive ? 'text-cafe-accent font-semibold' : 'text-cafe-textMuted'}>
                      {stepName}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Items Summary */}
        <div className="py-6 border-b border-cafe-border">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-cafe-textMuted mb-3">
            Items in This Order
          </h2>
          <div className="space-y-2 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-cafe-text">{item.item_name}</span>
                  <span className="text-cafe-textMuted ml-1.5">× {item.quantity}</span>
                </div>
                <span className="font-medium text-cafe-accent">
                  {formatRupees(item.unit_price_paise * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {order.note && (
            <div className="mt-4 p-2.5 bg-cafe-muted rounded text-xs text-cafe-text">
              <strong>Instructions:</strong> {order.note}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-cafe-border flex items-center justify-between text-sm font-semibold text-cafe-text">
            <span>Total Payable:</span>
            <span className="text-cafe-accent text-base">
              {formatRupees(orderTotalPaise)}
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 text-center">
          <p className="text-xs text-cafe-textMuted mb-4">
            Show this screen or order reference <strong className="font-mono">{order.short_ref}</strong> at the counter when settling your bill.
          </p>
          <Link
            to="/"
            className="touch-target inline-flex items-center justify-center px-4 py-2 bg-cafe-surface text-cafe-text border border-cafe-border text-xs font-medium rounded hover:bg-cafe-muted transition-colors duration-150"
          >
            Back to Cafe Home
          </Link>
        </div>
      </div>
    </div>
  );
};
