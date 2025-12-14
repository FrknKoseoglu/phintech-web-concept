"use client";

import { TrendingUp, TrendingDown, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { toast } from "sonner";
import MoneyDisplay from "@/components/ui/MoneyDisplay";
import { formatMoney } from "@/lib/utils";

interface PortfolioSummaryProps {
  balance: number;
  holdingsValue?: number; // Total value of holdings
  profitLoss?: number; // Total P/L
}

export default function PortfolioSummary({
  balance,
  holdingsValue = 0,
  profitLoss = 0,
}: PortfolioSummaryProps) {
  const totalNetWorth = balance + holdingsValue;
  const costBasis = holdingsValue - profitLoss;
  const changePercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;
  const isPositive = profitLoss >= 0;

  const handleDemoFeature = (feature: string) => {
    toast.info(`${feature} özelliği Konsept Projede mevcut değildir`);
  };

  return (
    <div className="bg-white dark:bg-black rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-text-muted text-sm font-medium">
          Toplam Varlıklarım
        </h3>
        {holdingsValue > 0 && (
          <span
            className={`${
              isPositive
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger"
            } text-xs px-3 py-1 rounded-full font-semibold flex items-center`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
            {isPositive ? "+" : ""}
            {changePercent.toFixed(1)}%
          </span>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          <MoneyDisplay amount={totalNetWorth} currency="USD" decimalClassName="opacity-50" />
        </h2>
      </div>

      {/* Breakdown */}
      {holdingsValue > 0 && (
        <div className="mt-3 flex gap-4 text-xs text-gray-400">
          <span>Nakit: {formatMoney(balance, { currency: 'USD' }).full}</span>
          <span>Yatırım: {formatMoney(holdingsValue, { currency: 'USD' }).full}</span>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button 
          onClick={() => handleDemoFeature('Para yatırma')}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3 rounded-full text-sm font-semibold transition-all"
        >
          <ArrowDownToLine className="w-4 h-4" />
          Yatır
        </button>
        <button 
          onClick={() => handleDemoFeature('Para çekme')}
          className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-800 dark:text-white py-3 rounded-full text-sm font-semibold transition-all border border-transparent dark:border-gray-800"
        >
          <ArrowUpFromLine className="w-4 h-4" />
          Çek
        </button>
      </div>
    </div>
  );
}

