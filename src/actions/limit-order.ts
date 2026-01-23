"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getAssetBySymbol } from "@/lib/market";
import type { LimitOrder } from "@/types";

// Default user ID for demo (in production, get from session)
const DEMO_USER_ID = "demo_user_001";

/**
 * Result of a limit order operation.
 */
interface LimitOrderResult {
  success: boolean;
  message: string;
  order?: LimitOrder;
}

/**
 * Create a new limit order.
 * Note: Funds are NOT locked at creation time (soft limit).
 * Funds will be checked at execution time by the cron job.
 */
export async function createLimitOrder(data: {
  symbol: string;
  quantity?: number;
  amount?: number;
  targetPrice: number;
  type: "BUY" | "SELL";
}): Promise<LimitOrderResult> {
  try {
    const { symbol, quantity, amount, targetPrice, type } = data;

    // ============ INPUT VALIDATION ============
    if (!symbol || typeof symbol !== "string") {
      return { success: false, message: "Geçersiz sembol" };
    }

    if (!quantity && !amount) {
      return { success: false, message: "Miktar veya tutar belirtmelisiniz" };
    }

    if (quantity && quantity <= 0) {
      return { success: false, message: "Miktar 0'dan büyük olmalıdır" };
    }

    if (amount && amount <= 0) {
      return { success: false, message: "Tutar 0'dan büyük olmalıdır" };
    }

    if (!targetPrice || targetPrice <= 0) {
      return { success: false, message: "Hedef fiyat 0'dan büyük olmalıdır" };
    }

    if (type !== "BUY" && type !== "SELL") {
      return { success: false, message: "Geçersiz işlem tipi" };
    }

    // ============ VERIFY ASSET EXISTS ============
    const asset = await getAssetBySymbol(symbol);
    if (!asset) {
      return { success: false, message: `${symbol} varlığı bulunamadı` };
    }

    // ============ CREATE LIMIT ORDER ============
    const order = await prisma.limitOrder.create({
      data: {
        userId: DEMO_USER_ID,
        symbol: symbol.toUpperCase(),
        quantity: quantity || null,
        amount: amount || null,
        targetPrice,
        type,
        status: "PENDING",
      },
    });

    // Revalidate pages
    revalidatePath("/");
    revalidatePath("/trade");

    const actionText = type === "BUY" ? "alım" : "satım";
    const priceDisplay = asset.currency === 'TRY' 
      ? `₺${targetPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}` 
      : `$${targetPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

    return {
      success: true,
      message: `${symbol} ${actionText} talimatı oluşturuldu. Hedef fiyat: ${priceDisplay}`,
      order: {
        id: order.id,
        userId: order.userId,
        symbol: order.symbol,
        quantity: order.quantity || undefined,
        amount: order.amount || undefined,
        targetPrice: order.targetPrice,
        type: order.type as "BUY" | "SELL",
        status: order.status as "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED",
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Create limit order error:", error);
    const message = error instanceof Error ? error.message : "Talimat oluşturulurken bir hata oluştu";
    return { success: false, message };
  }
}

/**
 * Cancel a pending limit order.
 */
export async function cancelLimitOrder(orderId: string): Promise<LimitOrderResult> {
  try {
    if (!orderId) {
      return { success: false, message: "Geçersiz talimat ID" };
    }

    // Find the order
    const order = await prisma.limitOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, message: "Talimat bulunamadı" };
    }

    // Verify ownership (in demo mode, all orders belong to DEMO_USER_ID)
    if (order.userId !== DEMO_USER_ID) {
      return { success: false, message: "Bu talimatı iptal etme yetkiniz yok" };
    }

    // Can only cancel PENDING orders
    if (order.status !== "PENDING") {
      return { success: false, message: `Bu talimat zaten ${order.status === "COMPLETED" ? "tamamlandı" : order.status === "CANCELLED" ? "iptal edildi" : "başarısız oldu"}` };
    }

    // Update status to CANCELLED
    const updatedOrder = await prisma.limitOrder.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    // Revalidate pages
    revalidatePath("/");
    revalidatePath("/trade");

    return {
      success: true,
      message: `${order.symbol} talimatı iptal edildi`,
      order: {
        id: updatedOrder.id,
        userId: updatedOrder.userId,
        symbol: updatedOrder.symbol,
        quantity: updatedOrder.quantity || undefined,
        amount: updatedOrder.amount || undefined,
        targetPrice: updatedOrder.targetPrice,
        type: updatedOrder.type as "BUY" | "SELL",
        status: updatedOrder.status as "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED",
        createdAt: updatedOrder.createdAt.toISOString(),
        updatedAt: updatedOrder.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Cancel limit order error:", error);
    const message = error instanceof Error ? error.message : "Talimat iptal edilirken bir hata oluştu";
    return { success: false, message };
  }
}

/**
 * Get all limit orders for the current user.
 */
export async function getUserLimitOrders(): Promise<LimitOrder[]> {
  try {
    const orders = await prisma.limitOrder.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      symbol: order.symbol,
      quantity: order.quantity || undefined,
      amount: order.amount || undefined,
      targetPrice: order.targetPrice,
      type: order.type as "BUY" | "SELL",
      status: order.status as "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED",
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Get user limit orders error:", error);
    return [];
  }
}

/**
 * Get pending limit orders count for the current user.
 */
export async function getPendingOrdersCount(): Promise<number> {
  try {
    const count = await prisma.limitOrder.count({
      where: {
        userId: DEMO_USER_ID,
        status: "PENDING",
      },
    });
    return count;
  } catch (error) {
    console.error("Get pending orders count error:", error);
    return 0;
  }
}
