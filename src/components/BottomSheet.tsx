import React, { useEffect, useRef } from 'react';
import { Icons } from './Icon';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Push history state to handle Android hardware back button (UI_SPEC Section 7)
      window.history.pushState({ bottomSheet: true }, '');

      const handlePopState = () => {
        onClose();
      };
      window.addEventListener('popstate', handlePopState);

      // Focus modal container
      setTimeout(() => {
        sheetRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('keydown', handleKeyDown);
        if (previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
    >
      {/* Dimmed scrim background */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet surface */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-[480px] max-h-[90dvh] bg-[var(--glass-strong)] glass-strong rounded-t-[24px] border-t border-glass-border shadow-2xl flex flex-col focus:outline-none animate-in slide-in-from-bottom duration-250"
      >
        {/* Decorative grab handle */}
        <div className="w-full pt-3 pb-1 flex justify-center" aria-hidden="true">
          <div className="w-10 h-1 rounded-[2px] bg-ink-muted/30" />
        </div>

        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-glass-border">
          {title ? (
            <h2 className="text-lg font-bold text-ink tracking-tight">{title}</h2>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-ink-muted hover:text-ink hover:bg-glass transition-colors duration-150"
          >
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="p-5 overflow-y-auto overflow-x-hidden flex-1 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
