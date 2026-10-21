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
      icon: (filled: boolean) => <Icons.MenuTab filled={filled} className="w-6 h-6" />,
      badge: null,
    },
    {
      id: 'order',
      label: 'Your order',
      to: `/t/${token}/order`,
      end: true,
      icon: (filled: boolean) => <Icons.OrderTab filled={filled} className="w-6 h-6" />,
      badge: totalItems > 0 ? (
        <span
          className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-accent text-accent-ink rounded-[4px] text-[10px] font-bold tabular-nums shadow-sm"
          aria-label={`${totalItems} items in your order`}
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
      icon: (filled: boolean) => <Icons.StatusTab filled={filled} className="w-6 h-6" />,
      badge: hasActiveOrder ? (
        <span
          className="absolute top-0 right-0 w-2 h-2 rounded-full bg-accent animate-pulse"
          aria-label="Active order in progress"
        />
      ) : null,
    },
    {
      id: 'info',
      label: 'Info',
      to: `/t/${token}/info`,
      end: true,
      icon: (filled: boolean) => <Icons.InfoTab filled={filled} className="w-6 h-6" />,
      badge: null,
    },
  ];

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
    >
      <div className="w-full max-w-[480px] pointer-events-auto glass border-t border-glass-border pb-[env(safe-area-inset-bottom)] shadow-lg">
        <div className="h-16 grid grid-cols-4 items-center">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `min-w-[44px] min-h-[56px] h-full flex flex-col items-center justify-center transition-colors duration-150 relative select-none ${
                  isActive
                    ? 'text-accent font-semibold'
                    : 'text-ink-muted hover:text-ink font-normal'
                }`
              }
            >
              {({ isActive }) => (
                <>
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
