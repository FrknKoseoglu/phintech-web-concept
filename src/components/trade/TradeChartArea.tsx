"use client";

import { useState, useEffect, useTransition } from "react";
import { LineChart, CandlestickChart } from "lucide-react";
import type { Asset } from "@/types";
import { getAssetHistory, type ChartDataPoint } from "@/actions/market";
import { cn } from "@/lib/utils";
import FinancialChart, { type ChartDataPoint as FinancialChartDataPoint } from "../charts/FinancialChart";

interface TradeChartAreaProps {
  asset: Asset;
}

const timeRanges = [
  { label: "1G", value: "1d" as const },
  { label: "1H", value: "1wk" as const },
  { label: "1A", value: "1mo" as const },
  { label: "3A", value: "3mo" as const },
  { label: "1 Yıl", value: "1y" as const },
];

export default function TradeChartArea({ asset }: TradeChartAreaProps) {
  const isPositive = asset.changePercent >= 0;
  const [activeRange, setActiveRange] = useState<"1d" | "1wk" | "1mo" | "3mo" | "1y">("1mo");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isPending, startTransition] = useTransition();
  const [chartType, setChartType] = useState<"line" | "candlestick">("candlestick");

  // Fetch chart data when symbol or range changes
  useEffect(() => {
    startTransition(async () => {
      const data = await getAssetHistory(asset.symbol, activeRange);
      setChartData(data);
    });
  }, [asset.symbol, activeRange]);

  // Convert chartData to FinancialChart format
  const financialChartData: FinancialChartDataPoint[] = chartData.map((point, i) => {
    const price = point.price;
    const variance = price * 0.015; // 1.5% variance for OHLC simulation
    
    const open = i > 0 ? chartData[i - 1].price : price;
    const high = Math.max(open, price) + Math.random() * variance;
    const low = Math.min(open, price) - Math.random() * variance;
    
    return {
      time: point.date,
      open,
      high: Math.max(open, high, low, price),
      low: Math.min(open, high, low, price),
      close: price,
    };
  });

  return (
    <div className="h-full flex flex-col relative bg-white dark:bg-black">
      {/* Toolbar */}
      <div className="h-12 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-4 bg-white dark:bg-black">
        {/* Time Range - Pill Style */}
        <div className="flex gap-1 bg-gray-100 dark:bg-[#1C1C1E] p-1 rounded-full">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setActiveRange(range.value)}
              className={cn(
                "text-xs font-medium px-4 py-1.5 rounded-full transition-all",
                activeRange === range.value
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Chart Type */}
        <div className="flex gap-1 bg-gray-100 dark:bg-[#1C1C1E] p-1 rounded-xl">
          <button 
            onClick={() => setChartType("line")}
            className={cn(
              "p-2 rounded-lg transition-all",
              chartType === "line" ? "text-primary bg-primary/15" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <LineChart className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setChartType("candlestick")}
            className={cn(
              "p-2 rounded-lg transition-all",
              chartType === "candlestick" ? "text-primary bg-primary/15" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <CandlestickChart className="w-4 h-4" />
          </button>
        </div>

        {/* Loading indicator */}
        {isPending && (
          <div className="ml-auto">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative overflow-hidden">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            Grafik yükleniyor...
          </div>
        ) : (
          <div className="h-full p-4">
            <FinancialChart
              data={financialChartData}
              type={chartType}
              height={500}
            />
          </div>
        )}

        {/* Current Price Indicator */}
        <div
          className={cn(
            "absolute right-0 top-[25%] text-white text-xs px-3 py-1.5 rounded-l-xl shadow-lg font-bold z-10",
            isPositive ? "bg-success" : "bg-danger"
          )}
        >
          ${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>

        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none z-0">
          <div className="text-[100px] font-bold text-gray-500">MIDAS</div>
        </div>
      </div>
    </div>
  );
}
