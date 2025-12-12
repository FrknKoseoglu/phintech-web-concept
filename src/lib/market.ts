// ============================================
// Midas Web Interface - Market Simulation Engine
// ============================================

import type { Asset } from "@/types";

/**
 * Seed data for market assets with initial prices.
 * Includes: AAPL, TSLA, BTC, ETH, XAU (Gold), TRY (Lira), THY (Turkish Airlines)
 */
export const SEED_ASSETS: Asset[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 178.50,
    changePercent: 0,
    logo: "/logos/aapl.svg",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 245.80,
    changePercent: 0,
    logo: "/logos/tsla.svg",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 43250.00,
    changePercent: 0,
    logo: "/logos/btc.svg",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 2280.50,
    changePercent: 0,
    logo: "/logos/eth.svg",
  },
  {
    symbol: "XAU",
    name: "Gold (oz)",
    price: 2035.40,
    changePercent: 0,
    logo: "/logos/xau.svg",
  },
  {
    symbol: "TRY",
    name: "Turkish Lira",
    price: 0.034,
    changePercent: 0,
    logo: "/logos/try.svg",
  },
  {
    symbol: "THY",
    name: "Turkish Airlines",
    price: 8.75,
    changePercent: 0,
    logo: "/logos/thy.svg",
  },
];

/**
 * Applies a random price change between -2% and +2% to simulate market movement.
 * @param price - The current price
 * @returns Object with new price and change percentage
 */
function applyRandomChange(price: number): { newPrice: number; changePercent: number } {
  // Random percentage between -2% and +2%
  const changePercent = (Math.random() * 4 - 2);
  const newPrice = price * (1 + changePercent / 100);
  
  return {
    newPrice: Math.round(newPrice * 100) / 100, // Round to 2 decimal places
    changePercent: Math.round(changePercent * 100) / 100,
  };
}

/**
 * In-memory price tracker to maintain price continuity between calls.
 * This ensures prices evolve over time rather than resetting each call.
 */
let currentPrices: Map<string, number> = new Map();

// Initialize with seed prices
SEED_ASSETS.forEach((asset) => {
  currentPrices.set(asset.symbol, asset.price);
});

/**
 * Gets market data with dynamic pricing simulation.
 * Each call applies a small random change (-2% to +2%) to prices,
 * creating a "Live Ticker" effect without a real API.
 * 
 * @returns Array of assets with updated prices and change percentages
 */
export function getMarketData(): Asset[] {
  return SEED_ASSETS.map((asset) => {
    const currentPrice = currentPrices.get(asset.symbol) || asset.price;
    const { newPrice, changePercent } = applyRandomChange(currentPrice);
    
    // Update the tracked price for next call
    currentPrices.set(asset.symbol, newPrice);
    
    return {
      ...asset,
      price: newPrice,
      changePercent,
    };
  });
}

/**
 * Resets prices to their seed values.
 * Useful for testing or resetting the simulation.
 */
export function resetMarketPrices(): void {
  currentPrices = new Map();
  SEED_ASSETS.forEach((asset) => {
    currentPrices.set(asset.symbol, asset.price);
  });
}

/**
 * Gets a specific asset by symbol with current price.
 */
export function getAssetBySymbol(symbol: string): Asset | undefined {
  const marketData = getMarketData();
  return marketData.find((asset) => asset.symbol === symbol);
}
