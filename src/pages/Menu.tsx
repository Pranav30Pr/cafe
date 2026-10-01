import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MenuCategory, MenuItem } from '../types';
import { formatRupees } from '../utils/formatters';
import { DietBadge } from '../components/DietBadge';
import { PRICE_NOTICE } from '../constants/consent';

export const Menu: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Menu | Artisan Roast Cafe';
    api.getMenu().then((res) => {
      setCategories(res.categories);
      setItems(res.items);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-cafe-accent tracking-tight mb-2">
          Cafe Menu
        </h1>
        {/* Required Price & Tax notice from Section 5.1 */}
        <p className="text-sm text-cafe-textMuted">{PRICE_NOTICE}</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-cafe-textMuted text-sm" role="status">
          Loading menu items...
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map((cat) => {
            const catItems = items.filter((i) => i.category_id === cat.id);
            if (catItems.length === 0) return null;

            return (
              <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
                <h2
                  id={`cat-${cat.id}`}
                  className="text-xl font-semibold text-cafe-text pb-2 mb-4 border-b border-cafe-border"
                >
                  {cat.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catItems.map((item) => (
                    <article
                      key={item.id}
                      className="border border-cafe-border bg-cafe-surface p-4 rounded flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-medium text-cafe-text text-base leading-snug">
                            {item.name}
                          </h3>
                          <div className="flex-shrink-0">
                            <DietBadge diet={item.diet} />
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-xs text-cafe-textMuted mb-2.5 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {/* Flat grey photo placeholder per Section 9 */}
                        <div
                          className="w-full h-28 bg-[#EBE7DF] border border-cafe-border flex items-center justify-center text-xs text-cafe-textMuted rounded mb-3"
                          aria-label={`Photo placeholder for ${item.name}`}
                        >
                          Photo to be added
                        </div>

                        {item.allergen_note && (
                          <p className="text-[11px] text-cafe-textMuted italic mb-2">
                            Allergen: {item.allergen_note}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-cafe-border flex items-center justify-between">
                        <span className="font-semibold text-cafe-accent text-sm">
                          {formatRupees(item.price_paise)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
