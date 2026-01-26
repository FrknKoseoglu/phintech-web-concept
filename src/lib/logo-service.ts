import { unstable_cache } from 'next/cache';

/**
 * Logo Service - Centralized logo fetching with caching
 * Uses logo.dev API for stocks and crypto
 */

// Static fallback URLs for currencies and special cases
const STATIC_LOGOS: Record<string, string> = {
  'USD': 'https://flagcdn.com/w80/us.png',
  'TRY': 'https://flagcdn.com/w80/tr.png',
};

// Crypto symbols that should use crypto endpoint
const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'AVAX', 'DOGE', 'XRP', 'ADA', 'DOT', 'MATIC', 'LINK'];

/**
 * Get logo URL for a given symbol
 * Cached for 24 hours to minimize API calls
 */
export const getLogoUrl = unstable_cache(
  async (symbol: string): Promise<string | null> => {
    // Check static logos first
    if (STATIC_LOGOS[symbol]) {
      return STATIC_LOGOS[symbol];
    }

    const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || 'LOGO_DEV_PUBLISHABLE_KEY';
    
    // Determine if this is a crypto or stock
    const isCrypto = CRYPTO_SYMBOLS.includes(symbol);
    
    if (isCrypto) {
      // Use crypto endpoint for cryptocurrencies
      return `https://img.logo.dev/crypto/${symbol.toLowerCase()}?token=${token}`;
    } else {
      // Use ticker endpoint for stocks
      return `https://img.logo.dev/ticker/${symbol}?token=${token}`;
    }
  },
  ['logo-url'], // Cache key prefix
  { 
    revalidate: 86400, // 24 hours - logos don't change frequently
    tags: ['logos'] 
  }
);

/**
 * Validate if a logo URL is accessible
 * Used for fallback logic
 */
export async function validateLogoUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get crypto-specific logo URL
 */
export function getCryptoLogoUrl(symbol: string): string {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || 'LOGO_DEV_PUBLISHABLE_KEY';
  return `https://img.logo.dev/crypto/${symbol.toLowerCase()}?token=${token}`;
}

/**
 * Get stock-specific logo URL
 */
export function getStockLogoUrl(symbol: string): string {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || 'LOGO_DEV_PUBLISHABLE_KEY';
  return `https://img.logo.dev/ticker/${symbol}?token=${token}`;
}
