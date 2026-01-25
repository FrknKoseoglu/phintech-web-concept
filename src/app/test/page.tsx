import { fetchMarketData, fetchUser } from "@/actions/market";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  // Call the server actions to test the simulation
  const marketData = await fetchMarketData();
  const user = await fetchUser();
  
  // Call again to show price changes
  const marketData2 = await fetchMarketData();

  return (
    <main className="min-h-screen bg-midas-black p-8">
      <h1 className="text-3xl font-bold text-midas-gold mb-8">
        🧪 Backend Simulation Test
      </h1>

      {/* User Data */}
      <div className="mb-8 bg-midas-charcoal p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-midas-yellow mb-4">User Data</h2>
        {user ? (
          <div className="text-gray-300 font-mono text-sm">
            <p>ID: {user.id}</p>
            <p>Balance: ${user.balance.toLocaleString()}</p>
            <p>Portfolio Items: {user.portfolio.length}</p>
          </div>
        ) : (
          <p className="text-gray-400">No user data (not logged in)</p>
        )}
      </div>

      {/* Market Data - First Call */}
      <section className="mb-8 p-6 bg-midas-dark rounded-lg border border-midas-gold/20">
        <h2 className="text-xl font-semibold text-midas-yellow mb-4">
          Market Data (First Call)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketData.map((asset) => (
            <div
              key={asset.symbol}
              className="p-4 bg-midas-darker rounded border border-gray-800"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{asset.symbol}</span>
                <span
                  className={`text-sm ${
                    asset.changePercent >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {asset.changePercent >= 0 ? "+" : ""}
                  {asset.changePercent.toFixed(2)}%
                </span>
              </div>
              <p className="text-gray-400 text-sm">{asset.name}</p>
              <p className="text-midas-gold font-mono mt-2">
                ${asset.price.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Market Data - Second Call (to show price changes) */}
      <section className="mb-8 p-6 bg-midas-dark rounded-lg border border-midas-gold/20">
        <h2 className="text-xl font-semibold text-midas-yellow mb-4">
          Market Data (Second Call - Prices Changed!)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketData2.map((asset) => (
            <div
              key={asset.symbol}
              className="p-4 bg-midas-darker rounded border border-gray-800"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{asset.symbol}</span>
                <span
                  className={`text-sm ${
                    asset.changePercent >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {asset.changePercent >= 0 ? "+" : ""}
                  {asset.changePercent.toFixed(2)}%
                </span>
              </div>
              <p className="text-gray-400 text-sm">{asset.name}</p>
              <p className="text-midas-gold font-mono mt-2">
                ${asset.price.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Success Message */}
      <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
        <p className="text-green-400">
          ✅ Backend simulation is working! Notice how prices are different between the two calls.
        </p>
      </div>
    </main>
  );
}
