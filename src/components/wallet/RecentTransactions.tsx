import { Download, ShoppingCart, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { Transaction } from "@/types";
import { getHoldingUnit } from "@/lib/utils";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

/**
 * Format date to a nice readable format (e.g., "Dec 12, 2025")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format time (e.g., "14:20")
 */
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // Take only the most recent 5 transactions
  const recentTxs = transactions.slice(0, 5);

  return (
    <div className="mt-6 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Son İşlemler
        </h3>
        <a href="#" className="text-primary text-sm font-medium hover:underline">
          Tümünü Gör
        </a>
      </div>

      <div className="space-y-4">
        {recentTxs.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            Henüz işlem bulunmuyor.
          </p>
        ) : (
          recentTxs.map((tx) => {
            const isBuy = tx.type === "BUY";
            // BUY = money out (red), SELL = money in (green)
            const isPositive = tx.type === "SELL";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      isPositive
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowDownLeft className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {tx.symbol} {isBuy ? "Satın Alım" : "Satış"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(tx.date)}, {formatTime(tx.date)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${
                      isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isPositive ? "+" : "-"}${tx.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {tx.quantity.toFixed(4)} {getHoldingUnit(tx.symbol)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
