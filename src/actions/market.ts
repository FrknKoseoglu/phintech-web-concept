"use server";

// ============================================
// Midas Web Interface - Market Server Actions
// ============================================

import type { Asset, User, Transaction } from "@/types";
import { getMarketData, getAssetBySymbol, resetMarketPrices } from "@/lib/market";
import { getUser, resetDb, getTransactions } from "@/lib/db";

/**
 * Server Action: Fetches simulated market data with dynamic prices.
 * Each call returns slightly different prices to simulate live market.
 */
export async function fetchMarketData(): Promise<Asset[]> {
  // Simulate network delay for realistic behavior
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  return getMarketData();
}

/**
 * Server Action: Fetches a specific asset by symbol.
 */
export async function fetchAsset(symbol: string): Promise<Asset | null> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  
  const asset = getAssetBySymbol(symbol);
  return asset || null;
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
