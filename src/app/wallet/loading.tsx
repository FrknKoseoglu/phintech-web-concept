export default function WalletLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Summary Card Skeleton */}
        <div className="lg:col-span-2 bg-white dark:bg-black p-6 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse">
          <div className="h-4 w-32 bg-gray-700 rounded mb-2" />
          <div className="h-8 w-48 bg-gray-700 rounded mb-4" />
          <div className="h-3 w-full bg-gray-800 rounded mt-6" />
        </div>
        {/* Promo Card Skeleton */}
        <div className="bg-gray-800 rounded-2xl p-6 animate-pulse">
          <div className="h-6 w-40 bg-gray-700 rounded mb-2" />
          <div className="h-4 w-full bg-gray-700 rounded mb-4" />
          <div className="h-10 w-32 bg-gray-700 rounded" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Skeleton */}
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="lg:col-span-3 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
          <div className="h-6 w-40 bg-gray-700 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
