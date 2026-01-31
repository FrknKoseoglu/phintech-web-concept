import { getMidasNews } from "@/actions/news";
import { ExternalLink, Newspaper } from "lucide-react";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand-config";

export const metadata = {
  title: "Haberler",
  description: "Güncel finans haberleri",
};

export default async function NewsPage() {
  const newsItems = await getMidasNews();

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                {BRAND_NAME} Gündem
              </h1>
              <p className="text-sm text-gray-500 dark:text-text-muted">
                Finans dünyasından en son haberler
              </p>
            </div>
          </div>
          <a
            href="https://www.getmidas.com/gundem"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
          >
            {BRAND_NAME}&apos;ta Aç
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* News List */}
        {newsItems.length === 0 ? (
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 text-center">
            <p className="text-gray-500 dark:text-text-muted">
              Haberler yüklenemedi. Lütfen daha sonra tekrar deneyin.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {newsItems.map((item) => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-surface-light dark:bg-surface-dark rounded-2xl p-5 border border-gray-200 dark:border-border-dark hover:border-primary/50 transition-all group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-black dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h2>
                    {item.description && (
                      <p className="text-sm text-gray-500 dark:text-text-muted mt-2 line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-text-muted whitespace-nowrap flex-shrink-0 bg-gray-100 dark:bg-[#2C2C2E] px-2 py-1 rounded-full">
                    {item.date}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 dark:text-text-muted hover:text-primary transition-colors"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
