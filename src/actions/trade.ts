"use server";

import { revalidatePath } from "next/cache";
import { getAssetBySymbol } from "@/lib/market";
import prisma from "@/lib/prisma";
import type { TradeResult } from "@/types";

// Default user ID for demo (in production, get from session)
const DEMO_USER_ID = "demo_user_001";

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
        balance: 100000, // $100k starting bonus
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
 * SECURITY: Price is fetched server-side to prevent client manipulation.
 * Client only provides symbol and quantity.
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
    // CRITICAL: We fetch the price ourselves, never trust client
    const asset = await getAssetBySymbol(symbol);
    if (!asset) {
      return { success: false, message: `${symbol} varlığı bulunamadı` };
    }

    const serverPrice = asset.price;
    const totalCost = serverPrice * quantity;

    // ============ EXECUTE TRADE IN TRANSACTION ============
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // Get user
      const user = await tx.user.findUnique({
        where: { id: DEMO_USER_ID },
        include: { portfolio: true },
      });

      if (!user) {
        throw new Error("Kullanıcı bulunamadı");
      }

      if (type === "BUY") {
        // -------- BUY VALIDATION --------
        if (user.balance < totalCost) {
          const maxQuantity = Math.floor((user.balance / serverPrice) * 10000) / 10000;
          throw new Error(
            `Yetersiz bakiye. Mevcut: $${user.balance.toFixed(2)}, Gerekli: $${totalCost.toFixed(2)}. Maksimum alabileceğiniz: ${maxQuantity} ${symbol}`
          );
        }

        // -------- BUY EXECUTION --------
        // Deduct balance
        await tx.user.update({
          where: { id: DEMO_USER_ID },
          data: { balance: { decrement: totalCost } },
        });

        // Upsert portfolio item
        const existingItem = user.portfolio.find((p: { symbol: string }) => p.symbol === symbol);
        if (existingItem) {
          // Calculate new weighted average cost
          const totalValue = existingItem.quantity * existingItem.avgCost + totalCost;
          const newQuantity = existingItem.quantity + quantity;
          const newAvgCost = totalValue / newQuantity;

          await tx.portfolioItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: newQuantity,
              avgCost: newAvgCost,
            },
          });
        } else {
          await tx.portfolioItem.create({
            data: {
              userId: DEMO_USER_ID,
              symbol,
              quantity,
              avgCost: serverPrice,
            },
          });
        }
      } else {
        // -------- SELL VALIDATION --------
        const existingItem = user.portfolio.find((p: { symbol: string }) => p.symbol === symbol);
        const ownedQuantity = existingItem?.quantity || 0;

        if (ownedQuantity < quantity) {
          throw new Error(
            `Yetersiz varlık. Sahip olduğunuz: ${ownedQuantity.toFixed(4)} ${symbol}, Satmak istediğiniz: ${quantity}`
          );
        }

        // -------- SELL EXECUTION --------
        // Add to balance
        await tx.user.update({
          where: { id: DEMO_USER_ID },
          data: { balance: { increment: totalCost } },
        });

        // Update portfolio
        const newQuantity = existingItem!.quantity - quantity;

        if (newQuantity < 0.00001) {
          // Remove from portfolio
          await tx.portfolioItem.delete({
            where: { id: existingItem!.id },
          });
        } else {
          await tx.portfolioItem.update({
            where: { id: existingItem!.id },
            data: { quantity: newQuantity },
          });
        }
      }

      // ============ CREATE TRANSACTION RECORD ============
      const transaction = await tx.transaction.create({
        data: {
          userId: DEMO_USER_ID,
          type,
          symbol,
          quantity,
          price: serverPrice,
          total: totalCost,
        },
      });

      return transaction;
    });

    // ============ REVALIDATE CACHED PAGES ============
    revalidatePath("/");
    revalidatePath("/trade");
    revalidatePath("/wallet");

    // ============ RETURN SUCCESS ============
    const actionText = type === "BUY" ? "satın alındı" : "satıldı";
    return {
      success: true,
      message: `${quantity} ${symbol} $${serverPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })} fiyatından ${actionText}. Toplam: $${totalCost.toFixed(2)}`,
      transaction: {
        id: result.id,
        type: result.type as "BUY" | "SELL",
        symbol: result.symbol,
        quantity: result.quantity,
        price: result.price,
        total: result.total,
        date: result.date.toISOString(),
      },
    };
  } catch (error) {
    console.error("Trade execution error:", error);
    const message = error instanceof Error ? error.message : "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.";
    return { success: false, message };
  }
}
