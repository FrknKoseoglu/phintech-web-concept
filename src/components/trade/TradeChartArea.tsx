"use client";

import { LineChart, CandlestickChart } from "lucide-react";
import type { Asset } from "@/types";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface TradeChartAreaProps {
  asset: Asset;
}

const timeRanges = ["15d", "1S", "4S", "1G", "1H"];

// Seeded random number generator for consistent SSR/client values
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export default function TradeChartArea({ asset }: TradeChartAreaProps) {
  const isPositive = asset.changePercent >= 0;

  // Use asset price as seed for consistent random values between server and client
  const candles = useMemo(() => {
    const random = seededRandom(Math.floor(asset.price * 100));
    return Array.from({ length: 8 }, () => ({
      height: random() * 50 + 25,
      bodyStart: random() * 30,
      bodyHeight: random() * 40 + 20,
      isGreen: random() > 0.35,
    }));
  }, [asset.price]);

  return (
    <div className="flex-1 flex flex-col relative bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="h-10 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-4 bg-surface-light dark:bg-surface-dark">
        {/* Time Range */}
        <div className="flex gap-1">
          {timeRanges.map((range, i) => (
            <button
              key={range}
              className={cn(
                "text-xs font-medium px-2 py-1 rounded transition-colors",
                i === 1
                  ? "text-primary bg-primary/10"
                  : "text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {range}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Chart Type */}
        <div className="flex gap-2">
          <button className="text-gray-500 hover:text-primary transition-colors">
            <LineChart className="w-4 h-4" />
          </button>
          <button className="text-primary">
            <CandlestickChart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Area with Grid Background */}
      <div
        className="flex-1 relative p-4 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(128, 128, 128, 0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(128, 128, 128, 0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      >
        {/* Candlestick Visualization */}
        <div className="absolute inset-0 flex items-end justify-around px-10 pb-10 pt-20 gap-2 opacity-80">
          {candles.map((candle, i) => (
            <div
              key={i}
              className="w-full relative group"
              style={{ height: `${candle.height}%` }}
            >
              {/* Wick */}
              <div
                className={cn(
                  "absolute h-full w-[1px] left-1/2 -translate-x-1/2",
                  candle.isGreen ? "bg-success" : "bg-danger"
                )}
              />
              {/* Body */}
              <div
                className={cn(
                  "absolute w-full left-0 right-0 mx-auto",
                  candle.isGreen ? "bg-success" : "bg-danger"
                )}
                style={{
                  bottom: `${candle.bodyStart}%`,
                  height: `${candle.bodyHeight}%`,
                }}
              />
              {/* Hover background */}
              <div
                className={cn(
                  "absolute inset-0 opacity-20",
                  candle.isGreen ? "bg-success/20" : "bg-danger/20"
                )}
              />
            </div>
          ))}
        </div>

        {/* Current Price Indicator */}
        <div
          className={cn(
            "absolute right-0 top-[25%] text-white text-xs px-2 py-1 rounded-l shadow-lg font-bold",
            isPositive ? "bg-success" : "bg-danger"
          )}
        >
          {asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>

        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <div className="text-[120px] font-bold text-gray-500">MIDAS</div>
        </div>
      </div>
    </div>
  );
}
