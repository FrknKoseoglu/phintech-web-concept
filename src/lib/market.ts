import YahooFinance from 'yahoo-finance2';
import { unstable_cache } from 'next/cache';
import type { Asset, AssetCategory } from '@/types';

// Yahoo Finance v3 requires instantiation
const yahooFinance = new YahooFinance();

// Quote result type
interface QuoteResult {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
}

// UI symbols to Yahoo Finance symbols mapping (exported for use in chart data)
export const SYMBOL_MAP: Record<string, string> = {
  // Crypto
  'BTC': 'BTC-USD',
  'ETH': 'ETH-USD',
  'SOL': 'SOL-USD',
  'AVAX': 'AVAX-USD',
  'DOGE': 'DOGE-USD',
  // US Stocks
  'AAPL': 'AAPL',
  'TSLA': 'TSLA',
  'NVDA': 'NVDA',
  'AMZN': 'AMZN',
  'MSFT': 'MSFT',
  // BIST (Istanbul Stock Exchange)
  'THYAO': 'THYAO.IS',
  'GARAN': 'GARAN.IS',
  'AKBNK': 'AKBNK.IS',
  'EREGL': 'EREGL.IS',
  'SASA': 'SASA.IS',
  // Commodities
  'XAU': 'GC=F',    // Gold (USD)
  'XAG': 'SI=F',    // Silver (USD)
  // Currencies (for exchange)
  'USD': 'TRY=X',     // USD price in TRY
  'USDT': 'USDT-USD', // USDT price in USD (will convert to TRY)
};

// Asset metadata (name, category, logo)
interface AssetMeta {
  name: string;
  category: AssetCategory;
  logo: string;
}

const ASSET_META: Record<string, AssetMeta> = {
  // Crypto
  'BTC': { name: 'Bitcoin', category: 'crypto', logo: '/logos/btc.svg' },
  'ETH': { name: 'Ethereum', category: 'crypto', logo: '/logos/eth.svg' },
  'SOL': { name: 'Solana', category: 'crypto', logo: '/logos/sol.svg' },
  'AVAX': { name: 'Avalanche', category: 'crypto', logo: '/logos/avax.svg' },
  'DOGE': { name: 'Dogecoin', category: 'crypto', logo: '/logos/doge.svg' },
  // US Stocks
  'AAPL': { name: 'Apple Inc.', category: 'stock', logo: '/logos/aapl.svg' },
  'TSLA': { name: 'Tesla Inc.', category: 'stock', logo: '/logos/tsla.svg' },
  'NVDA': { name: 'NVIDIA Corp.', category: 'stock', logo: '/logos/nvda.svg' },
  'AMZN': { name: 'Amazon.com', category: 'stock', logo: '/logos/amzn.svg' },
  'MSFT': { name: 'Microsoft Corp.', category: 'stock', logo: '/logos/msft.svg' },
  // BIST
  'THYAO': { name: 'Türk Hava Yolları', category: 'stock', logo: '/logos/thy.svg' },
  'GARAN': { name: 'Garanti BBVA', category: 'stock', logo: '/logos/garan.svg' },
  'AKBNK': { name: 'Akbank', category: 'stock', logo: '/logos/akbnk.svg' },
  'EREGL': { name: 'Ereğli Demir Çelik', category: 'stock', logo: '/logos/eregl.svg' },
  'SASA': { name: 'SASA Polyester', category: 'stock', logo: '/logos/sasa.svg' },
  // Commodities
  'XAU': { name: 'Altın (Ons)', category: 'commodity', logo: '/logos/gold.svg' },
  'XAG': { name: 'Gümüş (Ons)', category: 'commodity', logo: '/logos/silver.svg' },
  // Currencies
  'USD': { name: 'Amerikan Doları', category: 'currency', logo: '/logos/usd.svg' },
  'USDT': { name: 'Tether', category: 'currency', logo: '/logos/usdt.svg' },
};

// Default fallback prices
const FALLBACK_PRICES: Record<string, number> = {
  'BTC': 42000,
  'ETH': 2200,
  'SOL': 95,
  'AVAX': 35,
  'DOGE': 0.08,
  'AAPL': 180,
  'TSLA': 240,
  'NVDA': 480,
  'AMZN': 155,
  'MSFT': 375,
  'THYAO': 260,
  'GARAN': 55,
  'AKBNK': 45,
  'EREGL': 38,
  'SASA': 62,
  'XAU': 2050,
  'XAG': 24,
  'USD': 34.5,    // 1 USD = 34.5 TRY
  'USDT': 34.3,   // 1 USDT ≈ 34.3 TRY
};

// Determine currency based on asset type
// This determines what currency the PRICE is displayed in
function getCurrency(uiSymbol: string): 'USD' | 'TRY' {
  const yahooSymbol = SYMBOL_MAP[uiSymbol];
  // BIST stocks are priced in TRY
  if (yahooSymbol?.endsWith('.IS')) return 'TRY';
  // USD and USDT are priced in TRY (for buying with TL)
  if (uiSymbol === 'USD' || uiSymbol === 'USDT') return 'TRY';
  // Everything else is in USD
  return 'USD';
}

// Build seed assets from metadata
const SEED_ASSETS: Asset[] = Object.entries(ASSET_META).map(([symbol, meta]) => ({
  symbol,
  name: meta.name,
  price: FALLBACK_PRICES[symbol] || 100,
  changePercent: 0,
  logo: meta.logo,
  category: meta.category,
  currency: getCurrency(symbol),
}));

// Market categories for filtering (currencies hidden from default list)
export const MARKET_CATEGORIES = {
  crypto: ['BTC', 'ETH', 'SOL', 'AVAX', 'DOGE'],
  abd: ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT'],
  bist: ['THYAO', 'GARAN', 'AKBNK', 'EREGL', 'SASA'],
  commodity: ['XAU', 'XAG'],
  // USD and USDT are searchable but not shown in default tabs
};

// Cached wrapper for Yahoo Finance quote API
const fetchYahooQuotes = unstable_cache(
  async (symbols: string[]) => {
    return await yahooFinance.quote(symbols) as QuoteResult[];
  },
  ['yahoo-market-quotes'],
  { 
    revalidate: 60, // Cache for 60 seconds
    tags: ['market-data'] 
  }
);

export async function getMarketData(): Promise<Asset[]> {
  try {
    const yahooSymbols = Object.values(SYMBOL_MAP);
    const results = await fetchYahooQuotes(yahooSymbols);

    // Get USD/TRY rate for USDT conversion
    const usdTryQuote = results.find((r: QuoteResult) => r.symbol === 'TRY=X');
    const usdTryRate = usdTryQuote?.regularMarketPrice || 34.5;

    // Update assets with live data
    const updatedAssets = SEED_ASSETS.map((asset) => {
      const yahooSymbol = SYMBOL_MAP[asset.symbol];
      const quote = results.find((r: QuoteResult) => r.symbol === yahooSymbol);

      if (quote) {
        let price = quote.regularMarketPrice || asset.price;
        let changePercent = quote.regularMarketChangePercent || 0;
        
        // USDT is fetched as USDT-USD, convert to TRY
        if (asset.symbol === 'USDT' && price > 0) {
          price = price * usdTryRate; // 1 USDT = X USD * Y TRY/USD = Z TRY
        }
        
        return {
          ...asset,
          price,
          changePercent,
        };
      }
      return asset;
    });

    return updatedAssets;

  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
      console.error("❌ Yahoo Finance Rate Limit (429): Using fallback data. Cache should prevent this.");
    } else {
      console.error("❌ Yahoo Finance Error:", error);
    }
    return SEED_ASSETS;
  }
}

export async function getAssetBySymbol(symbol: string): Promise<Asset | undefined> {
  const market = await getMarketData();
  return market.find((a) => a.symbol === symbol);
}

// Legacy exports
export { SEED_ASSETS };

// Get live market data snapshot (async version)
export async function getMarketDataSnapshot(): Promise<Asset[]> {
  return await getMarketData();
}

export function resetMarketPrices(): void {
  // No-op in real data mode
}

export function getAssetInfo(symbol: string): Asset | undefined {
  return SEED_ASSETS.find((a) => a.symbol === symbol);
}
