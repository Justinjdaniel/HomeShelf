/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavTab } from './BottomNav';

interface HeaderProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  shoppingCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onOpenDiagnostics: () => void;
  subtitle?: string;
  syncStatus?: 'synced' | 'syncing' | 'idle';
  lastSyncedText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  onOpenSettings,
  onOpenSearch,
  onOpenDiagnostics,
  subtitle = 'Dashboard Inventory',
  syncStatus = 'synced',
  lastSyncedText = 'Synced just now',
}) => {
  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 sticky-elevate ${
        isDark
          ? 'bg-[#0b1326]/90 border-[#243049] text-[#f8fafc]'
          : 'bg-[#faf8ff]/90 border-[#e2e8f0] text-[#131b2e]'
      }`}
    >
      <div className="h-16 px-4 md:px-8 flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left Slot: Clean Brand Mark & Status (No redundant hamburger button) */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex items-center gap-3 flex-shrink-0 cursor-pointer group"
            onClick={onOpenDiagnostics}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onOpenDiagnostics();
            }}
            aria-label="HomeShelf Diagnostics Overview"
          >
            {/* Unified App Icon */}
            <div className="relative">
              <img
                alt="HomeShelf Brand Icon"
                className="h-8 w-8 object-contain flex-shrink-0 rounded-lg shadow-sm transition-transform group-hover:scale-105"
                src="/icon.svg"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ${
                isDark ? 'ring-[#0b1326]' : 'ring-white'
              }`} />
            </div>

            <div className="flex flex-col flex-shrink-0">
              <div className="flex items-center gap-2 flex-nowrap">
                <span className={`text-[15px] font-bold tracking-tight whitespace-nowrap transition-colors ${
                  isDark ? 'text-[#f8fafc] group-hover:text-sky-300' : 'text-[#131b2e] group-hover:text-sky-600'
                }`}>
                  HomeShelf
                </span>
                {/* Auto Executive Cache Sync Status Pill */}
                <span
                  role="status"
                  aria-live="polite"
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30 text-[10px] font-semibold leading-none flex-shrink-0"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      syncStatus === 'syncing' ? 'bg-amber-400 animate-spin' : 'bg-[#10b981] animate-pulse'
                    }`}
                  />
                  <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Synced'}</span>
                </span>
              </div>
              <span className={`text-[11px] whitespace-nowrap truncate ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                {subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Center Slot: Live Sync Health Telemetry (Desktop) */}
        <div className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono transition-colors ${
          isDark ? 'border-slate-700/40 bg-slate-800/20 text-slate-400' : 'border-slate-200 bg-slate-100/80 text-slate-600'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local Vault Online • {lastSyncedText}</span>
        </div>

        {/* Right Slot: Clean icon buttons with proper spacing & hover animations */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Diagnostics Console Button (Moved cleanly to right header) */}
          <button
            aria-label="Open Diagnostics System Console"
            onClick={onOpenDiagnostics}
            title="Open Diagnostics Console"
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              isDark
                ? 'text-[#94a3b8] hover:text-[#38bdf8] hover:bg-[#1a243b]'
                : 'text-[#64748b] hover:text-[#0284c7] hover:bg-[#eef0ff]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">monitor_heart</span>
          </button>

          {/* Search Inventory Button */}
          <button
            aria-label="Search Inventory Catalog"
            onClick={onOpenSearch}
            title="Search Inventory"
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              isDark
                ? 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1a243b]'
                : 'text-[#64748b] hover:text-[#131b2e] hover:bg-[#eef0ff]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            aria-label="Toggle Theme Mode"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              isDark ? 'text-[#38bdf8] hover:bg-[#1a243b]' : 'text-[#0284c7] hover:bg-[#eef0ff]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* User Profile & Master Data Settings Trigger */}
          <button
            aria-label="Master Data Settings and Vault Management"
            onClick={onOpenSettings}
            title="Open Master Data Settings & Vault"
            className={`w-9 h-9 flex items-center justify-center rounded-full hover:opacity-90 active:scale-95 transition-all duration-200 ml-0.5 ring-1 hover:ring-2 hover:ring-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              isDark ? 'ring-[#243049]' : 'ring-[#cbd5e1]'
            }`}
            type="button"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBs_kAgV0VxgWYRrIJiB6Yw6NuvnBeTY6o8l6QyJp8dzH2ve5IpPqTjEpc-2lDw7NPm_HQEosEsizJWmxesfLdfULih1Crd_jFOqm1xNoCIxgPzgRQ3TkH6PRRg3txxBdvuCtc6BN7uKZ7mK_Msgzobh4vG5nrgE0KwlVhMnBtbDkhrrKoZieIdhjjfWZbtZy9BT4RPW8zNdr6xEZacqVDc50NnwWmCoXidnWib95zV32nzS88AAAG0"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
