import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MenuItem, MenuCategory, Cafe } from '../../types';
import { ItemCard } from '../../components/ItemCard';
import { MiniCartBar } from '../../components/MiniCartBar';
import { Icons } from '../../components/Icon';
import { DietMarker } from '../../components/DietMarker';
import { useCart } from '../../state/CartContext';

interface TableAppContextType {
  cafe: Cafe;
  token: string;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  tableLabel: string;
}

export const MenuTab: React.FC = () => {
  const { token, categories, menuItems, tableLabel } = useOutletContext<TableAppContextType>();
  const { totalItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [highProteinOnly, setHighProteinOnly] = useState(false);
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);

  // Filter items by category, dietary toggles, and search
  const filteredItems = useMemo(() => {
    let result = menuItems;

    // Veg Only filter (Zomato / Swiggy standard)
    if (vegOnly) {
      result = result.filter((i) => i.diet === 'veg');
    }

    // High Protein filter (25g+)
    if (highProteinOnly) {
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes('protein') ||
          i.name.toLowerCase().includes('chicken') ||
          i.name.toLowerCase().includes('tofu') ||
          i.name.toLowerCase().includes('shake')
      );
    }

    // Bestseller filter
    if (bestsellerOnly) {
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes('energy') ||
          i.name.toLowerCase().includes('chicken') ||
          i.name.toLowerCase().includes('shake')
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((i) => i.category_id === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [menuItems, selectedCategory, searchQuery, vegOnly, highProteinOnly, bestsellerOnly]);

  const activeCategories = useMemo(() => {
    if (selectedCategory !== 'all') {
      return categories.filter((c) => c.id === selectedCategory);
    }
    return categories.filter((cat) =>
      filteredItems.some((item) => item.category_id === cat.id)
    );
  }, [categories, filteredItems, selectedCategory]);

  const scrollToCategory = (catId: string) => {
    setSelectedCategory(catId);
    setSearchQuery('');
    setMenuSheetOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`category-${catId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Clean Cafe Welcome Banner (Swiggy / Zomato Healthy Cafe Hero) */}
      <section className="bg-white rounded-[6px] p-4 border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
              Verde Fuel & Protein Bar
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5 font-medium">
              Healthy Bowls • High-Protein Snacks • Cold Brews
            </p>

            {/* Table & Prep Time Badges */}
            <div className="flex items-center gap-2 mt-2 text-xs font-semibold">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#15803D] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                {tableLabel || 'Table 4'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-[#64748B]">
                <Icons.Clock className="w-3.5 h-3.5 text-slate-400" />
                12-18 mins prep
              </span>
            </div>
          </div>

          {/* Zomato / Swiggy Green Rating Badge */}
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#15803D] text-white font-extrabold text-xs shadow-sm">
              <span>★</span>
              <span>4.8</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-medium">1.2K+ ratings</span>
          </div>
        </div>

        {/* Offers / Deals Strip (Zomato / Swiggy promo carousel) */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[#F0FDF4] border border-[#DCFCE7] text-xs flex-shrink-0">
            <span className="font-extrabold text-[#15803D]">🏷️ 20% OFF</span>
            <span className="text-slate-600 font-medium">Up to ₹100 • Use VERDE20</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[#FEF3C7] border border-[#FDE68A] text-xs flex-shrink-0">
            <span className="font-extrabold text-[#92400E]">⚡ 140 PTS</span>
            <span className="text-amber-900 font-medium">Loyalty balance</span>
          </div>
        </div>
      </section>

      {/* Search Bar (Swiggy / Zomato Input) */}
      <div className="relative">
        <label htmlFor="menu-search" className="sr-only">
          Search dishes and drinks
        </label>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Icons.Search className="w-4 h-4" />
        </div>
        <input
          id="menu-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for bowls, smoothies, protein snacks..."
          className="w-full h-11 pl-10 pr-4 rounded-[6px] bg-white border border-[#CBD5E1] text-sm text-[#0F172A] placeholder:text-slate-400 focus-visible:outline-none focus:border-[#15803D] shadow-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <Icons.Close className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Swiggy / Zomato Quick Toggles Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {/* Veg Only Toggle Switch */}
        <button
          type="button"
          onClick={() => setVegOnly(!vegOnly)}
          className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-bold border transition-colors ${
            vegOnly
              ? 'bg-[#ECFDF5] border-[#15803D] text-[#15803D]'
              : 'bg-white border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
          }`}
        >
          <DietMarker diet="veg" />
          <span>Veg Only</span>
        </button>

        {/* High Protein Toggle */}
        <button
          type="button"
          onClick={() => setHighProteinOnly(!highProteinOnly)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-bold border transition-colors ${
            highProteinOnly
              ? 'bg-[#15803D] border-[#15803D] text-white'
              : 'bg-white border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
          }`}
        >
          <Icons.Flame className="w-3.5 h-3.5" />
          <span>High Protein</span>
        </button>

        {/* Bestsellers Toggle */}
        <button
          type="button"
          onClick={() => setBestsellerOnly(!bestsellerOnly)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-[6px] text-xs font-bold border transition-colors ${
            bestsellerOnly
              ? 'bg-[#FEF3C7] border-[#D97706] text-[#92400E]'
              : 'bg-white border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
          }`}
        >
          Bestsellers
        </button>
      </div>

      {/* Category Pills (Swiggy / Zomato sticky category strip) */}
      <div className="sticky top-14 z-20 -mx-4 px-4 py-2.5 bg-[#F8FAF8] border-b border-[#E2E8F0] overflow-x-auto no-scrollbar flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('all');
            setSearchQuery('');
          }}
          className={`h-8 px-3.5 rounded-[6px] text-xs font-bold whitespace-nowrap transition-colors select-none flex items-center justify-center ${
            selectedCategory === 'all'
              ? 'bg-[#15803D] text-white shadow-sm'
              : 'bg-white text-[#475569] border border-[#CBD5E1] hover:bg-slate-50'
          }`}
        >
          All Items
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => scrollToCategory(cat.id)}
              className={`h-8 px-3.5 rounded-[6px] text-xs font-bold whitespace-nowrap transition-colors select-none flex items-center justify-center ${
                isSelected
                  ? 'bg-[#15803D] text-white shadow-sm'
                  : 'bg-white text-[#475569] border border-[#CBD5E1] hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Menu Item Cards Listed by Category in Clean White Sections */}
      {filteredItems.length === 0 ? (
        <div className="p-8 bg-white rounded-[6px] border border-[#E2E8F0] text-center text-sm text-[#64748B] mt-6 shadow-sm">
          {searchQuery
            ? `No items found matching "${searchQuery}".`
            : 'No menu items found for this filter.'}
        </div>
      ) : (
        <div className="space-y-4 mt-3">
          {activeCategories.map((cat) => {
            const catItems = filteredItems.filter((i) => i.category_id === cat.id);
            if (catItems.length === 0) return null;

            return (
              <section
                key={cat.id}
                id={`category-${cat.id}`}
                aria-labelledby={`cat-title-${cat.id}`}
                className="bg-white rounded-[6px] p-4 border border-[#E2E8F0] shadow-sm"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2
                    id={`cat-title-${cat.id}`}
                    className="text-base font-extrabold text-[#0F172A] tracking-tight"
                  >
                    {cat.name}
                  </h2>
                  <span className="text-xs font-semibold text-[#64748B]">
                    {catItems.length} {catItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div>
                  {catItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Iconic Swiggy / Zomato Floating Category Pill */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-30 transition-all duration-200 ${
          totalItems > 0 ? 'bottom-[calc(64px+48px+20px)]' : 'bottom-20'
        }`}
      >
        <button
          type="button"
          onClick={() => setMenuSheetOpen(true)}
          className="h-10 px-4 rounded-[6px] bg-[#0F172A] text-white text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all select-none"
        >
          <span>📖</span>
          <span>MENU</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
          <span className="text-[11px] text-slate-300 tabular-nums">{categories.length}</span>
        </button>
      </div>

      {/* Floating Category Navigation Sheet */}
      {menuSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[480px] bg-white rounded-t-[12px] p-5 shadow-2xl space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-extrabold text-base text-[#0F172A]">Browse Categories</span>
              <button
                type="button"
                onClick={() => setMenuSheetOpen(false)}
                className="p-1 rounded-[4px] hover:bg-slate-100 text-slate-500"
              >
                <Icons.Close className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setMenuSheetOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-[6px] text-sm font-bold text-left transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#ECFDF5] text-[#15803D]'
                    : 'hover:bg-slate-50 text-[#0F172A]'
                }`}
              >
                <span>All Items</span>
                <span className="text-xs text-slate-400 font-semibold">{menuItems.length}</span>
              </button>

              {categories.map((cat) => {
                const count = menuItems.filter((i) => i.category_id === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => scrollToCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-[6px] text-sm font-bold text-left transition-colors ${
                      isSelected
                        ? 'bg-[#ECFDF5] text-[#15803D]'
                        : 'hover:bg-slate-50 text-[#0F172A]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-slate-400 font-semibold">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart (Positioned above bottom nav) */}
      <MiniCartBar token={token} />
    </div>
  );
};

