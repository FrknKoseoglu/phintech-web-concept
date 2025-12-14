"use client";

import { useState } from "react";
import type { Asset, User, Transaction } from "@/types";
import AssetSidebar from "@/components/trade/AssetSidebar";
import TradeHeader from "@/components/trade/TradeHeader";
import TradeChartArea from "@/components/trade/TradeChartArea";
import TradeOrderBook from "@/components/trade/TradeOrderBook";
import TradeForm from "@/components/trade/TradeForm";
import TradeTabs from "@/components/trade/TradeTabs";

interface TradePageClientProps {
  assets: Asset[];
  user: User;
  transactions: Transaction[];
  initialSymbol?: string;
  initialMode?: 'BUY' | 'SELL';
}

export default function TradePageClient({ 
  assets, 
  user, 
  transactions,
  initialSymbol = "BTC",
  initialMode = "BUY"
}: TradePageClientProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);

  const selectedAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];
  
  // Find how much of this asset the user owns
  const portfolioItem = user.portfolio.find((p) => p.symbol === selectedSymbol);
  const ownedQuantity = portfolioItem?.quantity || 0;

  // Check if symbol is in favorites
  const isFavorite = user.favorites?.includes(selectedSymbol) || false;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] w-full max-w-[1920px] mx-auto overflow-hidden bg-gray-100 dark:bg-[#0a0a0a] p-2 gap-2">
      {/* Left Sidebar - Asset List */}
      <div className="lg:w-72 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <AssetSidebar
          assets={assets}
          selectedSymbol={selectedSymbol}
          onSelectAsset={setSelectedSymbol}
        />
      </div>

      {/* Main Content */}
      <section className="flex-1 flex flex-col min-w-0 gap-2">
        {/* Header */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <TradeHeader asset={selectedAsset} isFavorite={isFavorite} />
        </div>

        {/* Chart + Right Panel */}
        <div className="flex-1 flex flex-col md:flex-row gap-2 overflow-hidden">
          {/* Chart Section */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="flex-1 min-h-[400px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <TradeChartArea asset={selectedAsset} />
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <TradeTabs 
                symbol={selectedSymbol}
                transactions={transactions}
                portfolioItem={portfolioItem}
                currentPrice={selectedAsset.price}
              />
            </div>
          </div>

          {/* Right Panel - Order Book + Trade Form */}
          <div className="w-full md:w-80 flex flex-col gap-2">
            <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <TradeOrderBook asset={selectedAsset} />
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <TradeForm 
                asset={selectedAsset} 
                availableBalance={user.balance}
                ownedQuantity={ownedQuantity}
                initialMode={initialMode}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
