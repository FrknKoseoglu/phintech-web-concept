/**
 * CoinGecko API Service
 * Reliable cryptocurrency price data without authentication
 * Free tier: 10-50 calls/minute (much better than Yahoo Finance)
 */

import { unstable_cache } from 'next/cache';

export interface CoinGeckoPrice {
  usd: number;
  usd_24h_change: number;
}

export interface CoinGeckoResponse {
  bitcoin?: CoinGeckoPrice;
  ethereum?: CoinGeckoPrice;
  solana?: CoinGeckoPrice;
  'avalanche-2'?: CoinGeckoPrice;
  dogecoin?: CoinGeckoPrice;
  tether?: CoinGeckoPrice;
}

// Mapping from our symbols to CoinGecko IDs
const COINGECKO_ID_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'AVAX': 'avalanche-2',
  'DOGE': 'dogecoin',
  'USDT': 'tether',
};

/**
 * Fetches cryptocurrency prices from CoinGecko API
 * Cached for 30 seconds to reduce API calls
 */
export const fetchCoinGeckoData = unstable_cache(
  async (symbols: string[]): Promise<CoinGeckoResponse> => {
    const coinIds = symbols
      .map(symbol => COINGECKO_ID_MAP[symbol])
      .filter(Boolean)
      .join(',');
    
    if (!coinIds) {
      return {};
    }

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 }, // 30 seconds cache
      });

      if (!response.ok) {
        console.error(`CoinGecko API Error: ${response.status} ${response.statusText}`);
        return {};
      }

      const data = await response.json();
      return data as CoinGeckoResponse;
    } catch (error) {
      console.error('❌ CoinGecko fetch error:', error);
      return {};
    }
  },
  ['coingecko-prices'],
  { 
    revalidate: 30, // Cache for 30 seconds
    tags: ['crypto-prices'] 
  }
);

/**
 * Get price for a single cryptocurrency
 */
export async function getCryptoPrice(symbol: string): Promise<{ price: number; changePercent: number } | null> {
  const data = await fetchCoinGeckoData([symbol]);
  const coinId = COINGECKO_ID_MAP[symbol];
  
  if (!coinId) {
    return null;
  }

  const coinData = data[coinId as keyof CoinGeckoResponse];
  
  if (!coinData) {
    return null;
  }

  return {
    price: coinData.usd,
    changePercent: coinData.usd_24h_change,
  };
}

/**
 * Get prices for multiple cryptocurrencies
 */
export async function getCryptoPrices(symbols: string[]): Promise<Map<string, { price: number; changePercent: number }>> {
  const data = await fetchCoinGeckoData(symbols);
  const result = new Map<string, { price: number; changePercent: number }>();

  for (const symbol of symbols) {
    const coinId = COINGECKO_ID_MAP[symbol];
    if (!coinId) continue;

    const coinData = data[coinId as keyof CoinGeckoResponse];
    if (coinData) {
      result.set(symbol, {
        price: coinData.usd,
        changePercent: coinData.usd_24h_change,
      });
    }
  }

  return result;
}
