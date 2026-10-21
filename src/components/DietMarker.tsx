import React from 'react';
import { DietType } from '../types';

interface DietMarkerProps {
  diet: DietType;
  className?: string;
}

export const DietMarker: React.FC<DietMarkerProps> = ({ diet, className = '' }) => {
  const getLabel = () => {
    switch (diet) {
      case 'veg':
        return 'Vegetarian';
      case 'non_veg':
        return 'Non-vegetarian';
      case 'egg':
        return 'Contains egg';
    }
  };

  const getColor = () => {
    switch (diet) {
      case 'veg':
        return 'text-success border-success';
      case 'non_veg':
        return 'text-danger border-danger';
      case 'egg':
        return 'text-warning border-warning';
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 border rounded-[3px] p-[1.5px] ${getColor()} ${className}`}
      title={getLabel()}
      aria-label={getLabel()}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      <span className="sr-only">{getLabel()}</span>
    </span>
  );
};
