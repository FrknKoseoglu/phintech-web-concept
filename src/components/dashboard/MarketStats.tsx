const stats = [
  { label: "Piyasa Değeri", value: "$845.2B" },
  { label: "Hacim (24s)", value: "$24.5B" },
  { label: "Dolaşımdaki Arz", value: "19.5M BTC" },
];

export default function MarketStats() {
  return (
    <div className="bg-white dark:bg-black rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
        Piyasa İstatistikleri (24s)
      </h3>
      <div className="space-y-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex justify-between items-center text-sm"
          >
            <span className="text-gray-500 dark:text-text-muted">{stat.label}</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {stat.value}
            </span>
          </div>
        ))}

        {/* Buy Pressure Bar */}
        <div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-900 rounded-full mt-2 overflow-hidden">
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
