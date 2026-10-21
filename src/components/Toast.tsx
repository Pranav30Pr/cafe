import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  undoAction?: () => void;
  onDismiss: () => void;
  type?: 'status' | 'alert';
}

export const Toast: React.FC<ToastProps> = ({
  message,
  undoAction,
  onDismiss,
  type = 'status',
}) => {
  useEffect(() => {
    if (type === 'status') {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [onDismiss, type]);

  return (
    <div
      role={type === 'alert' ? 'alert' : 'status'}
      className="fixed bottom-[calc(64px+env(safe-area-inset-bottom)+12px)] left-4 right-4 max-w-[448px] mx-auto z-50 glass-strong border border-glass-border rounded-[14px] p-3 shadow-xl flex items-center justify-between gap-3 text-ink text-xs font-medium animate-in slide-in-from-bottom duration-150"
    >
      <span className="flex-1 leading-snug">{message}</span>

      {undoAction && (
        <button
          type="button"
          onClick={undoAction}
          className="px-2.5 py-1 rounded-[8px] bg-accent text-accent-ink font-semibold hover:opacity-90 active:scale-95 transition-transform duration-100"
        >
          Undo
        </button>
      )}

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="text-ink-muted hover:text-ink p-1"
      >
        ✕
      </button>
    </div>
  );
};
