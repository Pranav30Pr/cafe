import React from 'react';
import { OrderStatus } from '../types';
import { Icons } from './Icon';

interface StatusTrackerProps {
  status: OrderStatus;
}

const STEPS: Array<{ key: OrderStatus; label: string; activeSentence: string }> = [
  { key: 'new', label: 'Received', activeSentence: 'The kitchen has your order' },
  { key: 'accepted', label: 'Accepted', activeSentence: 'The kitchen has accepted your order' },
  { key: 'preparing', label: 'Preparing', activeSentence: 'Your order is being prepared' },
  { key: 'ready', label: 'Ready', activeSentence: 'Your order is ready' },
];

const STEP_ORDER: Record<OrderStatus, number> = {
  new: 0,
  accepted: 1,
  preparing: 2,
  ready: 3,
  served: 4,
  cancelled: -1,
};

export const StatusTracker: React.FC<StatusTrackerProps> = ({ status }) => {
  const currentStepIndex = STEP_ORDER[status] ?? 0;

  if (status === 'cancelled') {
    return (
      <div className="p-6 glass-strong rounded-[6px] border border-danger/30 text-center space-y-2">
        <div className="w-12 h-12 rounded-[6px] bg-danger/10 text-danger flex items-center justify-center mx-auto mb-2">
          <Icons.Close className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-danger">Order Cancelled</h3>
        <p className="text-xs text-ink-muted leading-relaxed">
          This order was cancelled. Please speak to a staff member.
        </p>
      </div>
    );
  }

  if (status === 'served') {
    return (
      <div className="p-6 glass-strong rounded-[6px] border border-success/30 text-center space-y-2">
        <div className="w-12 h-12 rounded-[6px] bg-success/10 text-success flex items-center justify-center mx-auto mb-2">
          <Icons.Check className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-success">Enjoy your order.</h3>
        <p className="text-xs text-ink-muted leading-relaxed">
          Your order has been served at your table. Please pay at the counter.
        </p>
      </div>
    );
  }

  const currentSentence = STEPS[currentStepIndex]?.activeSentence || 'Your order is in progress';

  return (
    <div className="p-5 glass-strong rounded-[6px] border border-glass-border shadow-sm space-y-5">

      {/* 4 Steps Horizontal Tracker */}
      <div className="grid grid-cols-4 gap-2 relative">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStepIndex > idx;
          const isCurrent = currentStepIndex === idx;

          return (
            <div key={step.key} className="flex flex-col items-center text-center">
              {/* Step indicator node */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 select-none mb-2 ${
                  isCurrent
                    ? 'bg-accent text-accent-ink ring-4 ring-accent/20 shadow-md'
                    : isCompleted
                    ? 'bg-success text-white'
                    : 'bg-glass text-ink-muted border border-glass-border'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Icons.Check className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step label */}
              <span
                className={`text-[11px] leading-tight ${
                  isCurrent
                    ? 'font-bold text-accent'
                    : isCompleted
                    ? 'font-medium text-ink'
                    : 'text-ink-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Focus sentence under the tracker per UI_SPEC Section 5.3 */}
      <div className="pt-3 border-t border-glass-border text-center">
        <p className="text-base font-semibold text-ink leading-snug">
          {currentSentence}
        </p>
      </div>
    </div>
  );
};
