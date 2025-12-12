import type { Asset } from "@/types";

interface OpenOrdersProps {
  symbol?: string;
}

const mockOrders = [
  {
    id: 1,
    date: "12-05 14:32:01",
    pair: "BTC/USDT",
    type: "Limit",
    side: "Al",
    price: 41500.0,
    amount: "0.05 BTC",
    filled: "0.00%",
    total: "2,075.00 USDT",
  },
  {
    id: 2,
    date: "12-05 10:15:45",
    pair: "ETH/USDT",
    type: "Stop-Limit",
    side: "Sat",
    price: 2300.0,
    amount: "1.5 ETH",
    filled: "0.00%",
    total: "3,450.00 USDT",
  },
];

export default function OpenOrders({ symbol }: OpenOrdersProps) {
  const tabs = ["Açık Emirler (2)", "Emir Geçmişi", "Alım-Satım Geçmişi", "Varlıklar"];

  return (
    <div className="h-64 border-t border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark flex flex-col">
      {/* Tabs */}
      <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              i === 0
                ? "font-semibold text-primary border-b-2 border-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <th className="pb-2 font-medium">Tarih</th>
              <th className="pb-2 font-medium">Parite</th>
              <th className="pb-2 font-medium">Tür</th>
              <th className="pb-2 font-medium">Yön</th>
              <th className="pb-2 font-medium text-right">Fiyat</th>
              <th className="pb-2 font-medium text-right">Miktar</th>
              <th className="pb-2 font-medium text-right">% Doluluk</th>
              <th className="pb-2 font-medium text-right">Toplam</th>
              <th className="pb-2 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {mockOrders.map((order) => (
              <tr
                key={order.id}
                className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="py-3 text-gray-600 dark:text-gray-300">{order.date}</td>
                <td className="py-3 font-semibold text-gray-900 dark:text-white">{order.pair}</td>
                <td className="py-3 text-gray-600 dark:text-gray-300">{order.type}</td>
                <td className={`py-3 font-medium ${order.side === "Al" ? "text-success" : "text-danger"}`}>
                  {order.side}
                </td>
                <td className="py-3 text-right text-gray-900 dark:text-white">{order.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                <td className="py-3 text-right text-gray-700 dark:text-gray-200">{order.amount}</td>
                <td className="py-3 text-right text-gray-700 dark:text-gray-200">{order.filled}</td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-300">{order.total}</td>
                <td className="py-3 text-right">
                  <button className="text-danger hover:bg-danger/10 px-2 py-1 rounded text-xs">
                    İptal
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500 italic">
          Daha fazla açık emriniz bulunmuyor.
        </div>
      </div>
    </div>
  );
}
