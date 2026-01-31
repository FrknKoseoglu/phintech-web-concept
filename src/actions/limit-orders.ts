"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAssetBySymbol } from "@/lib/market";
import prisma from "@/lib/prisma";
import { executeSystemTrade } from "./trade";
import type { LimitOrderResult } from "@/types";

/**
 * Create a new limit order
 * @param symbol Asset symbol (e.g., 'BTC', 'AAPL', 'TSLA')
 * @param quantity Quantity to buy/sell
 * @param targetPrice Price at which order should execute
 * @param type 'BUY' or 'SELL'
 */
export async function createLimitOrder(
  symbol: string,
  quantity: number,
  targetPrice: number,
  type: "BUY" | "SELL"
): Promise<LimitOrderResult> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { success: false, message: "Lütfen giriş yapın" };
  }

  try {
    // Validate inputs
    if (!symbol || typeof symbol !== "string") {
      return { success: false, message: "Geçersiz sembol" };
    }
    
    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      return { success: false, message: "Geçersiz miktar. Miktar 0'dan büyük olmalıdır." };
    }

    if (!targetPrice || typeof targetPrice !== "number" || targetPrice <= 0) {
      return { success: false, message: "Geçersiz hedef fiyat. Fiyat 0'dan büyük olmalıdır." };
    }

    // Round values to prevent precision issues
    quantity = Math.round(quantity * 10000) / 10000;
    targetPrice = Math.round(targetPrice * 100) / 100;

    // Fetch asset information
    const asset = await getAssetBySymbol(symbol);
    if (!asset) {
      return { success: false, message: `${symbol} varlığı bulunamadı` };
    }

    // Get user with portfolio
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { portfolio: true },
    });

    if (!user) {
      return { success: false, message: "Kullanıcı bulunamadı" };
    }

    const totalCost = targetPrice * quantity;

    if (type === "BUY") {
      // For BUY orders, check if user has sufficient balance
      // Note: This is a simplified check. In production, you might want to reserve the balance
      if (asset.currency === 'TRY') {
        if (user.balance < totalCost) {
          return { 
            success: false, 
            message: `Yetersiz bakiye. Gerekli: ₺${totalCost.toFixed(2)}, Mevcut: ₺${user.balance.toFixed(2)}` 
          };
        }
      } else {
        // For USD/USDT assets, check portfolio balance
        const currencySymbol = asset.category === 'crypto' ? 'USDT' : 'USD';
        const currencyItem = user.portfolio.find(p => p.symbol === currencySymbol);
        const currencyBalance = currencyItem?.quantity || 0;
        
        if (currencyBalance < totalCost) {
          return { 
            success: false, 
            message: `Yetersiz ${currencySymbol} bakiyesi. Gerekli: ${totalCost.toFixed(2)}, Mevcut: ${currencyBalance.toFixed(2)}` 
          };
        }
      }
    } else {
      // For SELL orders, check if user has sufficient quantity
      const portfolioItem = user.portfolio.find(p => p.symbol === symbol);
      const ownedQuantity = portfolioItem?.quantity || 0;

      if (ownedQuantity < quantity) {
        return { 
          success: false, 
          message: `Yetersiz varlık. Sahip olduğunuz: ${ownedQuantity.toFixed(4)} ${symbol}, Satmak istediğiniz: ${quantity}` 
        };
      }
    }

    // Create limit order
    const limitOrder = await prisma.limitOrder.create({
      data: {
        userId: session.user.id,
        symbol,
        quantity,
        targetPrice,
        type,
        status: "PENDING",
      },
    });

    revalidatePath("/trade");

    const actionText = type === "BUY" ? "alım" : "satım";
    const priceDisplay = asset.currency === 'TRY' 
      ? `₺${targetPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}` 
      : `$${targetPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

    return {
      success: true,
      message: `Limit ${actionText} emri oluşturuldu. ${quantity} ${symbol} @ ${priceDisplay}`,
      order: {
        id: limitOrder.id,
        userId: limitOrder.userId,
        symbol: limitOrder.symbol,
        quantity: limitOrder.quantity ?? undefined,
        amount: limitOrder.amount ?? undefined,
        targetPrice: limitOrder.targetPrice,
        type: limitOrder.type as "BUY" | "SELL",
        status: limitOrder.status as "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED",
        createdAt: limitOrder.createdAt.toISOString(),
        updatedAt: limitOrder.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Limit order creation error:", error);
    const message = error instanceof Error ? error.message : "Emir oluşturulurken bir hata oluştu.";
    return { success: false, message };
  }
}

/**
 * Cancel a pending limit order
 * @param orderId ID of the order to cancel
 */
export async function cancelLimitOrder(orderId: string): Promise<LimitOrderResult> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { success: false, message: "Lütfen giriş yapın" };
  }

  try {
    // Find the order
    const order = await prisma.limitOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, message: "Emir bulunamadı" };
    }

    // Verify ownership
    if (order.userId !== session.user.id) {
      return { success: false, message: "Bu emri iptal etme yetkiniz yok" };
    }

    // Check if order can be cancelled
    if (order.status !== "PENDING") {
      return { success: false, message: "Sadece bekleyen emirler iptal edilebilir" };
    }

    // Update order status
    const updatedOrder = await prisma.limitOrder.update({
      where: { id: orderId },
      data: { 
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/trade");

    return {
      success: true,
      message: "Emir başarıyla iptal edildi",
      order: {
        id: updatedOrder.id,
        userId: updatedOrder.userId,
        symbol: updatedOrder.symbol,
        quantity: updatedOrder.quantity ?? undefined,
        amount: updatedOrder.amount ?? undefined,
        targetPrice: updatedOrder.targetPrice,
        type: updatedOrder.type as "BUY" | "SELL",
        status: updatedOrder.status as "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED",
        createdAt: updatedOrder.createdAt.toISOString(),
        updatedAt: updatedOrder.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Limit order cancellation error:", error);
    const message = error instanceof Error ? error.message : "Emir iptal edilirken bir hata oluştu.";
    return { success: false, message };
  }
}

/**
 * Get user's limit orders
 * @param status Optional filter by status
 */
export async function getLimitOrders(
  status?: "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED"
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { success: false, message: "Lütfen giriş yapın", orders: [] };
  }

  try {
    const where: any = { userId: session.user.id };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.limitOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Fetch asset details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const asset = await getAssetBySymbol(order.symbol);
        return {
          id: order.id,
          userId: order.userId,
          symbol: order.symbol,
          quantity: order.quantity ?? undefined,
          amount: order.amount ?? undefined,
          targetPrice: order.targetPrice,
          type: order.type as "BUY" | "SELL",
          status: order.status as "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED",
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
          currentPrice: asset?.price || 0,
          currency: asset?.currency || 'USD',
        };
      })
    );

    return {
      success: true,
      orders: ordersWithDetails,
    };
  } catch (error) {
    console.error("Get limit orders error:", error);
    return { 
      success: false, 
      message: "Emirler getirilirken bir hata oluştu",
      orders: [] 
    };
  }
}

/**
 * Check and execute eligible limit orders
 * This function should be called periodically (e.g., via cron job)
 * For demo purposes, it can be manually triggered
 */
export async function checkAndExecuteLimitOrders() {
  try {
    // Get all pending orders
    const pendingOrders = await prisma.limitOrder.findMany({
      where: { status: "PENDING" },
      include: { user: true },
    });

    let executedCount = 0;
    let failedCount = 0;

    for (const order of pendingOrders) {
      try {
        // Get current market price
        const asset = await getAssetBySymbol(order.symbol);
        if (!asset) {
          console.warn(`Asset not found for order ${order.id}: ${order.symbol}`);
          continue;
        }

        const currentPrice = asset.price;
        let shouldExecute = false;

        // Check if order should be executed
        if (order.type === "BUY" && currentPrice <= order.targetPrice) {
          shouldExecute = true;
        } else if (order.type === "SELL" && currentPrice >= order.targetPrice) {
          shouldExecute = true;
        }

        if (shouldExecute && order.quantity) {
          // Execute the trade
          const tradeResult = await executeSystemTrade(
            order.userId,
            order.symbol,
            order.quantity,
            order.type as "BUY" | "SELL"
          );

          if (tradeResult.success) {
            // Update order status to COMPLETED
            await prisma.limitOrder.update({
              where: { id: order.id },
              data: { 
                status: "COMPLETED",
                updatedAt: new Date(),
              },
            });

            // Create notification
            await prisma.notification.create({
              data: {
                userId: order.userId,
                title: "Limit Emir Gerçekleşti",
                message: `${order.quantity} ${order.symbol} ${order.type === 'BUY' ? 'satın alındı' : 'satıldı'}. Fiyat: ${currentPrice}`,
              },
            });

            executedCount++;
          } else {
            // Mark as failed
            await prisma.limitOrder.update({
              where: { id: order.id },
              data: { 
                status: "FAILED",
                updatedAt: new Date(),
              },
            });
            failedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error);
        failedCount++;
      }
    }

    revalidatePath("/trade");

    return {
      success: true,
      message: `İşlem tamamlandı. ${executedCount} emir gerçekleştirildi, ${failedCount} emir başarısız`,
      executedCount,
      failedCount,
    };
  } catch (error) {
    console.error("Check and execute limit orders error:", error);
    return {
      success: false,
      message: "Emirler kontrol edilirken bir hata oluştu",
      executedCount: 0,
      failedCount: 0,
    };
  }
}
