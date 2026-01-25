"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchMarketData } from "@/actions/market";
import type { Asset } from "@/types";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  asset: Asset;
  categoryLabel: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  crypto: "🪙 Kripto Paralar",
  stock: "📊 Hisse Senetleri", 
  etf: "📈 ETF'ler",
  commodity: "🥇 Emtialar",
  currency: "💱 Döviz",
};

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load all assets on mount
  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      try {
        const assets = await fetchMarketData();
        setAllAssets(assets);
      } catch (error) {
        console.error("Failed to load assets:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          // You would typically trigger onOpen here, but we don't have that prop
          // This will be handled in Navbar
        }
      }
      
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase().trim();
    const matches = allAssets
      .filter((asset) => 
        asset.symbol.toLowerCase().includes(searchQuery) ||
        asset.name.toLowerCase().includes(searchQuery)
      )
      .slice(0, 15) // Limit to 15 results
      .map((asset) => ({
        asset,
        categoryLabel: CATEGORY_LABELS[asset.category] || "Diğer",
      }));

    setResults(matches);
  }, [query, allAssets]);

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.categoryLabel]) {
      acc[result.categoryLabel] = [];
    }
    acc[result.categoryLabel].push(result.asset);
    return acc;
  }, {} as Record<string, Asset[]>);

  const handleSelectAsset = (symbol: string) => {
    router.push(`/trade?symbol=${symbol}`);
    onClose();
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sembol veya şirket adı ara (Bitcoin, AAPL, Garanti)..."
                className={cn(
                  "w-full bg-gray-50 dark:bg-black",
                  "border-0 rounded-xl py-3 pl-12 pr-12 text-base",
                  "focus:ring-2 focus:ring-primary focus:outline-none",
                  "text-gray-900 dark:text-white placeholder-gray-500"
                )}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">ESC</kbd>
              <span>kapat</span>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p>Yükleniyor...</p>
              </div>
            ) : query && results.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2" />
                <p>"{query}" için sonuç bulunamadı</p>
              </div>
            ) : query ? (
              <div className="py-2">
                {Object.entries(groupedResults).map(([categoryLabel, assets]) => (
                  <div key={categoryLabel} className="mb-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {categoryLabel}
                    </div>
                    {assets.map((asset) => (
                      <button
                        key={asset.symbol}
                        onClick={() => handleSelectAsset(asset.symbol)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3",
                          "hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors",
                          "text-left"
                        )}
                      >
                        <img 
                          src={asset.logo} 
                          alt={asset.symbol}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logos/placeholder.svg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {asset.symbol}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {asset.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {asset.currency === 'TRY' ? '₺' : '$'}
                            {asset.price.toLocaleString('tr-TR', { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2 
                            })}
                          </div>
                          <div className={cn(
                            "text-sm font-medium",
                            asset.changePercent >= 0 ? "text-success" : "text-danger"
                          )}>
                            {asset.changePercent >= 0 ? '+' : ''}
                            {asset.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2" />
                <p className="mb-1">Hızlı arama başlatın</p>
                <p className="text-xs text-gray-400">
                  Tüm varlıklar arasında arama yapın
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
