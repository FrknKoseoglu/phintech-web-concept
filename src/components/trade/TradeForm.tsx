"use client";

import { useState, useMemo } from "react";
import { Plus, Minus, ChevronDown } from "lucide-react";
import type { Asset } from "@/types";
import { cn } from "@/lib/utils";

interface TradeFormProps {
  asset: Asset;
  availableBalance: number;
}

export default function TradeForm({ asset, availableBalance }: TradeFormProps) {
  const [isBuy, setIsBuy] = useState(true);
  const [price, setPrice] = useState(asset.price.toString());
  const [amount, setAmount] = useState("");
  const [sliderValue, setSliderValue] = useState(0);
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");

  // Calculate total
  const total = useMemo(() => {
    const p = parseFloat(price) || 0;
    const a = parseFloat(amount) || 0;
    return p * a;
  }, [price, amount]);

  // Check if order is valid
  const isValidOrder = useMemo(() => {
    const p = parseFloat(price) || 0;
    const a = parseFloat(amount) || 0;
    if (p <= 0 || a <= 0) return false;
    if (isBuy && total > availableBalance) return false;
    return true;
  }, [price, amount, total, availableBalance, isBuy]);

  // Handle slider change
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    if (isBuy) {
      const maxBuyAmount = availableBalance / (parseFloat(price) || 1);
      setAmount(((maxBuyAmount * value) / 100).toFixed(4));
    }
  };

  // Increment/decrement price
  const adjustPrice = (delta: number) => {
    const currentPrice = parseFloat(price) || 0;
    const step = currentPrice > 100 ? 0.1 : 0.01;
    setPrice((currentPrice + delta * step).toFixed(2));
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800/50">
      {/* Buy/Sell Toggle */}
      <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setIsBuy(true)}
          className={cn(
            "flex-1 py-1.5 text-sm font-semibold rounded transition-all",
            isBuy
              ? "bg-success text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          Al
        </button>
        <button
          onClick={() => setIsBuy(false)}
          className={cn(
            "flex-1 py-1.5 text-sm font-semibold rounded transition-all",
            !isBuy
              ? "bg-danger text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          Sat
        </button>
      </div>

      {/* Order Type & Commission */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative group">
          <button className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1 hover:text-primary">
            {orderType === "limit" ? "Limit" : "Piyasa"}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-gray-400 cursor-pointer hover:underline">
          Komisyon Bilgisi
        </span>
      </div>

      {/* Price Input */}
      <div className="mb-3">
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          Fiyat (USD)
        </label>
        <div className="relative">
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-3 pr-16 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 dark:text-white transition-all"
          />
          <div className="absolute right-0 top-0 h-full flex flex-col border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => adjustPrice(1)}
              className="flex-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-tr-lg text-gray-500"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => adjustPrice(-1)}
              className="flex-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-br-lg text-gray-500"
            >
              <Minus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          Miktar ({asset.symbol})
        </label>
        <div className="relative">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-3 pr-12 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary text-gray-900 dark:text-white transition-all"
          />
          <span className="absolute right-3 top-2 text-xs text-gray-500 mt-0.5">
            {asset.symbol}
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-6 px-1">
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer">
          <div
            className={cn("absolute left-0 top-0 h-full rounded-full", isBuy ? "bg-success" : "bg-danger")}
            style={{ width: `${sliderValue}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-md border-2 border-white dark:border-gray-800 hover:scale-110 transition-transform",
              isBuy ? "bg-success" : "bg-danger"
            )}
            style={{ left: `${sliderValue}%`, marginLeft: "-6px" }}
          />
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => (
            <div
              key={tick}
              className="absolute top-2 w-0.5 h-1 bg-gray-300 dark:bg-gray-600"
              style={{ left: `${tick}%` }}
            />
          ))}
        </div>
      </div>

      {/* Available Balance */}
      <div className="flex justify-between text-xs mb-4 text-gray-500">
        <span>Kullanılabilir</span>
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
        </span>
      </div>

      {/* Total */}
      <div className="flex justify-between text-sm mb-4 py-2 border-t border-gray-100 dark:border-gray-700">
        <span className="text-gray-500">Toplam</span>
        <span className="font-bold text-gray-900 dark:text-white">
          ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Insufficient Balance Warning */}
      {isBuy && total > availableBalance && total > 0 && (
        <div className="mb-3 text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg">
          Yetersiz bakiye. Maksimum: ${availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>
      )}

      {/* Submit Button */}
      <button
        disabled={!isValidOrder}
        className={cn(
          "w-full font-bold py-3 rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
          isBuy
            ? "bg-success hover:bg-green-600 text-white shadow-green-500/20"
            : "bg-danger hover:bg-red-600 text-white shadow-red-500/20"
        )}
      >
        {asset.symbol} {isBuy ? "Al" : "Sat"}
      </button>
    </div>
  );
}
