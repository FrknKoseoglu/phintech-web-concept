"use server";

import { revalidatePath } from "next/cache";
import { getAssetBySymbol, SYMBOL_MAP } from "@/lib/market";
import prisma from "@/lib/prisma";
import type { TradeResult, Asset } from "@/types";

// Default user ID for demo (in production, get from session)
const DEMO_USER_ID = "demo_user_001";

// =============================================================================
// TRIPLE-CURRENCY SYSTEM
// =============================================================================
// TRY (₺)  -> user.balance      -> BIST stocks, Commodities, Currency purchases
// USD ($)  -> portfolio['USD']  -> US Stocks (AAPL, TSLA, etc.)
// USDT     -> portfolio['USDT'] -> Crypto (BTC, ETH, SOL, etc.)
// =============================================================================

type FundingSource = 'TRY' | 'USD' | 'USDT';

/**
 * Determines the funding source required to buy/sell an asset.
 */
function getFundingSource(asset: Asset): FundingSource {
  // Currency purchases (USD, USDT) always use TRY
  if (asset.category === 'currency') return 'TRY';
  
  // BIST stocks use TRY
  if (SYMBOL_MAP[asset.symbol]?.endsWith('.IS')) return 'TRY';
  
  // Commodities use TRY (priced in USD but traded with TRY for now)
  if (asset.category === 'commodity') return 'TRY';
  
  // Crypto uses USDT
  if (asset.category === 'crypto') return 'USDT';
  
  // US Stocks use USD (default for 'stock' category that isn't BIST)
  return 'USD';
}

/**
 * Fetches the current USD/TRY exchange rate.
 */
async function getUsdTryRate(): Promise<number> {
  try {
    const usdAsset = await getAssetBySymbol('USD');
    if (usdAsset && usdAsset.price > 0) {
      return usdAsset.price;
    }
  } catch (error) {
    console.error("Failed to fetch USD/TRY rate:", error);
  }
  return 34.5; // Fallback rate
}

/**
 * Gets the current user from the database, creating one if it doesn't exist.
 */
async function getOrCreateUser() {
  let user = await prisma.user.findUnique({
    where: { id: DEMO_USER_ID },
    include: {
      portfolio: true,
    },
  });

  // Create demo user if not exists
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEMO_USER_ID,
        email: "demo@midas.app",
        name: "Demo User",
        balance: 100000, // 100k TL starting bonus
        favorites: ["BTC", "ETH", "AAPL"],
      },
      include: {
        portfolio: true,
      },
    });
  }

  return user;
}

/**
 * Execute a MARKET ORDER trade (BUY or SELL) for the given asset.
 * 
 * TRIPLE-CURRENCY LOGIC:
 * - BIST stocks & Currency: Deduct/Add TRY from user.balance
 * - US Stocks: Deduct/Add USD from portfolio['USD']
 * - Crypto: Deduct/Add USDT from portfolio['USDT']
 */
export async function executeTrade(
  symbol: string,
  quantity: number,
  type: "BUY" | "SELL"
): Promise<TradeResult> {
  try {
    // ============ INPUT VALIDATION ============
    if (!symbol || typeof symbol !== "string") {
      return { success: false, message: "Geçersiz sembol" };
    }
    
    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      return { success: false, message: "Geçersiz miktar. Miktar 0'dan büyük olmalıdır." };
    }

    // Round quantity to 4 decimal places to prevent precision issues
    quantity = Math.round(quantity * 10000) / 10000;

    // ============ FETCH SERVER-SIDE PRICE ============
    const asset = await getAssetBySymbol(symbol);
    if (!asset) {
      return { success: false, message: `${symbol} varlığı bulunamadı` };
    }

    const serverPrice = asset.price;
    const totalCost = serverPrice * quantity;
    
    // Determine funding source
    const fundingSource = getFundingSource(asset);

    // ============ GET USER ============
    const user = await prisma.user.findUnique({
      where: { id: DEMO_USER_ID },
      include: { portfolio: true },
    });

    if (!user) {
      return { success: false, message: "Kullanıcı bulunamadı" };
    }

    // Get portfolio balances for USD and USDT
    const usdItem = user.portfolio.find(p => p.symbol === 'USD');
    const usdtItem = user.portfolio.find(p => p.symbol === 'USDT');
    const usdBalance = usdItem?.quantity || 0;
    const usdtBalance = usdtItem?.quantity || 0;

    if (type === "BUY") {
      // ============ BUY VALIDATION ============
      let errorMessage = "";
      let isValid = true;

      if (fundingSource === 'TRY') {
        // Check TRY balance (user.balance)
        if (user.balance < totalCost) {
          isValid = false;
          errorMessage = `Yetersiz TL bakiyesi. Mevcut: ₺${user.balance.toFixed(2)}, Gerekli: ₺${totalCost.toFixed(2)}`;
        }
      } else if (fundingSource === 'USD') {
        // Check USD balance (portfolio)
        if (usdBalance < totalCost) {
          isValid = false;
          errorMessage = `Amerikan hisseleri için Dolar (USD) almalısınız. Mevcut: $${usdBalance.toFixed(2)}, Gerekli: $${totalCost.toFixed(2)}`;
        }
      } else if (fundingSource === 'USDT') {
        // Check USDT balance (portfolio)
        if (usdtBalance < totalCost) {
          isValid = false;
          errorMessage = `Kripto işlemi için Tether (USDT) almalısınız. Mevcut: ${usdtBalance.toFixed(2)} USDT, Gerekli: ${totalCost.toFixed(2)} USDT`;
        }
      }

      if (!isValid) {
        return { success: false, message: errorMessage };
      }

      // ============ BUY EXECUTION ============
      // Deduct from funding source
      if (fundingSource === 'TRY') {
        await prisma.user.update({
          where: { id: DEMO_USER_ID },
          data: { balance: { decrement: totalCost } },
        });
      } else if (fundingSource === 'USD') {
        // Deduct USD from portfolio
        await prisma.portfolioItem.update({
          where: { id: usdItem!.id },
          data: { quantity: { decrement: totalCost } },
        });
      } else if (fundingSource === 'USDT') {
        // Deduct USDT from portfolio
        await prisma.portfolioItem.update({
          where: { id: usdtItem!.id },
          data: { quantity: { decrement: totalCost } },
        });
      }

      // Add to portfolio (or update existing)
      const existingItem = user.portfolio.find((p) => p.symbol === symbol);
      if (existingItem) {
        const totalValue = existingItem.quantity * existingItem.avgCost + totalCost;
        const newQuantity = existingItem.quantity + quantity;
        const newAvgCost = totalValue / newQuantity;

        await prisma.portfolioItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            avgCost: newAvgCost,
          },
        });
      } else {
        await prisma.portfolioItem.create({
          data: {
            userId: DEMO_USER_ID,
            symbol,
            quantity,
            avgCost: serverPrice,
          },
        });
      }
    } else {
      // ============ SELL VALIDATION ============
      const existingItem = user.portfolio.find((p) => p.symbol === symbol);
      const ownedQuantity = existingItem?.quantity || 0;

      if (ownedQuantity < quantity) {
        return {
          success: false,
          message: `Yetersiz varlık. Sahip olduğunuz: ${ownedQuantity.toFixed(4)} ${symbol}, Satmak istediğiniz: ${quantity}`,
        };
      }

      // ============ SELL EXECUTION ============
      // Add proceeds to funding source
      if (fundingSource === 'TRY') {
        await prisma.user.update({
          where: { id: DEMO_USER_ID },
          data: { balance: { increment: totalCost } },
        });
      } else if (fundingSource === 'USD') {
        // Add USD to portfolio
        if (usdItem) {
          await prisma.portfolioItem.update({
            where: { id: usdItem.id },
            data: { quantity: { increment: totalCost } },
          });
        } else {
          await prisma.portfolioItem.create({
            data: {
              userId: DEMO_USER_ID,
              symbol: 'USD',
              quantity: totalCost,
              avgCost: 1,
            },
          });
        }
      } else if (fundingSource === 'USDT') {
        // Add USDT to portfolio
        if (usdtItem) {
          await prisma.portfolioItem.update({
            where: { id: usdtItem.id },
            data: { quantity: { increment: totalCost } },
          });
        } else {
          await prisma.portfolioItem.create({
            data: {
              userId: DEMO_USER_ID,
              symbol: 'USDT',
              quantity: totalCost,
              avgCost: 1,
            },
          });
        }
      }

      // Update portfolio (remove sold quantity)
      const newQuantity = existingItem!.quantity - quantity;

      if (newQuantity < 0.00001) {
        await prisma.portfolioItem.delete({
          where: { id: existingItem!.id },
        });
      } else {
        await prisma.portfolioItem.update({
          where: { id: existingItem!.id },
          data: { quantity: newQuantity },
        });
      }
    }

    // ============ CREATE TRANSACTION RECORD ============
    const transaction = await prisma.transaction.create({
      data: {
        userId: DEMO_USER_ID,
        type,
        symbol,
        quantity,
        price: serverPrice,
        total: totalCost,
      },
    });

    // ============ REVALIDATE CACHED PAGES ============
    revalidatePath("/");
    revalidatePath("/trade");
    revalidatePath("/wallet");

    // ============ RETURN SUCCESS ============
    const actionText = type === "BUY" ? "satın alındı" : "satıldı";
    const currencySymbol = asset.currency === 'TRY' ? '₺' : '$';
    const priceDisplay = asset.currency === 'TRY' 
      ? `₺${serverPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}` 
      : `$${serverPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    const totalDisplay = asset.currency === 'TRY'
      ? `₺${totalCost.toFixed(2)}`
      : `$${totalCost.toFixed(2)}`;
    
    // Add funding source info
    const fundingInfo = fundingSource === 'TRY' ? ' (TL bakiyesinden)' 
      : fundingSource === 'USD' ? ' (Dolar bakiyesinden)' 
      : ' (USDT bakiyesinden)';
    
    return {
      success: true,
      message: `${quantity} ${symbol} ${priceDisplay} fiyatından ${actionText}. Toplam: ${totalDisplay}${fundingInfo}`,
      transaction: {
        id: transaction.id,
        type: transaction.type as "BUY" | "SELL",
        symbol: transaction.symbol,
        quantity: transaction.quantity,
        price: transaction.price,
        total: transaction.total,
        date: transaction.date.toISOString(),
      },
    };
  } catch (error) {
    console.error("Trade execution error:", error);
    const message = error instanceof Error ? error.message : "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.";
    return { success: false, message };
  }
}
