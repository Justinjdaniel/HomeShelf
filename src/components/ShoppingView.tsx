/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryItem } from '../types/inventory';
import { PriceDisplay } from './PriceDisplay';

interface ShoppingViewProps {
  items: InventoryItem[];
  currency?: string;
  onCommitRestock: (itemIds: string[]) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onShowToast: (message: string) => void;
  isDark: boolean;
}

type ShoppingFilter = 'all' | 'urgent' | 'pantry' | 'household' | 'checked';

export const ShoppingView: React.FC<ShoppingViewProps> = ({
  items,
  currency = 'AED',
  onCommitRestock,
  onUpdateQuantity,
  onShowToast,
  isDark,
}) => {
  const [activeFilter, setActiveFilter] = useState<ShoppingFilter>('all');
  const [storeRouteActive, setStoreRouteActive] = useState(true);
  const [autoShelveActive, setAutoShelveActive] = useState(true);

  const shoppingItems = items.filter((i) => i.inShoppingList);

  const [checkedItemIds, setCheckedItemIds] = useState<Set<string>>(() => {
    // Default all items in shopping list to checked
    return new Set(items.filter((i) => i.inShoppingList).map((i) => i.id));
  });

  const toggleCheck = (id: string) => {
    setCheckedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchRestock = () => {
    const ids = Array.from(checkedItemIds);
    if (ids.length === 0) {
      onShowToast('Please select at least one item to restock');
      return;
    }
    onCommitRestock(ids);
    onShowToast(`Restocked ${ids.length} items to their designated shelves!`);
  };

  // Dynamic filter tallies computed directly from shopping items state
  const totalCount = shoppingItems.length;
  const urgentCount = shoppingItems.filter(
    (i) => i.status === 'expired' || i.status === 'expiring_soon'
  ).length;
  const pantryCount = shoppingItems.filter(
    (i) => i.categoryId === 'cat_pantry' || i.categoryId === 'cat_dairy' || i.categoryId === 'cat_produce'
  ).length;
  const householdCount = shoppingItems.filter(
    (i) => i.categoryId === 'cat_household' || i.categoryId === 'cat_tools' || i.categoryId === 'cat_medical'
  ).length;
  const checkedCount = shoppingItems.filter((i) => checkedItemIds.has(i.id)).length;

  const urgentExpiredCount = shoppingItems.filter((i) => i.status === 'expired').length;
  const lowStockCount = shoppingItems.filter(
    (i) => i.status === 'low_stock' || i.status === 'expiring_soon'
  ).length;

  // Filter items based on active selection
  const filteredItems = shoppingItems.filter((i) => {
    if (activeFilter === 'urgent') return i.status === 'expired' || i.status === 'expiring_soon';
    if (activeFilter === 'pantry') {
      return i.categoryId === 'cat_pantry' || i.categoryId === 'cat_dairy' || i.categoryId === 'cat_produce';
    }
    if (activeFilter === 'household') {
      return i.categoryId === 'cat_household' || i.categoryId === 'cat_tools' || i.categoryId === 'cat_medical';
    }
    if (activeFilter === 'checked') return checkedItemIds.has(i.id);
    return true;
  });

  // Calculate total units and total estimated cost of checked items
  const totalCheckedUnits = Array.from(checkedItemIds).reduce((acc, id) => {
    const item = items.find((i) => i.id === id);
    return acc + (item?.shoppingQuantity || item?.targetQuantity || 1);
  }, 0);

  const totalEstimatedCost = Array.from(checkedItemIds).reduce((acc, id) => {
    const item = items.find((i) => i.id === id);
    const qty = item?.shoppingQuantity || item?.targetQuantity || 1;
    return acc + (item?.price || 0) * qty;
  }, 0);

  return (
    <div className="flex flex-col w-full gap-4 max-w-6xl mx-auto pt-2 pb-28 px-4">
      {/* 1. Active Restock Queue Header Card */}
      <div
        className={`relative overflow-hidden rounded-xl p-4 sm:p-5 shadow-md border transition-colors ${
          isDark
            ? 'bg-[#171f33] border-[#243049] text-[#f8fafc]'
            : 'bg-white border-[#e2e8f0] text-[#131b2e]'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2 relative">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-sky-500/20 text-[#38bdf8]">
                <span className="material-symbols-outlined text-[16px]">shopping_basket</span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8]">
                Active Restock Queue
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {totalCount} Items to Replenish
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
              Dynamic inventory threshold &amp; expiration trigger pipeline
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {urgentExpiredCount > 0 && (
              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 text-[#f87171] border border-red-500/30 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {urgentExpiredCount} Urgent Expired
              </span>
            )}
            <span
              className={`inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                isDark ? 'bg-[#222a3d] text-sky-200' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {lowStockCount} Low Stock
            </span>
          </div>
        </div>

        {/* Toggles & Mode Selection */}
        <div
          className={`grid grid-cols-2 gap-2 pt-2 mt-2 border-t rounded-lg p-1.5 ${
            isDark ? 'bg-[#131b2e] border-[#243049]' : 'bg-slate-50 border-[#e2e8f0]'
          }`}
        >
          <button
            onClick={() => {
              setStoreRouteActive(!storeRouteActive);
              onShowToast(
                storeRouteActive
                  ? 'Store aisle routing disabled'
                  : 'Store aisle route sorting activated'
              );
            }}
            className={`flex items-center justify-between p-2.5 rounded-lg border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              isDark ? 'bg-[#171f33] border-[#243049]' : 'bg-white border-[#cbd5e1]'
            }`}
            type="button"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">route</span>
              <span className="text-xs font-semibold truncate">Store Route</span>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                storeRouteActive ? 'bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'
              }`}
            />
          </button>

          <button
            onClick={() => {
              setAutoShelveActive(!autoShelveActive);
              onShowToast(
                autoShelveActive
                  ? 'Auto-shelve disabled'
                  : 'Auto-shelve on restock confirmed'
              );
            }}
            className={`flex items-center justify-between p-2.5 rounded-lg border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              isDark ? 'bg-[#171f33] border-[#243049]' : 'bg-white border-[#cbd5e1]'
            }`}
            type="button"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#34d399] text-[18px]">auto_fix_high</span>
              <span className="text-xs font-semibold truncate">Auto-Shelve</span>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                autoShelveActive ? 'bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. Primary Bulk Restock Action Surface */}
      <button
        onClick={handleBatchRestock}
        className="w-full flex items-center justify-between min-h-[52px] px-4 py-3 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-semibold text-sm shadow-lg active:scale-98 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        type="button"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white">
            <span className="material-symbols-outlined text-[20px]">shelves</span>
          </span>
          <div className="flex flex-col text-left">
            <span>Restock All Checked to Shelves</span>
            <span className="text-[11px] text-sky-100 font-normal">
              Est. <PriceDisplay amount={totalEstimatedCost} currency={currency} />
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full text-xs font-bold tabular-nums">
          <span>{totalCheckedUnits} Units</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </div>
      </button>

      {/* 3. Filter Chips Row with Accurate Dynamic Tallies */}
      <div
        role="tablist"
        aria-label="Shopping Filter Categories"
        className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar"
      >
        {/* Filter: All */}
        <button
          role="tab"
          aria-selected={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
            activeFilter === 'all'
              ? 'bg-[#38bdf8] text-[#00354a] shadow-sm'
              : isDark
              ? 'bg-[#1a243b] text-[#dae2fd] hover:bg-[#243049]'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
          type="button"
        >
          <span>All</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
              activeFilter === 'all'
                ? 'bg-[#00354a] text-[#38bdf8]'
                : isDark
                ? 'bg-slate-800 text-slate-300'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* Filter: Urgent Replenish */}
        <button
          role="tab"
          aria-selected={activeFilter === 'urgent'}
          onClick={() => setActiveFilter('urgent')}
          className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
            activeFilter === 'urgent'
              ? 'bg-[#ef4444] text-white shadow-sm'
              : isDark
              ? 'bg-[#1a243b] text-[#f87171] hover:bg-[#243049]'
              : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
          }`}
          type="button"
        >
          <span>Urgent Replenish</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
              activeFilter === 'urgent'
                ? 'bg-white text-red-600'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {urgentCount}
          </span>
        </button>

        {/* Filter: Pantry */}
        <button
          role="tab"
          aria-selected={activeFilter === 'pantry'}
          onClick={() => setActiveFilter('pantry')}
          className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
            activeFilter === 'pantry'
              ? 'bg-[#38bdf8] text-[#00354a] shadow-sm'
              : isDark
              ? 'bg-[#1a243b] text-[#dae2fd] hover:bg-[#243049]'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
          type="button"
        >
          <span>Pantry</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
              activeFilter === 'pantry'
                ? 'bg-[#00354a] text-[#38bdf8]'
                : isDark
                ? 'bg-slate-800 text-slate-300'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {pantryCount}
          </span>
        </button>

        {/* Filter: Household */}
        <button
          role="tab"
          aria-selected={activeFilter === 'household'}
          onClick={() => setActiveFilter('household')}
          className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
            activeFilter === 'household'
              ? 'bg-[#38bdf8] text-[#00354a] shadow-sm'
              : isDark
              ? 'bg-[#1a243b] text-[#dae2fd] hover:bg-[#243049]'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
          type="button"
        >
          <span>Household</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
              activeFilter === 'household'
                ? 'bg-[#00354a] text-[#38bdf8]'
                : isDark
                ? 'bg-slate-800 text-slate-300'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {householdCount}
          </span>
        </button>

        {/* Filter: Checked */}
        <button
          role="tab"
          aria-selected={activeFilter === 'checked'}
          onClick={() => setActiveFilter('checked')}
          className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
            activeFilter === 'checked'
              ? 'bg-emerald-500 text-white shadow-sm'
              : isDark
              ? 'bg-[#1a243b] text-emerald-400 hover:bg-[#243049]'
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
          }`}
          type="button"
        >
          <span>Checked</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
              activeFilter === 'checked'
                ? 'bg-white text-emerald-700'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {checkedCount}
          </span>
        </button>
      </div>

      {/* 4. Restock Items Queue Cards */}
      <div className="flex flex-col gap-2.5">
        {filteredItems.length === 0 ? (
          <div
            className={`p-8 rounded-xl border text-center flex flex-col items-center justify-center gap-2 ${
              isDark ? 'bg-[#131b2e] border-[#243049] text-slate-400' : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            <span className="material-symbols-outlined text-[36px] text-slate-500">done_all</span>
            <p className="font-semibold text-sm">No items in this filter view</p>
            <p className="text-xs">Your shelves are fully stocked for this category.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isChecked = checkedItemIds.has(item.id);
            const reqQuantity = item.shoppingQuantity || item.targetQuantity || 1;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isChecked
                    ? isDark
                      ? 'bg-[#172036] border-[#2d3a57]'
                      : 'bg-white border-slate-200 shadow-sm'
                    : isDark
                    ? 'bg-[#111827]/70 border-slate-800 opacity-60'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                {/* Checkbox & Item Summary */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleCheck(item.id)}
                    aria-label={`Toggle check for ${item.name}`}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 active:scale-90 ${
                      isChecked
                        ? 'bg-sky-500 border-sky-400 text-white shadow-sm'
                        : isDark
                        ? 'border-slate-600 bg-slate-800/40 text-transparent'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  </button>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm truncate">{item.name}</span>
                      {item.status === 'expired' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                          Expired
                        </span>
                      )}
                      {item.status === 'expiring_soon' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                          Expiring
                        </span>
                      )}
                    </div>
                    <div className={`text-xs flex items-center gap-2 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>{item.shelfLocation}</span>
                      <span>•</span>
                      <span>
                        <PriceDisplay amount={item.price * reqQuantity} currency={currency} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tactile Stepper Controls */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                      isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>

                  <span className="w-8 text-center font-bold font-mono text-sm tabular-nums">
                    {reqQuantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                      isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
