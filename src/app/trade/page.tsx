import { fetchMarketData, fetchUser } from "@/actions/market";
import TradePageClient from "@/components/trade/TradePageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Al-Sat | Midas Web Interface",
  description: "Trade assets on Midas trading platform",
};

export default async function TradePage() {
  // Fetch data via Server Actions
  const [assets, user] = await Promise.all([
    fetchMarketData(),
    fetchUser(),
  ]);

  return <TradePageClient assets={assets} user={user} />;
}
