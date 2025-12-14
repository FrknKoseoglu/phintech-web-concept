import { fetchMarketData, fetchUser, fetchTransactions } from "@/actions/market";
import TradePageClient from "@/components/trade/TradePageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Al-Sat | Midas Web Interface",
  description: "Trade assets on Midas trading platform",
};

interface TradePageProps {
  searchParams: Promise<{ symbol?: string; mode?: string }>;
}

export default async function TradePage({ searchParams }: TradePageProps) {
  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams;
  const initialSymbol = params.symbol || "BTC";
  const initialMode = (params.mode === 'sell' ? 'SELL' : 'BUY') as 'BUY' | 'SELL';

  // Fetch data via Server Actions
  const [assets, user, transactions] = await Promise.all([
    fetchMarketData(),
    fetchUser(),
    fetchTransactions(),
  ]);

  return (
    <TradePageClient 
      assets={assets} 
      user={user}
      transactions={transactions}
      initialSymbol={initialSymbol}
      initialMode={initialMode}
    />
  );
}

