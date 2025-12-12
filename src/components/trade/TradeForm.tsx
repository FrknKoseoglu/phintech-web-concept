"use client";

import { useState, useMemo, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Asset } from "@/types";
import { cn } from "@/lib/utils";
import { executeTrade } from "@/actions/trade";

interface TradeFormProps {
  asset: Asset;
  availableBalance: number;
  ownedQuantity?: number;
}

export default function TradeForm({ 
  asset, 
  availableBalance,
  ownedQuantity = 0,
}: TradeFormProps) {
  const [isBuy, setIsBuy] = useState(true);
  const [quantity, setQuantity] = useState("");
  const [sliderValue, setSliderValue] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Calculate estimated total based on current market price
  const estimatedTotal = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    return q * asset.price;
  }, [quantity, asset.price]);

  // Calculate max quantity user can buy/sell
  const maxQuantity = useMemo(() => {
    if (isBuy) {
      return Math.floor((availableBalance / asset.price) * 10000) / 10000;
    }
    return ownedQuantity;
  }, [isBuy, availableBalance, asset.price, ownedQuantity]);

  // Check if order is valid
  const isValidOrder = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    if (q <= 0) return false;
    if (isBuy && estimatedTotal > availableBalance) return false;
    if (!isBuy && q > ownedQuantity) return false;
    return true;
  }, [quantity, estimatedTotal, availableBalance, isBuy, ownedQuantity]);

  // Handle slider change
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    const newQuantity = (maxQuantity * value) / 100;
    setQuantity(newQuantity.toFixed(4));
  };

  // Reset form
  const resetForm = () => {
    setQuantity("");
    setSliderValue(0);
  };

  // Handle trade submission
  const handleSubmit = () => {
    if (!isValidOrder || isPending) return;

    const qty = parseFloat(quantity);
    const tradeType = isBuy ? "BUY" : "SELL";

    startTransition(async () => {
      try {
        const result = await executeTrade(asset.symbol, qty, tradeType);
        
        if (result.success) {
          toast.success("İşlem Başarılı", {
            description: result.message,
          });
          resetForm();
        } else {
          toast.error("İşlem Başarısız", {
            description: result.message,
          });
        }
      } catch (error) {
        toast.error("Bir hata oluştu", {
          description: "Lütfen tekrar deneyin.",
        });
      }
    });
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800/50">
      {/* Buy/Sell Toggle */}
      <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => { setIsBuy(true); resetForm(); }}
          disabled={isPending}
          className={cn(
            "flex-1 py-2 text-sm font-bold rounded-md transition-all",
            isBuy
              ? "bg-success text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          Piyasa Al
        </button>
        <button
          onClick={() => { setIsBuy(false); resetForm(); }}
          disabled={isPending}
          className={cn(
            "flex-1 py-2 text-sm font-bold rounded-md transition-all",
            !isBuy
              ? "bg-danger text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          Piyasa Sat
        </button>
      </div>

      {/* Current Market Price (Read-Only) */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Piyasa Fiyatı</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            ${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Quantity Input */}
      <div className="mb-4">
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          Miktar ({asset.symbol})
        </label>
        <div className="relative">
          <input
            type="text"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              const val = parseFloat(e.target.value) || 0;
              setSliderValue(maxQuantity > 0 ? Math.min((val / maxQuantity) * 100, 100) : 0);
            }}
            placeholder="0.00"
            disabled={isPending}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-3 pr-12 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white transition-all disabled:opacity-50"
          />
          <span className="absolute right-3 top-2.5 text-xs text-gray-500">
            {asset.symbol}
          </span>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>
            Maks: <button 
              onClick={() => { setQuantity(maxQuantity.toFixed(4)); setSliderValue(100); }}
              className="text-primary hover:underline"
            >
              {maxQuantity.toFixed(4)} {asset.symbol}
            </button>
          </span>
          {!isBuy && <span>Sahip: {ownedQuantity.toFixed(4)}</span>}
        </div>
      </div>

      {/* Slider */}
      <div className="mb-6 px-1">
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer">
          <div
            className={cn("absolute left-0 top-0 h-full rounded-full transition-all", isBuy ? "bg-success" : "bg-danger")}
            style={{ width: `${sliderValue}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            disabled={isPending}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md border-2 border-white dark:border-gray-800 hover:scale-110 transition-transform",
              isBuy ? "bg-success" : "bg-danger"
            )}
            style={{ left: `${sliderValue}%`, marginLeft: "-8px" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-2">
          {[0, 25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => handleSliderChange(pct)}
              className="hover:text-primary transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Available Balance / Owned */}
      <div className="flex justify-between text-xs mb-3 text-gray-500">
        <span>{isBuy ? "Kullanılabilir Bakiye" : "Sahip Olduğunuz"}</span>
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {isBuy 
            ? `$${availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            : `${ownedQuantity.toFixed(4)} ${asset.symbol}`
          }
        </span>
      </div>

      {/* Estimated Total */}
      <div className="flex justify-between text-sm mb-4 py-3 border-y border-gray-100 dark:border-gray-700">
        <span className="text-gray-500">Tahmini Toplam</span>
        <span className="font-bold text-lg text-gray-900 dark:text-white">
          ${estimatedTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Validation Warnings */}
      {isBuy && estimatedTotal > availableBalance && estimatedTotal > 0 && (
        <div className="mb-3 text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg">
          Yetersiz bakiye. Maksimum alım: {maxQuantity.toFixed(4)} {asset.symbol}
        </div>
      )}
      {!isBuy && parseFloat(quantity) > ownedQuantity && parseFloat(quantity) > 0 && (
        <div className="mb-3 text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg">
          Yetersiz varlık. Sahip olduğunuz: {ownedQuantity.toFixed(4)} {asset.symbol}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValidOrder || isPending}
        className={cn(
          "w-full font-bold py-3.5 rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base",
          isBuy
            ? "bg-success hover:bg-green-600 text-white shadow-green-500/20"
            : "bg-danger hover:bg-red-600 text-white shadow-red-500/20"
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            İşleniyor...
          </>
        ) : (
          <>
            {asset.symbol} {isBuy ? "Satın Al" : "Sat"}
          </>
        )}
      </button>

      {/* Info Text */}
      <p className="text-[10px] text-gray-400 text-center mt-3">
        Piyasa emri, anlık piyasa fiyatından gerçekleştirilir.
      </p>
    </div>
  );
}
