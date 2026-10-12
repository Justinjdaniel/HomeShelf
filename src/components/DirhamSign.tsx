/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface DirhamSignProps {
  className?: string;
  size?: number | string;
  ariaLabel?: string;
}

/**
 * Official Emirati Dirham Sign (CBUAE)
 * Unveiled on March 27, 2025 by the Central Bank of the United Arab Emirates.
 * Assigned code point U+20C3 in Unicode 18.0.
 *
 * Design: A stylized Latin letter 'D' crossed with two horizontal lines
 * representing financial stability and inspired by the UAE national flag.
 * Usage: Placed directly to the left of the numeric value, optically baseline-aligned.
 */
export const DirhamSign: React.FC<DirhamSignProps> = ({
  className = 'inline-block h-[0.88em] w-[0.88em] shrink-0 align-baseline',
  size,
  ariaLabel = 'AED',
}) => {
  return (
    <svg
      viewBox="1 2.5 22 19"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      role="img"
      aria-label={ariaLabel}
    >
      {/* Outer stylized Latin letter D curved bowl and stem */}
      <path d="M5.5 3.5h6.5a8.5 8.5 0 0 1 8.5 8.5 8.5 8.5 0 0 1-8.5 8.5H5.5V3.5z" />
      {/* Two horizontal crossbars representing financial stability & UAE flag */}
      <line x1="2.5" y1="9.5" x2="16.5" y2="9.5" strokeWidth="2.2" />
      <line x1="2.5" y1="14.5" x2="16.5" y2="14.5" strokeWidth="2.2" />
    </svg>
  );
};
