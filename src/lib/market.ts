import YahooFinance from 'yahoo-finance2';
import type { Asset, AssetCategory } from '@/types';

// Yahoo Finance v3 requires instantiation
const yahooFinance = new YahooFinance();

// Quote result type
interface QuoteResult {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
}

// UI symbols to Yahoo Finance symbols mapping
const SYMBOL_MAP: Record<string, string> = {
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
  'XAU': 'GC=F',    // Gold
  'XAG': 'SI=F',    // Silver
  // Currency
  'USD': 'TRY=X',   // USD/TRY
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
  // Currency
  'USD': { name: 'Dolar/TL', category: 'currency', logo: '/logos/usd.svg' },
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
  'USD': 34,
};

// Build seed assets from metadata
const SEED_ASSETS: Asset[] = Object.entries(ASSET_META).map(([symbol, meta]) => ({
  symbol,
  name: meta.name,
  price: FALLBACK_PRICES[symbol] || 100,
  changePercent: 0,
  logo: meta.logo,
  category: meta.category,
}));

// Market categories for filtering
export const MARKET_CATEGORIES = {
  crypto: ['BTC', 'ETH', 'SOL', 'AVAX', 'DOGE'],
  abd: ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT'],
  bist: ['THYAO', 'GARAN', 'AKBNK', 'EREGL', 'SASA'],
  commodity: ['XAU', 'XAG', 'USD'],
};

export async function getMarketData(): Promise<Asset[]> {
  try {
    const yahooSymbols = Object.values(SYMBOL_MAP);
    const results = await yahooFinance.quote(yahooSymbols) as QuoteResult[];

    console.log("✅ Yahoo Data:", results.length, "assets fetched.");

    // Update assets with live data
    const updatedAssets = SEED_ASSETS.map((asset) => {
      const yahooSymbol = SYMBOL_MAP[asset.symbol];
      const quote = results.find((r: QuoteResult) => r.symbol === yahooSymbol);

      if (quote) {
        return {
          ...asset,
          price: quote.regularMarketPrice || asset.price,
          changePercent: quote.regularMarketChangePercent || 0,
        };
      }
      return asset;
    });

    return updatedAssets;

  } catch (error) {
    console.error("❌ Yahoo Finance Error:", error);
    return SEED_ASSETS;
  }
}

export async function getAssetBySymbol(symbol: string): Promise<Asset | undefined> {
  const market = await getMarketData();
  return market.find((a) => a.symbol === symbol);
}

// Legacy exports
export { SEED_ASSETS };

export function getMarketDataSnapshot(): Asset[] {
  return SEED_ASSETS;
}

export function resetMarketPrices(): void {
  // No-op in real data mode
}

export function getAssetInfo(symbol: string): Asset | undefined {
  return SEED_ASSETS.find((a) => a.symbol === symbol);
}
