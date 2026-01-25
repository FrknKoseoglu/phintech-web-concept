import { fetchMarketData, fetchUser } from "@/actions/market";
import DashboardManager from "@/components/dashboard/DashboardManager";
import NewsFeed from "@/components/dashboard/NewsFeed";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch data via Server Actions
  const [marketData, user] = await Promise.all([
    fetchMarketData(),
    fetchUser(), // Returns null for unauthenticated users
  ]);

  return (
    <DashboardManager marketData={marketData} user={user}>
      <NewsFeed />
    </DashboardManager>
  );
}

