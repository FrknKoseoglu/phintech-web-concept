"use client";

import { useState, useTransition, useEffect } from "react";
import { Star, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { Asset } from "@/types";
import { cn } from "@/lib/utils";
import { toggleFavorite } from "@/actions/user";

interface TradeHeaderProps {
  asset: Asset;
  isFavorite?: boolean;
}

export default function TradeHeader({ asset, isFavorite: initialFavorite = false }: TradeHeaderProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isPending, startTransition] = useTransition();
  
  // Sync state when prop changes (e.g., switching assets)
  useEffect(() => {
    setIsFavorite(initialFavorite);
  }, [initialFavorite]);
  
  const isPositive = asset.changePercent >= 0;
  const priceChange = asset.price * (asset.changePercent / 100);

  // Mock 24h stats
  const stats = {
    volume24h: "28,451.21",
    volumeUSD: "1.2B",
    high24h: (asset.price * 1.015).toFixed(2),
    low24h: (asset.price * 0.975).toFixed(2),
  };

  const handleToggleFavorite = () => {
    // Optimistic update
    setIsFavorite((prev) => !prev);

    startTransition(async () => {
      const result = await toggleFavorite(asset.symbol);
      if (!result.success) {
        // Revert on failure
        setIsFavorite((prev) => !prev);
        toast.error("Favorilere eklenemedi");
      } else {
        toast.success(result.isFavorite ? "Favorilere eklendi" : "Favorilerden çıkarıldı");
      }
    });
  };

  // Get category label
  const getCategoryLabel = () => {
    switch (asset.category) {
      case "crypto": return "Kripto";
      case "stock": return "Hisse";
      case "commodity": return "Emtia";
      case "currency": return "Döviz";
      default: return "Varlık";
    }
  };

  return (
    <div className="h-16 px-6 flex items-center justify-between bg-white dark:bg-black">
      <div className="flex items-center gap-4">
        {/* Asset Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {asset.symbol}/{asset.currency === 'TRY' ? 'TRY' : 'USD'}
            </h1>
            <span className="bg-primary/15 text-primary text-xs px-2.5 py-1 rounded-full font-medium">
              {getCategoryLabel()}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {asset.name}
          </span>
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-2" />

        {/* Price */}
        <div className="flex flex-col">
          <span className={cn("text-2xl font-bold", isPositive ? "text-success" : "text-danger")}>
            {asset.currency === 'TRY' 
              ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(asset.price)
              : `$${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </span>
          <span className={cn("text-xs font-medium", isPositive ? "text-success" : "text-danger")}>
            {isPositive ? "+" : ""}{asset.currency === 'TRY' ? '₺' : '$'}{priceChange.toFixed(2)} ({isPositive ? "+" : ""}{asset.changePercent.toFixed(2)}%)
          </span>
        </div>

        {/* 24h Stats (Hidden on smaller screens) */}
        <div className="hidden xl:flex items-center gap-6 ml-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-medium">
              24s Hacim ({asset.symbol})
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {stats.volume24h}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-medium">
              24s Hacim (USD)
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {stats.volumeUSD}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-medium">
              24s En Yüksek
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {stats.high24h}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-medium">
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
        <button 
          onClick={handleToggleFavorite}
          disabled={isPending}
          className={cn(
            "p-2.5 rounded-xl transition-all",
            isFavorite 
              ? "text-yellow-500 bg-yellow-500/15 hover:bg-yellow-500/25" 
              : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
        >
          <Star className={cn("w-5 h-5", isFavorite && "fill-current")} />
        </button>
        <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 transition-all">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
