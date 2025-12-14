import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with clsx.
 * Handles conditional classes and resolves Tailwind class conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the holding unit for display.
 * For forex pairs, shows the quote currency instead of the pair name.
 * USDTRY -> TRY (you're holding TRY)
 * TRYUSD -> USD (you're holding USD)
 */
export function getHoldingUnit(symbol: string): string {
  if (symbol === 'USDTRY') return 'TRY';
  if (symbol === 'TRYUSD') return 'USD';
  return symbol;
}

/**
 * Format options for currency display.
 */
export interface FormatMoneyOptions {
  currency?: 'USD' | 'TRY' | 'USDT';
  showSymbol?: boolean;
}

/**
 * Format result with main and decimal parts for styled rendering.
 */
export interface FormattedMoney {
  /** Full formatted string (e.g., "$10.000,25") */
  full: string;
  /** Symbol (e.g., "$", "₺") */
  symbol: string;
  /** Main part without decimals (e.g., "10.000") */
  main: string;
  /** Decimal part with comma (e.g., ",25") */
  decimals: string;
}

/**
 * Formats money with Turkish notation: 10.000,25
 * - Period (.) for thousands separator
 * - Comma (,) for decimal separator
 * - Always shows 2 decimal places
 * 
 * @example
 * formatMoney(10000.25) -> { full: "$10.000,25", main: "10.000", decimals: ",25" }
 */
export function formatMoney(
  amount: number,
  options: FormatMoneyOptions = {}
): FormattedMoney {
  const { currency = 'USD', showSymbol = true } = options;
  
  // Get currency symbol
  const symbols: Record<string, string> = {
    USD: '$',
    TRY: '₺',
    USDT: '',
  };
  const symbol = showSymbol ? symbols[currency] || '' : '';
  
  // Format with Turkish locale (uses period for thousands, comma for decimals)
  const formatted = Math.abs(amount).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  // Split into main and decimal parts
  const parts = formatted.split(',');
  const main = parts[0];
  const decimals = `,${parts[1] || '00'}`;
  
  // Handle negative
  const sign = amount < 0 ? '-' : '';
  
  // Add USDT suffix if needed
  const suffix = currency === 'USDT' ? ' USDT' : '';
  
  return {
    full: `${sign}${symbol}${main}${decimals}${suffix}`,
    symbol: sign + symbol,
    main,
    decimals: decimals + suffix,
  };
}
