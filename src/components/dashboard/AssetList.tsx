"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Star,
} from "lucide-react";
import type { Asset } from "@/types";
import { cn } from "@/lib/utils";
import AssetIcon from "@/components/ui/AssetIcon";

interface AssetListProps {
  assets: Asset[];
  selectedSymbol?: string;
  onSelectAsset?: (symbol: string) => void;
  favorites?: string[];
}

// Format price based on currency
function formatPrice(price: number, currency: 'USD' | 'TRY'): string {
  if (currency === 'TRY') {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }
  if (price >= 1000) {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${price.toFixed(2)}`;
}

// Categories for accordion
const categories = [
  { id: "favorites", label: "Favoriler", icon: Star },
  { id: "crypto", label: "Kripto", filter: (a: Asset) => a.category === "crypto" },
  { id: "stock", label: "Hisseler", filter: (a: Asset) => a.category === "stock" },
  { id: "commodity", label: "Emtia & Döviz", filter: (a: Asset) => a.category === "commodity" || a.category === "currency" },
];

export default function AssetList({ assets, selectedSymbol, onSelectAsset, favorites = [] }: AssetListProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    favorites: true,
    crypto: true,
    stock: false,
    commodity: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter assets by user's actual favorites
  const favoriteAssets = assets.filter(a => favorites.includes(a.symbol));

  const getAssetsForCategory = (category: typeof categories[0]) => {
    if (category.id === "favorites") return favoriteAssets;
    if (category.filter) return assets.filter(category.filter);
    return [];
  };

  return (
    <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[420px]">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center flex-shrink-0">
        <h3 className="font-semibold text-gray-800 dark:text-white">
          İzleme Listesi
        </h3>
        <button className="text-primary text-sm font-medium hover:text-primary-hover transition-colors">
          Düzenle
        </button>
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-thin">
        {categories.map((category) => {
          const categoryAssets = getAssetsForCategory(category);
          const isOpen = openSections[category.id];

          // Show empty state for favorites, hide other empty categories
          const isFavorites = category.id === "favorites";
          if (categoryAssets.length === 0 && !isFavorites) return null;

          return (
            <div key={category.id} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection(category.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category.label}
                  </span>
                </div>
                <span className="text-xs text-text-muted bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded-full">
                  {categoryAssets.length}
                </span>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="pb-2">
                  {/* Empty state for favorites */}
                  {isFavorites && categoryAssets.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <Star className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-text-muted mb-3">
                        Henüz favori varlık eklemediniz. Trade sayfasından yıldız ikonuna tıklayarak ekleyebilirsiniz.
                      </p>
                      <a
                        href="/trade"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                      >
                        Trade Sayfasına Git
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                  categoryAssets.map((asset) => {
                    const isPositive = asset.changePercent >= 0;
                    const isSelected = asset.symbol === selectedSymbol;

                    return (
                      <div
                        key={asset.symbol}
                        onClick={() => onSelectAsset?.(asset.symbol)}
                        className={cn(
                          "flex items-center justify-between px-4 py-2 cursor-pointer transition-colors",
                          isSelected 
                            ? "bg-primary/10 border-l-2 border-primary" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-900 border-l-2 border-transparent"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <AssetIcon symbol={asset.symbol} size={32} />
                          <div>
                            <div className={cn(
                              "font-bold text-sm",
                              isSelected ? "text-primary" : "text-gray-900 dark:text-white"
                            )}>
                              {asset.symbol}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-text-muted">
                              {asset.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm text-gray-900 dark:text-white">
                            {formatPrice(asset.price, asset.currency)}
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
                        </div>
                      </div>
                    );
                  }))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
