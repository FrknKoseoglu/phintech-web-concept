import { getMarketData } from '@/lib/market';

export default async function MarketVerificationPage() {
  const marketData = await getMarketData();
  
  const cryptos = marketData.filter(a => a.category === 'crypto');
  const stocks = marketData.filter(a => a.category === 'stock');
  const currencies = marketData.filter(a => a.category === 'currency');
  const commodities = marketData.filter(a => a.category === 'commodity');

  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          📊 Market Data Verification
        </h1>

        <div className="space-y-6">
          {/* Crypto */}
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              💎 Cryptocurrencies <span className="text-xs text-green-600">(CoinGecko API)</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {cryptos.map(asset => (
                <div key={asset.symbol} className="p-4 border rounded-lg dark:border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold dark:text-white">{asset.symbol}</span>
                    <span className="text-lg dark:text-white">${asset.price.toLocaleString()}</span>
                  </div>
                  <div className={`text-sm ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Currencies */}
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              💱 Currencies <span className="text-xs text-green-600">(TCMB Official)</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {currencies.map(asset => (
                <div key={asset.symbol} className="p-4 border rounded-lg dark:border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold dark:text-white">{asset.symbol}</span>
                    <span className="text-lg dark:text-white">₺{asset.price.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* US Stocks */}
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              🇺🇸 US Stocks <span className="text-xs text-blue-600">(Yahoo Finance)</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {stocks.filter(s => !s.symbol.endsWith('.IS')).map(asset => (
                <div key={asset.symbol} className="p-4 border rounded-lg dark:border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold dark:text-white">{asset.symbol}</span>
                    <span className="text-lg dark:text-white">${asset.price.toLocaleString()}</span>
                  </div>
                  <div className={`text-sm ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BIST Stocks */}
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              🇹🇷 BIST <span className="text-xs text-blue-600">(Yahoo Finance - 15min delay)</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {stocks.filter(s => s.symbol.endsWith('.IS')).map(asset => (
                <div key={asset.symbol} className="p-4 border rounded-lg dark:border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold dark:text-white">{asset.symbol}</span>
                    <span className="text-lg dark:text-white">₺{asset.price.toFixed(2)}</span>
                  </div>
                  <div className={`text-sm ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Commodities */}
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              🥇 Commodities <span className="text-xs text-blue-600">(Yahoo Finance)</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {commodities.map(asset => (
                <div key={asset.symbol} className="p-4 border rounded-lg dark:border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold dark:text-white">{asset.name}</span>
                    <span className="text-lg dark:text-white">${asset.price.toLocaleString()}</span>
                  </div>
                  <div className={`text-sm ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-400">
            ✅ <strong>Multi-Provider System Active:</strong> Crypto from CoinGecko, Forex from TCMB, Stocks from Yahoo Finance
          </p>
        </div>
      </div>
    </div>
  );
}
