/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  isDark?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Keep local offline record without external network telemetry
    console.error('[HomeShelf ErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    if (confirm('Clear local app session cache and reload? Your inventory database will be preserved.')) {
      sessionStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isDark = this.props.isDark !== false;
      return (
        <div
          role="alert"
          aria-live="assertive"
          className={`min-h-screen flex items-center justify-center p-6 transition-colors ${
            isDark ? 'bg-[#0b1326] text-[#f8fafc]' : 'bg-[#faf8ff] text-[#131b2e]'
          }`}
        >
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl flex flex-col gap-4 ${
              isDark ? 'bg-[#131b2e] border-[#243049]' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 text-amber-400">
              <span className="material-symbols-outlined text-[32px]">shield_with_heart</span>
              <div>
                <h1 className="text-lg font-bold">
                  {this.props.fallbackTitle || 'System Ledger Recovery Mode'}
                </h1>
                <p className="text-xs text-slate-400">
                  An unexpected render exception was safely contained by HomeShelf.
                </p>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border text-xs font-mono overflow-x-auto max-h-40 ${
                isDark ? 'bg-[#0b1326] border-[#243049] text-red-300' : 'bg-slate-50 border-slate-200 text-red-600'
              }`}
            >
              <div className="font-bold mb-1">{this.state.error?.name || 'Error'}: {this.state.error?.message}</div>
              <div className="text-[11px] text-slate-500 whitespace-pre-wrap">
                {this.state.error?.stack?.split('\n').slice(0, 3).join('\n')}
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Your offline inventory data in IndexedDB remains safe and intact. You can reload the view or reset temporary session cache below.
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-700/30">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="py-2.5 px-4 rounded-xl border border-slate-700/60 hover:bg-slate-800/40 font-semibold text-xs text-slate-300 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset Session</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
