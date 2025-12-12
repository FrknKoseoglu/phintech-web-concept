"use client";

import { useState, useEffect } from "react";
import type { Asset, User } from "@/types";
import AssetList from "./AssetList";
import ChartArea from "./ChartArea";
import QuickTrade from "./QuickTrade";
import OrderBook from "./OrderBook";
import PortfolioSummary from "./PortfolioSummary";
import MarketStats from "./MarketStats";

interface DashboardManagerProps {
  marketData: Asset[];
  user: User;
  children?: React.ReactNode; // For NewsFeed (Server Component)
}

export default function DashboardManager({ marketData, user, children }: DashboardManagerProps) {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  
  // Get the selected asset from market data
  const selectedAsset = marketData.find((a) => a.symbol === selectedSymbol) || marketData[0];

  // Update symbol when marketData changes (e.g., on navigation)
  useEffect(() => {
    if (!marketData.find((a) => a.symbol === selectedSymbol) && marketData.length > 0) {
      setSelectedSymbol(marketData[0].symbol);
    }
  }, [marketData, selectedSymbol]);

  const handleAssetSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1920px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Portfolio & Watchlist */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <PortfolioSummary balance={user.balance} />
          <AssetList 
            assets={marketData} 
            selectedSymbol={selectedSymbol}
            onSelectAsset={handleAssetSelect}
          />
        </div>

        {/* Center Column - Chart & Stats */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <ChartArea asset={selectedAsset} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MarketStats />
            {/* NewsFeed passed as children (Server Component) */}
            {children}
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
