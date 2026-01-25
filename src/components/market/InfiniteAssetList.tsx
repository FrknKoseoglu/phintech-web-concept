"use client";

import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Asset } from "@/types";
import { cn } from "@/lib/utils";
import AssetIcon from "@/components/ui/AssetIcon";
import { getMarketList } from "@/actions/market";

interface InfiniteAssetListProps {
  category: 'BIST' | 'US_STOCKS' | 'CRYPTO' | 'ETF';
  searchQuery?: string;
}

/**
 * Infinite scroll asset list component
 * Loads assets progressively as user scrolls to bottom
 */
export default function InfiniteAssetList({ category, searchQuery }: InfiniteAssetListProps) {
  const router = useRouter();
  const [items, setItems] = useState<Asset[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Load more data
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // Pass searchQuery to getMarketList if it exists
      const result = await getMarketList(category, page, 10, searchQuery);
      
      if (result.assets.length > 0) {
        setItems(prev => [...prev, ...result.assets]);
        setPage(prev => prev + 1);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load market data:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [category, page, loading, hasMore]);

  // Reset when category or searchQuery changes
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setInitialLoad(true);
    setLoading(false);
  }, [category, searchQuery]);

  // Load initial data
  useEffect(() => {
    if (initialLoad && items.length === 0) {
      loadMore();
    }
  }, [initialLoad, items.length]);

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && !loading && hasMore && !initialLoad) {
      loadMore();
    }
  }, [inView, loading, hasMore, initialLoad]);

  // Navigate to trade page
  const handleAssetClick = (symbol: string) => {
    router.push(`/trade?symbol=${symbol}`);
  };

  // Skeleton loading cards
  const renderSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded ml-auto" />
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );

  // Format price with currency symbol
  const formatPrice = (price: number, currency: 'USD' | 'TRY' | 'USDT'): string => {
    if (currency === 'TRY') {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    }
    if (currency === 'USDT') {
      return `₮${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Initial loading state
  if (initialLoad && items.length === 0) {
    return renderSkeleton();
  }

  // Empty state
  if (!initialLoad && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-gray-400 mb-2">
          <TrendingUp className="w-12 h-12 mx-auto opacity-50" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Bu kategoride varlık bulunamadı
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Asset List */}
      {items.map((asset, index) => {
        const isPositive = asset.changePercent >= 0;

        return (
          <div
            key={`${asset.symbol}-${index}`}
            onClick={() => handleAssetClick(asset.symbol)}
            className={cn(
              "flex items-center justify-between p-4 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800",
              "cursor-pointer transition-all duration-200",
              "hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-primary/50 hover:shadow-md"
            )}
          >
            {/* Left: Icon + Info */}
            <div className="flex items-center gap-3">
              <AssetIcon symbol={asset.symbol} size={40} />
              <div>
                <div className="font-bold text-sm text-gray-900 dark:text-white">
                  {asset.symbol}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                  {asset.name}
                </div>
              </div>
            </div>

            {/* Right: Price + Change */}
            <div className="text-right">
              <div className="font-semibold text-sm text-gray-900 dark:text-white mb-0.5">
                {formatPrice(asset.price, asset.currency)}
              </div>
              <div
                className={cn(
                  "text-xs font-medium flex items-center justify-end gap-1",
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
              </div>
            </div>
          </div>
        );
      })}

      {/* Loading Spinner at Bottom */}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Yükleniyor...</span>
          </div>
        </div>
      )}

      {/* End of List */}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-6 text-sm text-gray-400">
          Tüm varlıklar gösterildi ({items.length} adet)
        </div>
      )}
    </div>
  );
}
