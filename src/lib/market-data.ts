"use server";

import { unstable_cache } from "next/cache";
import yahooFinance from "yahoo-finance2";

export interface MarketOverview {
  volume24h: number | null;
  high24h: number | null;
  low24h: number | null;
  symbol: string;
}

/**
 * Get market overview data from Yahoo Finance
 * Uses GC=F (Gold) for commodity data and USDTRY=X for forex
 * Cached for 5 minutes
 */
export const getMarketOverview = unstable_cache(
  async (): Promise<MarketOverview> => {
    try {
      // Fetch Gold (GC=F) data as representative commodity
      const goldQuote = await yahooFinance.quote("GC=F");

      return {
        volume24h: goldQuote.regularMarketVolume || null,
        high24h: goldQuote.regularMarketDayHigh || null,
        low24h: goldQuote.regularMarketDayLow || null,
        symbol: "GC=F",
      };
    } catch (error) {
      console.error("❌ Market overview fetch failed:", error);
      
      // Return fallback data with null values
      return {
        volume24h: null,
        high24h: null,
        low24h: null,
        symbol: "GC=F",
      };
    }
  },
  ["market-overview"],
  {
    revalidate: 300, // 5 minutes
    tags: ["market-overview"],
  }
);
