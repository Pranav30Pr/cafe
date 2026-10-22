import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icons } from './Icon';
import { useCart } from '../state/CartContext';

interface TabBarProps {
  token: string;
  hasActiveOrder?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({ token, hasActiveOrder = false }) => {
  const { totalItems } = useCart();

  const tabs = [
    {
      id: 'menu',
      label: 'Menu',
      to: `/t/${token}`,
      end: true,
      icon: (filled: boolean) => <Icons.MenuTab filled={filled} className="w-5 h-5" />,
      badge: null,
    },
    {
      id: 'order',
      label: 'Cart',
      to: `/t/${token}/order`,
      end: true,
      icon: (filled: boolean) => <Icons.OrderTab filled={filled} className="w-5 h-5" />,
      badge: totalItems > 0 ? (
        <span
          className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-[#15803D] text-white rounded-[4px] text-[10px] font-bold tabular-nums shadow-sm"
          aria-label={`${totalItems} items in cart`}
        >
          {totalItems}
        </span>
      ) : null,
    },
    {
      id: 'status',
      label: 'Status',
      to: `/t/${token}/status`,
      end: false,
      icon: (filled: boolean) => <Icons.StatusTab filled={filled} className="w-5 h-5" />,
      badge: hasActiveOrder ? (
        <span
          className="absolute top-0 right-0 w-2 h-2 rounded-[2px] bg-[#15803D] animate-pulse"
          aria-label="Active order in progress"
        />
      ) : null,
    },
    {
      id: 'club',
      label: 'Club',
      to: `/t/${token}/club`,
      end: true,
      icon: (filled: boolean) => <Icons.ClubTab filled={filled} className="w-5 h-5" />,
      badge: null,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
    >
      <div className="w-full max-w-[480px] pointer-events-auto bg-white border-t border-[#E2E8F0] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="h-16 grid grid-cols-4 items-center px-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `min-w-[44px] min-h-[56px] h-full flex flex-col items-center justify-center transition-colors duration-150 relative select-none ${
                  isActive
                    ? 'text-[#15803D] font-bold'
                    : 'text-[#64748B] hover:text-[#0F172A] font-normal'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active top green bar */}
                  {isActive && (
                    <span className="absolute top-0 w-10 h-0.5 bg-[#15803D] rounded-[1px]" />
                  )}
                  <div className="relative flex items-center justify-center">
                    {tab.icon(isActive)}
                    {tab.badge}
                  </div>
                  <span className="text-[11px] mt-1 leading-none tracking-tight">
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
