"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { executeTrade } from "@/actions/trade";
import { createLimitOrder } from "@/actions/limit-order";
import type { Asset } from "@/types";
import { Loader2 } from "lucide-react";
import { cn, getHoldingUnit } from "@/lib/utils";

interface QuickTradeProps {
  selectedAsset?: Asset;
  tryBalance: number;      // user.balance (TL)
  usdBalance: number;      // portfolio['USD']
  usdtBalance: number;     // portfolio['USDT']
  ownedQuantity?: number;
}

// BIST stock symbols (for client-side funding source check)
const BIST_SYMBOLS = ['THYAO', 'GARAN', 'AKBNK', 'EREGL', 'SASA'];

// Determine funding source for an asset
type FundingSource = 'TRY' | 'USD' | 'USDT';

function getFundingSource(asset: Asset): FundingSource {
  if (asset.category === 'currency') return 'TRY';
  if (BIST_SYMBOLS.includes(asset.symbol)) return 'TRY';
  if (asset.category === 'commodity') return 'TRY';
  if (asset.category === 'crypto') return 'USDT';
  return 'USD';
}

// Get available balance for display based on asset type
function getAvailableBalanceInfo(asset: Asset, tryBalance: number, usdBalance: number, usdtBalance: number): { amount: number; label: string; symbol: string } {
  const source = getFundingSource(asset);
  if (source === 'USDT') {
    return { amount: usdtBalance, label: 'Kullanılabilir', symbol: 'USDT' };
  } else if (source === 'USD') {
    return { amount: usdBalance, label: 'Kullanılabilir', symbol: '$' };
  }
  return { amount: tryBalance, label: 'Kullanılabilir', symbol: '₺' };
}

export default function QuickTrade({
  selectedAsset,
  tryBalance,
  usdBalance,
  usdtBalance,
  ownedQuantity = 0,
}: QuickTradeProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Trade mode: BUY or SELL
  const [mode, setMode] = useState<"BUY" | "SELL">("BUY");
  // Order type: market or limit
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  
  const [symbol, setSymbol] = useState(selectedAsset?.symbol || "BTC");
  const [quantity, setQuantity] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
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
  const isLimit = orderType === "limit";

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

    // Validate sell quantity (only for market orders or limit sell)
    if (!isBuy && qty > ownedQuantity) {
      toast.error(`Yetersiz varlık. Sahip olduğunuz: ${ownedQuantity.toFixed(4)} ${getHoldingUnit(symbol)}`);
      return;
    }

    // Limit order validation
    if (isLimit) {
      const price = parseFloat(targetPrice);
      if (!price || price <= 0) {
        toast.error("Lütfen geçerli bir hedef fiyat girin");
        return;
      }

      startTransition(async () => {
        const result = await createLimitOrder({
          symbol: symbol.toUpperCase(),
          quantity: qty,
          targetPrice: price,
          type: mode,
        });
        
        if (result.success) {
          toast.success("Talimatınız alındı. Fiyat gelince işleme konulacak.", {
            description: result.message,
          });
          setQuantity("");
          setTargetPrice("");
          setSliderValue(0);
        } else {
          toast.error(result.message);
        }
      });
    } else {
      // Market order
      startTransition(async () => {
        const result = await executeTrade(symbol.toUpperCase(), qty, mode);
        if (result.success) {
          toast.success(result.message);
          setQuantity("");
          setSliderValue(0);
        } else {
          toast.error(result.message);
        }
      });
    }
  };

  // Calculate quantity based on slider percentage
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    // Get available balance based on funding source
    const balanceInfo = selectedAsset ? getAvailableBalanceInfo(selectedAsset, tryBalance, usdBalance, usdtBalance) : { amount: 0, label: '', symbol: '' };
    
    if (isBuy && estimatedPrice > 0) {
      // For BUY, calculate max quantity based on available funds
      const maxQuantity = balanceInfo.amount / estimatedPrice;
      const newQuantity = (maxQuantity * value) / 100;
      setQuantity(newQuantity.toFixed(4));
    } else if (!isBuy && ownedQuantity > 0) {
      // SELL mode: calculate based on owned quantity
      const newQuantity = (ownedQuantity * value) / 100;
      setQuantity(newQuantity.toFixed(4));
    }
  };

  return (
    <div className="bg-white dark:bg-black rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
      {/* Order Type Tabs: Piyasa / Limit */}
      <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-4">
        <button
          onClick={() => setOrderType("market")}
          disabled={isPending}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
            !isLimit
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          Piyasa
        </button>
        <button
          onClick={() => setOrderType("limit")}
          disabled={isPending}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
            isLimit
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          Limit
        </button>
      </div>

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

      {/* Available Balance / Owned Quantity */}
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>
          {isBuy ? (
            <>
              {selectedAsset && (() => {
                const info = getAvailableBalanceInfo(selectedAsset, tryBalance, usdBalance, usdtBalance);
                return (
                  <>
                    {info.label}:{" "}
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {info.symbol === 'USDT' 
                        ? `${info.amount.toFixed(2)} USDT`
                        : info.symbol === '$'
                          ? `$${info.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                          : `₺${info.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`
                      }
                    </span>
                  </>
                );
              })()}
            </>
          ) : (
            <>
              Sahip olduğunuz:{" "}
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {ownedQuantity.toFixed(4)} {symbol}
              </span>
            </>
          )}
        </span>
        {/* Current market price indicator */}
        {selectedAsset && (
          <span className="text-gray-400">
            Güncel: {selectedAsset.currency === 'TRY' 
              ? `₺${estimatedPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}` 
              : `$${estimatedPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </span>
        )}
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

        {/* Target Price Input (Limit orders only) */}
        {isLimit && (
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Hedef Fiyat
            </label>
            <div className="relative">
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={estimatedPrice > 0 ? estimatedPrice.toFixed(2) : "0.00"}
                disabled={isPending}
                className={cn(
                  "block w-full pl-3 pr-14 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-800 dark:text-gray-200 disabled:opacity-50 transition-colors",
                  isBuy 
                    ? "border-gray-200 dark:border-gray-800 focus:ring-success focus:border-success" 
                    : "border-gray-200 dark:border-gray-800 focus:ring-danger focus:border-danger"
                )}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-400 text-xs">
                  {selectedAsset?.currency === 'TRY' ? '₺' : '$'}
                </span>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-gray-400">
              {isBuy 
                ? "Fiyat bu seviyeye düşünce otomatik alım yapılır" 
                : "Fiyat bu seviyeye çıkınca otomatik satım yapılır"}
            </p>
          </div>
        )}

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

        {/* Slider (Market orders only) */}
        {!isLimit && (
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
        )}

        {/* Total */}
        <div className="flex justify-between items-center py-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-500">
            {isLimit ? "Tahmini Toplam" : "Tahmini Toplam"}
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {isLimit && targetPrice
              ? (() => {
                  const limitTotal = parseFloat(targetPrice) * parseFloat(quantity || "0");
                  return selectedAsset?.currency === 'TRY' 
                    ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(limitTotal)
                    : `$${limitTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                })()
              : symbol === 'USDTRY' 
                ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total)
                : selectedAsset?.currency === 'TRY' 
                  ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total)
                  : `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
        </div>

        {/* TRY Conversion Info */}
        {symbol === 'USDTRY' && total > 0 && (
          <div className="text-xs text-center text-gray-500 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg mb-3">
            {parseFloat(quantity || '0').toFixed(2)} USD = {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total)}
          </div>
        )}
        {selectedAsset?.currency === 'TRY' && symbol !== 'USDTRY' && total > 0 && (
          <div className="text-xs text-center text-gray-500 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg mb-3">
            Yaklaşık <span className="font-semibold text-gray-700 dark:text-gray-300">
              ${(total / 34.5).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span> (Kur: ~34.50)
          </div>
        )}

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
          ) : isLimit ? (
            <>
              Talimat Oluştur
            </>
          ) : (
            <>
              {symbol || "---"} {isBuy ? "Al" : "Sat"}
            </>
          )}
        </button>

        {/* Limit order info */}
        {isLimit && (
          <p className="text-[10px] text-center text-gray-400">
            Talimat oluşturulduğunda bakiyeniz kilitlenmez. 
            İşlem anında yeterli bakiye kontrol edilir.
          </p>
        )}
      </div>
    </div>
  );
}
