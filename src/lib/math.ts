import type { PortfolioItem, Asset } from "@/types";

/**
 * Centralized Net Worth Calculation Module
 * 
 * All monetary values are normalized to USD as the base currency.
 * TRY assets are converted using the live USD/TRY rate.
 */

export interface NetWorthResult {
  /** Total net worth in USD */
  totalUsd: number;
  /** Total net worth in TRY (for display) */
  totalTry: number;
  /** TRY cash balance converted to USD */
  cashTryInUsd: number;
  /** USD cash from portfolio */
  cashUsd: number;
  /** USDT cash from portfolio (treated as 1:1 with USD) */
  cashUsdt: number;
  /** Total invested assets value in USD */
  investmentsValueUsd: number;
  /** Breakdown by category */
  breakdown: {
    stocks: number;
    crypto: number;
    commodities: number;
  };
}

/**
 * Calculates total net worth in USD, properly converting TRY-denominated assets.
 * 
 * Formula:
 * Total ($) = (TRY Balance / USD_TRY_Rate) + USD + USDT + Σ(Asset_Qty × Asset_Price_USD)
 */
export function calculateNetWorth(
  userBalanceTRY: number,
  portfolio: PortfolioItem[],
  marketData: Asset[],
  usdTryRate: number = 34.5
): NetWorthResult {
  // 1. Convert Cash TRY to USD
  const cashTryInUsd = userBalanceTRY / usdTryRate;

  // 2. Get Cash USD and USDT from portfolio
  const cashUsd = portfolio.find(p => p.symbol === 'USD')?.quantity || 0;
  const cashUsdt = portfolio.find(p => p.symbol === 'USDT')?.quantity || 0;

  // 3. Calculate Invested Assets (exclude currency holdings)
  const investments = portfolio.filter(p => 
    p.symbol !== 'USD' && p.symbol !== 'USDT'
  );

  let investmentsValueUsd = 0;
  let stocksValue = 0;
  let cryptoValue = 0;
  let commoditiesValue = 0;

  investments.forEach(item => {
    const asset = marketData.find(m => m.symbol === item.symbol);
    if (!asset) return;

    let valueInUsd: number;

    // If asset is priced in TRY (BIST stocks), convert to USD
    if (asset.currency === 'TRY') {
      valueInUsd = (asset.price * item.quantity) / usdTryRate;
    } else {
      valueInUsd = asset.price * item.quantity;
    }

    investmentsValueUsd += valueInUsd;

    // Track by category
    if (asset.category === 'crypto') {
      cryptoValue += valueInUsd;
    } else if (asset.category === 'commodity') {
      commoditiesValue += valueInUsd;
    } else if (asset.category === 'stock') {
      stocksValue += valueInUsd;
    }
  });

  const totalUsd = cashTryInUsd + cashUsd + cashUsdt + investmentsValueUsd;

  return {
    totalUsd,
    totalTry: totalUsd * usdTryRate,
    cashTryInUsd,
    cashUsd,
    cashUsdt,
    investmentsValueUsd,
    breakdown: {
      stocks: stocksValue,
      crypto: cryptoValue,
      commodities: commoditiesValue,
    },
  };
}

/**
 * Calculates profit/loss for portfolio items.
 */
export function calculateProfitLoss(
  portfolio: PortfolioItem[],
  marketData: Asset[],
  usdTryRate: number = 34.5
): { totalPL: number; totalPLPercent: number } {
  let totalCurrentValue = 0;
  let totalCostBasis = 0;

  const investments = portfolio.filter(p => 
    p.symbol !== 'USD' && p.symbol !== 'USDT'
  );

  investments.forEach(item => {
    const asset = marketData.find(m => m.symbol === item.symbol);
    if (!asset) return;

    const currentValue = asset.price * item.quantity;
    const costBasis = item.avgCost * item.quantity;

    // Convert TRY-denominated assets to USD
    if (asset.currency === 'TRY') {
      totalCurrentValue += currentValue / usdTryRate;
      totalCostBasis += costBasis / usdTryRate;
    } else {
      totalCurrentValue += currentValue;
      totalCostBasis += costBasis;
    }
  });

  const totalPL = totalCurrentValue - totalCostBasis;
  const totalPLPercent = totalCostBasis > 0 
    ? (totalPL / totalCostBasis) * 100 
    : 0;

  return { totalPL, totalPLPercent };
}

/**
 * Gets the USD/TRY rate from market data.
 */
export function getUsdTryRate(marketData: Asset[]): number {
  const usdAsset = marketData.find(a => a.symbol === 'USD');
  return usdAsset?.price || 34.5;
}
