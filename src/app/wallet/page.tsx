import { fetchUser, fetchTransactions } from "@/actions/market";
import { getMarketDataSnapshot } from "@/lib/market";
import { calculateNetWorth, calculateProfitLoss, getUsdTryRate } from "@/lib/math";
import type { PortfolioHolding, AssetCategory } from "@/types";
import { TrendingUp, TrendingDown, ArrowDownToLine, ArrowUpFromLine, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RecentTransactions from "@/components/wallet/RecentTransactions";
import WalletSidebar from "@/components/wallet/WalletSidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portföy | Midas Web Interface",
  description: "Manage your portfolio on Midas trading platform",
};

interface WalletPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function WalletPage({ searchParams }: WalletPageProps) {
  // Check authentication - redirect to login if not authenticated
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/wallet");
  }

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams;
  const categoryFilter = params.category as AssetCategory | undefined;

  // Fetch user data, transactions and live market data
  const [user, transactions, marketData] = await Promise.all([
    fetchUser(),
    fetchTransactions(),
    getMarketDataSnapshot(),
  ]);

  // Build holdings with calculated values (excluding currency holdings)
  const allHoldings: PortfolioHolding[] = user.portfolio
    .filter((item) => item.quantity > 0.00001 && !['USD', 'USDT'].includes(item.symbol))
    .map((item) => {
      const asset = marketData.find((a) => a.symbol === item.symbol);
      if (!asset) return null;

      const currentValue = item.quantity * asset.price;
      const costBasis = item.quantity * item.avgCost;
      const profitLoss = currentValue - costBasis;
      const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

      return {
        symbol: item.symbol,
        name: asset.name,
        quantity: item.quantity,
        avgCost: item.avgCost,
        currentPrice: asset.price,
        currentValue,
        profitLoss,
        profitLossPercent,
        category: asset.category,
      };
    })
    .filter(Boolean) as PortfolioHolding[];

  // Apply category filter
  const holdings = categoryFilter 
    ? allHoldings.filter((h) => h.category === categoryFilter)
    : allHoldings;

  // Get USD/TRY rate from market data
  const usdTryRate = getUsdTryRate(marketData);
  const usdtAsset = marketData.find(a => a.symbol === 'USDT');
  const usdtRate = usdtAsset?.price || 34.3;

  // Use centralized calculation (properly converts TRY to USD)
  const netWorth = calculateNetWorth(user.balance, user.portfolio, marketData, usdTryRate);
  const { totalPL, totalPLPercent } = calculateProfitLoss(user.portfolio, marketData, usdTryRate);

  // Extract values for display
  const tryBalance = user.balance;
  const usdBalance = netWorth.cashUsd;
  const usdtBalance = netWorth.cashUsdt;
  const tryInUsd = netWorth.cashTryInUsd;
  const usdtInUsd = usdtBalance; // USDT ~= USD
  const totalNetWorth = netWorth.totalUsd;
  const totalProfitLoss = totalPL;
  const totalProfitLossPercent = totalPLPercent;

  // Calculate percentages for distribution (avoid division by zero)
  const calcPercent = (value: number) => 
    totalNetWorth > 0 ? Math.round((value / totalNetWorth) * 100) : 0;

  const distributions = [
    { label: "Hisse", percent: calcPercent(netWorth.breakdown.stocks), color: "bg-primary" },
    { label: "Kripto", percent: calcPercent(netWorth.breakdown.crypto), color: "bg-purple-400" },
    { label: "Emtia", percent: calcPercent(netWorth.breakdown.commodities), color: "bg-orange-400" },
    { label: "TL", percent: calcPercent(tryInUsd), color: "bg-red-400" },
    { label: "USD", percent: calcPercent(usdBalance), color: "bg-green-400" },
    { label: "USDT", percent: calcPercent(usdtInUsd), color: "bg-blue-400" },
  ].filter((d) => d.percent > 0); // Only show categories with value

  // Get category label for display
  const getCategoryLabel = () => {
    switch (categoryFilter) {
      case "stock": return "Hisseler";
      case "crypto": return "Kripto Varlıklar";
      case "commodity": return "Emtia & Döviz";
      default: return "Tüm Varlıklar";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Summary Card */}
        <div className="lg:col-span-2 bg-white dark:bg-black p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Toplam Varlık Değeri
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  ${totalNetWorth.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium flex items-center",
                  totalProfitLoss >= 0 
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                )}>
                  {totalProfitLoss >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {totalProfitLoss >= 0 ? "+" : ""}{totalProfitLossPercent.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ≈ ₺{(totalNetWorth * 34).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-primary/20">
                <ArrowDownToLine className="w-4 h-4" />
                Para Yatır
              </button>
              <button className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                <ArrowUpFromLine className="w-4 h-4" />
                Çek
              </button>
            </div>
          </div>

          {/* Distribution Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-2 text-gray-500 dark:text-gray-400">
              <span>Varlık Dağılımı</span>
              <span className="cursor-pointer hover:text-primary">Detayları Gör</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full flex overflow-hidden">
              {distributions.map((d, i) => (
                <div key={i} className={cn("h-full", d.color)} style={{ width: `${d.percent}%` }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {distributions.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", d.color)} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{d.label} %{d.percent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Midas Plus Card */}
        <Link href="/analysis" className="bg-gradient-to-br from-primary to-purple-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group cursor-pointer block">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold mb-2 relative z-10">Midas Plus'a Geç</h3>
          <p className="text-white/80 text-sm mb-4 relative z-10">
            Daha düşük komisyonlar ve canlı veri akışı ile yatırımlarını güçlendir.
          </p>
          <span className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors relative z-10 border border-white/10 inline-block">
            Planları İncele
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <WalletSidebar />

        {/* Holdings Table */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Table Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {getCategoryLabel()}
                </h3>
                <span className="text-xs text-text-muted bg-gray-100 dark:bg-[#2C2C2E] px-2 py-1 rounded-full">
                  {holdings.length} varlık
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Varlık ara..."
                  className="pl-10 pr-4 py-2 border-none ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50 dark:bg-[#1C1C1E] text-sm rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-primary focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Varlık</th>
                    <th className="px-6 py-4">Fiyat</th>
                    <th className="px-6 py-4">Değişim</th>
                    <th className="px-6 py-4">Bakiye</th>
                    <th className="px-6 py-4 text-right">Değer (USD)</th>
                    <th className="px-6 py-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {/* Currency Balance Rows - only show when viewing all */}
                  {!categoryFilter && (
                    <>
                      {/* TRY Balance */}
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-red-50/30 dark:bg-red-950/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
                              ₺
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">TRY</div>
                              <div className="text-xs text-gray-500">Türk Lirası</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">₺1.00</td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 font-medium">- 0.00%</span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                          ₺{tryBalance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold">
                          ${tryInUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href="/trade?symbol=USD&mode=buy" className="text-primary hover:text-primary-dark font-medium text-xs">USD Al</Link>
                          <span className="mx-1 text-gray-300">|</span>
                          <Link href="/trade?symbol=USDT&mode=buy" className="text-primary hover:text-primary-dark font-medium text-xs">USDT Al</Link>
                        </td>
                      </tr>

                      {/* USD Balance */}
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-green-50/30 dark:bg-green-950/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                              $
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">USD</div>
                              <div className="text-xs text-gray-500">Amerikan Doları</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">₺{usdTryRate.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 font-medium">- 0.00%</span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                          ${usdBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold">
                          ${usdBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href="/trade?symbol=USD&mode=buy" className="text-success hover:text-green-400 font-medium text-xs">Al</Link>
                          <span className="mx-2 text-gray-600">|</span>
                          <Link href="/trade?symbol=USD&mode=sell" className="text-danger hover:text-red-400 font-medium text-xs">Sat</Link>
                        </td>
                      </tr>

                      {/* USDT Balance */}
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-blue-50/30 dark:bg-blue-950/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                              ₮
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">USDT</div>
                              <div className="text-xs text-gray-500">Tether</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">₺{usdtRate.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 font-medium">- 0.00%</span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                          {usdtBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDT
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold">
                          ${usdtInUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href="/trade?symbol=USDT&mode=buy" className="text-success hover:text-green-400 font-medium text-xs">Al</Link>
                          <span className="mx-2 text-gray-600">|</span>
                          <Link href="/trade?symbol=USDT&mode=sell" className="text-danger hover:text-red-400 font-medium text-xs">Sat</Link>
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Asset Rows */}
                  {holdings.map((holding) => {
                    const isPositive = holding.profitLossPercent >= 0;

                    return (
                      <tr key={holding.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {holding.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">{holding.symbol}</div>
                              <div className="text-xs text-gray-500">{holding.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                          ${holding.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "flex items-center gap-1 font-medium",
                            isPositive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                          )}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isPositive ? "+" : ""}{holding.profitLossPercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                          {holding.quantity.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold">
                          ${holding.currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href={`/trade?symbol=${holding.symbol}&mode=buy`} 
                            className="text-success hover:text-green-400 font-medium text-xs transition-colors"
                          >
                            Al
                          </Link>
                          <span className="mx-2 text-gray-600">|</span>
                          <Link 
                            href={`/trade?symbol=${holding.symbol}&mode=sell`} 
                            className="text-danger hover:text-red-400 font-medium text-xs transition-colors"
                          >
                            Sat
                          </Link>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty State */}
                  {holdings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        {categoryFilter 
                          ? `Bu kategoride varlık bulunmuyor.`
                          : `Henüz varlık bulunmuyor. Al-Sat sayfasından işlem yapabilirsiniz.`
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {categoryFilter 
                  ? `${holdings.length} ${getCategoryLabel().toLowerCase()} gösteriliyor`
                  : `Toplam ${holdings.length + 1} varlık gösteriliyor`
                }
              </span>
              {categoryFilter && (
                <Link href="/wallet" className="text-xs text-primary hover:text-primary-dark font-medium">
                  Tümünü Göster
                </Link>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <RecentTransactions transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
