import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMarketData } from "@/lib/market";
import { executeSystemTrade } from "@/actions/trade";

/**
 * Cron API Route: Process Pending Limit Orders
 * 
 * This endpoint should be called externally (e.g., Vercel Cron, Railway, etc.)
 * every 1-5 minutes to process pending limit orders.
 * 
 * Security: Requires CRON_SECRET header for authentication.
 * 
 * Logic:
 * 1. Fetch all PENDING limit orders
 * 2. Group orders by symbol to minimize API calls
 * 3. Fetch current prices for unique symbols
 * 4. Execute trades when conditions are met:
 *    - BUY: CurrentPrice <= TargetPrice (buy low)
 *    - SELL: CurrentPrice >= TargetPrice (sell high)
 * 5. Update order status (COMPLETED/FAILED)
 */

interface ProcessResult {
  processed: number;
  completed: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export async function GET(request: Request) {
  const startTime = Date.now();
  
  // ============ SECURITY CHECK ============
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET environment variable is not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // Check for Bearer token format
  const expectedHeader = `Bearer ${cronSecret}`;
  if (authHeader !== expectedHeader) {
    console.warn("Unauthorized cron access attempt");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ============ FETCH PENDING ORDERS ============
  const result: ProcessResult = {
    processed: 0,
    completed: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const pendingOrders = await prisma.limitOrder.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" }, // Process oldest first
    });

    if (pendingOrders.length === 0) {
      return NextResponse.json({
        message: "No pending orders to process",
        ...result,
        executionTime: Date.now() - startTime,
      });
    }

    // ============ GET DISTINCT SYMBOLS ============
    const uniqueSymbols = [...new Set(pendingOrders.map(o => o.symbol))];
    
    // ============ BATCH FETCH PRICES ============
    const marketData = await getMarketData();
    const priceMap = new Map<string, number>();
    
    for (const asset of marketData) {
      if (uniqueSymbols.includes(asset.symbol)) {
        priceMap.set(asset.symbol, asset.price);
      }
    }

    // ============ PROCESS EACH ORDER ============
    for (const order of pendingOrders) {
      result.processed++;

      const currentPrice = priceMap.get(order.symbol);
      
      if (!currentPrice) {
        result.skipped++;
        result.errors.push(`Price not found for ${order.symbol}`);
        continue;
      }

      // Check if conditions are met
      const shouldExecute = order.type === "BUY"
        ? currentPrice <= order.targetPrice  // BUY when price drops to target
        : currentPrice >= order.targetPrice; // SELL when price rises to target

      if (!shouldExecute) {
        result.skipped++;
        continue;
      }

      // Calculate quantity if only amount was specified
      let quantity = order.quantity;
      if (!quantity && order.amount) {
        quantity = order.amount / currentPrice;
      }

      if (!quantity || quantity <= 0) {
        result.failed++;
        await prisma.limitOrder.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });
        result.errors.push(`Invalid quantity for order ${order.id}`);
        continue;
      }

      // ============ EXECUTE TRADE ============
      try {
        const tradeResult = await executeSystemTrade(
          order.userId,
          order.symbol,
          quantity,
          order.type as "BUY" | "SELL"
        );

        if (tradeResult.success) {
          // Update order status to COMPLETED
          await prisma.limitOrder.update({
            where: { id: order.id },
            data: { status: "COMPLETED" },
          });
          result.completed++;
          console.log(`✅ Order ${order.id} completed: ${order.type} ${quantity} ${order.symbol}`);
        } else {
          // Update order status to FAILED
          await prisma.limitOrder.update({
            where: { id: order.id },
            data: { status: "FAILED" },
          });
          result.failed++;
          result.errors.push(`Order ${order.id}: ${tradeResult.message}`);
          console.log(`❌ Order ${order.id} failed: ${tradeResult.message}`);
        }
      } catch (tradeError) {
        // Update order status to FAILED
        await prisma.limitOrder.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });
        result.failed++;
        const errorMsg = tradeError instanceof Error ? tradeError.message : "Unknown error";
        result.errors.push(`Order ${order.id}: ${errorMsg}`);
        console.error(`❌ Order ${order.id} exception:`, tradeError);
      }
    }

    // ============ RETURN SUMMARY ============
    return NextResponse.json({
      message: "Cron job completed",
      ...result,
      executionTime: Date.now() - startTime,
    });

  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        ...result,
        executionTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: Request) {
  return GET(request);
}
