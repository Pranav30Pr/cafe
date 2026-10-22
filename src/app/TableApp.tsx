import React, { useEffect, useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { api } from '../services/api';
import { Cafe, CafeTable, MenuCategory, MenuItem } from '../types';
import { TopBar } from '../components/TopBar';
import { TabBar } from '../components/TabBar';
import { CartProvider } from '../state/CartContext';

export interface TableAppContextType {
  cafe: Cafe;
  token: string;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  tableLabel: string;
}

export const TableApp: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [table, setTable] = useState<CafeTable | null>(null);
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      api.getTableByToken(token),
      api.getCafe(),
      api.getMenu(),
    ]).then(([tableData, cafeData, menuData]) => {
      setTable(tableData);
      setCafe(cafeData);
      setCategories(menuData.categories);
      setMenuItems(menuData.items);
      setLoading(false);

      if (tableData) {
        document.title = `${tableData.label} | ${cafeData.name}`;
      }
    });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center text-sm font-medium text-ink-muted">
        Loading menu...
      </div>
    );
  }

  if (!table || !cafe) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm glass-strong p-8 rounded-[16px] border border-glass-border shadow-lg space-y-4">
          <h1 className="text-lg font-bold text-ink">Invalid Table Link</h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            This table link is not valid or has been refreshed. Please ask a cafe staff member.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-[12px] bg-accent text-accent-ink text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Visit Cafe Homepage
          </a>
        </div>
      </div>
    );
  }

  const contextValue: TableAppContextType = {
    cafe,
    token: token || '',
    categories,
    menuItems,
    tableLabel: table.label,
  };

  return (
    <CartProvider initialItems={menuItems}>

      <div className="min-h-screen bg-bg-base text-ink relative font-sans flex flex-col items-center">
        {/* Subtle tonal backdrop layer */}
        <div className="app-backdrop" />

        {/* Mobile Viewport Container - max 480px width */}
        <div className="w-full max-w-[480px] min-h-screen relative z-10 flex flex-col">
          <TopBar cafeName={cafe.name} tableLabel={table.label} />

          <main id="main-content" className="flex-1 px-4 pt-2">
            <Outlet context={contextValue} />
          </main>

          <TabBar token={token || ''} />
        </div>
      </div>
    </CartProvider>
  );
};
