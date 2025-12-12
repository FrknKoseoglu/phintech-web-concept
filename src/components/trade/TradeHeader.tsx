import { Star, Share2 } from "lucide-react";
import type { Asset } from "@/types";
import { cn } from "@/lib/utils";

interface TradeHeaderProps {
  asset: Asset;
}

export default function TradeHeader({ asset }: TradeHeaderProps) {
  const isPositive = asset.changePercent >= 0;
  const priceChange = asset.price * (asset.changePercent / 100);

  // Mock 24h stats
  const stats = {
    volume24h: "28,451.21",
    volumeUSD: "1.2B",
    high24h: (asset.price * 1.015).toFixed(2),
    low24h: (asset.price * 0.975).toFixed(2),
  };

  return (
    <div className="h-16 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between bg-surface-light dark:bg-surface-dark">
      <div className="flex items-center gap-4">
        {/* Asset Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {asset.symbol}/USD
            </h1>
            <span className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-0.5 rounded text-gray-500 dark:text-gray-300">
              {asset.symbol === "BTC" || asset.symbol === "ETH" ? "Kripto" : "Hisse"}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {asset.name}
          </span>
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

        {/* Price */}
        <div className="flex flex-col">
          <span className={cn("text-2xl font-bold", isPositive ? "text-success" : "text-danger")}>
            ${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span className={cn("text-xs font-medium", isPositive ? "text-success" : "text-danger")}>
            {isPositive ? "+" : ""}${priceChange.toFixed(2)} ({isPositive ? "+" : ""}{asset.changePercent.toFixed(2)}%)
          </span>
        </div>

        {/* 24h Stats (Hidden on smaller screens) */}
        <div className="hidden xl:flex items-center gap-6 ml-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">
              24s Hacim ({asset.symbol})
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {stats.volume24h}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">
              24s Hacim (USD)
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {stats.volumeUSD}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">
              24s En Yüksek
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {stats.high24h}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">
              24s En Düşük
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {stats.low24h}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
          <Star className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
