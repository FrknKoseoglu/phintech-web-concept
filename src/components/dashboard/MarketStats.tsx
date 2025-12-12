const stats = [
  { label: "Piyasa Değeri", value: "$845.2B" },
  { label: "Hacim (24s)", value: "$24.5B" },
  { label: "Dolaşımdaki Arz", value: "19.5M BTC" },
];

export default function MarketStats() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-border-light dark:border-border-dark">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Piyasa İstatistikleri (24s)
      </h3>
      <div className="space-y-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex justify-between items-center text-sm"
          >
            <span className="text-gray-500">{stat.label}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {stat.value}
            </span>
          </div>
        ))}

        {/* Buy Pressure Bar */}
        <div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary w-[75%] rounded-full" />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Alış Baskısı</span>
            <span>75%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
