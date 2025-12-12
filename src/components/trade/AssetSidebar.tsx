"use client";

import { useState } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import type { Asset } from "@/types";
import { cn } from "@/lib/utils";

interface AssetSidebarProps {
  assets: Asset[];
  selectedSymbol?: string;
  onSelectAsset?: (symbol: string) => void;
}

const categories = ["Favoriler", "BIST", "ABD", "Kripto"];

export default function AssetSidebar({
  assets,
  selectedSymbol = "BTC",
  onSelectAsset,
}: AssetSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Favoriler");

  // Filter assets based on search query
  const filteredAssets = assets.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-72 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sembol ara (AAPL, BTC)..."
            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary text-gray-900 dark:text-gray-100 placeholder-gray-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mt-4 text-xs font-medium overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1 rounded-full whitespace-nowrap transition-colors",
                activeCategory === cat
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
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
                    ? "bg-primary/5 border-primary"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-[8px] text-white font-bold">
                      {asset.symbol.charAt(0)}
                    </div>
                    <span className="font-bold text-sm">
                      {asset.symbol}/USD
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    ${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
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
      </div>
    </aside>
  );
}
