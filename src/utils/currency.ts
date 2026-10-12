/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
  nativeName: string;
  prefix: boolean;
  usesCustomGlyph?: boolean;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  {
    code: 'AED',
    symbol: 'AED ',
    label: 'UAE Dirham (AED)',
    nativeName: 'درهم إماراتي',
    prefix: true,
    usesCustomGlyph: true,
  },
  {
    code: 'USD',
    symbol: '$',
    label: 'US Dollar (USD)',
    nativeName: 'US Dollar',
    prefix: true,
  },
  {
    code: 'EUR',
    symbol: '€',
    label: 'Euro (EUR)',
    nativeName: 'Euro',
    prefix: true,
  },
  {
    code: 'GBP',
    symbol: '£',
    label: 'British Pound (GBP)',
    nativeName: 'British Pound',
    prefix: true,
  },
  {
    code: 'SAR',
    symbol: 'SAR ',
    label: 'Saudi Riyal (SAR)',
    nativeName: 'ريال سعودي',
    prefix: true,
  },
  {
    code: 'QAR',
    symbol: 'QAR ',
    label: 'Qatari Riyal (QAR)',
    nativeName: 'ريال قطري',
    prefix: true,
  },
  {
    code: 'INR',
    symbol: '₹',
    label: 'Indian Rupee (INR)',
    nativeName: 'Indian Rupee',
    prefix: true,
  },
];

/**
 * Returns a standard formatted string for text-only contexts.
 */
export function formatCurrency(amount: number, currencyCode: string = 'AED'): string {
  const currency =
    SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];

  const formattedNumber = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return currency.prefix
    ? `${currency.symbol}${formattedNumber}`
    : `${formattedNumber} ${currency.symbol}`;
}
