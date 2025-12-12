import {
  Bitcoin,
  Cpu,
  Car,
  Gem,
  Plane,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { Asset } from "@/types";
import { cn } from "@/lib/utils";

interface AssetListProps {
  assets: Asset[];
}

// Map asset symbols to Lucide icons
function getAssetIcon(symbol: string) {
  const iconClass = "w-5 h-5";
  
  switch (symbol) {
    case "BTC":
      return <Bitcoin className={cn(iconClass, "text-yellow-500")} />;
    case "ETH":
      return <Gem className={cn(iconClass, "text-purple-500")} />;
    case "AAPL":
      return <Cpu className={cn(iconClass, "text-gray-200")} />;
    case "TSLA":
      return <Car className={cn(iconClass, "text-red-500")} />;
    case "XAU":
      return <DollarSign className={cn(iconClass, "text-yellow-600")} />;
    case "THY":
      return <Plane className={cn(iconClass, "text-blue-500")} />;
    case "TRY":
      return <DollarSign className={cn(iconClass, "text-red-600")} />;
    default:
      return <DollarSign className={cn(iconClass, "text-text-muted")} />;
  }
}

// Format price based on value
function formatPrice(price: number, symbol: string): string {
  if (symbol === "TRY") {
    return `$${price.toFixed(4)}`;
  }
  if (price >= 1000) {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${price.toFixed(2)}`;
}

export default function AssetList({ assets }: AssetListProps) {
  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-border-dark flex-1 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-border-dark flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 dark:text-white">
          İzleme Listesi
        </h3>
        <button className="text-primary text-sm font-medium hover:text-primary-hover transition-colors">
          Düzenle
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100 dark:divide-border-dark">
            {assets.map((asset) => {
              const isPositive = asset.changePercent >= 0;

              return (
                <tr
                  key={asset.symbol}
                  className="hover:bg-gray-50 dark:hover:bg-[#1C1C1E] cursor-pointer group transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1C1C1E] flex items-center justify-center">
                        {getAssetIcon(asset.symbol)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {asset.symbol}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-text-muted">{asset.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(asset.price, asset.symbol)}
                    </div>
                    <div
                      className={cn(
                        "text-xs font-medium flex items-center justify-end gap-0.5",
                        isPositive ? "text-success" : "text-danger"
                      )}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isPositive ? "+" : ""}
                      {asset.changePercent.toFixed(2)}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
