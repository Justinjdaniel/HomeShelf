/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export const MASTER_ICONS_LIST = [
  // Categories & Food
  { id: 'local_drink', label: 'Beverage / Milk' },
  { id: 'nutrition', label: 'Produce / Fruit' },
  { id: 'kitchen', label: 'Pantry / Kitchen' },
  { id: 'coffee', label: 'Coffee / Tea' },
  { id: 'restaurant', label: 'Meal / Dining' },
  { id: 'lunch_dining', label: 'Lunch / Prepared' },
  { id: 'bakery_dining', label: 'Bread / Bakery' },
  { id: 'egg', label: 'Eggs / Dairy' },
  { id: 'cookie', label: 'Snacks / Biscuits' },
  { id: 'icecream', label: 'Frozen / Dessert' },
  { id: 'water_drop', label: 'Water / Oil' },
  { id: 'liquor', label: 'Wine / Liquors' },

  // Household & Pharmacy
  { id: 'medication', label: 'Medical / Drugs' },
  { id: 'medical_services', label: 'First Aid' },
  { id: 'cleaning_services', label: 'Cleaning Spray' },
  { id: 'soap', label: 'Soap / Wash' },
  { id: 'sanitizer', label: 'Sanitizer / Hygiene' },
  { id: 'wash', label: 'Laundry / Detergent' },
  { id: 'auto_fix_high', label: 'Beauty / Care' },

  // Rooms & Locations
  { id: 'room', label: 'Room / General' },
  { id: 'home', label: 'Home / Living' },
  { id: 'shelves', label: 'Shelves / Pantry' },
  { id: 'warehouse', label: 'Storage / Cellar' },
  { id: 'garage', label: 'Garage / Workshop' },
  { id: 'desk', label: 'Office / Study' },
  { id: 'countertops', label: 'Countertop' },
  { id: 'inventory_2', label: 'Storage Box / Vault' },
  { id: 'ac_unit', label: 'Refrigerator / Cold' },
  { id: 'severe_cold', label: 'Deep Freezer' },

  // Tools & Supplies
  { id: 'handyman', label: 'Tools / Hardware' },
  { id: 'build', label: 'Workshop / Maintenance' },
  { id: 'devices', label: 'Electronics / Cables' },
  { id: 'pets', label: 'Pet Food & Supplies' },
  { id: 'child_care', label: 'Baby / Child Care' },
  { id: 'star', label: 'Essential / VIP' },
  { id: 'label', label: 'General Tag' },
  { id: 'category', label: 'Category' },
];

interface IconPickerModalProps {
  currentIcon?: string;
  isOpen: boolean;
  onSelectIcon: (iconName: string) => void;
  onClose: () => void;
  title?: string;
  isDark: boolean;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  currentIcon,
  isOpen,
  onSelectIcon,
  onClose,
  title = 'Select Visual Icon',
  isDark,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredIcons = MASTER_ICONS_LIST.filter(
    (item) =>
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="icon-picker-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        className={`w-full max-w-md rounded-2xl border p-4 shadow-2xl flex flex-col gap-3.5 max-h-[85vh] transition-all ${
          isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-2 border-b ${
          isDark ? 'border-slate-700/40' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-400 text-[20px]">palette</span>
            <h3 id="icon-picker-title" className="text-sm font-bold tracking-tight">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Icon Picker"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons (e.g. coffee, kitchen, fridge)..."
            className={`w-full h-8.5 pl-8 pr-3 rounded-lg border text-xs outline-none ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400 focus:border-sky-400'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
            }`}
            autoFocus
          />
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 overflow-y-auto max-h-64 p-1">
          {filteredIcons.map((ic) => {
            const isSelected = currentIcon === ic.id;
            return (
              <button
                key={ic.id}
                type="button"
                onClick={() => {
                  onSelectIcon(ic.id);
                  onClose();
                }}
                title={ic.label}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group ${
                  isSelected
                    ? 'border-sky-400 bg-sky-500/20 text-sky-300 ring-2 ring-sky-400/50'
                    : isDark
                    ? 'border-slate-800 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">
                  {ic.id}
                </span>
                <span className="text-[9px] font-medium truncate w-full text-center opacity-80">
                  {ic.label.split('/')[0].trim()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${
          isDark ? 'border-slate-700/40 text-slate-400' : 'border-slate-200 text-slate-600'
        }`}>
          <span>{filteredIcons.length} available icons</span>
          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-colors ${
              isDark
                ? 'border-slate-600 hover:bg-slate-700/50 text-slate-300'
                : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
