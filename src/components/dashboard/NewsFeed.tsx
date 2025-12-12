import { getMidasNews } from "@/actions/news";
import { ExternalLink } from "lucide-react";

interface NewsFeedProps {
  limit?: number;
  showHeader?: boolean;
}

export default async function NewsFeed({ limit = 3, showHeader = true }: NewsFeedProps) {
  const allNews = await getMidasNews();
  const newsItems = limit ? allNews.slice(0, limit) : allNews;

  if (newsItems.length === 0) {
    return (
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-200 dark:border-border-dark">
        <h3 className="font-semibold text-black dark:text-white mb-4">
          Midas Gündem
        </h3>
        <p className="text-sm text-gray-500 dark:text-text-muted">
          Haberler yüklenemedi.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-200 dark:border-border-dark">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-black dark:text-white">
          Midas Gündem
        </h3>
        <a
          href="https://www.getmidas.com/gundem"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
        >
          Tümünü Gör
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div className="space-y-4">
        {newsItems.map((item, index) => (
          <div key={item.link}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-500 dark:text-text-muted mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 dark:text-text-muted whitespace-nowrap flex-shrink-0">
                  {item.date}
                </span>
              </div>
            </a>
            {index < newsItems.length - 1 && (
              <div className="border-b border-gray-100 dark:border-border-dark mt-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
