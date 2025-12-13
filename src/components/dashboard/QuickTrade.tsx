"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { executeTrade } from "@/actions/trade";
import type { Asset } from "@/types";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickTradeProps {
  selectedAsset?: Asset;
  availableBalance: number;
}

export default function QuickTrade({
  selectedAsset,
  availableBalance,
}: QuickTradeProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"BUY" | "SELL">("BUY");
  const [symbol, setSymbol] = useState(selectedAsset?.symbol || "BTC");
  const [quantity, setQuantity] = useState("");
  const [sliderValue, setSliderValue] = useState(0);

  // Sync symbol with selected asset
  useEffect(() => {
    if (selectedAsset?.symbol) {
      setSymbol(selectedAsset.symbol);
    }
  }, [selectedAsset?.symbol]);

  // Estimate price for display (will be fetched server-side for actual trade)
  const estimatedPrice = selectedAsset?.price || 0;
  const total = estimatedPrice * parseFloat(quantity || "0");

  const isBuy = mode === "BUY";
  const accentColor = isBuy ? "success" : "danger";

  const handleSubmit = () => {
    // Check authentication
    if (!session) {
      toast.error("İşlem yapmak için lütfen giriş yapın.", {
        action: {
          label: "Giriş Yap",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }

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
      const result = await executeTrade(symbol.toUpperCase(), qty, mode);
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
    // TODO: For SELL mode, calculate based on owned quantity
  };

  return (
    <div className="bg-white dark:bg-black rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
      {/* Buy/Sell Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-6">
        <button
          onClick={() => setMode("BUY")}
          disabled={isPending}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all",
            isBuy
              ? "bg-success text-white shadow-md shadow-success/20"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          Al
        </button>
        <button
          onClick={() => setMode("SELL")}
          disabled={isPending}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all",
            !isBuy
              ? "bg-danger text-white shadow-md shadow-danger/20"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          )}
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
            className={cn(
              "block w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-800 dark:text-gray-200 uppercase disabled:opacity-50 transition-colors",
              isBuy 
                ? "border-gray-200 dark:border-gray-800 focus:ring-success focus:border-success" 
                : "border-gray-200 dark:border-gray-800 focus:ring-danger focus:border-danger"
            )}
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
              className={cn(
                "block w-full pl-3 pr-14 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-800 dark:text-gray-200 disabled:opacity-50 transition-colors",
                isBuy 
                  ? "border-gray-200 dark:border-gray-800 focus:ring-success focus:border-success" 
                  : "border-gray-200 dark:border-gray-800 focus:ring-danger focus:border-danger"
              )}
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
            disabled={isPending}
            className={cn(
              "w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-50",
              isBuy 
                ? "bg-gray-200 dark:bg-gray-800 accent-success" 
                : "bg-gray-200 dark:bg-gray-800 accent-danger"
            )}
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
        <div className="flex justify-between items-center py-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-500">Tahmini Toplam</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className={cn(
            "w-full font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2",
            isBuy
              ? "bg-success hover:bg-green-600 text-white shadow-success/30"
              : "bg-danger hover:bg-red-600 text-white shadow-danger/30"
          )}
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
