import type { Asset } from "@/types";
import { cn } from "@/lib/utils";

interface OrderBookProps {
  asset?: Asset;
}

// Generate simulated order book entries based on current price
function generateOrderBook(basePrice: number) {
  const asks = [
    { price: basePrice * 1.0012, amount: 0.425, total: 18.2 },
    { price: basePrice * 1.0009, amount: 0.850, total: 36.5 },
    { price: basePrice * 1.0005, amount: 0.120, total: 5.1 },
  ];

  const bids = [
    { price: basePrice * 0.9996, amount: 0.550, total: 23.4 },
    { price: basePrice * 0.9988, amount: 1.250, total: 54.1 },
    { price: basePrice * 0.9981, amount: 0.300, total: 12.9 },
    { price: basePrice * 0.9977, amount: 2.500, total: 108.2 },
  ];

  return { asks, bids };
}

export default function OrderBook({ asset }: OrderBookProps) {
  const price = asset?.price || 43240.10;
  const { asks, bids } = generateOrderBook(price);

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border-light dark:border-border-dark">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
          Emir Defteri
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* Column Headers */}
        <div className="grid grid-cols-3 text-[10px] text-gray-400 mb-2 px-2">
          <span>Fiyat (USD)</span>
          <span className="text-right">Miktar</span>
          <span className="text-right">Toplam</span>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="flex flex-col-reverse space-y-reverse space-y-0.5 mb-2">
          {asks.map((order, i) => (
            <div
              key={`ask-${i}`}
              className="grid grid-cols-3 text-xs px-2 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer relative"
            >
              <div
                className="absolute inset-0 bg-red-100 dark:bg-red-900/10"
                style={{ width: `${(order.amount / 2.5) * 100}%`, right: 0, left: "auto" }}
              />
              <span className="text-danger z-10 relative">
                {order.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-right text-gray-600 dark:text-gray-400 z-10 relative">
                {order.amount.toFixed(3)}
              </span>
              <span className="text-right text-gray-600 dark:text-gray-400 z-10 relative">
                {order.total.toFixed(1)}K
              </span>
            </div>
          ))}
        </div>

        {/* Current Price */}
        <div className="text-center py-3 my-1 border-y border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/30">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-gray-500 ml-1">USD</span>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-0.5 mt-2">
          {bids.map((order, i) => (
            <div
              key={`bid-${i}`}
              className="grid grid-cols-3 text-xs px-2 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer relative"
            >
              <div
                className="absolute inset-0 bg-green-100 dark:bg-green-900/10"
                style={{ width: `${(order.amount / 2.5) * 100}%`, right: 0, left: "auto" }}
              />
              <span className="text-success z-10 relative">
                {order.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-right text-gray-600 dark:text-gray-400 z-10 relative">
                {order.amount.toFixed(3)}
              </span>
              <span className="text-right text-gray-600 dark:text-gray-400 z-10 relative">
                {order.total.toFixed(1)}K
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
