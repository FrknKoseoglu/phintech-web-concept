"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { executeTrade } from "@/actions/trade";
import type { Asset } from "@/types";
import { Loader2 } from "lucide-react";

interface QuickTradeProps {
  selectedAsset?: Asset;
  availableBalance: number;
}

export default function QuickTrade({
  selectedAsset,
  availableBalance,
}: QuickTradeProps) {
  const [isPending, startTransition] = useTransition();
  const [isBuy, setIsBuy] = useState(true);
  const [symbol, setSymbol] = useState(selectedAsset?.symbol || "BTC");
  const [quantity, setQuantity] = useState("");
  const [sliderValue, setSliderValue] = useState(0);

  // Estimate price for display (will be fetched server-side for actual trade)
  const estimatedPrice = selectedAsset?.price || 0;
  const total = estimatedPrice * parseFloat(quantity || "0");

  const handleSubmit = () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      toast.error("Lütfen geçerli bir miktar girin");
      return;
    }

    if (!symbol.trim()) {
      toast.error("Lütfen bir sembol girin");
      return;
    }

    startTransition(async () => {
      const result = await executeTrade(symbol.toUpperCase(), qty, isBuy ? "BUY" : "SELL");
      if (result.success) {
        toast.success(result.message);
        setQuantity(""); // Reset quantity after successful trade
        setSliderValue(0);
      } else {
        toast.error(result.message);
      }
    });
  };

  // Calculate quantity based on slider percentage
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    if (isBuy && estimatedPrice > 0) {
      const maxQuantity = availableBalance / estimatedPrice;
      const newQuantity = (maxQuantity * value) / 100;
      setQuantity(newQuantity.toFixed(4));
    }
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-border-light dark:border-border-dark">
      {/* Buy/Sell Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
        <button
          onClick={() => setIsBuy(true)}
          disabled={isPending}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
            isBuy
              ? "bg-success text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Al
        </button>
        <button
          onClick={() => setIsBuy(false)}
          disabled={isPending}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
            !isBuy
              ? "bg-danger text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Sat
        </button>
      </div>

      {/* Available Balance */}
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>
          Kullanılabilir:{" "}
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            ${availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </span>
        <a href="#" className="text-primary hover:underline">
          Limit
        </a>
      </div>

      {/* Form Inputs */}
      <div className="space-y-4">
        {/* Symbol Input */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Sembol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="BTC, ETH, AAPL..."
            disabled={isPending}
            className="block w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 uppercase disabled:opacity-50"
          />
        </div>

        {/* Quantity Input */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Miktar ({symbol || "---"})
          </label>
          <div className="relative">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              disabled={isPending}
              className="block w-full pl-3 pr-14 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200 disabled:opacity-50"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400 text-xs">{symbol || "---"}</span>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="pt-2 pb-4">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            disabled={isPending || !isBuy}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary disabled:opacity-50"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500">Tahmini Toplam</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className={`w-full font-bold py-3 rounded-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            isBuy
              ? "bg-success hover:bg-green-600 text-white shadow-green-500/20"
              : "bg-danger hover:bg-red-600 text-white shadow-red-500/20"
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              İşleniyor...
            </>
          ) : (
            <>
              {symbol || "---"} {isBuy ? "Al" : "Sat"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
