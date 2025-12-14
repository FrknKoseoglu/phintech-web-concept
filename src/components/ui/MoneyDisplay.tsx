"use client";

import { formatMoney, type FormatMoneyOptions, cn } from "@/lib/utils";

interface MoneyDisplayProps extends FormatMoneyOptions {
  amount: number;
  className?: string;
  /** Additional class for the decimal part (default: slightly faded) */
  decimalClassName?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Styled money display component with faded decimals.
 * Uses Turkish notation: 10.000,25
 * 
 * @example
 * <MoneyDisplay amount={10000.25} currency="USD" size="lg" />
 * // Renders: $10.000<span class="opacity-60">,25</span>
 */
export default function MoneyDisplay({
  amount,
  currency = 'USD',
  showSymbol = true,
  className,
  decimalClassName = 'opacity-60',
  size = 'md',
}: MoneyDisplayProps) {
  const formatted = formatMoney(amount, { currency, showSymbol });
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  return (
    <span className={cn(sizeClasses[size], className)}>
      {formatted.symbol}{formatted.main}
      <span className={decimalClassName}>{formatted.decimals}</span>
    </span>
  );
}
