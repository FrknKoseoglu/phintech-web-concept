import { Download, ShoppingCart } from "lucide-react";

const transactions = [
  {
    id: 1,
    type: "deposit",
    title: "Para Yatırma (USD)",
    time: "Bugün, 14:20",
    amount: "+$2,000.00",
    status: "Başarılı",
  },
  {
    id: 2,
    type: "buy",
    title: "TSLA Satın Alım",
    time: "Dün, 09:15",
    amount: "-$455.00",
    detail: "2.0 Adet",
  },
];

export default function RecentTransactions() {
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
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  tx.type === "deposit"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                {tx.type === "deposit" ? (
                  <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <ShoppingCart className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {tx.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {tx.time}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-sm font-bold ${
                  tx.type === "deposit"
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {tx.amount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {tx.status || tx.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
