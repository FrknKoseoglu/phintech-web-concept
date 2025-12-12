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
