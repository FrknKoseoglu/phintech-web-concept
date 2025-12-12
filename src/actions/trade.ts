"use server";

import { revalidatePath } from "next/cache";
import { getAssetBySymbol } from "@/lib/market";
import { getUser, readDb, writeDb } from "@/lib/db";
import type { Transaction, TradeResult } from "@/types";

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
    const asset = getAssetBySymbol(symbol);
    if (!asset) {
      return { success: false, message: `${symbol} varlığı bulunamadı` };
    }

    const serverPrice = asset.price;
    const totalCost = serverPrice * quantity;

    // ============ FETCH USER DATA ============
    const user = await getUser();

    // ============ EXECUTE TRADE ============
    if (type === "BUY") {
      // -------- BUY VALIDATION --------
      if (user.balance < totalCost) {
        const maxQuantity = Math.floor((user.balance / serverPrice) * 10000) / 10000;
        return {
          success: false,
          message: `Yetersiz bakiye. Mevcut: $${user.balance.toFixed(2)}, Gerekli: $${totalCost.toFixed(2)}. Maksimum alabileceğiniz: ${maxQuantity} ${symbol}`,
        };
      }

      // -------- BUY EXECUTION --------
      // Deduct balance
      user.balance = Math.round((user.balance - totalCost) * 100) / 100;

      // Update portfolio
      const existingItem = user.portfolio.find((p) => p.symbol === symbol);
      if (existingItem) {
        // Calculate new weighted average cost
        const totalValue = existingItem.quantity * existingItem.avgCost + totalCost;
        const newQuantity = existingItem.quantity + quantity;
        existingItem.avgCost = totalValue / newQuantity;
        existingItem.quantity = newQuantity;
      } else {
        // Add new portfolio item
        user.portfolio.push({
          symbol,
          quantity,
          avgCost: serverPrice,
        });
      }
    } else {
      // -------- SELL VALIDATION --------
      const existingItem = user.portfolio.find((p) => p.symbol === symbol);
      const ownedQuantity = existingItem?.quantity || 0;

      if (ownedQuantity < quantity) {
        return {
          success: false,
          message: `Yetersiz varlık. Sahip olduğunuz: ${ownedQuantity.toFixed(4)} ${symbol}, Satmak istediğiniz: ${quantity}`,
        };
      }

      // -------- SELL EXECUTION --------
      // Add to balance
      user.balance = Math.round((user.balance + totalCost) * 100) / 100;

      // Update portfolio
      existingItem!.quantity -= quantity;

      // Remove from portfolio if quantity becomes zero (or near zero due to floating point)
      if (existingItem!.quantity < 0.00001) {
        user.portfolio = user.portfolio.filter((p) => p.symbol !== symbol);
      }
    }

    // ============ CREATE TRANSACTION RECORD ============
    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      type,
      symbol,
      quantity,
      price: serverPrice,
      total: totalCost,
      date: new Date().toISOString(),
    };

    // ============ PERSIST TO DATABASE ============
    const db = await readDb();
    db.user = user;

    // Ensure transactions array exists
    if (!db.transactions) {
      db.transactions = [];
    }
    
    // Add transaction to beginning (most recent first)
    db.transactions.unshift(transaction);

    // Keep only last 100 transactions
    if (db.transactions.length > 100) {
      db.transactions = db.transactions.slice(0, 100);
    }

    await writeDb(db);

    // ============ REVALIDATE CACHED PAGES ============
    revalidatePath("/");
    revalidatePath("/trade");
    revalidatePath("/wallet");

    // ============ RETURN SUCCESS ============
    const actionText = type === "BUY" ? "satın alındı" : "satıldı";
    return {
      success: true,
      message: `${quantity} ${symbol} $${serverPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })} fiyatından ${actionText}. Toplam: $${totalCost.toFixed(2)}`,
      transaction,
    };
  } catch (error) {
    console.error("Trade execution error:", error);
    return {
      success: false,
      message: "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}
