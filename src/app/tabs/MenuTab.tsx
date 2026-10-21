import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MenuItem, MenuCategory, Cafe } from '../../types';
import { ItemCard } from '../../components/ItemCard';
import { MiniCartBar } from '../../components/MiniCartBar';
import { Icons } from '../../components/Icon';

interface TableAppContextType {
  cafe: Cafe;
  token: string;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  tableLabel: string;
}

export const MenuTab: React.FC = () => {
  const { cafe, token, categories, menuItems } = useOutletContext<TableAppContextType>();
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items by category and search
  const filteredItems = useMemo(() => {
    let result = menuItems;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [menuItems, searchQuery]);

  const activeCategories = useMemo(() => {
    if (searchQuery.trim()) {
      return categories.filter((cat) =>
        filteredItems.some((item) => item.category_id === cat.id)
      );
    }
    return categories;
  }, [categories, filteredItems, searchQuery]);

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Category Chips Bar (Horizontally scrollable, sticky under TopBar) */}
      <div className="sticky top-14 z-20 -mx-4 px-4 py-2 glass border-b border-glass-border overflow-x-auto no-scrollbar flex items-center gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id && !searchQuery.trim();
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
                const el = document.getElementById(`category-${cat.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`h-10 min-h-[40px] px-4 rounded-[12px] text-xs font-semibold whitespace-nowrap transition-colors duration-150 select-none flex items-center justify-center ${
                isSelected
                  ? 'bg-accent text-accent-ink shadow-sm'
                  : 'glass-strong text-ink hover:bg-glass border border-glass-border'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Search field (UI_SPEC 5.1: Device-side filtering, no network calls) */}
      <div className="relative">
        <label htmlFor="menu-search" className="sr-only">
          Search the menu
        </label>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
          <Icons.Search className="w-4 h-4" />
        </div>
        <input
          id="menu-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search the menu"
          className="w-full h-11 pl-10 pr-4 rounded-[12px] glass-strong border border-glass-border text-sm text-ink placeholder:text-ink-muted/70 focus-visible:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-muted hover:text-ink"
          >
            <Icons.Close className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Menu Categories & Item Cards */}
      {filteredItems.length === 0 ? (
        <div className="p-8 glass-strong rounded-[16px] border border-glass-border text-center text-sm text-ink-muted mt-6">
          {searchQuery
            ? `No menu items matching "${searchQuery}".`
            : 'The menu is not available right now. Please ask a staff member.'}
        </div>
      ) : (
        <div className="space-y-6 mt-2">
          {activeCategories.map((cat) => {
            const catItems = filteredItems.filter((i) => i.category_id === cat.id);
            if (catItems.length === 0) return null;

            return (
              <section
                key={cat.id}
                id={`category-${cat.id}`}
                aria-labelledby={`cat-title-${cat.id}`}
                className="space-y-2.5 pt-2"
              >
                <h2
                  id={`cat-title-${cat.id}`}
                  className="text-base font-bold text-ink tracking-tight px-1"
                >
                  {cat.name}
                </h2>

                <div className="space-y-2.5">
                  {catItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Mini Cart Bar (Visible on Menu tab when cart > 0 per UI_SPEC 4.2) */}
      <MiniCartBar token={token} />
    </div>
  );
};
