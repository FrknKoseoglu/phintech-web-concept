import { fetchMarketData, fetchUser } from "@/actions/market";
import type { Asset, PortfolioItem } from "@/types";
import WalletSummary from "@/components/wallet/WalletSummary";
import WalletSidebar from "@/components/wallet/WalletSidebar";
import HoldingsTable from "@/components/wallet/HoldingsTable";
import UpgradeCard from "@/components/wallet/UpgradeCard";
import RecentTransactions from "@/components/wallet/RecentTransactions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portföy | Midas Web Interface",
  description: "Manage your portfolio on Midas trading platform",
};

// Calculate holding details with current prices
function calculateHoldings(
  portfolio: PortfolioItem[],
  assets: Asset[]
) {
  return portfolio
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const asset = assets.find((a) => a.symbol === item.symbol);
      if (!asset) return null;

      const currentValue = item.quantity * asset.price;
      const costBasis = item.quantity * item.avgCost;
      const profitLoss = currentValue - costBasis;
      const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

      return {
        ...item,
        asset,
        currentValue,
        profitLoss,
        profitLossPercent,
      };
    })
    .filter(Boolean) as Array<{
      symbol: string;
      quantity: number;
      avgCost: number;
      asset: Asset;
      currentValue: number;
      profitLoss: number;
      profitLossPercent: number;
    }>;
}

// Calculate asset allocation for the summary chart
function calculateAllocations(
  holdings: Array<{ symbol: string; currentValue: number }>,
  cashBalance: number
) {
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0) + cashBalance;
  if (totalValue === 0) return [];

  const colors: Record<string, string> = {
    USD: "#22c55e", // green
    BTC: "#f97316", // orange
    ETH: "#8b5cf6", // purple
    AAPL: "#000000", // black
    TSLA: "#ef4444", // red
    XAU: "#eab308", // yellow
    THY: "#3b82f6", // blue
    TRY: "#dc2626", // red
  };

  const allocations = [];

  // Cash allocation
  if (cashBalance > 0) {
    allocations.push({
      label: "Nakit (USD)",
      percentage: Math.round((cashBalance / totalValue) * 100),
      color: colors.USD,
    });
  }

  // Asset allocations
  for (const holding of holdings) {
    allocations.push({
      label: holding.symbol,
      percentage: Math.round((holding.currentValue / totalValue) * 100),
      color: colors[holding.symbol] || "#6b7280",
    });
  }

  return allocations;
}

export default async function WalletPage() {
  const [assets, user] = await Promise.all([
    fetchMarketData(),
    fetchUser(),
  ]);

  // Calculate holdings with current prices
  const holdings = calculateHoldings(user.portfolio, assets);

  // Calculate total portfolio value
  const holdingsValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalValue = user.balance + holdingsValue;

  // Calculate allocations
  const allocations = calculateAllocations(holdings, user.balance);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <WalletSummary
          totalValue={totalValue}
          changePercent={2.4}
          allocations={allocations}
        />
        <UpgradeCard />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <WalletSidebar />
        
        <div className="lg:col-span-3">
          <HoldingsTable holdings={holdings} cashBalance={user.balance} />
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
