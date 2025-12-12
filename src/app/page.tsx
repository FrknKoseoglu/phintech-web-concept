import { fetchMarketData, fetchUser } from "@/actions/market";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import AssetList from "@/components/dashboard/AssetList";
import ChartArea from "@/components/dashboard/ChartArea";
import MarketStats from "@/components/dashboard/MarketStats";
import NewsFeed from "@/components/dashboard/NewsFeed";
import QuickTrade from "@/components/dashboard/QuickTrade";
import OrderBook from "@/components/dashboard/OrderBook";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch data via Server Actions
  const [marketData, user] = await Promise.all([
    fetchMarketData(),
    fetchUser(),
  ]);

  // Get BTC as the default selected asset
  const selectedAsset = marketData.find((a) => a.symbol === "BTC") || marketData[0];

  return (
    <div className="p-4 lg:p-6 max-w-[1920px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Portfolio & Watchlist */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <PortfolioSummary balance={user.balance} />
          <AssetList assets={marketData} />
        </div>

        {/* Center Column - Chart & Stats */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <ChartArea asset={selectedAsset} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MarketStats />
            <NewsFeed />
          </div>
        </div>

        {/* Right Column - Trade & Order Book */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <QuickTrade
            selectedAsset={selectedAsset}
            availableBalance={user.balance}
          />
          <OrderBook asset={selectedAsset} />
        </div>
      </div>
    </div>
  );
}
