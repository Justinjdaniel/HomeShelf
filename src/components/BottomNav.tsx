/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type NavTab = 'dashboard' | 'shelves' | 'shopping' | 'scanner';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  shoppingCount: number;
  isDark: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  shoppingCount,
  isDark,
}) => {
  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t pb-safe md:hidden transition-colors duration-200 ${
        isDark ? 'bg-[#0b1326]/95 border-[#243049]' : 'bg-[#faf8ff]/95 border-[#e2e8f0]'
      }`}
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {/* Tab 1: Dashboard / Inventory */}
        <button
          aria-label="Inventory Dashboard"
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[70px] min-h-[48px] transition-colors ${
            currentTab === 'dashboard'
              ? isDark ? 'text-[#38bdf8] font-bold' : 'text-[#0284c7] font-bold'
              : isDark ? 'text-[#94a3b8] hover:text-[#f8fafc]' : 'text-[#64748b] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <div
            className={`flex items-center justify-center w-12 h-6 rounded-full transition-colors ${
              currentTab === 'dashboard'
                ? isDark ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'bg-[#0284c7]/15 text-[#0284c7]'
                : ''
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">space_dashboard</span>
          </div>
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </button>

        {/* Tab 2: Shelves & Rooms */}
        <button
          aria-label="Storage Shelves and Rooms"
          onClick={() => onTabChange('shelves')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[70px] min-h-[48px] transition-colors ${
            currentTab === 'shelves'
              ? isDark ? 'text-[#38bdf8] font-bold' : 'text-[#0284c7] font-bold'
              : isDark ? 'text-[#94a3b8] hover:text-[#f8fafc]' : 'text-[#64748b] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <div
            className={`flex items-center justify-center w-12 h-6 rounded-full transition-colors ${
              currentTab === 'shelves'
                ? isDark ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'bg-[#0284c7]/15 text-[#0284c7]'
                : ''
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">shelves</span>
          </div>
          <span className="text-[10px] tracking-tight">Shelves</span>
        </button>

        {/* Tab 3: Shopping / Restock Queue */}
        <button
          aria-label="Shopping Restock Queue"
          onClick={() => onTabChange('shopping')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[70px] min-h-[48px] transition-colors relative ${
            currentTab === 'shopping'
              ? isDark ? 'text-[#38bdf8] font-bold' : 'text-[#0284c7] font-bold'
              : isDark ? 'text-[#94a3b8] hover:text-[#f8fafc]' : 'text-[#64748b] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <div
            className={`flex items-center justify-center w-12 h-6 rounded-full transition-colors relative ${
              currentTab === 'shopping'
                ? isDark ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'bg-[#0284c7]/15 text-[#0284c7]'
                : ''
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">checklist</span>
            {shoppingCount > 0 && (
              <span className="absolute -top-1 right-2 min-w-[15px] h-3.5 px-1 rounded-full bg-[#fbbf24] text-[#0b1326] text-[9px] font-bold flex items-center justify-center shadow-sm">
                {shoppingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Shopping</span>
        </button>

        {/* Tab 4: Optical Scanner */}
        <button
          aria-label="Optical Barcode Scanner"
          onClick={() => onTabChange('scanner')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[70px] min-h-[48px] transition-colors ${
            currentTab === 'scanner'
              ? isDark ? 'text-[#38bdf8] font-bold' : 'text-[#0284c7] font-bold'
              : isDark ? 'text-[#94a3b8] hover:text-[#f8fafc]' : 'text-[#64748b] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <div
            className={`flex items-center justify-center w-12 h-6 rounded-full transition-colors ${
              currentTab === 'scanner'
                ? isDark ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'bg-[#0284c7]/15 text-[#0284c7]'
                : ''
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">barcode_scanner</span>
          </div>
          <span className="text-[10px] tracking-tight">Scanner</span>
        </button>
      </div>
    </nav>
  );
};
