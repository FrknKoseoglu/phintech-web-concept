"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AssetIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

// Known logo URLs for our main assets
const LOGO_MAP: Record<string, string> = {
  // Crypto
  'BTC': 'https://assets.coincap.io/assets/icons/btc@2x.png',
  'ETH': 'https://assets.coincap.io/assets/icons/eth@2x.png',
  'SOL': 'https://assets.coincap.io/assets/icons/sol@2x.png',
  'AVAX': 'https://assets.coincap.io/assets/icons/avax@2x.png',
  'DOGE': 'https://assets.coincap.io/assets/icons/doge@2x.png',
  // US Stocks
  'AAPL': 'https://logo.clearbit.com/apple.com',
  'TSLA': 'https://logo.clearbit.com/tesla.com',
  'NVDA': 'https://logo.clearbit.com/nvidia.com',
  'AMZN': 'https://logo.clearbit.com/amazon.com',
  'MSFT': 'https://logo.clearbit.com/microsoft.com',
  // BIST
  'THYAO': 'https://logo.clearbit.com/turkishairlines.com',
  'GARAN': 'https://logo.clearbit.com/garantibbva.com.tr',
  'AKBNK': 'https://logo.clearbit.com/akbank.com',
  'EREGL': 'https://logo.clearbit.com/erdemir.com.tr',
  'SASA': 'https://logo.clearbit.com/sasapolyester.com',
  // Commodities / Currency
  'XAU': 'https://assets.coincap.io/assets/icons/xau@2x.png',
  'XAG': 'https://assets.coincap.io/assets/icons/xag@2x.png',
  'USD': 'https://flagcdn.com/w80/us.png',
  'TRY': 'https://flagcdn.com/w80/tr.png',
};

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

export default function AssetIcon({ symbol, size = 40, className }: AssetIconProps) {
  const [hasError, setHasError] = useState(false);
  
  // Get logo URL from map or try to construct one
  const logoUrl = LOGO_MAP[symbol];
  
  // If we have a known URL and no error, show the image
  if (logoUrl && !hasError) {
    return (
      <div 
        className={cn("relative overflow-hidden rounded-full bg-white dark:bg-gray-900 flex items-center justify-center", className)}
        style={{ width: size, height: size }}
      >
        <Image
          src={logoUrl}
          alt={symbol}
          width={size - 4}
          height={size - 4}
          className="object-contain"
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
        "rounded-full flex items-center justify-center font-bold text-white",
        className
      )}
      style={{ 
        width: size, 
        height: size, 
        backgroundColor,
        fontSize: `${fontSize}px`,
      }}
    >
      {letters}
    </div>
  );
}
