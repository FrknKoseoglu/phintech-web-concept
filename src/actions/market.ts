"use server";

// ============================================
// Midas Web Interface - Market Server Actions
// ============================================

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import {getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Asset, AssetCategory, User, Transaction, PortfolioItem } from "@/types";
import { getMarketData, getAssetBySymbol, resetMarketPrices, SYMBOL_MAP, MARKET_CATEGORIES } from "@/lib/market";
import prisma from "@/lib/prisma";

/**
 * Server Action: Fetches real market data from Yahoo Finance.
 * Falls back to static data if API fails.
 * Wrapped with React cache() to deduplicate requests across components.
 */
export const fetchMarketData = cache(async (): Promise<Asset[]> => {
  return await getMarketData();
});

/**
 * Server Action: Fetches a specific asset by symbol with real-time price.
 * Wrapped with React cache() to deduplicate requests for the same symbol.
 */
export const fetchAsset = cache(async (symbol: string): Promise<Asset | null> => {
  const asset = await getAssetBySymbol(symbol);
  return asset ?? null;
});

/**
 * Server Action: Fetches the current user data from the database.
 * Returns null if user is not authenticated (for public pages like dashboard).
 */
export async function fetchUser(): Promise<User | null> {
  const session = await getServerSession(authOptions);
  
  // Return null for unauthenticated users (guest mode)
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      portfolio: true,
    },
  });

  if (!user) {
    return null;
  }

  // Transform to match User type
  return {
    id: user.id,
    balance: user.balance,
    portfolio: user.portfolio.map((p: { symbol: string; quantity: number; avgCost: number }) => ({
      symbol: p.symbol,
      quantity: p.quantity,
      avgCost: p.avgCost,
    })),
    favorites: user.favorites,
  };
}


/**
 * Server Action: Resets all user data to initial state.
 * Useful for testing and demo purposes.
 */
export async function resetAllData(): Promise<{ success: boolean }> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized - Please login");
  }

  try {
    // Delete all user's transactions and portfolio
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { userId: session.user.id } }),
      prisma.portfolioItem.deleteMany({ where: { userId: session.user.id } }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          balance: 100000,
          favorites: ["BTC", "ETH", "AAPL"],
        },
      }),
    ]);
    
    resetMarketPrices();
    return { success: true };
  } catch (error) {
    console.error("Failed to reset data:", error);
    return { success: false };
  }
}

/**
 * Server Action: Fetches transactions from the database.
 */
export async function fetchTransactions(): Promise<Transaction[]> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return [];
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 100,
  });

  return transactions.map((t: { id: string; type: string; symbol: string; quantity: number; price: number; total: number; date: Date }) => ({
    id: t.id,
    type: t.type as "BUY" | "SELL" | "DEPOSIT",
    symbol: t.symbol,
    quantity: t.quantity,
    price: t.price,
    total: t.total,
    date: t.date.toISOString(),
  }));
}

// ============================================
// Historical Chart Data
// ============================================

export interface ChartDataPoint {
  date: string;
  price: number;
  timestamp: number;
}

// Note: SYMBOL_MAP is imported from @/lib/market

// Cached wrapper for Yahoo Finance chart API
// Cache for 24 hours to prevent rate limiting in development
const fetchYahooChart = unstable_cache(
  async (yahooSymbol: string, period1Str: string, period2Str: string, interval: '1m' | '5m' | '1h' | '1d') => {
    console.log(`📊 Fetching chart data for ${yahooSymbol} (${period1Str} to ${period2Str}, interval: ${interval})`);
    const YahooFinance = (await import('yahoo-finance2')).default;
    const yahooFinance = new YahooFinance();
    
    const result = await yahooFinance.chart(yahooSymbol, {
      period1: period1Str,
      period2: period2Str,
      interval,
    });
    
    console.log(`✅ Yahoo chart data received: ${result.quotes?.length || 0} data points`);
    return result;
  },
  ['yahoo-chart-v4'], // Bumped for 24h cache
  { 
    revalidate: 86400, // Cache for 24 hours (development stability)
    tags: ['chart-data'] 
  }
);

/**
 * Server Action: Fetches historical price data for charting.
 * - Uses CoinGecko for crypto assets (more reliable, no rate limits)
 * - Uses Yahoo Finance for stocks/commodities (with aggressive caching)
 */
export async function getAssetHistory(
  symbol: string,
  range: '1d' | '1wk' | '1mo' | '3mo' | '1y' = '1mo'
): Promise<ChartDataPoint[]> {
  try {
    // Get current asset price for fallback data
    const marketData = await getMarketData();
    const currentAsset = marketData.find(a => a.symbol === symbol);
    const currentPrice = currentAsset?.price || 100; // Default if asset not found
    
    // ===== CRYPTO: Use CoinGecko (Reliable) =====
    const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'AVAX', 'DOGE', 'USDT'];
    if (cryptoSymbols.includes(symbol)) {
      try {
        const { getCryptoHistory } = await import('@/lib/coingecko');
        const coinGeckoData = await getCryptoHistory(symbol, range);
        
        if (coinGeckoData && coinGeckoData.length > 0) {
          console.log(`✅ Using CoinGecko data for ${symbol}: ${coinGeckoData.length} points`);
          return coinGeckoData;
        }
        
        console.warn(`⚠️ CoinGecko returned empty data for ${symbol}, using fallback`);
      } catch (error) {
        console.error(`❌ CoinGecko error for ${symbol}:`, error);
      }
      
      // Fallback for crypto if CoinGecko fails
      return generateFallbackData(range, symbol, currentPrice);
    }
    
    // ===== STOCKS/COMMODITIES: Use Yahoo Finance (Cached) =====
    const yahooSymbol = SYMBOL_MAP[symbol] || symbol;
    
    // Calculate period based on range
    const now = new Date();
    let period1: Date;
    let interval: '1m' | '5m' | '1h' | '1d' = '1d';
    
    switch (range) {
      case '1d':
        period1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        interval = '5m';
        break;
      case '1wk':
        period1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        interval = '1h';
        break;
      case '1mo':
        period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        interval = '1d';
        break;
      case '3mo':
        period1 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        interval = '1d';
        break;
      case '1y':
        period1 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        interval = '1d';
        break;
    }
    
    const period1Str = period1.toISOString().split('T')[0];
    const period2Str = now.toISOString().split('T')[0];
    
    const result = await fetchYahooChart(yahooSymbol, period1Str, period2Str, interval);
    
    if (!result.quotes || result.quotes.length === 0) {
      return generateFallbackData(range, symbol, currentPrice);
    }
    
    return result.quotes
      .filter((q: { close?: number | null }) => q.close != null)
      .map((q: { date: Date; close?: number | null }) => ({
        date: q.date.toISOString(),
        price: q.close as number,
        timestamp: q.date.getTime(),
      }));
      
  } catch (error: any) {
    // Get current price for fallback in error case
    const marketData = await getMarketData().catch(() => []);
    const currentAsset = marketData.find(a => a.symbol === symbol);
    const currentPrice = currentAsset?.price || 100;
    
    if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
      console.error(`❌ Yahoo Finance Chart Rate Limit (429) for ${symbol}: Using fallback data.`);
      console.error('💡 Tip: Chart data is cached for 1 hour. Wait before refreshing.');
    } else {
      console.error(`❌ Failed to fetch chart data for ${symbol}:`, error?.message || error);
    }
    
    console.warn(`⚠️ Using generated fallback data for ${symbol} (current price: $${currentPrice})`);
    return generateFallbackData(range, symbol, currentPrice);
  }
}

// Generate fallback data for demo/offline - uses current asset price
function generateFallbackData(range: string, symbol: string, currentPrice: number): ChartDataPoint[] {
  const now = Date.now();
  const points = range === '1d' ? 24 : range === '1wk' ? 7 : range === '3mo' ? 90 : range === '1y' ? 365 : 30;
  const msPerPoint = range === '1d' ? 3600000 : 86400000;
  
  // Calculate variance based on asset type and price range
  let variancePercent = 0.04; // Default 4%
  if (symbol.endsWith('.IS')) {
    variancePercent = 0.035; // BIST: 3.5%
  } else if (currentPrice < 10) {
    variancePercent = 0.05; // Low price assets: 5%
  }
  
  const variance = currentPrice * variancePercent;
  
  // Generate data working BACKWARDS from current price to ensure final value is exact
  const data: ChartDataPoint[] = [];
  let price = currentPrice;
  
  // Start from the end (current time) and work backwards
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now - i * msPerPoint;
    
    data.push({
      date: new Date(timestamp).toISOString(),
      price: price,
      timestamp: timestamp,
    });
    
    // Only apply random walk if not the last point (which is currentPrice)
    if (i > 0) {
      const randomChange = (Math.random() - 0.5) * variance;
      price -= randomChange; // Subtract because we're going backwards
      
      // Keep price within reasonable bounds (±7% from current)
      price = Math.max(currentPrice * 0.93, Math.min(currentPrice * 1.07, price));
    }
  }
  
  return data;
}

// ============================================
// Infinite Scroll - Market List with Pagination
// ============================================

export interface MarketListResult {
  assets: Asset[];
  hasMore: boolean;
  total: number;
  page: number;
}

// Cached wrapper for market list data
const fetchMarketListCached = unstable_cache(
  async (category: string, page: number, limit: number) => {
    const { getPaginatedSymbols } = await import('@/lib/constants/market-data');
    const YahooFinance = (await import('yahoo-finance2')).default;
    const { getCryptoPrices } = await import('@/lib/coingecko');
    const { getUSDTRY } = await import('@/lib/tcmb');
    
    // Get paginated symbols from catalog
    const { symbols, hasMore, total } = getPaginatedSymbols(
      category as 'BIST' | 'US_STOCKS' | 'CRYPTO' | 'ETF',
      page,
      limit
    );

    if (symbols.length === 0) {
      return { assets: [], hasMore: false, total: 0 };
    }

    // Determine data source based on category
    let assets: Asset[] = [];

    if (category === 'CRYPTO') {
      // Use CoinGecko for crypto
      try {
        const cryptoSymbols = symbols.map(s => s.symbol.replace('-USD', ''));
        const cryptoPrices = await getCryptoPrices(cryptoSymbols);
        const usdTryRate = await getUSDTRY().catch(() => 43.28);

        assets = symbols.map(item => {
          const baseSymbol = item.symbol.replace('-USD', '');
          const cryptoData = cryptoPrices.get(baseSymbol);
          
          return {
            symbol: baseSymbol,
            name: item.name,
            price: cryptoData?.price || 0,
            changePercent: cryptoData?.changePercent || 0,
            logo: `/logos/${baseSymbol.toLowerCase()}.svg`,
            category: 'crypto' as AssetCategory,
            currency: 'USDT' as const,
          };
        });
      } catch (error) {
        console.error('❌ Failed to fetch crypto prices:', error);
        // Return empty assets on error
        assets = symbols.map(item => ({
          symbol: item.symbol.replace('-USD', ''),
          name: item.name,
          price: 0,
          changePercent: 0,
          logo: `/logos/${item.symbol.replace('-USD', '').toLowerCase()}.svg`,
          category: 'crypto' as AssetCategory,
          currency: 'USDT' as const,
        }));
      }
    } else {
      // Use Yahoo Finance for stocks and ETFs
      try {
        const yahooFinance = new YahooFinance();
        const yahooSymbols = symbols.map(s => s.symbol);
        const quotesResponse = await yahooFinance.quote(yahooSymbols);
        const quotes = Array.isArray(quotesResponse) ? quotesResponse : [quotesResponse];

        assets = symbols.map(item => {
          const quote = quotes.find((q: any) => q.symbol === item.symbol);

          // Determine currency based on category and symbol
          let currency: 'USD' | 'TRY' | 'USDT' = 'USD';
          if (item.symbol.endsWith('.IS')) {
            currency = 'TRY';
          }

          // Determine category
          let assetCategory: AssetCategory = 'stock';
          if (category === 'ETF') {
            assetCategory = 'stock'; // ETFs use stock category
          }

          return {
            symbol: item.symbol,
            name: item.name,
            price: quote?.regularMarketPrice || 0,
            changePercent: quote?.regularMarketChangePercent || 0,
            logo: `/logos/${item.symbol.replace('.IS', '').toLowerCase()}.svg`,
            category: assetCategory,
            currency,
          };
        });
      } catch (error: any) {
        if (error?.message?.includes('429')) {
          console.warn('⚠️ Yahoo Finance Rate Limited (429) - Using fallback');
        } else {
          console.error('❌ Failed to fetch stock prices:', error);
        }
        
        // Return symbols with zero prices on error
        assets = symbols.map(item => ({
          symbol: item.symbol,
          name: item.name,
          price: 0,
          changePercent: 0,
          logo: `/logos/${item.symbol.replace('.IS', '').toLowerCase()}.svg`,
          category: 'stock' as AssetCategory,
          currency: item.symbol.endsWith('.IS') ? 'TRY' as const : 'USD' as const,
        }));
      }
    }

    return { assets, hasMore, total };
  },
  ['market-list-paginated'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['market-list'],
  }
);

/**
 * Server Action: Get paginated market list for infinite scroll.
 * Fetches live prices from Yahoo Finance or CoinGecko based on category.
 * 
 * @param category - Market category (BIST, US_STOCKS, CRYPTO, ETF)
 * @param page - Page number (1-indexed)
 * @param limit - Items per page (default 10)
 */
export async function getMarketList(
  category: 'BIST' | 'US_STOCKS' | 'CRYPTO' | 'ETF',
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string
): Promise<{ assets: Asset[]; hasMore: boolean }> {
  try {
    const allAssets = await getMarketData();
    
    // Filter by category or search query
    let filtered = allAssets;

    if (searchQuery && searchQuery.trim()) {
      // Search across all categories
      const query = searchQuery.toLowerCase().trim();
      filtered = allAssets.filter((asset) => 
        asset.symbol.toLowerCase().includes(query) ||
        asset.name.toLowerCase().includes(query)
      );
    } else {
      // Filter by category
      filtered = allAssets.filter((asset) => {
        if (category === 'BIST') return MARKET_CATEGORIES.bist.includes(asset.symbol);
        if (category === 'US_STOCKS') return MARKET_CATEGORIES.abd.includes(asset.symbol);
        if (category === 'CRYPTO') return MARKET_CATEGORIES.crypto.includes(asset.symbol);
        if (category === 'ETF') return MARKET_CATEGORIES.etf.includes(asset.symbol);
        return false;
      });
    }

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedAssets = filtered.slice(start, end);
    const hasMore = end < filtered.length;

    return { assets: paginatedAssets, hasMore };
  } catch (error) {
    console.error('getMarketList error:', error);
    return { assets: [], hasMore: false };
  }
}
