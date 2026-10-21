import React from 'react';

interface TopBarProps {
  cafeName: string;
  tableLabel?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ cafeName, tableLabel }) => {
  return (
    <header className="sticky top-0 z-30 w-full glass border-b border-glass-border pt-[env(safe-area-inset-top)]">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Brand name */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-ink tracking-tight select-none">
            {cafeName}
          </span>
        </div>

        {/* Compact Table Label Chip */}
        {tableLabel && (
          <div
            className="px-3 py-1 rounded-[12px] glass-strong border border-glass-border text-xs font-semibold text-accent shadow-sm select-none"
            aria-label={`You are ordering from ${tableLabel}`}
          >
            {tableLabel}
          </div>
        )}
      </div>
    </header>
  );
};
