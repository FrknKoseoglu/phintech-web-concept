"use client";

import { useState } from "react";
import type { Asset } from "@/types";

interface QuickTradeProps {
  selectedAsset?: Asset;
  availableBalance: number;
}

export default function QuickTrade({
  selectedAsset,
  availableBalance,
}: QuickTradeProps) {
  const [isBuy, setIsBuy] = useState(true);
  const [price, setPrice] = useState(selectedAsset?.price.toString() || "0");
  const [amount, setAmount] = useState("");
  const [sliderValue, setSliderValue] = useState(0);

  const total = parseFloat(price || "0") * parseFloat(amount || "0");
  const symbol = selectedAsset?.symbol || "BTC";

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-border-light dark:border-border-dark">
      {/* Buy/Sell Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
        <button
          onClick={() => setIsBuy(true)}
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
        {/* Price Input */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Fiyat (USD)
          </label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400 text-xs">USD</span>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Miktar ({symbol})
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="block w-full pl-3 pr-10 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-200"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400 text-xs">{symbol}</span>
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
            onChange={(e) => setSliderValue(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
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
          <span className="text-sm text-gray-500">Toplam</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Submit Button */}
        <button
          className={`w-full font-bold py-3 rounded-lg shadow-lg transition-all transform active:scale-95 ${
            isBuy
              ? "bg-success hover:bg-green-600 text-white shadow-green-500/20"
              : "bg-danger hover:bg-red-600 text-white shadow-red-500/20"
          }`}
        >
          {symbol} {isBuy ? "Al" : "Sat"}
        </button>
      </div>
    </div>
  );
}
