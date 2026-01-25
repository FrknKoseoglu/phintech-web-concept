"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import type { Asset, User } from "@/types";
import { calculateNetWorth, calculateProfitLoss, getUsdTryRate } from "@/lib/math";
import AssetList from "./AssetList";
import ChartArea from "./ChartArea";
import QuickTrade from "./QuickTrade";
import OrderBook from "./OrderBook";
import PortfolioSummary from "./PortfolioSummary";
import MarketStats from "./MarketStats";

interface DashboardManagerProps {
  marketData: Asset[];
  user: User | null; // Allow null for guest users
  children?: React.ReactNode; // For NewsFeed (Server Component)
}

export default function DashboardManager({ marketData, user, children }: DashboardManagerProps) {
  const { data: session } = useSession();
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  
  // Get the selected asset from market data
  const selectedAsset = marketData.find((a) => a.symbol === selectedSymbol) || marketData[0];

  // Guest mode defaults
  const guestUser: User = {
    id: "guest",
    balance: 0,
    portfolio: [],
    favorites: [],
  };

  const activeUser = user || guestUser;

  // Use centralized calculation for proper TRY/USD conversion
  const { cashBalanceUsd, holdingsValue, profitLoss } = useMemo(() => {
    const usdTryRate = getUsdTryRate(marketData);
    const netWorth = calculateNetWorth(activeUser.balance, activeUser.portfolio, marketData, usdTryRate);
    const { totalPL } = calculateProfitLoss(activeUser.portfolio, marketData, usdTryRate);
    
    // Total cash = TRY converted to USD + USD + USDT
    const totalCashUsd = netWorth.cashTryInUsd + netWorth.cashUsd + netWorth.cashUsdt;
    
    return { 
      cashBalanceUsd: totalCashUsd,
      holdingsValue: netWorth.investmentsValueUsd, 
      profitLoss: totalPL 
    };
  }, [activeUser.portfolio, activeUser.balance, marketData]);

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
          {/* Show PortfolioSummary only when logged in */}
          {session && user && (
            <PortfolioSummary 
              balance={cashBalanceUsd}
              holdingsValue={holdingsValue}
              profitLoss={profitLoss}
            />
          )}
          <AssetList 
            assets={marketData} 
            selectedSymbol={selectedSymbol}
            onSelectAsset={handleAssetSelect}
            favorites={activeUser.favorites}
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
            tryBalance={activeUser.balance}
            usdBalance={activeUser.portfolio.find(p => p.symbol === 'USD')?.quantity || 0}
            usdtBalance={activeUser.portfolio.find(p => p.symbol === 'USDT')?.quantity || 0}
            ownedQuantity={activeUser.portfolio.find(p => p.symbol === selectedSymbol)?.quantity || 0}
          />
          <OrderBook asset={selectedAsset} />
        </div>
      </div>
    </div>
  );
}

