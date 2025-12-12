import YahooFinance from 'yahoo-finance2';
import type { Asset } from '@/types';

// Yahoo Finance v3 requires instantiation
const yahooFinance = new YahooFinance();

// Quote result type
interface QuoteResult {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
}

// Bizim UI'daki sembollerimiz ile Yahoo'nun sembolleri arasındaki harita
const SYMBOL_MAP: Record<string, string> = {
  'BTC': 'BTC-USD',
  'ETH': 'ETH-USD',
  'AAPL': 'AAPL',
  'TSLA': 'TSLA',
  'NVDA': 'NVDA',
  'THYAO': 'THYAO.IS',
  'USD': 'TRY=X',
  'XAU': 'GC=F' // Altın Ons
};

// Başlangıç (Yedek) Verisi - Yahoo çalışmazsa bu döner
const SEED_ASSETS: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 42000, changePercent: 0, logo: "/logos/btc.svg", category: 'crypto' },
  { symbol: "ETH", name: "Ethereum", price: 2200, changePercent: 0, logo: "/logos/eth.svg", category: 'crypto' },
  { symbol: "AAPL", name: "Apple Inc.", price: 180, changePercent: 0, logo: "/logos/aapl.svg", category: 'stock' },
  { symbol: "TSLA", name: "Tesla Inc.", price: 240, changePercent: 0, logo: "/logos/tsla.svg", category: 'stock' },
  { symbol: "THYAO", name: "Türk Hava Yolları", price: 260, changePercent: 0, logo: "/logos/thy.svg", category: 'stock' },
  { symbol: "USD", name: "US Dollar", price: 30, changePercent: 0, logo: "/logos/usd.svg", category: 'commodity' },
];

export async function getMarketData(): Promise<Asset[]> {
  try {
    // 1. Yahoo sembollerini bir diziye çevir
    const yahooSymbols = Object.values(SYMBOL_MAP);

    // 2. Yahoo Finance'den veriyi çek
    const results = await yahooFinance.quote(yahooSymbols) as QuoteResult[];

    console.log("✅ Yahoo Data Geldi:", results.length, "adet varlık.");

    // 3. Gelen veriyi bizim 'Asset' formatımıza dönüştür
    const updatedAssets = SEED_ASSETS.map((asset) => {
      // Bizim sembolümüze karşılık gelen Yahoo sembolünü bul
      const yahooSymbol = SYMBOL_MAP[asset.symbol];
      // Sonuçlar arasından bu sembolü bul
      const quote = results.find((r: QuoteResult) => r.symbol === yahooSymbol);

      if (quote) {
        return {
          ...asset,
          // Fiyat varsa al, yoksa eskisi kalsın
          price: quote.regularMarketPrice || asset.price,
          // Yüzde değişim varsa al, yoksa 0
          changePercent: quote.regularMarketChangePercent || 0,
        };
      }
      return asset;
    });

    return updatedAssets;

  } catch (error) {
    console.error("❌ Yahoo Finance Hatası:", error);
    // Hata olursa site çökmesin, eski (seed) veriyi döndür
    return SEED_ASSETS;
  }
}

// Tek bir varlığı bulmak için yardımcı fonksiyon
export async function getAssetBySymbol(symbol: string): Promise<Asset | undefined> {
  const market = await getMarketData();
  return market.find((a) => a.symbol === symbol);
}

// Legacy exports for backward compatibility
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
