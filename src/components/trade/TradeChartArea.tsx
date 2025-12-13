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
import { LineChart, CandlestickChart } from "lucide-react";
import type { Asset } from "@/types";
import { getAssetHistory, type ChartDataPoint } from "@/actions/market";
import { cn } from "@/lib/utils";

interface TradeChartAreaProps {
  asset: Asset;
}

const timeRanges = [
  { label: "1G", value: "1d" as const },
  { label: "1H", value: "1wk" as const },
  { label: "1A", value: "1mo" as const },
  { label: "3A", value: "3mo" as const },
];

export default function TradeChartArea({ asset }: TradeChartAreaProps) {
  const isPositive = asset.changePercent >= 0;
  const [activeRange, setActiveRange] = useState<"1d" | "1wk" | "1mo" | "3mo">("1mo");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isPending, startTransition] = useTransition();
  const [chartType, setChartType] = useState<"line" | "candle">("line");

  // Fetch chart data when symbol or range changes
  useEffect(() => {
    startTransition(async () => {
      const data = await getAssetHistory(asset.symbol, activeRange);
      setChartData(data);
    });
  }, [asset.symbol, activeRange]);

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
    <div className="h-full flex flex-col relative bg-black">
      {/* Toolbar */}
      <div className="h-12 border-b border-gray-800 flex items-center px-4 gap-4 bg-black">
        {/* Time Range - Pill Style */}
        <div className="flex gap-1 bg-[#1C1C1E] p-1 rounded-full">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setActiveRange(range.value)}
              className={cn(
                "text-xs font-medium px-4 py-1.5 rounded-full transition-all",
                activeRange === range.value
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-700" />

        {/* Chart Type */}
        <div className="flex gap-1 bg-[#1C1C1E] p-1 rounded-xl">
          <button 
            onClick={() => setChartType("line")}
            className={cn(
              "p-2 rounded-lg transition-all",
              chartType === "line" ? "text-primary bg-primary/15" : "text-gray-400 hover:text-white"
            )}
          >
            <LineChart className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setChartType("candle")}
            className={cn(
              "p-2 rounded-lg transition-all",
              chartType === "candle" ? "text-primary bg-primary/15" : "text-gray-400 hover:text-white"
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
      <div
        className="flex-1 relative p-4 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(128, 128, 128, 0.05) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(128, 128, 128, 0.05) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="tradeChartGradient" x1="0" y1="0" x2="0" y2="1">
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
                minTickGap={60}
              />
              <YAxis
                domain={["dataMin - 100", "dataMax + 100"]}
                tick={{ fill: "#8E8E93", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) => `$${(value / 1000).toFixed(1)}K`}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#tradeChartGradient)"
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            Grafik yükleniyor...
          </div>
        )}

        {/* Current Price Indicator */}
        <div
          className={cn(
            "absolute right-0 top-[25%] text-white text-xs px-3 py-1.5 rounded-l-xl shadow-lg font-bold",
            isPositive ? "bg-success" : "bg-danger"
          )}
        >
          ${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>

        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <div className="text-[100px] font-bold text-gray-500">MIDAS</div>
        </div>
      </div>
    </div>
  );
}
