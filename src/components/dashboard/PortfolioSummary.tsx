import { TrendingUp, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

interface PortfolioSummaryProps {
  balance: number;
  changePercent?: number;
}

export default function PortfolioSummary({
  balance,
  changePercent = 2.4,
}: PortfolioSummaryProps) {
  const isPositive = changePercent >= 0;

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-border-light dark:border-border-dark">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Toplam Varlıklarım
        </h3>
        <span
          className={`${
            isPositive
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          } text-xs px-2 py-1 rounded-md font-medium flex items-center`}
        >
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          {isPositive ? "+" : ""}
          {changePercent.toFixed(1)}%
        </span>
      </div>

      <div className="flex items-baseline space-x-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </h2>
        <span className="text-sm text-gray-400">USD</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-2 rounded-lg text-sm font-medium transition-colors">
          <ArrowDownToLine className="w-4 h-4" />
          Yatır
        </button>
        <button className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded-lg text-sm font-medium transition-colors">
          <ArrowUpFromLine className="w-4 h-4" />
          Çek
        </button>
      </div>
    </div>
  );
}
