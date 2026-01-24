"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Refill user balance with demo funds
 * Only works if balance < 10,000 TL
 * Adds 90,000 TL and creates transaction record
 */
export async function refillBalance() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "Oturum açmanız gerekiyor" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get current user balance
      const user = await tx.user.findUnique({
        where: { email: session.user!.email! },
        select: { id: true, balance: true },
      });

      if (!user) {
        throw new Error("Kullanıcı bulunamadı");
      }

      const currentBalance = user.balance;
      const threshold = 10000;
      const refillAmount = 90000;

      // Check if eligible for refill
      if (currentBalance >= threshold) {
        throw new Error("Bakiye yeterli, ekleme yapılamaz (minimum: 10.000 TL altı)");
      }

      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          balance: currentBalance + refillAmount,
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "DEPOSIT",
          symbol: "TRY",
          quantity: refillAmount,
          price: 1,
          total: refillAmount,
          date: new Date(),
        },
      });

      return {
        newBalance: updatedUser.balance,
        refillAmount: refillAmount,
      };
    });

    revalidatePath("/wallet");

    return {
      success: true,
      newBalance: result.newBalance,
      refillAmount: result.refillAmount,
    };
  } catch (error: any) {
    return {
      error: error.message || "Bir hata oluştu",
    };
  }
}
