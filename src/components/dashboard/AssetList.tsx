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
      return <Cpu className={cn(iconClass, "text-gray-800 dark:text-gray-200")} />;
    case "TSLA":
      return <Car className={cn(iconClass, "text-red-500")} />;
    case "XAU":
      return <DollarSign className={cn(iconClass, "text-yellow-600")} />;
    case "THY":
      return <Plane className={cn(iconClass, "text-blue-500")} />;
    case "TRY":
      return <DollarSign className={cn(iconClass, "text-red-600")} />;
    default:
      return <DollarSign className={cn(iconClass, "text-gray-500")} />;
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
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark flex-1 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          İzleme Listesi
        </h3>
        <button className="text-primary text-sm font-medium hover:underline">
          Düzenle
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {assets.map((asset) => {
              const isPositive = asset.changePercent >= 0;

              return (
                <tr
                  key={asset.symbol}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer group transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {getAssetIcon(asset.symbol)}
                      <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                          {asset.symbol}
                        </div>
                        <div className="text-xs text-gray-500">{asset.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
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
