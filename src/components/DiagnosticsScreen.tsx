/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { runAllAgenticTests, AgenticTestResult } from '../tests/agenticTestRunner';

interface DiagnosticsScreenProps {
  itemsCount?: number;
  onEnterDashboard?: () => void;
  onEnterScanner?: () => void;
  onDirectScan?: () => void;
  onClose?: () => void;
  isDark: boolean;
}

export const DiagnosticsScreen: React.FC<DiagnosticsScreenProps> = ({
  itemsCount = 142,
  onEnterDashboard,
  onEnterScanner,
  onDirectScan,
  onClose,
  isDark,
}) => {
  const [testResults, setTestResults] = useState<AgenticTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleRunAgenticTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await runAllAgenticTests();
      setTestResults(results);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleProceed = () => {
    if (onEnterDashboard) onEnterDashboard();
    else if (onClose) onClose();
  };

  const handleScan = () => {
    if (onDirectScan) onDirectScan();
    else if (onEnterScanner) onEnterScanner();
    else if (onClose) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="System Diagnostics Console"
      className={`fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 pb-8 transition-colors duration-200 overflow-y-auto ${
        isDark ? 'bg-[#0b1326] text-[#f8fafc]' : 'bg-[#faf8ff] text-[#131b2e]'
      }`}
    >
      {/* Header telemetry */}
      <div className="flex flex-col gap-3 pt-2 max-w-xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/30 overflow-hidden shadow-sm">
              <img src="/icon.svg" alt="HomeShelf Brand Mark" className="w-7 h-7 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">HomeShelf Executive Core</span>
              <span className={`text-[11px] ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                Kinetic Ledger • Nocturne Cellar Engine
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#34d399] text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% ONLINE
            </div>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close Diagnostics"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className={isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}>
              System Diagnostics &amp; Cache Warmup
            </span>
            <span className="text-[#38bdf8] font-mono">142/142 Indexed (100%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Center Animated Kinetic Shelf SVG */}
      <div className="my-auto py-4 flex flex-col items-center">
        <div className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-2xl relative border border-sky-500/20">
          <svg height="100%" viewBox="0 0 400 400" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bgGlow" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            <rect fill="url(#bgGlow)" height="400" rx="24" width="400" />

            {/* Radar circles */}
            <circle
              className="animate-pulse"
              cx="200"
              cy="190"
              fill="none"
              r="110"
              stroke="#38bdf8"
              strokeWidth="1.5"
              opacity="0.3"
            />
            <circle
              cx="200"
              cy="190"
              fill="none"
              opacity="0.25"
              r="145"
              stroke="#0ea5e9"
              strokeDasharray="6 8"
              strokeWidth="1"
            />

            {/* Kinetic Shelves representation */}
            <rect fill="#38bdf8" height="6" opacity="0.8" rx="3" width="220" x="90" y="140" />
            <rect fill="#38bdf8" height="6" opacity="0.8" rx="3" width="220" x="90" y="210" />
            <rect fill="#38bdf8" height="6" opacity="0.8" rx="3" width="220" x="90" y="280" />

            {/* Stored item icons */}
            <rect fill="#34d399" height="35" opacity="0.9" rx="4" width="28" x="110" y="105" />
            <rect fill="#38bdf8" height="30" opacity="0.8" rx="4" width="25" x="145" y="110" />
            <rect fill="#fbbf24" height="25" opacity="0.85" rx="4" width="30" x="178" y="115" />
            <rect fill="#f87171" height="40" opacity="0.9" rx="4" width="32" x="240" y="100" />

            <rect fill="#818cf8" height="38" opacity="0.85" rx="4" width="30" x="120" y="172" />
            <rect fill="#34d399" height="30" opacity="0.9" rx="4" width="26" x="160" y="180" />
            <rect fill="#fbbf24" height="45" opacity="0.9" rx="4" width="35" x="220" y="165" />

            {/* Scanning Laser Beam */}
            <line
              stroke="#38bdf8"
              strokeWidth="2.5"
              x1="60"
              x2="340"
              y1="190"
              y2="190"
              className="animate-pulse"
              filter="drop-shadow(0 0 8px #38bdf8)"
            />
          </svg>
        </div>
      </div>

      {/* Diagnostics verification items */}
      <div className="flex flex-col gap-2 max-w-xl mx-auto w-full">
        <div
          className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
            isDark ? 'bg-[#131b2e] border-[#243049]' : 'bg-white border-[#e2e8f0]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-[#38bdf8] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">database</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">Local Room Database</span>
              <span className={`text-[10px] ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                IndexedDB vault armed • {itemsCount} items loaded
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
            SYNCED
          </span>
        </div>

        <div
          className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
            isDark ? 'bg-[#131b2e] border-[#243049]' : 'bg-white border-[#e2e8f0]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-[#34d399] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">CBUAE Dirham Currency Engine</span>
              <span className={`text-[10px] ${isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                Official UAE Dirham Vector Standard active
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
            READY
          </span>
        </div>

        {/* Agentic Automated Test Suite Interactive Console */}
        <div
          className={`flex flex-col gap-2.5 p-3 rounded-xl border text-xs ${
            isDark ? 'bg-[#131b2e] border-[#243049]' : 'bg-white border-[#e2e8f0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-[18px]">verified</span>
              <div>
                <span className="font-bold text-xs block">Agentic Self-Test Suite</span>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Automated verification of metrics, DB &amp; forecasts
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRunAgenticTests}
              disabled={isRunningTests}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                isRunningTests
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-[15px] ${isRunningTests ? 'animate-spin' : ''}`}>
                {isRunningTests ? 'sync' : 'play_arrow'}
              </span>
              <span>{isRunningTests ? 'Testing...' : 'Run Agentic Tests'}</span>
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1 max-h-48 overflow-y-auto">
              {testResults.map((test) => (
                <div
                  key={test.id}
                  className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
                    test.status === 'passed'
                      ? isDark
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : isDark
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-[15px]">
                      {test.status === 'passed' ? 'check_circle' : 'cancel'}
                    </span>
                    <span className="font-semibold truncate">{test.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] opacity-75 font-mono">{test.durationMs}ms</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        test.status === 'passed' ? 'bg-emerald-500/30' : 'bg-rose-500/30'
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 mt-4 max-w-xl mx-auto w-full">
        <button
          onClick={handleProceed}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          type="button"
        >
          <span>Enter Command Dashboard</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        <button
          onClick={handleScan}
          className={`w-full py-3 px-4 rounded-xl border font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
            isDark
              ? 'bg-[#131b2e] hover:bg-[#1a243b] border-[#243049] text-[#dae2fd]'
              : 'bg-white hover:bg-slate-50 border-[#cbd5e1] text-[#131b2e]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">barcode_scanner</span>
          <span>Quick Scan Optical Sensor</span>
        </button>
      </div>
    </div>
  );
};
