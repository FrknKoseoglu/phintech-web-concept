"use client";

import { useState, useMemo } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import type { Asset, AssetCategory } from "@/types";
import { cn } from "@/lib/utils";
import AssetIcon from "@/components/ui/AssetIcon";

interface AssetSidebarProps {
  assets: Asset[];
  selectedSymbol?: string;
  onSelectAsset?: (symbol: string) => void;
}

type CategoryTab = "all" | "bist" | "abd" | "crypto";

const categoryTabs: { id: CategoryTab; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "bist", label: "BIST" },
  { id: "abd", label: "ABD" },
  { id: "crypto", label: "Kripto" },
];

// Map symbols to market categories
const symbolToMarket: Record<string, CategoryTab> = {
  // BIST
  THYAO: "bist",
  GARAN: "bist",
  AKBNK: "bist",
  EREGL: "bist",
  SASA: "bist",
  // US Stocks
  AAPL: "abd",
  TSLA: "abd",
  NVDA: "abd",
  AMZN: "abd",
  MSFT: "abd",
  // Crypto
  BTC: "crypto",
  ETH: "crypto",
  SOL: "crypto",
  AVAX: "crypto",
  DOGE: "crypto",
};

function getMarketCategory(asset: Asset): CategoryTab {
  // First check symbol mapping
  if (symbolToMarket[asset.symbol]) {
    return symbolToMarket[asset.symbol];
  }
  // Then check asset category
  if (asset.category === "crypto") return "crypto";
  if (asset.category === "stock") {
    // Turkish stocks go to BIST
    if (asset.symbol.endsWith(".IS") || asset.name.includes("Türk")) return "bist";
    return "abd";
  }
  return "all";
}

export default function AssetSidebar({
  assets,
  selectedSymbol = "BTC",
  onSelectAsset,
}: AssetSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");

  // Filter assets based on search and category
  const filteredAssets = useMemo(() => {
    let filtered = assets;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (activeTab !== "all") {
      filtered = filtered.filter((asset) => getMarketCategory(asset) === activeTab);
    }

    return filtered;
  }, [assets, searchQuery, activeTab]);

  return (
    <aside className="w-full lg:w-72 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sembol ara (AAPL, BTC)..."
            className="w-full bg-gray-100 dark:bg-[#1C1C1E] border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-text-muted"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 mt-4 bg-gray-100 dark:bg-[#1C1C1E] p-1 rounded-xl">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                activeTab === tab.id
                  ? "bg-white dark:bg-[#2C2C2E] text-primary shadow-sm"
                  : "text-gray-500 dark:text-text-muted hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAssets.length === 0 ? (
          <div className="p-4 text-center text-sm text-text-muted">
            Varlık bulunamadı
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-border-dark">
            {filteredAssets.map((asset) => {
              const isSelected = asset.symbol === selectedSymbol;
              const isPositive = asset.changePercent >= 0;

              return (
                <div
                  key={asset.symbol}
                  onClick={() => onSelectAsset?.(asset.symbol)}
                  className={cn(
                    "p-3 cursor-pointer group transition-colors border-l-4",
                    isSelected
                      ? "bg-primary/5 dark:bg-primary/10 border-primary"
                      : "hover:bg-gray-50 dark:hover:bg-[#1C1C1E] border-transparent"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <AssetIcon symbol={asset.symbol} size={24} />
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {asset.symbol}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${asset.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-text-muted truncate max-w-[120px]">
                      {asset.name}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-0.5 font-medium",
                        isPositive ? "text-success" : "text-danger"
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {asset.changePercent.toFixed(2)}%
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
