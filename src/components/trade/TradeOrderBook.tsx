import type { Asset } from "@/types";
import { cn } from "@/lib/utils";

interface TradeOrderBookProps {
  asset: Asset;
}

// Simple seeded random for consistent per-symbol data
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate simulated order book entries based on current price and symbol
function generateOrderBook(basePrice: number, symbol: string) {
  const seed = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const asks = Array.from({ length: 8 }, (_, i) => {
    const rand = seededRandom(seed + i + 100);
    return {
      price: basePrice * (1 + (0.0002 * (i + 1) + rand * 0.0003)),
      amount: 0.01 + rand * 2.5,
      total: Math.floor(1 + rand * 120),
    };
  }).sort((a, b) => b.price - a.price); // Highest price at top

  const bids = Array.from({ length: 8 }, (_, i) => {
    const rand = seededRandom(seed + i + 200);
    return {
      price: basePrice * (1 - (0.0002 * (i + 1) + rand * 0.0003)),
      amount: 0.01 + rand * 2.5,
      total: Math.floor(1 + rand * 120),
    };
  }).sort((a, b) => b.price - a.price); // Highest price at top

  return { asks, bids };
}

export default function TradeOrderBook({ asset }: TradeOrderBookProps) {
  const { asks, bids } = generateOrderBook(asset.price, asset.symbol);
  const maxAmount = Math.max(...asks.map(a => a.amount), ...bids.map(b => b.amount));
  
  // Calculate spread
  const lowestAsk = Math.min(...asks.map(a => a.price));
  const highestBid = Math.max(...bids.map(b => b.price));
  const spread = lowestAsk - highestBid;
  const spreadPercent = (spread / asset.price) * 100;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Emir Defteri</h3>
      </div>

      {/* ASKS (Sells) - Top Section */}
      <div className="flex-1 overflow-hidden relative flex flex-col justify-end">
        <div className="overflow-y-auto">
          {asks.map((order, i) => {
            const isFirstAsk = i === asks.length - 1; // Last in display = closest to spread
            return (
              <div
                key={`ask-${i}`}
                className="grid grid-cols-3 px-3 py-0.5 text-[11px] hover:bg-gray-100 dark:hover:bg-gray-800/30 cursor-pointer relative group"
                title={isFirstAsk ? `Makas: ${spreadPercent.toFixed(3)}%` : undefined}
              >
                <span className="text-danger font-medium z-10">
                  {order.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-right text-gray-500 dark:text-gray-400 z-10">
                  {order.amount.toFixed(4)}
                </span>
                <span className="text-right text-gray-400 dark:text-gray-500 z-10">{order.total}K</span>
                <div
                  className="absolute top-0 right-0 h-full bg-danger/10 dark:bg-danger/8"
                  style={{ width: `${((order.amount / maxAmount) * 100).toFixed(2)}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Center - Column Headers Only */}
      <div className="py-1.5 px-3 border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d0d0d]">
        <div className="grid grid-cols-3 text-[9px] uppercase text-gray-500 font-medium">
          <div>Fiyat</div>
          <div className="text-right">Miktar</div>
          <div className="text-right">Toplam</div>
        </div>
      </div>

      {/* BIDS (Buys) - Bottom Section */}
      <div className="flex-1 overflow-hidden relative">
        <div className="overflow-y-auto h-full">
          {bids.map((order, i) => {
            const isFirstBid = i === 0; // First in display = closest to spread
            return (
              <div
                key={`bid-${i}`}
                className="grid grid-cols-3 px-3 py-0.5 text-[11px] hover:bg-gray-100 dark:hover:bg-gray-800/30 cursor-pointer relative group"
                title={isFirstBid ? `Makas: ${spreadPercent.toFixed(3)}%` : undefined}
              >
                <span className="text-success font-medium z-10">
                  {order.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-right text-gray-500 dark:text-gray-400 z-10">
                  {order.amount.toFixed(4)}
                </span>
                <span className="text-right text-gray-400 dark:text-gray-500 z-10">{order.total}K</span>
                <div
                  className="absolute top-0 right-0 h-full bg-success/10 dark:bg-success/8"
                  style={{ width: `${((order.amount / maxAmount) * 100).toFixed(2)}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


