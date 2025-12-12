"use client";

import { useState } from "react";
import type { Asset, User } from "@/types";
import AssetSidebar from "@/components/trade/AssetSidebar";
import TradeHeader from "@/components/trade/TradeHeader";
import TradeChartArea from "@/components/trade/TradeChartArea";
import TradeOrderBook from "@/components/trade/TradeOrderBook";
import TradeForm from "@/components/trade/TradeForm";
import OpenOrders from "@/components/trade/OpenOrders";

interface TradePageClientProps {
  assets: Asset[];
  user: User;
}

export default function TradePageClient({ assets, user }: TradePageClientProps) {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");

  const selectedAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] w-full max-w-[1920px] mx-auto overflow-hidden">
      {/* Left Sidebar - Asset List */}
      <AssetSidebar
        assets={assets}
        selectedSymbol={selectedSymbol}
        onSelectAsset={setSelectedSymbol}
      />

      {/* Main Content */}
      <section className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900">
        {/* Header */}
        <TradeHeader asset={selectedAsset} />

        {/* Chart + Right Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Chart Section */}
          <div className="flex-1 flex flex-col">
            <TradeChartArea asset={selectedAsset} />
            <OpenOrders symbol={selectedSymbol} />
          </div>

          {/* Right Panel - Order Book + Trade Form */}
          <div className="w-full md:w-80 border-l border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark flex flex-col h-full overflow-hidden">
            <TradeOrderBook asset={selectedAsset} />
            <TradeForm asset={selectedAsset} availableBalance={user.balance} />
          </div>
        </div>
      </section>
    </div>
  );
}
