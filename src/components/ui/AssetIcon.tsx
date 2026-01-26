"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AssetIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

// Crypto symbols that use crypto endpoint
const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'AVAX', 'DOGE', 'XRP', 'ADA', 'DOT', 'MATIC', 'LINK'];

// Static logos for currencies
const STATIC_LOGOS: Record<string, string> = {
  'USD': 'https://flagcdn.com/w80/us.png',
  'TRY': 'https://flagcdn.com/w80/tr.png',
};

/**
 * Get logo URL for a symbol using logo.dev
 * Crypto: https://img.logo.dev/crypto/{symbol}?token=...
 * Stocks: https://img.logo.dev/ticker/{SYMBOL}?token=...
 */
function getLogoUrl(symbol: string): string | undefined {
  // Check static logos first
  if (STATIC_LOGOS[symbol]) {
    return STATIC_LOGOS[symbol];
  }

  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || 'LOGO_DEV_PUBLISHABLE_KEY';
  
  // Determine if this is a crypto or stock
  const isCrypto = CRYPTO_SYMBOLS.includes(symbol);
  
  if (isCrypto) {
    // Use crypto endpoint - lowercase required
    return `https://img.logo.dev/crypto/${symbol.toLowerCase()}?token=${token}`;
  } else {
    // Use ticker endpoint for stocks - uppercase
    return `https://img.logo.dev/ticker/${symbol.toUpperCase()}?token=${token}`;
  }
}

// Generate a consistent pastel color from a string
function getColorFromSymbol(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use predefined nice colors
  const colors = [
    '#4E55FF', // Primary blue
    '#05C46B', // Green
    '#FF3B30', // Red
    '#F59E0B', // Orange
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#10B981', // Emerald
    '#F97316', // Orange-red
    '#6366F1', // Indigo
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * AssetIcon Component
 * 
 * Displays a logo for financial assets (stocks, crypto, currencies).
 * Uses logo.dev API with intelligent fallback to letter avatars.
 * 
 * @param {string} symbol - Asset symbol (e.g., "BTC", "AAPL", "THYAO")
 * @param {number} size - Icon size in pixels (default: 40)
 * @param {string} className - Additional Tailwind classes
 * 
 * @example
 * <AssetIcon symbol="BTC" size={48} />
 * <AssetIcon symbol="AAPL" size={32} className="border-2" />
 */
export default function AssetIcon({ symbol, size = 40, className }: AssetIconProps) {
  const [hasError, setHasError] = useState(false);
  
  // Get logo URL using logo.dev service
  const logoUrl = getLogoUrl(symbol);
  
  // If we have a known URL and no error, show the image
  if (logoUrl && !hasError) {
    // Calculate image size with 5% padding on each side (total 10% reduction)
    const paddingSize = Math.round(size * 0.05);
    const imageSize = size - (paddingSize * 2);

    return (
      <div 
        className={cn("relative overflow-hidden flex items-center justify-center bg-white dark:bg-gray-900", className)}
        style={{ 
          width: size, 
          height: size,
          borderRadius: '50%', // Ensure perfect circle
          padding: `${paddingSize}px` // 5% padding
        }}
      >
        <Image
          src={logoUrl}
          alt={symbol}
          width={imageSize}
          height={imageSize}
          className="object-contain"
          style={{ borderRadius: '50%' }}
          onError={() => setHasError(true)}
          unoptimized // Skip Next.js image optimization for external URLs
        />
      </div>
    );
  }
  
  // Fallback: Letter Avatar
  const backgroundColor = getColorFromSymbol(symbol);
  const letters = symbol.slice(0, 2).toUpperCase();
  const fontSize = size * 0.4;
  
  return (
    <div
      className={cn(
        "flex items-center justify-center font-bold text-white",
        className
      )}
      style={{ 
        width: size, 
        height: size, 
        backgroundColor,
        fontSize: `${fontSize}px`,
        borderRadius: '50%' // Ensure perfect circle
      }}
    >
      {letters}
    </div>
  );
}

