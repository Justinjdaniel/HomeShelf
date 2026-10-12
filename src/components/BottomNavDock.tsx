/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavTab } from './BottomNav';

interface BottomNavDockProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  shoppingCount: number;
  isDark: boolean;
  onOpenQuickAdd?: () => void;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({
  currentTab,
  onTabChange,
  shoppingCount,
  isDark,
  onOpenQuickAdd,
}) => {
  const navItems: Array<{
    tab: NavTab;
    label: string;
    icon: string;
    badge?: number;
  }> = [
    { tab: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { tab: 'shelves', label: 'Shelves', icon: 'shelves' },
    { tab: 'shopping', label: 'Restock', icon: 'checklist', badge: shoppingCount },
    { tab: 'scanner', label: 'Scanner', icon: 'barcode_scanner' },
  ];

  return (
    <nav
      aria-label="Primary Navigation Dock"
      className="fixed bottom-5 inset-x-0 mx-auto z-40 w-fit max-w-[calc(100vw-1.5rem)] px-1 pointer-events-auto"
    >
      <div
        className={`flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-full border shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
          isDark
            ? 'bg-[#0f172a]/85 border-slate-700/60 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-slate-300'
            : 'bg-white/90 border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.12)] text-slate-700'
        }`}
      >
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onTabChange(item.tab)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.label} View${item.badge ? `, ${item.badge} items` : ''}`}
              className={`relative flex items-center gap-2 min-h-[44px] min-w-[44px] px-3.5 sm:px-4 py-2 rounded-full font-semibold text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 active:scale-95 group hover:-translate-y-0.5 ${
                isActive
                  ? isDark
                    ? 'bg-gradient-to-r from-sky-500/25 to-teal-500/25 text-sky-300 border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                    : 'bg-sky-50 text-sky-700 border border-sky-300/80 shadow-[0_0_15px_rgba(2,132,199,0.15)]'
                  : isDark
                  ? 'hover:bg-slate-800/60 hover:text-white'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                {item.icon}
              </span>

              {/* Responsive Text Label: hidden on small phones, visible on sm+ */}
              <span className="hidden sm:inline-block tracking-tight">
                {item.label}
              </span>

              {/* Dynamic Restock Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  aria-hidden="true"
                  className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center tabular-nums leading-none transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'bg-sky-400 text-slate-950 font-black'
                      : 'bg-amber-400 text-slate-950'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Active Underglow Dot */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,1)] sm:hidden" />
              )}
            </button>
          );
        })}

        {/* Separator */}
        {onOpenQuickAdd && (
          <div
            className={`w-px h-6 mx-0.5 sm:mx-1 ${
              isDark ? 'bg-slate-700/60' : 'bg-slate-200'
            }`}
          />
        )}

        {/* Quick Add Action Trigger */}
        {onOpenQuickAdd && (
          <button
            type="button"
            onClick={onOpenQuickAdd}
            aria-label="Quick Add Inventory Item"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white shadow-md active:scale-90 hover:scale-105 hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        )}
      </div>
    </nav>
  );
};
