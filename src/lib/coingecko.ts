/**
 * CoinGecko API Service
 * Reliable cryptocurrency price data without authentication
 * Free tier: 10-50 calls/minute (much better than Yahoo Finance)
 */

import { unstable_cache } from 'next/cache';

// CoinGecko API configuration
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const API_BASE = COINGECKO_API_KEY 
  ? 'https://api.coingecko.com/api/v3' 
  : 'https://api.coingecko.com/api/v3';

// Helper to build headers with API key if available
function getCoinGeckoHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  
  if (COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
  }
  
  return headers;
}

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
 * Cached for 24 hours to prevent rate limiting in development
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

    const url = `${API_BASE}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;
    
    try {
      console.log(`📊 Fetching CoinGecko prices${COINGECKO_API_KEY ? ' (with API key)' : ' (public)'}...`);
      
      const response = await fetch(url, {
        headers: getCoinGeckoHeaders(),
        next: { revalidate: 86400 }, // 24 hours cache
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
  ['coingecko-prices-v2'],
  { 
    revalidate: 86400, // Cache for 24 hours
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

/**
 * Historical data point from CoinGecko
 */
export interface CoinGeckoChartPoint {
  date: string;
  price: number;
  timestamp: number;
}

/**
 * Fetches historical price data for a cryptocurrency from CoinGecko
 * Free tier supports market_chart endpoint with up to 365 days
 * 
 * @param symbol - Our crypto symbol (BTC, ETH, etc.)
 * @param range - Time range (1d, 1wk, 1mo, 3mo, 1y)
 */
export const getCryptoHistory = unstable_cache(
  async (symbol: string, range: '1d' | '1wk' | '1mo' | '3mo' | '1y'): Promise<CoinGeckoChartPoint[]> => {
    const coinId = COINGECKO_ID_MAP[symbol];
    
    if (!coinId) {
      console.warn(`⚠️ Unknown crypto symbol: ${symbol}`);
      return [];
    }

    // Map our ranges to CoinGecko's "days" parameter
    const daysMap: Record<string, number> = {
      '1d': 1,
      '1wk': 7,
      '1mo': 30,
      '3mo': 90,
      '1y': 365,
    };
    
    const days = daysMap[range] || 30;
    
    // CoinGecko market_chart endpoint
    const url = `${API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days === 1 ? 'hourly' : 'daily'}`;
    
    try {
      console.log(`📊 Fetching CoinGecko history for ${symbol} (${days} days)${COINGECKO_API_KEY ? ' [API Key]' : ' [Public]'}`);
      
      const response = await fetch(url, {
        headers: getCoinGeckoHeaders(),
        next: { revalidate: 86400 }, // Cache for 24 hours
      });

      if (!response.ok) {
        console.error(`❌ CoinGecko API Error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      
      // CoinGecko returns: { prices: [[timestamp_ms, price], ...] }
      if (!data.prices || !Array.isArray(data.prices)) {
        console.error('❌ CoinGecko returned invalid data structure');
        return [];
      }
      
      console.log(`✅ CoinGecko history received: ${data.prices.length} data points for ${symbol}`);
      
      // Transform to our format
      return data.prices.map(([timestamp, price]: [number, number]) => ({
        date: new Date(timestamp).toISOString(),
        price: price,
        timestamp: timestamp,
      }));
      
    } catch (error) {
      console.error(`❌ Failed to fetch CoinGecko history for ${symbol}:`, error);
      return [];
    }
  },
  ['coingecko-history-v2'],
  {
    revalidate: 86400, // Cache for 24 hours
    tags: ['crypto-history'],
  }
);

