/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryItem } from '../types/inventory';

interface SearchModalProps {
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  onClose: () => void;
  isDark: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  items,
  onSelectItem,
  onClose,
  isDark,
}) => {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? items.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.barcode.includes(query) ||
          i.shelfLocation.toLowerCase().includes(query.toLowerCase())
      )
    : items.slice(0, 8); // show first 8 as recent

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 pt-16">
      <div
        className={`w-full max-w-lg rounded-2xl border p-4 shadow-2xl flex flex-col gap-3 max-h-[80vh] overflow-hidden ${
          isDark ? 'bg-[#131b2e] border-[#243049] text-[#f8fafc]' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2 border-b pb-3 border-slate-700/40">
          <span className="material-symbols-outlined text-[22px] text-sky-400">search</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 142 items by name, barcode SKU, or room..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
          />
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[60vh] pr-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            {query.trim() ? `Search Results (${filtered.length})` : 'Quick Pick Catalog'}
          </span>

          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectItem(item);
                onClose();
              }}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer active:scale-98 transition-all ${
                isDark ? 'bg-[#1a243b] border-[#243049] hover:bg-[#222a3d]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img alt={item.name} className="w-full h-full object-cover" src={item.imageUrl} />
                  ) : (
                    <span className="material-symbols-outlined text-[18px] text-sky-400">
                      inventory_2
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold truncate">{item.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{item.shelfLocation}</span>
                </div>
              </div>

              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-xs font-bold tabular-nums">
                  {item.quantity} {item.unitId.replace('unit_', '')}
                </span>
                <span className="text-[10px] font-mono text-sky-400">{item.barcode}</span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              No inventory matching "{query}" found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
