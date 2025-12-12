// ============================================
// Midas Web Interface - Data Models
// ============================================

/**
 * Represents a tradable asset in the market.
 */
export interface Asset {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  logo: string;
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
}

/**
 * Database schema for the local JSON database.
 */
export interface DbSchema {
  user: User;
  market: Asset[];
}
