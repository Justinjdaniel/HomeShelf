/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DirhamSign } from './DirhamSign';
import { SUPPORTED_CURRENCIES } from '../utils/currency';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
  glyphClassName?: string;
}

/**
 * Universal Price Display Component
 * Renders the official CBUAE Emirati Dirham vector glyph when currency is AED,
 * or standard currency symbols for other currencies, placed directly to the left of the numeric value.
 *
 * Uses optical baseline alignment (`inline-flex items-baseline leading-none`) so the Dirham glyph
 * and numbers sit on the exact same typographic baseline without vertical drift.
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  currency = 'AED',
  className = '',
  glyphClassName = 'inline-block h-[0.85em] w-[0.85em] mr-1 shrink-0 self-baseline translate-y-[0.02em]',
}) => {
  const activeCurrency =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];

  const formattedNumber = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (activeCurrency.code === 'AED') {
    return (
      <span className={`inline-flex items-baseline tabular-nums font-mono leading-none ${className}`}>
        <DirhamSign className={glyphClassName} />
        <span className="tabular-nums font-mono leading-none">{formattedNumber}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-baseline tabular-nums font-mono leading-none ${className}`}>
      {activeCurrency.prefix && <span className="mr-0.5 leading-none">{activeCurrency.symbol}</span>}
      <span className="tabular-nums font-mono leading-none">{formattedNumber}</span>
      {!activeCurrency.prefix && <span className="ml-0.5 leading-none">{activeCurrency.symbol}</span>}
    </span>
  );
};
