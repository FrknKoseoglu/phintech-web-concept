// ============================================
// Midas Web Interface - Data Models
// ============================================

/**
 * Asset category types.
 */
export type AssetCategory = "crypto" | "stock" | "commodity" | "currency" | "etf";

/**
 * Represents a tradable asset in the market.
 */
/**
 * Currency type for assets.
 */
export type AssetCurrency = 'USD' | 'TRY' | 'USDT';

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  logo: string;
  category: AssetCategory;
  currency: AssetCurrency;
}

/**
 * Represents an item in the user's portfolio.
 */
export interface PortfolioItem {
  symbol: string;
  quantity: number;
  avgCost: number;
}

/**
 * Represents a user account.
 */
export interface User {
  id: string;
  balance: number;
  portfolio: PortfolioItem[];
  favorites: string[];
}

/**
 * Represents a trade transaction.
 */
export interface Transaction {
  id: string;
  type: "BUY" | "SELL" | "DEPOSIT";
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
}

/**
 * Database schema for the local JSON database.
 */
export interface DbSchema {
  user: User;
  market: Asset[];
  transactions: Transaction[];
}

/**
 * Result of a trade execution.
 */
export interface TradeResult {
  success: boolean;
  message: string;
  transaction?: Transaction;
}

/**
 * Portfolio holding with calculated values.
 */
export interface PortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  category: AssetCategory;
  changePercent24h?: number; // 24-hour price change (from market data)
}

/**
 * Status of a limit order.
 */
export type LimitOrderStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";

/**
 * Represents a limit order for automated trading.
 */
export interface LimitOrder {
  id: string;
  userId: string;
  symbol: string;
  quantity?: number;   // Optional: Asset quantity
  amount?: number;     // Optional: Fiat amount
  targetPrice: number;
  type: "BUY" | "SELL";
  status: LimitOrderStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Result of a limit order operation.
 */
export interface LimitOrderResult {
  success: boolean;
  message: string;
  order?: LimitOrder;
}


