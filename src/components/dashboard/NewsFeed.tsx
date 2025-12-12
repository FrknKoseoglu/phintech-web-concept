const newsItems = [
  {
    id: 1,
    title: "Fed faiz kararı öncesi piyasalarda son durum ne?",
    time: "10 dk",
    href: "#",
  },
  {
    id: 2,
    title: "Bitcoin ETF onayına dair yeni gelişmeler ve SEC açıklamaları.",
    time: "45 dk",
    href: "#",
  },
  {
    id: 3,
    title: "Borsa İstanbul güne yükselişle başladı.",
    time: "2 sa",
    href: "#",
  },
];

export default function NewsFeed() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-border-light dark:border-border-dark">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Midas Gündem
      </h3>
      <div className="space-y-4">
        {newsItems.map((item, index) => (
          <div key={item.id}>
            <a href={item.href} className="block group">
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </p>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {item.time}
                </span>
              </div>
            </a>
            {index < newsItems.length - 1 && (
              <div className="border-b border-border-light dark:border-border-dark border-dashed mt-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
