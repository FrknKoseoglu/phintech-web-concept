"use server";

// ============================================
// Midas Web Interface - Market Server Actions
// ============================================

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import type { Asset, User, Transaction, PortfolioItem } from "@/types";
import { getMarketData, getAssetBySymbol, resetMarketPrices, SYMBOL_MAP } from "@/lib/market";
import prisma from "@/lib/prisma";

// Default user ID for demo (in production, get from session)
const DEMO_USER_ID = "demo_user_001";

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
 */
export async function fetchUser(): Promise<User> {
  let user = await prisma.user.findUnique({
    where: { id: DEMO_USER_ID },
    include: {
      portfolio: true,
    },
  });

  // Create demo user if not exists
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEMO_USER_ID,
        email: "demo@midas.app",
        name: "Demo User",
        balance: 100000, // $100k starting bonus
        favorites: ["BTC", "ETH", "AAPL"],
      },
      include: {
        portfolio: true,
      },
    });
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
  try {
    // Delete all user's transactions and portfolio
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { userId: DEMO_USER_ID } }),
      prisma.portfolioItem.deleteMany({ where: { userId: DEMO_USER_ID } }),
      prisma.user.update({
        where: { id: DEMO_USER_ID },
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
  const transactions = await prisma.transaction.findMany({
    where: { userId: DEMO_USER_ID },
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
const fetchYahooChart = unstable_cache(
  async (yahooSymbol: string, period1Str: string, period2Str: string, interval: '1m' | '5m' | '1h' | '1d') => {
    const YahooFinance = (await import('yahoo-finance2')).default;
    const yahooFinance = new YahooFinance();
    
    return await yahooFinance.chart(yahooSymbol, {
      period1: period1Str,
      period2: period2Str,
      interval,
    });
  },
  ['yahoo-chart'],
  { 
    revalidate: 120, // Cache for 120 seconds
    tags: ['chart-data'] 
  }
);

/**
 * Server Action: Fetches historical price data for charting.
 * Uses Yahoo Finance chart API with caching.
 */
export async function getAssetHistory(
  symbol: string,
  range: '1d' | '1wk' | '1mo' | '3mo' = '1mo'
): Promise<ChartDataPoint[]> {
  try {
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
    }
    
    const period1Str = period1.toISOString().split('T')[0];
    const period2Str = now.toISOString().split('T')[0];
    
    const result = await fetchYahooChart(yahooSymbol, period1Str, period2Str, interval);
    
    if (!result.quotes || result.quotes.length === 0) {
      return generateFallbackData(range);
    }
    
    return result.quotes
      .filter((q: { close?: number | null }) => q.close != null)
      .map((q: { date: Date; close?: number | null }) => ({
        date: q.date.toISOString(),
        price: q.close as number,
        timestamp: q.date.getTime(),
      }));
      
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
      console.error("❌ Yahoo Finance Chart Rate Limit (429): Using fallback data.");
    } else {
      console.error("❌ Failed to fetch chart data:", error);
    }
    return generateFallbackData(range);
  }
}

// Generate fallback data for demo/offline
function generateFallbackData(range: string): ChartDataPoint[] {
  const now = Date.now();
  const points = range === '1d' ? 24 : range === '1wk' ? 7 : 30;
  const msPerPoint = range === '1d' ? 3600000 : 86400000;
  
  let price = 42000 + Math.random() * 1000;
  
  return Array.from({ length: points }, (_, i) => {
    price += (Math.random() - 0.48) * 500;
    return {
      date: new Date(now - (points - i) * msPerPoint).toISOString(),
      price: Math.max(price, 35000),
      timestamp: now - (points - i) * msPerPoint,
    };
  });
}
