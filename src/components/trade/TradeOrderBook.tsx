import type { Asset } from "@/types";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

interface TradeOrderBookProps {
  asset: Asset;
}

// Generate simulated order book entries based on current price
function generateOrderBook(basePrice: number) {
  const asks = [
    { price: basePrice * 1.00025, amount: 0.4321, total: 18 },
    { price: basePrice * 1.00019, amount: 0.1250, total: 5 },
    { price: basePrice * 1.00012, amount: 1.5000, total: 63 },
    { price: basePrice * 1.00005, amount: 0.0500, total: 2 },
  ];

  const bids = [
    { price: basePrice * 0.99996, amount: 0.5500, total: 23 },
    { price: basePrice * 0.99988, amount: 0.2200, total: 9 },
    { price: basePrice * 0.99976, amount: 2.1000, total: 88 },
    { price: basePrice * 0.99964, amount: 0.1000, total: 4 },
  ];

  return { asks, bids };
}

export default function TradeOrderBook({ asset }: TradeOrderBookProps) {
  const { asks, bids } = generateOrderBook(asset.price);
  const maxAmount = 2.5;

  return (
    <div className="flex-1 flex flex-col min-h-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Emir Defteri</span>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 px-3 py-2 text-[10px] uppercase text-gray-500 dark:text-gray-400 font-medium">
        <div>Fiyat(USD)</div>
        <div className="text-right">Miktar({asset.symbol})</div>
        <div className="text-right">Toplam</div>
      </div>

      {/* Asks */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto p-1">
          {asks.map((order, i) => (
            <div
              key={`ask-${i}`}
              className="grid grid-cols-3 px-2 py-0.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer relative group"
            >
              <span className="text-danger font-medium z-10">
                {order.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-right text-gray-600 dark:text-gray-300 z-10">
                {order.amount.toFixed(4)}
              </span>
              <span className="text-right text-gray-500 z-10">{order.total}K</span>
              <div
                className="absolute top-0 right-0 h-full bg-danger/10"
                style={{ width: `${(order.amount / maxAmount) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Current Price */}
      <div className="py-2 px-3 border-y border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className={cn("text-lg font-bold", asset.changePercent >= 0 ? "text-success" : "text-danger")}>
          {asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
        <span className="text-xs text-gray-500">
          ≈ {(asset.price * 30).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TRY
        </span>
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto p-1">
          {bids.map((order, i) => (
            <div
              key={`bid-${i}`}
              className="grid grid-cols-3 px-2 py-0.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer relative group"
            >
              <span className="text-success font-medium z-10">
                {order.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-right text-gray-600 dark:text-gray-300 z-10">
                {order.amount.toFixed(4)}
              </span>
              <span className="text-right text-gray-500 z-10">{order.total}K</span>
              <div
                className="absolute top-0 right-0 h-full bg-success/10"
                style={{ width: `${(order.amount / maxAmount) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
