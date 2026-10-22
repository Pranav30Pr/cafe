"use client";

import { useState } from "react";
import {
  Plus,
  Edit2,
  Check,
  X,
  Sparkles,
  Search,
  Filter,
  AlertOctagon,
  Save,
} from "lucide-react";
import { CAFE_CONFIG, MenuItem } from "@/config/cafe";

interface MenuManagerTabProps {
  items: MenuItem[];
  onUpdateItem: (itemId: string, updates: Partial<MenuItem>) => Promise<void>;
  onCreateItem: (newItem: Partial<MenuItem>) => Promise<void>;
}

export function MenuManagerTab({
  items,
  onUpdateItem,
  onCreateItem,
}: MenuManagerTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    categoryId: CAFE_CONFIG.categories[0].id,
    basePrice: 200,
    description: "",
    isVeg: true,
    isVegan: false,
    isChefSpecial: false,
  });

  const filteredItems = items.filter((item) => {
    const matchCat =
      selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchSearch =
      search.trim() === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleStartEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      basePrice: item.basePrice,
      description: item.description,
      isVeg: item.isVeg,
      isVegan: Boolean(item.isVegan),
      isChefSpecial: Boolean(item.isChefSpecial),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    await onUpdateItem(editingItem.id, {
      name: formData.name.trim(),
      categoryId: formData.categoryId,
      basePrice: Number(formData.basePrice),
      description: formData.description.trim(),
      isVeg: formData.isVeg,
      isVegan: formData.isVegan,
      isChefSpecial: formData.isChefSpecial,
    });
    setEditingItem(null);
  };

  const handleSaveNew = async () => {
    if (!formData.name.trim()) return;
    await onCreateItem({
      name: formData.name.trim(),
      categoryId: formData.categoryId,
      basePrice: Number(formData.basePrice),
      description: formData.description.trim(),
      isVeg: formData.isVeg,
      isVegan: formData.isVegan,
      isChefSpecial: formData.isChefSpecial,
      isAvailable: true,
    });
    setIsAddingNew(false);
    setFormData({
      name: "",
      categoryId: CAFE_CONFIG.categories[0].id,
      basePrice: 200,
      description: "",
      isVeg: true,
      isVegan: false,
      isChefSpecial: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E6E1D5] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#4E7A63]">
            Menu Operations
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B382B]">
            Culinary Catalog & Pricing
          </h2>
          <p className="text-xs text-[#55635B] mt-0.5">
            Owner live management: adjust item prices, descriptions, and dietary classifications.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAddingNew(true);
            setFormData({
              name: "",
              categoryId: CAFE_CONFIG.categories[0].id,
              basePrice: 200,
              description: "",
              isVeg: true,
              isVegan: false,
              isChefSpecial: false,
            });
          }}
          className="px-5 py-2.5 rounded-2xl bg-[#1B382B] text-white text-xs font-semibold hover:bg-[#12241C] transition-all flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4 text-[#8EBA9D]" />
          <span>Add New Menu Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#55635B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E6E1D5] text-xs text-[#151E19] focus:outline-none focus:border-[#4E7A63]"
          />
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === "all"
                ? "bg-[#1B382B] text-white"
                : "bg-white border border-[#E6E1D5] text-[#55635B] hover:border-[#4E7A63]"
            }`}
          >
            All ({items.length})
          </button>
          {CAFE_CONFIG.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === c.id
                  ? "bg-[#1B382B] text-white"
                  : "bg-white border border-[#E6E1D5] text-[#55635B] hover:border-[#4E7A63]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Item List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-white border border-[#E6E1D5] p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3 h-3 rounded border flex items-center justify-center ${
                      item.isVeg ? "border-[#2D8A4E]" : "border-[#C44A3F]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isVeg ? "bg-[#2D8A4E]" : "bg-[#C44A3F]"
                      }`}
                    />
                  </span>
                  <span className="text-[10px] font-mono text-[#55635B] uppercase">
                    {item.categoryId.replace("cat-", "")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.isChefSpecial && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Special
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.isAvailable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {item.isAvailable ? "Active" : "86'd"}
                  </span>
                </div>
              </div>

              <h3 className="font-serif text-base font-bold text-[#1B382B]">
                {item.name}
              </h3>
              <p className="text-xs text-[#55635B] mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#F3EFE6] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#55635B] block">Price</span>
                <span className="font-serif text-lg font-bold text-[#151E19]">
                  ₹{item.basePrice}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateItem(item.id, { isAvailable: !item.isAvailable })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    item.isAvailable
                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {item.isAvailable ? "86 Item" : "Restore"}
                </button>

                <button
                  onClick={() => handleStartEdit(item)}
                  className="p-2 rounded-xl bg-[#F3EFE6] hover:bg-[#E6E1D5] text-[#1B382B] transition-colors"
                  title="Edit Item Details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit or Add Item Modal */}
      {(editingItem || isAddingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FBF9F4] rounded-3xl border border-[#E6E1D5] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1B382B]">
                {editingItem ? "Edit Menu Item" : "Create New Menu Item"}
              </h3>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsAddingNew(false);
                }}
                className="p-2 rounded-full hover:bg-[#F3EFE6] text-[#55635B]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#151E19] block mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E1D5] text-[#151E19]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#151E19] block mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E1D5] text-[#151E19]"
                  >
                    {CAFE_CONFIG.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#151E19] block mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        basePrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E1D5] text-[#151E19] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#151E19] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E1D5] text-[#151E19]"
                />
              </div>

              {/* Dietary check boxes */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) =>
                      setFormData({ ...formData, isVeg: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span>Vegetarian</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isVegan}
                    onChange={(e) =>
                      setFormData({ ...formData, isVegan: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span>Vegan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isChefSpecial}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isChefSpecial: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span>Chef Recommendation</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E6E1D5] flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsAddingNew(false);
                }}
                className="px-4 py-2 rounded-xl border border-[#E6E1D5] text-xs font-semibold text-[#55635B]"
              >
                Cancel
              </button>

              <button
                onClick={editingItem ? handleSaveEdit : handleSaveNew}
                className="px-5 py-2 rounded-xl bg-[#1B382B] text-white text-xs font-bold hover:bg-[#12241C] shadow flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-[#8EBA9D]" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
