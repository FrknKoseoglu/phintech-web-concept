// ============================================
// Market Symbol Catalog - Seed Data for Infinite Scroll
// ============================================

/**
 * Curated catalog of market symbols organized by category.
 * Used for infinite scroll pagination in Market/Explore page.
 */

export interface SymbolMetadata {
  symbol: string;
  name: string;
}

export interface MarketCatalog {
  BIST: SymbolMetadata[];
  US_STOCKS: SymbolMetadata[];
  CRYPTO: SymbolMetadata[];
  ETF: SymbolMetadata[];
}

export const MARKET_CATALOG: MarketCatalog = {
  // ============================================
  // BIST - Istanbul Stock Exchange
  // BIST 30 Index + High-Volume BIST 100
  // ============================================
  BIST: [
    // BIST 30 Core
    { symbol: 'THYAO.IS', name: 'Türk Hava Yolları' },
    { symbol: 'GARAN.IS', name: 'Garanti BBVA' },
    { symbol: 'AKBNK.IS', name: 'Akbank' },
    { symbol: 'EREGL.IS', name: 'Ereğli Demir Çelik' },
    { symbol: 'SASA.IS', name: 'SASA Polyester' },
    { symbol: 'TUPRS.IS', name: 'Tüpraş' },
    { symbol: 'ISCTR.IS', name: 'İş Bankası (C)' },
    { symbol: 'YKBNK.IS', name: 'Yapı Kredi Bankası' },
    { symbol: 'TCELL.IS', name: 'Turkcell' },
    { symbol: 'SAHOL.IS', name: 'Sabancı Holding' },
    { symbol: 'PETKM.IS', name: 'Petkim' },
    { symbol: 'KCHOL.IS', name: 'Koç Holding' },
    { symbol: 'SISE.IS', name: 'Şişe Cam' },
    { symbol: 'ASELS.IS', name: 'Aselsan' },
    { symbol: 'KOZAL.IS', name: 'Koza Altın' },
    { symbol: 'TAVHL.IS', name: 'TAV Havalimanları' },
    { symbol: 'HALKB.IS', name: 'Halkbank' },
    { symbol: 'VAKBN.IS', name: 'Vakıfbank' },
    { symbol: 'BIMAS.IS', name: 'BİM' },
    { symbol: 'ENKAI.IS', name: 'Enka İnşaat' },
    
    // Popular BIST 100
    { symbol: 'FROTO.IS', name: 'Ford Otosan' },
    { symbol: 'TOASO.IS', name: 'Tofaş' },
    { symbol: 'ARCLK.IS', name: 'Arçelik' },
    { symbol: 'KOZAA.IS', name: 'Koza Anadolu Metal' },
    { symbol: 'DOHOL.IS', name: 'Doğan Holding' },
    { symbol: 'TTKOM.IS', name: 'Türk Telekom' },
    { symbol: 'PGSUS.IS', name: 'Pegasus' },
    { symbol: 'MGROS.IS', name: 'Migros' },
    { symbol: 'SOKM.IS', name: 'Şok Marketler' },
    { symbol: 'ULKER.IS', name: 'Ülker Bisküvi' },
    { symbol: 'VESBE.IS', name: 'Vestel Beyaz Eşya' },
    { symbol: 'VESTL.IS', name: 'Vestel Elektronik' },
    { symbol: 'KRDMD.IS', name: 'Kardemir' },
    { symbol: 'CIMSA.IS', name: 'Çimsa' },
  ],

  // ============================================
  // US Stocks - S&P 500 Giants & Popular Stocks
  // ============================================
  US_STOCKS: [
    // FAANG+
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)' },
    { symbol: 'GOOG', name: 'Alphabet Inc. (Class C)' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    
    // Tech Giants
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'AMD', name: 'Advanced Micro Devices' },
    { symbol: 'INTC', name: 'Intel Corp.' },
    { symbol: 'AVGO', name: 'Broadcom Inc.' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    { symbol: 'CRM', name: 'Salesforce Inc.' },
    { symbol: 'ORCL', name: 'Oracle Corp.' },
    { symbol: 'CSCO', name: 'Cisco Systems' },
    
    // Finance
    { symbol: 'JPM', name: 'JPMorgan Chase' },
    { symbol: 'BAC', name: 'Bank of America' },
    { symbol: 'WFC', name: 'Wells Fargo' },
    { symbol: 'GS', name: 'Goldman Sachs' },
    { symbol: 'MS', name: 'Morgan Stanley' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'MA', name: 'Mastercard Inc.' },
    
    // Consumer & Retail
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'COST', name: 'Costco Wholesale' },
    { symbol: 'HD', name: 'Home Depot' },
    { symbol: 'MCD', name: 'McDonald\'s Corp.' },
    { symbol: 'NKE', name: 'Nike Inc.' },
    { symbol: 'SBUX', name: 'Starbucks Corp.' },
    
    // Healthcare & Pharma
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'UNH', name: 'UnitedHealth Group' },
    { symbol: 'PFE', name: 'Pfizer Inc.' },
    { symbol: 'ABBV', name: 'AbbVie Inc.' },
  ],

  // ============================================
  // Crypto - Top 50 by Market Cap
  // ============================================
  CRYPTO: [
    // Top 10
    { symbol: 'BTC-USD', name: 'Bitcoin' },
    { symbol: 'ETH-USD', name: 'Ethereum' },
    { symbol: 'USDT-USD', name: 'Tether' },
    { symbol: 'BNB-USD', name: 'BNB' },
    { symbol: 'SOL-USD', name: 'Solana' },
    { symbol: 'XRP-USD', name: 'Ripple' },
    { symbol: 'USDC-USD', name: 'USD Coin' },
    { symbol: 'ADA-USD', name: 'Cardano' },
    { symbol: 'AVAX-USD', name: 'Avalanche' },
    { symbol: 'DOGE-USD', name: 'Dogecoin' },
    
    // Top 11-30
    { symbol: 'TRX-USD', name: 'TRON' },
    { symbol: 'DOT-USD', name: 'Polkadot' },
    { symbol: 'MATIC-USD', name: 'Polygon' },
    { symbol: 'LTC-USD', name: 'Litecoin' },
    { symbol: 'SHIB-USD', name: 'Shiba Inu' },
    { symbol: 'LINK-USD', name: 'Chainlink' },
    { symbol: 'UNI7083-USD', name: 'Uniswap' },
    { symbol: 'ATOM-USD', name: 'Cosmos' },
    { symbol: 'XLM-USD', name: 'Stellar' },
    { symbol: 'XMR-USD', name: 'Monero' },
    { symbol: 'BCH-USD', name: 'Bitcoin Cash' },
    { symbol: 'ALGO-USD', name: 'Algorand' },
    { symbol: 'VET-USD', name: 'VeChain' },
    { symbol: 'FIL-USD', name: 'Filecoin' },
    { symbol: 'ICP-USD', name: 'Internet Computer' },
    
    // Top 31-50 + Popular
    { symbol: 'APT-USD', name: 'Aptos' },
    { symbol: 'HBAR-USD', name: 'Hedera' },
    { symbol: 'NEAR-USD', name: 'NEAR Protocol' },
    { symbol: 'ARB-USD', name: 'Arbitrum' },
    { symbol: 'OP-USD', name: 'Optimism' },
    { symbol: 'AAVE-USD', name: 'Aave' },
    { symbol: 'MKR-USD', name: 'Maker' },
    { symbol: 'SAND-USD', name: 'The Sandbox' },
    { symbol: 'MANA-USD', name: 'Decentraland' },
  ],

  // ============================================
  // ETF - Popular US Exchange-Traded Funds
  // ============================================
  ETF: [
    // Major Index ETFs
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF' },
    { symbol: 'IVV', name: 'iShares Core S&P 500 ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq-100)' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
    { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF' },
    { symbol: 'IWM', name: 'iShares Russell 2000 ETF' },
    
    // Dividend ETFs
    { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF' },
    { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF' },
    { symbol: 'DGRO', name: 'iShares Core Dividend Growth ETF' },
    { symbol: 'NOBL', name: 'ProShares S&P 500 Dividend Aristocrats' },
    
    // Sector ETFs
    { symbol: 'XLK', name: 'Technology Select Sector SPDR' },
    { symbol: 'XLF', name: 'Financial Select Sector SPDR' },
    { symbol: 'XLV', name: 'Health Care Select Sector SPDR' },
    { symbol: 'XLE', name: 'Energy Select Sector SPDR' },
    { symbol: 'XLY', name: 'Consumer Discretionary SPDR' },
    { symbol: 'XLP', name: 'Consumer Staples SPDR' },
    { symbol: 'XLI', name: 'Industrial Select Sector SPDR' },
    { symbol: 'XLU', name: 'Utilities Select Sector SPDR' },
    { symbol: 'XLRE', name: 'Real Estate Select Sector SPDR' },
    
    // Growth & Value
    { symbol: 'VUG', name: 'Vanguard Growth ETF' },
    { symbol: 'VTV', name: 'Vanguard Value ETF' },
    { symbol: 'IWF', name: 'iShares Russell 1000 Growth ETF' },
    { symbol: 'IWD', name: 'iShares Russell 1000 Value ETF' },
    
    // International
    { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF' },
    { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF' },
    { symbol: 'EFA', name: 'iShares MSCI EAFE ETF' },
    { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF' },
    
    // Bond ETFs
    { symbol: 'AGG', name: 'iShares Core US Aggregate Bond ETF' },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF' },
    { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF' },
    { symbol: 'LQD', name: 'iShares iBoxx Investment Grade Corporate Bond ETF' },
  ],
};

/**
 * Get all symbols for a category
 */
export function getCategorySymbols(category: keyof MarketCatalog): string[] {
  return MARKET_CATALOG[category].map(item => item.symbol);
}

/**
 * Get paginated symbols for a category
 */
export function getPaginatedSymbols(
  category: keyof MarketCatalog,
  page: number = 1,
  limit: number = 10
): { symbols: SymbolMetadata[]; hasMore: boolean; total: number } {
  const allSymbols = MARKET_CATALOG[category];
  const total = allSymbols.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const symbols = allSymbols.slice(startIndex, endIndex);
  const hasMore = endIndex < total;

  return { symbols, hasMore, total };
}

/**
 * Search symbols across all categories
 */
export function searchSymbols(query: string): SymbolMetadata[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  const results: SymbolMetadata[] = [];
  
  Object.values(MARKET_CATALOG).forEach((category: SymbolMetadata[]) => {
    category.forEach((item: SymbolMetadata) => {
      if (
        item.symbol.toLowerCase().includes(normalizedQuery) ||
        item.name.toLowerCase().includes(normalizedQuery)
      ) {
        results.push(item);
      }
    });
  });

  return results;
}
