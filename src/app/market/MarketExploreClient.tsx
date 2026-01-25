"use client";

import { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import InfiniteAssetList from "@/components/market/InfiniteAssetList";
import { cn } from "@/lib/utils";

type CategoryTab = 'BIST' | 'US_STOCKS' | 'CRYPTO' | 'ETF';

const categoryTabs: { id: CategoryTab; label: string; description: string }[] = [
  { id: 'BIST', label: 'BIST', description: 'Borsa İstanbul' },
  { id: 'US_STOCKS', label: 'ABD Hisseleri', description: 'S&P 500 & Nasdaq' },
  { id: 'CRYPTO', label: 'Kripto', description: 'Bitcoin, Ethereum ve daha fazlası' },
  { id: 'ETF', label: 'ETF', description: 'Yatırım Fonları' },
];

/**
 * Market Explore Page - Client Component
 * Displays infinite scroll list of market assets with category filtering
 */
export default function MarketExploreClient() {
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('CRYPTO');
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A]">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Piyasalar
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Canlı fiyatlarla binlerce varlığı keşfedin ve yatırım yapın
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sembol veya şirket adı ara (AAPL, Bitcoin, Garanti BBVA)..."
                className={cn(
                  "w-full bg-white dark:bg-black",
                  "border border-gray-300 dark:border-gray-700",
                  "rounded-2xl py-3 pl-12 pr-4 text-base",
                  "focus:ring-2 focus:ring-primary focus:border-primary",
                  "text-gray-900 dark:text-white placeholder-gray-500",
                  "transition-all"
                )}
              />
            </div>
          </div>

          {/* Category Tabs */}
          {!searchQuery && (
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={cn(
                      "flex-shrink-0 px-6 py-3 rounded-2xl transition-all duration-200",
                      "font-semibold text-sm",
                      activeCategory === tab.id
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "bg-white dark:bg-black text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800"
                    )}
                  >
                    <div>{tab.label}</div>
                    <div
                      className={cn(
                        "text-xs mt-0.5",
                        activeCategory === tab.id
                          ? "text-white/80"
                          : "text-gray-400"
                      )}
                    >
                      {tab.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>"{searchQuery}"</strong> için arama sonuçları
              </p>
            </div>
          )}

          {/* Asset List - Always show, search filtering happens inside component */}
          <InfiniteAssetList category={activeCategory} searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
}
