// ============================================
// Midas Web Interface - Market Simulation Engine
// ============================================

import type { Asset, AssetCategory } from "@/types";

/**
 * Seed data for market assets with initial prices and categories.
 */
export const SEED_ASSETS: Asset[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 178.50,
    changePercent: 0,
    logo: "/logos/aapl.svg",
    category: "stock",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 245.80,
    changePercent: 0,
    logo: "/logos/tsla.svg",
    category: "stock",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 43250.00,
    changePercent: 0,
    logo: "/logos/btc.svg",
    category: "crypto",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 2280.50,
    changePercent: 0,
    logo: "/logos/eth.svg",
    category: "crypto",
  },
  {
    symbol: "XAU",
    name: "Gold (oz)",
    price: 2035.40,
    changePercent: 0,
    logo: "/logos/xau.svg",
    category: "commodity",
  },
  {
    symbol: "TRY",
    name: "Turkish Lira",
    price: 0.034,
    changePercent: 0,
    logo: "/logos/try.svg",
    category: "currency",
  },
  {
    symbol: "THY",
    name: "Turkish Airlines",
    price: 8.75,
    changePercent: 0,
    logo: "/logos/thy.svg",
    category: "stock",
  },
];

/**
 * Applies a random price change between -2% and +2% to simulate market movement.
 */
function applyRandomChange(price: number): { newPrice: number; changePercent: number } {
  const changePercent = (Math.random() * 4 - 2);
  const newPrice = price * (1 + changePercent / 100);
  
  return {
    newPrice: Math.round(newPrice * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
  };
}

/**
 * In-memory price tracker to maintain price continuity between calls.
 */
let currentPrices: Map<string, number> = new Map();

// Initialize with seed prices
SEED_ASSETS.forEach((asset) => {
  currentPrices.set(asset.symbol, asset.price);
});

/**
 * Gets market data with dynamic pricing simulation.
 */
export function getMarketData(): Asset[] {
  return SEED_ASSETS.map((asset) => {
    const currentPrice = currentPrices.get(asset.symbol) || asset.price;
    const { newPrice, changePercent } = applyRandomChange(currentPrice);
    
    currentPrices.set(asset.symbol, newPrice);
    
    return {
      ...asset,
      price: newPrice,
      changePercent,
    };
  });
}

/**
 * Gets market data WITHOUT applying price changes.
 * Used for display where we don't want to mutate prices.
 */
export function getMarketDataSnapshot(): Asset[] {
  return SEED_ASSETS.map((asset) => {
    const currentPrice = currentPrices.get(asset.symbol) || asset.price;
    return {
      ...asset,
      price: currentPrice,
    };
  });
}

/**
 * Resets prices to their seed values.
 */
export function resetMarketPrices(): void {
  currentPrices = new Map();
  SEED_ASSETS.forEach((asset) => {
    currentPrices.set(asset.symbol, asset.price);
  });
}

/**
 * Gets a specific asset by symbol with current price (applies change).
 */
export function getAssetBySymbol(symbol: string): Asset | undefined {
  const asset = SEED_ASSETS.find((a) => a.symbol === symbol);
  if (!asset) return undefined;
  
  const currentPrice = currentPrices.get(symbol) || asset.price;
  const { newPrice, changePercent } = applyRandomChange(currentPrice);
  
  currentPrices.set(symbol, newPrice);
  
  return {
    ...asset,
    price: newPrice,
    changePercent,
  };
}

/**
 * Gets the current price of a specific asset without applying change.
 */
export function getAssetPrice(symbol: string): number | null {
  return currentPrices.get(symbol) || null;
}

/**
 * Gets asset info by symbol without applying price change.
 */
export function getAssetInfo(symbol: string): Asset | undefined {
  const asset = SEED_ASSETS.find((a) => a.symbol === symbol);
  if (!asset) return undefined;
  
  const currentPrice = currentPrices.get(symbol) || asset.price;
  return {
    ...asset,
    price: currentPrice,
  };
}
