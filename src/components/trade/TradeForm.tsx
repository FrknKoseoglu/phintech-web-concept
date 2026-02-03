"use client";

import { useState, useMemo, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Asset } from "@/types";
import { cn, getHoldingUnit } from "@/lib/utils";
import { executeTrade } from "@/actions/trade";
import { createLimitOrder } from "@/actions/limit-orders";

interface TradeFormProps {
  asset: Asset;
  availableBalance: number;
  ownedQuantity?: number;
  initialMode?: 'BUY' | 'SELL';
}

export default function TradeForm({ 
  asset, 
  availableBalance,
  ownedQuantity = 0,
  initialMode = 'BUY',
}: TradeFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isBuy, setIsBuy] = useState(initialMode === 'BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [sliderValue, setSliderValue] = useState(0);
  const [isPending, startTransition] = useTransition();



  // Calculate estimated total based on current market price or limit price
  const estimatedTotal = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const price = orderType === 'LIMIT' ? (parseFloat(limitPrice) || 0) : asset.price;
    return q * price;
  }, [quantity, limitPrice, asset.price, orderType]);


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
    
    // For limit orders, also validate limit price
    if (orderType === 'LIMIT') {
      const lp = parseFloat(limitPrice) || 0;
      if (lp <= 0) return false;
    }
    
    if (isBuy && estimatedTotal > availableBalance) return false;
    if (!isBuy && q > ownedQuantity) return false;
    return true;
  }, [quantity, limitPrice, estimatedTotal, availableBalance, isBuy, ownedQuantity, orderType]);


  // Handle slider change
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    const newQuantity = (maxQuantity * value) / 100;
    setQuantity(newQuantity.toFixed(4));
  };

  // Reset form
  const resetForm = () => {
    setQuantity("");
    setLimitPrice("");
    setSliderValue(0);
  };



  // Handle trade submission
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

    if (!isValidOrder || isPending) return;

    const qty = parseFloat(quantity);
    const tradeType = isBuy ? "BUY" : "SELL";

    startTransition(async () => {
      try {
        if (orderType === 'MARKET') {
          // Execute market order immediately
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
        } else {
          // Create limit order
          const targetPrice = parseFloat(limitPrice);
          const result = await createLimitOrder(
            asset.symbol,
            qty,
            targetPrice,
            tradeType
          );
          
          if (result.success) {
            toast.success("Limit Emir Oluşturuldu", {
              description: result.message,
            });
            resetForm();
          } else {
            toast.error("Emir Oluşturulamadı", {
              description: result.message,
            });
          }
        }
      } catch (error) {
        toast.error("Bir hata oluştu", {
          description: "Lütfen tekrar deneyin.",
        });
      }
    });
  };


  return (
    <div className="p-4 bg-white dark:bg-black">
      {/* Buy/Sell Toggle - Pill Segmented Control */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-[#1C1C1E] p-1 rounded-full">
        <button
          onClick={() => { setIsBuy(true); resetForm(); }}
          disabled={isPending}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold rounded-full transition-all",
            isBuy
              ? "bg-success text-white shadow-lg"
              : "text-gray-400 hover:text-white"
          )}
        >
          {orderType === 'MARKET' ? 'Piyasa' : 'Limit'} Al
        </button>
        <button
          onClick={() => { setIsBuy(false); resetForm(); }}
          disabled={isPending}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold rounded-full transition-all",
            !isBuy
              ? "bg-danger text-white shadow-lg"
              : "text-gray-400 hover:text-white"
          )}
        >
          {orderType === 'MARKET' ? 'Piyasa' : 'Limit'} Sat
        </button>
      </div>

      {/* Order Type Toggle - Market/Limit - HIDDEN FOR NOW */}
      {/* <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-[#1C1C1E] p-1 rounded-xl">
        <button
          onClick={() => { setOrderType('MARKET'); setLimitPrice(""); }}
          disabled={isPending}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
            orderType === 'MARKET'
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          )}
        >
          Piyasa Emri
        </button>
        <button
          onClick={() => setOrderType('LIMIT')}
          disabled={isPending}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
            orderType === 'LIMIT'
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          )}
        >
          Limit Emir
        </button>
      </div> */}

      {/* Current Market Price (Read-Only) */}
      <div className="mb-4 p-3 bg-gray-100 dark:bg-[#1C1C1E] rounded-2xl">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Piyasa Fiyatı</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {asset.currency === 'TRY' ? '₺' : '$'}{asset.price.toLocaleString(asset.currency === 'TRY' ? "tr-TR" : "en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Limit Price Input (shown only for limit orders) */}
      {orderType === 'LIMIT' && (
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1.5">
            Limit Fiyatı ({asset.currency === 'TRY' ? '₺' : '$'})
          </label>
          <div className="relative">
            <input
              type="text"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={`${asset.price.toFixed(2)}`}
              disabled={isPending}
              className="w-full bg-gray-100 dark:bg-[#1C1C1E] border border-gray-300 dark:border-gray-700 rounded-2xl py-3 pl-4 pr-14 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white transition-all disabled:opacity-50"
            />
            <span className="absolute right-4 top-3.5 text-xs text-gray-400 font-medium">
              {asset.currency === 'TRY' ? '₺' : '$'}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Piyasa fiyatı: {asset.currency === 'TRY' ? '₺' : '$'}{asset.price.toLocaleString(asset.currency === 'TRY' ? "tr-TR" : "en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>
      )}

      {/* Quantity Input */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1.5">
          Miktar ({getHoldingUnit(asset.symbol)})
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
            className="w-full bg-gray-100 dark:bg-[#1C1C1E] border border-gray-300 dark:border-gray-700 rounded-2xl py-3 pl-4 pr-14 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white transition-all disabled:opacity-50"
          />
          <span className="absolute right-4 top-3.5 text-xs text-gray-400 font-medium">
            {getHoldingUnit(asset.symbol)}
          </span>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>
            Maks: <button 
              onClick={() => { setQuantity(maxQuantity.toFixed(4)); setSliderValue(100); }}
              className="text-primary hover:underline"
            >
              {maxQuantity.toFixed(4)} {getHoldingUnit(asset.symbol)}
            </button>
          </span>
          {!isBuy && <span>Sahip: {ownedQuantity.toFixed(4)}</span>}
        </div>
      </div>

      {/* Slider */}
      <div className="mb-6 px-1">
        <div className="h-2 bg-gray-200 dark:bg-[#1C1C1E] rounded-full relative cursor-pointer">
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
              "absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow-lg border-2 border-black hover:scale-110 transition-transform",
              isBuy ? "bg-success" : "bg-danger"
            )}
            style={{ left: `${sliderValue}%`, marginLeft: "-10px" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mt-3">
          {[0, 25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => handleSliderChange(pct)}
              className="hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Available Balance / Owned */}
      <div className="flex justify-between text-xs mb-3 text-gray-400">
        <span>{isBuy ? "Kullanılabilir Bakiye" : "Sahip Olduğunuz"}</span>
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {isBuy 
            ? `${asset.currency === 'TRY' ? '₺' : '$'}${availableBalance.toLocaleString(asset.currency === 'TRY' ? "tr-TR" : "en-US", { minimumFractionDigits: 2 })}`
            : `${ownedQuantity.toFixed(4)} ${getHoldingUnit(asset.symbol)}`
          }
        </span>
      </div>

      {/* Estimated Total */}
      <div className="flex justify-between text-sm mb-4 py-3 border-y border-gray-200 dark:border-gray-800">
        <span className="text-gray-500 dark:text-gray-400">Tahmini Toplam</span>
        <span className="font-bold text-lg text-gray-900 dark:text-white">
          {asset.currency === 'TRY' ? '₺' : '$'}{estimatedTotal.toLocaleString(asset.currency === 'TRY' ? "tr-TR" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Validation Warnings */}
      {isBuy && estimatedTotal > availableBalance && estimatedTotal > 0 && (
        <div className="mb-3 text-xs text-danger bg-danger/10 px-4 py-2.5 rounded-xl">
          Yetersiz bakiye. Maksimum alım: {maxQuantity.toFixed(4)} {getHoldingUnit(asset.symbol)}
        </div>
      )}
      {!isBuy && parseFloat(quantity) > ownedQuantity && parseFloat(quantity) > 0 && (
        <div className="mb-3 text-xs text-danger bg-danger/10 px-4 py-2.5 rounded-xl">
          Yetersiz varlık. Sahip olduğunuz: {ownedQuantity.toFixed(4)} {getHoldingUnit(asset.symbol)}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={session ? handleSubmit : () => router.push("/login")}
        disabled={session ? (!isValidOrder || isPending) : false}
        className={cn(
          "w-full font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base",
          !session
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25"
            : isBuy
              ? "bg-success hover:bg-green-600 text-white shadow-green-500/25"
              : "bg-danger hover:bg-red-600 text-white shadow-red-500/25"
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            İşleniyor...
          </>
        ) : !session ? (
          "İşlem Yapmak İçin Giriş Yap"
        ) : (
          <>
            {orderType === 'MARKET' 
              ? `${getHoldingUnit(asset.symbol)} ${isBuy ? "Satın Al" : "Sat"}`
              : `Limit Emir Oluştur`
            }
          </>
        )}
      </button>

      {/* Info Text */}
      <p className="text-[10px] text-gray-400 text-center mt-3">
        {orderType === 'MARKET' 
          ? 'Piyasa emri, anlık piyasa fiyatından gerçekleştirilir.'
          : 'Limit emir, belirlediğiniz fiyata ulaşıldığında otomatik olarak gerçekleştirilir.'
        }
      </p>
    </div>
  );
}
