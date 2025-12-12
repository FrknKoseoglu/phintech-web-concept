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
}

export default function TradePageClient({ 
  assets, 
  user, 
  transactions,
  initialSymbol = "BTC" 
}: TradePageClientProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);

  const selectedAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];
  
  // Find how much of this asset the user owns
  const portfolioItem = user.portfolio.find((p) => p.symbol === selectedSymbol);
  const ownedQuantity = portfolioItem?.quantity || 0;

  // Check if symbol is in favorites
  const isFavorite = user.favorites?.includes(selectedSymbol) || false;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] w-full max-w-[1920px] mx-auto overflow-hidden bg-white dark:bg-black">
      {/* Left Sidebar - Asset List */}
      <AssetSidebar
        assets={assets}
        selectedSymbol={selectedSymbol}
        onSelectAsset={setSelectedSymbol}
      />

      {/* Main Content */}
      <section className="flex-1 flex flex-col min-w-0 bg-white dark:bg-black">
        {/* Header */}
        <TradeHeader asset={selectedAsset} isFavorite={isFavorite} />

        {/* Chart + Right Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Chart Section */}
          <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-800">
            <TradeChartArea asset={selectedAsset} />
            <TradeTabs 
              symbol={selectedSymbol}
              transactions={transactions}
              portfolioItem={portfolioItem}
              currentPrice={selectedAsset.price}
            />
          </div>

          {/* Right Panel - Order Book + Trade Form */}
          <div className="w-full md:w-80 bg-white dark:bg-black flex flex-col h-full overflow-hidden">
            <TradeOrderBook asset={selectedAsset} />
            <TradeForm 
              asset={selectedAsset} 
              availableBalance={user.balance}
              ownedQuantity={ownedQuantity}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
