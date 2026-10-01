import React from 'react';
import { DietType } from '../types';

interface DietBadgeProps {
  diet: DietType;
  showText?: boolean;
}

export const DietBadge: React.FC<DietBadgeProps> = ({ diet, showText = true }) => {
  if (diet === 'veg') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-cafe-success bg-cafe-successBg border border-cafe-success rounded"
        title="Vegetarian"
        aria-label="Vegetarian food"
      >
        <span className="w-2.5 h-2.5 border border-cafe-success flex items-center justify-center rounded-sm" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full bg-cafe-success" />
        </span>
        {showText && <span>Veg</span>}
      </span>
    );
  }

  if (diet === 'non_veg') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-cafe-danger bg-cafe-dangerBg border border-cafe-danger rounded"
        title="Non-Vegetarian"
        aria-label="Non-Vegetarian food"
      >
        <span className="w-2.5 h-2.5 border border-cafe-danger flex items-center justify-center rounded-sm" aria-hidden="true">
          <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-cafe-danger" />
        </span>
        {showText && <span>Non-Veg</span>}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-cafe-warning bg-cafe-warningBg border border-cafe-warning rounded"
      title="Contains Egg"
      aria-label="Food contains egg"
    >
      <span className="w-2.5 h-2.5 border border-cafe-warning flex items-center justify-center rounded-sm" aria-hidden="true">
        <span className="w-1.5 h-2 rounded-full bg-cafe-warning" />
      </span>
      {showText && <span>Egg</span>}
    </span>
  );
};
