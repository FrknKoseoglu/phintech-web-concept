"use client";

import { useState, useEffect, useTransition } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Asset } from "@/types";
import { getAssetHistory, type ChartDataPoint } from "@/actions/market";
import { cn } from "@/lib/utils";

interface ChartAreaProps {
  asset?: Asset;
}

const timeRanges = [
  { label: "1G", value: "1d" as const },
  { label: "1H", value: "1wk" as const },
  { label: "1A", value: "1mo" as const },
  { label: "3A", value: "3mo" as const },
];

export default function ChartArea({ asset }: ChartAreaProps) {
  const symbol = asset?.symbol || "BTC";
  const price = asset?.price || 43240.1;
  const isPositive = (asset?.changePercent || 0) >= 0;

  const [activeRange, setActiveRange] = useState<"1d" | "1wk" | "1mo" | "3mo">("1mo");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isPending, startTransition] = useTransition();

  // Fetch chart data when symbol or range changes
  useEffect(() => {
    startTransition(async () => {
      const data = await getAssetHistory(symbol, activeRange);
      setChartData(data);
    });
  }, [symbol, activeRange]);

  // Format tooltip value
  const formatTooltipValue = (value: number) => {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format X axis label
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    if (activeRange === "1d") {
      return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: ChartDataPoint }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const date = new Date(data.payload.date);
      return (
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs text-text-muted mb-1">
            {date.toLocaleDateString("tr-TR", { 
              day: "2-digit", 
              month: "short",
              year: activeRange === "3mo" ? "numeric" : undefined 
            })}
            {activeRange === "1d" && ` ${date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`}
          </p>
          <p className="text-sm font-bold text-white">
            {formatTooltipValue(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const chartColor = isPositive ? "#05C46B" : "#FF3B30";

  return (
    <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 flex-1 min-h-[400px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-border-dark flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {symbol}/USD
            </span>
            <span className="bg-gray-200 dark:bg-[#2C2C2E] text-xs px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
              Spot
            </span>
          </div>
          <div className="flex flex-col">
            <span className={`text-lg font-bold ${isPositive ? "text-success" : "text-danger"}`}>
              ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-gray-500 dark:text-text-muted">
              ≈ ₺{(price * 34).toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-gray-100 dark:bg-[#1C1C1E] p-1 rounded-xl">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setActiveRange(range.value)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                activeRange === range.value
                  ? "bg-white dark:bg-[#2C2C2E] text-primary shadow-sm"
                  : "text-gray-500 dark:text-text-muted hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-4 relative">
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-dark/50 z-10">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                tick={{ fill: "#8E8E93", fontSize: 10 }}
                axisLine={{ stroke: "#2C2C2E" }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                domain={["dataMin - 100", "dataMax + 100"]}
                tick={{ fill: "#8E8E93", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}K`}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#colorPrice)"
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted">
            Grafik yükleniyor...
          </div>
        )}

        {/* Current Price Indicator */}
        <div
          className={cn(
            "absolute right-6 top-1/4 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg font-bold",
            isPositive ? "bg-success" : "bg-danger"
          )}
        >
          ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
