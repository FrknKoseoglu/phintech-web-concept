import {
  Bitcoin,
  Cpu,
  Car,
  Gem,
  Plane,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
} from "lucide-react";
import type { Asset, PortfolioItem } from "@/types";
import { cn } from "@/lib/utils";

interface HoldingWithDetails extends PortfolioItem {
  asset: Asset;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface HoldingsTableProps {
  holdings: HoldingWithDetails[];
  cashBalance: number;
}

// Map asset symbols to Lucide icons
function getAssetIcon(symbol: string) {
  const iconClass = "w-4 h-4";
  
  switch (symbol) {
    case "BTC":
      return <Bitcoin className={cn(iconClass, "text-orange-500")} />;
    case "ETH":
      return <Gem className={cn(iconClass, "text-purple-500")} />;
    case "AAPL":
      return <Cpu className={cn(iconClass)} />;
    case "TSLA":
      return <Car className={cn(iconClass, "text-red-500")} />;
    case "XAU":
      return <DollarSign className={cn(iconClass, "text-yellow-600")} />;
    case "THY":
      return <Plane className={cn(iconClass, "text-blue-500")} />;
    default:
      return <DollarSign className={cn(iconClass, "text-green-500")} />;
  }
}

const tabs = ["Tümü", "Spot", "Funding"];

export default function HoldingsTable({ holdings, cashBalance }: HoldingsTableProps) {
  const hasHoldings = holdings.length > 0;

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg w-fit">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                i === 0
                  ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Varlık ara..."
            className="pl-10 pr-4 py-2 border-none ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50 dark:bg-gray-800 text-sm rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-primary focus:outline-none dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Varlık</th>
              <th className="px-6 py-4">Fiyat</th>
              <th className="px-6 py-4">Değişim (24s)</th>
              <th className="px-6 py-4">Bakiye</th>
              <th className="px-6 py-4">K/Z</th>
              <th className="px-6 py-4 text-right">Değer (USD)</th>
              <th className="px-6 py-4 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {/* Cash Balance Row */}
            <tr className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">USD</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">US Dollar</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">$1.00</td>
              <td className="px-6 py-4">
                <span className="text-gray-400 flex items-center gap-1 font-medium">- 0.00%</span>
              </td>
              <td className="px-6 py-4 text-gray-900 dark:text-white">
                <div className="font-medium">
                  {cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </td>
              <td className="px-6 py-4 text-gray-400">-</td>
              <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold">
                ${cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-primary hover:text-primary-dark font-medium text-xs">Yatır</button>
                <span className="mx-1 text-gray-300">|</span>
                <button className="text-primary hover:text-primary-dark font-medium text-xs">Çek</button>
              </td>
            </tr>

            {/* Holdings Rows */}
            {holdings.map((holding) => {
              const isPositiveChange = holding.asset.changePercent >= 0;
              const isPositivePL = holding.profitLoss >= 0;

              return (
                <tr
                  key={holding.symbol}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 dark:bg-gray-700 flex items-center justify-center text-white">
                        {getAssetIcon(holding.symbol)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {holding.symbol}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {holding.asset.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                    ${holding.asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "flex items-center gap-1 font-medium",
                        isPositiveChange ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                      )}
                    >
                      {isPositiveChange ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isPositiveChange ? "+" : ""}
                      {holding.asset.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    <div className="font-medium">{holding.quantity.toFixed(4)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "font-medium",
                        isPositivePL ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                      )}
                    >
                      {isPositivePL ? "+" : ""}${holding.profitLoss.toFixed(2)}
                      <span className="text-xs ml-1">
                        ({isPositivePL ? "+" : ""}{holding.profitLossPercent.toFixed(2)}%)
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold">
                    ${holding.currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-success hover:text-green-400 font-medium text-xs transition-colors">
                      Al
                    </button>
                    <span className="mx-2 text-gray-600">|</span>
                    <button className="text-danger hover:text-red-400 font-medium text-xs transition-colors">
                      Sat
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {!hasHoldings && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">Henüz yatırımınız bulunmuyor.</p>
          <p className="text-xs mt-1">Al-Sat sayfasından ilk yatırımınızı yapın!</p>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          1-{holdings.length + 1} arası gösteriliyor (Toplam {holdings.length + 1} varlık)
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            Geri
          </button>
          <button className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
            İleri
          </button>
        </div>
      </div>
    </div>
  );
}
