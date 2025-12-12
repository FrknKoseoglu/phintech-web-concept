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
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-200 dark:border-border-dark">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-text-muted text-sm font-medium">
          Toplam Varlıklarım
        </h3>
        <span
          className={`${
            isPositive
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          } text-xs px-3 py-1 rounded-full font-semibold flex items-center`}
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
        <span className="text-sm text-text-muted">USD</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3 rounded-full text-sm font-semibold transition-all">
          <ArrowDownToLine className="w-4 h-4" />
          Yatır
        </button>
        <button className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-[#1C1C1E] hover:bg-gray-200 dark:hover:bg-[#2C2C2E] text-gray-800 dark:text-white py-3 rounded-full text-sm font-semibold transition-all">
          <ArrowUpFromLine className="w-4 h-4" />
          Çek
        </button>
      </div>
    </div>
  );
}
