import YahooFinance from 'yahoo-finance2';
import { unstable_cache } from 'next/cache';
import type { Asset, AssetCategory } from '@/types';
import { getCryptoPrices } from './coingecko';
import { getUSDTRY } from './tcmb';



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

// Default fallback prices (Updated: Jan 2026)
const FALLBACK_PRICES: Record<string, number> = {
  'BTC': 89693,   // ✅ Updated from real market data
  'ETH': 2950,    // ✅ Updated from real market data
  'SOL': 127.89,  // ✅ Updated from real market data
  'AVAX': 35.00,  // Updated fallback (CoinGecko provides real-time)
  'DOGE': 0.15,   // Estimated based on recent trends
  'AAPL': 210,    // Estimated Jan 2026
  'TSLA': 252,    // Estimated Jan 2026
  'NVDA': 825,    // Estimated Jan 2026
  'AMZN': 192,    // Estimated Jan 2026
  'MSFT': 420,    // Estimated Jan 2026
  'THYAO': 260,   // BIST stocks (will use live data)
  'GARAN': 55,
  'AKBNK': 45,
  'EREGL': 38,
  'SASA': 62,
  'XAU': 2750,    // Gold estimated ~$2750/oz
  'XAG': 32,      // Silver estimated ~$32/oz
  'USD': 43.28,   // ✅ TCMB official rate
  'USDT': 43.26,  // ✅ Updated (1 USDT ≈ 1 USD)
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
    // Dynamic instantiation to ensure fresh state/crumb for each (cached) call
    console.log("🔥 creating new yahoo finance instance");
    const yahooFinance = new YahooFinance();
    return await yahooFinance.quote(symbols) as QuoteResult[];
  },
  ['yahoo-market-quotes-v4'], // Bump version again
  { 
    revalidate: 60, // Cache for 60 seconds
    tags: ['market-data'] 
  }
);

export async function getMarketData(): Promise<Asset[]> {
  try {
    // Multi-provider approach: fetch from different sources in parallel
    const [cryptoPrices, usdTryRate, yahooResults] = await Promise.all([
      // CoinGecko for crypto (reliable, no rate limit issues)
      getCryptoPrices(['BTC', 'ETH', 'SOL', 'AVAX', 'DOGE', 'USDT']).catch(err => {
        console.error('❌ CoinGecko error:', err);
        return new Map();
      }),
      
      // TCMB for official USD/TRY rate
      getUSDTRY().catch(err => {
        console.error('❌ TCMB error:', err);
        return 43.28; // Fallback
      }),
      
      // Yahoo Finance only for stocks (US + BIST) and commodities
      (async () => {
        try {
          const stockSymbols = [
            'AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT',  // US stocks
            'THYAO.IS', 'GARAN.IS', 'AKBNK.IS', 'EREGL.IS', 'SASA.IS',  // BIST
            'GC=F', 'SI=F',  // Commodities
          ];
          
          try {
            return await fetchYahooQuotes(stockSymbols);
          } catch (yahooError: any) {
            // Handle Yahoo Finance specific errors (especially 429)
            if (yahooError?.message?.includes('429') || yahooError?.message?.includes('Too Many Requests')) {
              console.warn('⚠️ Yahoo Finance Rate Limited (429) - Using fallback prices for stocks');
            } else {
              console.error('❌ Yahoo Finance error:', yahooError?.message || yahooError);
            }
            return []; // Return empty array to use fallback prices
          }
        } catch (err) {
          console.error('❌ Yahoo Finance wrapper error:', err);
          return [];
        }
      })(),
    ]);

    // Log data source status
    console.log('📊 Market Data Sources Status:');
    console.log(`  ✅ CoinGecko: ${cryptoPrices.size} crypto prices loaded`);
    console.log(`  ✅ TCMB: USD/TRY = ₺${usdTryRate.toFixed(4)}`);
    console.log(`  ${yahooResults.length > 0 ? '✅' : '⚠️'} Yahoo Finance: ${yahooResults.length} stock quotes${yahooResults.length === 0 ? ' (using fallback)' : ''}`);

    // Update assets with live data from multiple sources
    const updatedAssets = SEED_ASSETS.map((asset) => {
      // 1. Try CoinGecko for crypto
      if (asset.category === 'crypto' || asset.symbol === 'USDT') {
        const cryptoData = cryptoPrices.get(asset.symbol);
        if (cryptoData) {
          let price = cryptoData.price;
          
          // USDT: convert USD to TRY
          if (asset.symbol === 'USDT') {
            price = price * usdTryRate;
          }
          
          return {
            ...asset,
            price,
            changePercent: cryptoData.changePercent,
          };
        }
      }
      
      // 2. Use TCMB rate for USD/TRY
      if (asset.symbol === 'USD') {
        return {
          ...asset,
          price: usdTryRate,
          changePercent: 0, // TCMB doesn't provide change %
        };
      }
      
      // 3. Try Yahoo Finance for stocks and commodities
      const yahooSymbol = SYMBOL_MAP[asset.symbol];
      const quote = yahooResults.find((r: QuoteResult) => r.symbol === yahooSymbol);
      
      if (quote && quote.regularMarketPrice) {
        return {
          ...asset,
          price: quote.regularMarketPrice,
          changePercent: quote.regularMarketChangePercent || 0,
        };
      }
      
      // 4. Fallback to default prices
      return asset;
    });

    return updatedAssets;

  } catch (error: any) {
    console.error("❌ Market data fetch error:", error);
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
