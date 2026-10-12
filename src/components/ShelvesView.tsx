/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryItem, MasterLocation, MasterShelf } from '../types/inventory';
import { PriceDisplay } from './PriceDisplay';

interface ShelvesViewProps {
  items: InventoryItem[];
  locations: MasterLocation[];
  shelves: MasterShelf[];
  currency?: string;
  onSelectItem: (item: InventoryItem) => void;
  onOpenQuickAdd: () => void;
  isDark: boolean;
}

export const ShelvesView: React.FC<ShelvesViewProps> = ({
  items,
  locations,
  shelves,
  currency = 'AED',
  onSelectItem,
  onOpenQuickAdd,
  isDark,
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [expandedShelfId, setExpandedShelfId] = useState<string | null>(null);

  // Filter shelves
  const visibleShelves =
    selectedLocationId === 'all'
      ? shelves
      : shelves.filter((s) => s.locationId === selectedLocationId);

  const currentLocation = locations.find((l) => l.id === selectedLocationId);

  return (
    <div className="flex flex-col w-full gap-4 max-w-6xl mx-auto pt-2 pb-28 px-4">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8]">
            <button
              onClick={() => setSelectedLocationId('all')}
              className="hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded px-1"
            >
              <span className="material-symbols-outlined text-[15px]">home_pin</span>
              <span>Home Hierarchy</span>
            </button>
            {currentLocation && (
              <>
                <span className="text-slate-500">/</span>
                <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                  {currentLocation.name}
                </span>
              </>
            )}
          </div>
          <h2 className="text-lg font-bold tracking-tight mt-0.5">Physical Storage Hierarchy</h2>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="text-xs font-semibold text-[#38bdf8] flex items-center gap-1 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded px-1.5 py-1"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span>Add Item</span>
        </button>
      </div>

      {/* Horizontal Filter Chips */}
      <div
        role="tablist"
        aria-label="Storage Locations"
        className="flex items-center gap-2 overflow-x-auto pb-1.5 -mx-4 px-4 no-scrollbar"
      >
        <button
          role="tab"
          aria-selected={selectedLocationId === 'all'}
          onClick={() => setSelectedLocationId('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 flex items-center gap-1.5 ${
            selectedLocationId === 'all'
              ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-md shadow-sky-500/20'
              : isDark
              ? 'bg-[#131b2e] text-[#f8fafc] border border-[#243049] hover:bg-[#1a243b] hover:border-slate-600'
              : 'bg-white text-[#131b2e] border border-[#cbd5e1] hover:bg-slate-50'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">grid_view</span>
          <span>All Locations ({locations.length})</span>
        </button>

        {locations.map((loc) => {
          const count = items.filter((i) => i.locationId === loc.id).length;
          const isSelected = selectedLocationId === loc.id;
          return (
            <button
              key={loc.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedLocationId(loc.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-md shadow-sky-500/20 ring-1 ring-sky-400/50'
                  : isDark
                  ? 'bg-[#131b2e] text-[#f8fafc] border border-[#243049] hover:bg-[#1a243b] hover:border-slate-600'
                  : 'bg-white text-[#131b2e] border border-[#cbd5e1] hover:bg-slate-50'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px] opacity-80">{loc.icon || 'room'}</span>
              <span>{loc.name}</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Shelves List */}
      <div className="flex flex-col gap-3">
        {visibleShelves.map((shelf) => {
          const shelfItems = items.filter((i) => i.shelfId === shelf.id);
          const isExpanded = expandedShelfId === shelf.id || visibleShelves.length <= 3;
          const shelfTotalVal = shelfItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

          return (
            <div
              key={shelf.id}
              className={`border rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-all duration-200 ${
                isDark
                  ? 'bg-[#131b2e] border-[#243049] hover:border-slate-700'
                  : 'bg-white border-[#e2e8f0] hover:border-slate-300'
              }`}
            >
              {/* Shelf Title & Summary */}
              <div
                onClick={() =>
                  setExpandedShelfId(expandedShelfId === shelf.id ? null : shelf.id)
                }
                className={`flex items-center justify-between cursor-pointer select-none p-1.5 -m-1.5 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[22px]">shelves</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm tracking-tight truncate">{shelf.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          shelf.healthStatus === 'near_limit'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {shelf.healthStatus === 'near_limit' ? 'Near Limit' : 'Optimal'}
                      </span>
                    </div>
                    <span className={`text-[11px] mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {shelfItems.length} assets stored • Valued at{' '}
                      <PriceDisplay amount={shelfTotalVal} currency={currency} />
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold font-mono text-sky-400 tabular-nums">
                    {shelf.capacityPercent}% Full
                  </span>
                  <span
                    className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-sky-400' : 'text-slate-400'
                    }`}
                  >
                    expand_more
                  </span>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    shelf.capacityPercent >= 85
                      ? 'bg-red-500'
                      : shelf.capacityPercent >= 65
                      ? 'bg-amber-400'
                      : 'bg-sky-400'
                  }`}
                  style={{ width: `${shelf.capacityPercent}%` }}
                />
              </div>

              {/* Item Previews Grid */}
              {isExpanded && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2 border-t border-slate-700/40">
                  {shelfItems.map((item) => (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectItem(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onSelectItem(item);
                      }}
                      className={`flex flex-col border rounded-xl p-2.5 min-w-0 cursor-pointer active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                        item.status === 'expired'
                          ? 'bg-[#2a080c] border-[#7f1d1d]/60 text-red-200'
                          : isDark
                          ? 'bg-[#1a243b] border-[#243049]/60 hover:border-sky-500/50'
                          : 'bg-slate-50 border-slate-200 hover:border-sky-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-6 h-6 rounded object-cover border border-slate-600"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-[18px] text-sky-400">
                            {item.categoryId === 'cat_dairy'
                              ? 'local_drink'
                              : item.categoryId === 'cat_medical'
                              ? 'medication'
                              : item.categoryId === 'cat_tools'
                              ? 'build'
                              : 'inventory_2'}
                          </span>
                        )}
                        <span className="font-semibold text-xs tabular-nums">
                          {item.quantity} {item.unitId.replace('unit_', '')}
                        </span>
                      </div>
                      <span className="text-xs font-semibold truncate">{item.name}</span>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span
                          className={`font-semibold ${
                            item.status === 'expired'
                              ? 'text-red-400'
                              : item.status === 'low_stock'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {item.status === 'expired'
                            ? 'Expired'
                            : item.status === 'low_stock'
                            ? 'Low'
                            : 'Optimal'}
                        </span>
                        <PriceDisplay amount={item.price} currency={currency} />
                      </div>
                    </div>
                  ))}

                  {shelfItems.length === 0 && (
                    <div className="col-span-full py-4 text-center text-xs text-slate-500 italic">
                      No items stored on this shelf yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
