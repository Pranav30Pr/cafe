import React from 'react';
import { Icons } from './Icon';

interface TopBarProps {
  cafeName: string;
  tableLabel?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ cafeName, tableLabel }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-[#E2E8F0] pt-[env(safe-area-inset-top)] shadow-sm">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Brand identity: Swiggy/Zomato restaurant header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#15803D]">
            <Icons.Bolt className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-[15px] text-[#0F172A] tracking-tight block leading-tight">
              {cafeName}
            </span>
            {tableLabel && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider">
                  {tableLabel}
                </span>
                <span className="text-[#94A3B8] text-[10px]">• Table Dine-in</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Loyalty Status Chip */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#F1F5F2] border border-[#E2E8F0] text-[#15803D]">
          <Icons.Bolt className="w-3.5 h-3.5" />
          <span className="text-xs font-extrabold tabular-nums">140 PTS</span>
        </div>
      </div>
    </header>
  );
};
