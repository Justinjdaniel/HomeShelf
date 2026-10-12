/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { NativeHUDMessage, subscribeToHUD } from '../utils/nativeAlerts';

interface NativeSystemHUDProps {
  isDark: boolean;
}

export const NativeSystemHUD: React.FC<NativeSystemHUDProps> = ({ isDark }) => {
  const [hud, setHud] = useState<NativeHUDMessage | null>(null);

  useEffect(() => {
    return subscribeToHUD((msg) => setHud(msg));
  }, []);

  if (!hud) return null;

  const typeConfig = {
    critical: {
      border: 'border-rose-500/70',
      bg: isDark ? 'bg-[#2a0e14]/95 text-rose-100' : 'bg-rose-50/95 text-rose-950',
      iconColor: 'text-rose-400',
      glow: 'shadow-[0_12px_36px_rgba(244,63,94,0.35)]',
      accent: 'bg-rose-500',
    },
    warning: {
      border: 'border-amber-500/70',
      bg: isDark ? 'bg-[#291a07]/95 text-amber-100' : 'bg-amber-50/95 text-amber-950',
      iconColor: 'text-amber-400',
      glow: 'shadow-[0_12px_36px_rgba(245,158,11,0.3)]',
      accent: 'bg-amber-500',
    },
    success: {
      border: 'border-emerald-500/70',
      bg: isDark ? 'bg-[#092219]/95 text-emerald-100' : 'bg-emerald-50/95 text-emerald-950',
      iconColor: 'text-emerald-400',
      glow: 'shadow-[0_12px_36px_rgba(16,185,129,0.25)]',
      accent: 'bg-emerald-500',
    },
    info: {
      border: 'border-sky-500/70',
      bg: isDark ? 'bg-[#0c1f38]/95 text-sky-100' : 'bg-sky-50/95 text-sky-950',
      iconColor: 'text-sky-400',
      glow: 'shadow-[0_12px_36px_rgba(56,189,248,0.25)]',
      accent: 'bg-sky-500',
    },
  }[hud.type];

  return (
    <aside
      aria-label="System Notification"
      className="fixed top-4 inset-x-0 mx-auto z-50 w-[92%] max-w-md pointer-events-auto"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${typeConfig.bg} ${typeConfig.border} ${typeConfig.glow}`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.accent}/20 border ${typeConfig.border}`}>
          <span className={`material-symbols-outlined text-[20px] ${typeConfig.iconColor}`}>
            {hud.icon}
          </span>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold tracking-tight truncate">
              {hud.title}
            </span>
            {hud.type === 'critical' && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-rose-500 text-white tracking-wider animate-pulse">
                Critical
              </span>
            )}
          </div>
          <span className="text-[11px] opacity-90 truncate leading-snug">
            {hud.body}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-mono opacity-60">Just now</span>
        </div>
      </div>
    </aside>
  );
};
