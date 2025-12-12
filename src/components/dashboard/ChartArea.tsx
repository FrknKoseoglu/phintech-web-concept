import type { Asset } from "@/types";

interface ChartAreaProps {
  asset?: Asset;
}

export default function ChartArea({ asset }: ChartAreaProps) {
  const symbol = asset?.symbol || "BTC";
  const price = asset?.price || 43240.10;
  const isPositive = (asset?.changePercent || 0) >= 0;

  // Generate random bar heights for visual effect
  const bars = Array.from({ length: 30 }, () => ({
    height: Math.random() * 60 + 20,
    isGreen: Math.random() > 0.3,
  }));

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark flex-1 min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {symbol}/USD
            </span>
            <span className="bg-gray-200 dark:bg-gray-700 text-xs px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
              Spot
            </span>
          </div>
          <div className="flex flex-col">
            <span className={`text-lg font-bold ${isPositive ? "text-success" : "text-danger"}`}>
              ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-gray-500">
              ≈ ₺{(price * 30).toLocaleString("tr-TR")}
            </span>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {["1H", "1D", "1W", "1M", "1Y"].map((range, i) => (
            <button
              key={range}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                i === 1
                  ? "bg-white dark:bg-gray-600 text-primary shadow-sm"
                  : "hover:bg-white dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative p-4 bg-gradient-to-b from-transparent to-blue-50/20 dark:to-blue-900/10">
        {/* Simple Bar Chart Visualization */}
        <div className="w-full h-full flex items-end justify-between space-x-1 px-2">
          {bars.map((bar, i) => (
            <div
              key={i}
              className={`w-2 rounded-t transition-all ${
                bar.isGreen ? "bg-green-400/30" : "bg-red-400/30"
              }`}
              style={{ height: `${bar.height}%` }}
            />
          ))}
        </div>

        {/* Price Indicator */}
        <div className="absolute right-4 top-1/4 bg-surface-light dark:bg-surface-dark px-3 py-1 rounded shadow-lg border border-border-light dark:border-border-dark flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isPositive ? "bg-success" : "bg-danger"}`} />
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* SVG Line Chart Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path
            d="M0,60 C10,55 20,65 30,50 C40,35 50,45 60,30 C70,15 80,35 90,20 L100,10"
            fill="none"
            stroke={isPositive ? "#10B981" : "#EF4444"}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
          <defs>
            <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity="1" />
              <stop offset="100%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 C10,55 20,65 30,50 C40,35 50,45 60,30 C70,15 80,35 90,20 L100,10 V100 H0 Z"
            fill="url(#chartGradient)"
            opacity="0.1"
          />
        </svg>
      </div>
    </div>
  );
}
