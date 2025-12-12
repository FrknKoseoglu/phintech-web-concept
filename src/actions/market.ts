"use server";

// ============================================
// Midas Web Interface - Market Server Actions
// ============================================

import type { Asset, User, Transaction } from "@/types";
import { getMarketData, getAssetBySymbol, resetMarketPrices } from "@/lib/market";
import { getUser, resetDb, getTransactions } from "@/lib/db";

/**
 * Server Action: Fetches real market data from Yahoo Finance.
 * Falls back to static data if API fails.
 */
export async function fetchMarketData(): Promise<Asset[]> {
  return await getMarketData();
}

/**
 * Server Action: Fetches a specific asset by symbol with real-time price.
 */
export async function fetchAsset(symbol: string): Promise<Asset | null> {
  return await getAssetBySymbol(symbol);
}

/**
 * Server Action: Fetches the current user data from the database.
 */
export async function fetchUser(): Promise<User> {
  return getUser();
}

/**
 * Server Action: Resets all data to initial state.
 * Useful for testing and demo purposes.
 */
export async function resetAllData(): Promise<{ success: boolean }> {
  try {
    await resetDb();
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
  return getTransactions();
}

// ============================================
// Historical Chart Data
// ============================================

export interface ChartDataPoint {
  date: string;
  price: number;
  timestamp: number;
}

// Symbol mapping for Yahoo Finance
const SYMBOL_MAP: Record<string, string> = {
  'BTC': 'BTC-USD',
  'ETH': 'ETH-USD',
  'AAPL': 'AAPL',
  'TSLA': 'TSLA',
  'NVDA': 'NVDA',
  'THYAO': 'THYAO.IS',
  'USD': 'TRY=X',
  'XAU': 'GC=F',
};

/**
 * Server Action: Fetches historical price data for charting.
 * Uses Yahoo Finance chart API.
 */
export async function getAssetHistory(
  symbol: string,
  range: '1d' | '1wk' | '1mo' | '3mo' = '1mo'
): Promise<ChartDataPoint[]> {
  try {
    const YahooFinance = (await import('yahoo-finance2')).default;
    const yahooFinance = new YahooFinance();
    
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
    
    const result = await yahooFinance.chart(yahooSymbol, {
      period1: period1.toISOString().split('T')[0],
      period2: now.toISOString().split('T')[0],
      interval,
    });
    
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
      
  } catch (error) {
    console.error("Failed to fetch chart data:", error);
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
