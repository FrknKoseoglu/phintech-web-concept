"use client";

import { useState } from "react";
import type { Transaction, PortfolioItem } from "@/types";
import { cn } from "@/lib/utils";

interface TradeTabsProps {
  symbol: string;
  transactions: Transaction[];
  portfolioItem?: PortfolioItem;
  currentPrice: number;
}

const tabs = [
  { id: "orders", label: "Açık Emirler" },
  { id: "history", label: "Alım-Satım Geçmişi" },
  { id: "assets", label: "Varlıklar" },
];

export default function TradeTabs({ symbol, transactions, portfolioItem, currentPrice }: TradeTabsProps) {
  const [activeTab, setActiveTab] = useState("orders");

  // Filter transactions for current symbol
  const symbolTransactions = transactions.filter((t) => t.symbol === symbol);

  // Calculate holding value
  const holdingQuantity = portfolioItem?.quantity || 0;
  const holdingAvgCost = portfolioItem?.avgCost || 0;
  const holdingValue = holdingQuantity * currentPrice;
  const holdingCost = holdingQuantity * holdingAvgCost;
  const holdingPnL = holdingValue - holdingCost;
  const holdingPnLPercent = holdingCost > 0 ? (holdingPnL / holdingCost) * 100 : 0;

  return (
    <div className="h-64 bg-white dark:bg-black flex flex-col">
      {/* Tabs - Rounded Pill Style */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all rounded-full",
              activeTab === tab.id
                ? "bg-primary/15 text-primary"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "orders" && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">
              Açık emiriniz bulunmuyor.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Piyasa emirleri anlık olarak gerçekleştirilir.
            </p>
          </div>
        )}

        {activeTab === "history" && (
          <div>
            {symbolTransactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <p className="text-sm text-gray-400">
                  {symbol} için işlem geçmişi bulunmuyor.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    <th className="pb-2 font-medium">Tarih</th>
                    <th className="pb-2 font-medium">Tür</th>
                    <th className="pb-2 font-medium text-right">Fiyat</th>
                    <th className="pb-2 font-medium text-right">Miktar</th>
                    <th className="pb-2 font-medium text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {symbolTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="py-2 text-gray-600 dark:text-gray-300">
                        {new Date(tx.date).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className={cn("py-2 font-medium", tx.type === "BUY" ? "text-success" : "text-danger")}>
                        {tx.type === "BUY" ? "Alış" : "Satış"}
                      </td>
                      <td className="py-2 text-right text-gray-900 dark:text-white">
                        ${tx.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 text-right text-gray-700 dark:text-gray-200">
                        {tx.quantity.toFixed(4)}
                      </td>
                      <td className="py-2 text-right text-gray-900 dark:text-white font-medium">
                        ${tx.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "assets" && (
          <div>
            {holdingQuantity <= 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <p className="text-sm text-gray-400">
                  {symbol} varlığınız bulunmuyor.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Sağ panelden alım yapabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="bg-[#1C1C1E] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{symbol}</h4>
                    <p className="text-xs text-gray-500">Spot Bakiye</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {holdingQuantity.toFixed(4)} {symbol}
                    </p>
                    <p className="text-sm text-gray-500">
                      ≈ ${holdingValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ort. Maliyet</p>
                    <p className="font-semibold text-white">
                      ${holdingAvgCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Mevcut Fiyat</p>
                    <p className="font-semibold text-white">
                      ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Kar/Zarar</p>
                    <p className={cn("font-semibold", holdingPnL >= 0 ? "text-success" : "text-danger")}>
                      {holdingPnL >= 0 ? "+" : ""}${holdingPnL.toFixed(2)} ({holdingPnLPercent.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
