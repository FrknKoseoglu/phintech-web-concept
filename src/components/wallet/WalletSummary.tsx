import { TrendingUp, CreditCard, ArrowUpRight } from "lucide-react";

interface AllocationItem {
  label: string;
  percentage: number;
  color: string;
}

interface WalletSummaryProps {
  totalValue: number;
  changePercent?: number;
  allocations: AllocationItem[];
}

export default function WalletSummary({
  totalValue,
  changePercent = 2.4,
  allocations,
}: WalletSummaryProps) {
  const isPositive = changePercent >= 0;
  const tryValue = totalValue * 30; // Mock TRY conversion

  return (
    <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Toplam Varlık Değeri
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`${
                isPositive
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              } text-xs px-2 py-1 rounded-full font-medium flex items-center`}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {isPositive ? "+" : ""}
              {changePercent.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ≈ ₺{tryValue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-primary/20">
            <CreditCard className="w-4 h-4" />
            Para Yatır
          </button>
          <button className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
            <ArrowUpRight className="w-4 h-4" />
            Çek
          </button>
        </div>
      </div>

      {/* Asset Allocation */}
      {allocations.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between text-xs mb-2 text-gray-500 dark:text-gray-400">
            <span>Varlık Dağılımı</span>
            <span>Detayları Gizle</span>
          </div>

          {/* Allocation Bar */}
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full flex overflow-hidden">
            {allocations.map((item, i) => (
              <div
                key={i}
                className="h-full"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
                title={item.label}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3">
            {allocations.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.label} %{item.percentage}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
