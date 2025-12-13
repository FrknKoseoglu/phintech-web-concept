"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

// Default user ID for demo (in production, get from session)
const DEMO_USER_ID = "demo_user_001";

/**
 * Toggle a symbol in user's favorites list.
 */
export async function toggleFavorite(symbol: string): Promise<{ success: boolean; isFavorite: boolean }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: DEMO_USER_ID },
      select: { favorites: true },
    });

    if (!user) {
      return { success: false, isFavorite: false };
    }

    const currentFavorites = user.favorites || [];
    const index = currentFavorites.indexOf(symbol);
    const isFavorite = index === -1;

    let newFavorites: string[];
    if (isFavorite) {
      // Add to favorites
      newFavorites = [...currentFavorites, symbol];
    } else {
      // Remove from favorites
      newFavorites = currentFavorites.filter((s: string) => s !== symbol);
    }

    await prisma.user.update({
      where: { id: DEMO_USER_ID },
      data: { favorites: newFavorites },
    });
    
    // Revalidate pages
    revalidatePath("/trade");
    revalidatePath("/");

    return { success: true, isFavorite };
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    return { success: false, isFavorite: false };
  }
}

/**
 * Check if a symbol is in favorites.
 */
export async function isFavorite(symbol: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: DEMO_USER_ID },
    select: { favorites: true },
  });
  return user?.favorites?.includes(symbol) || false;
}

/**
 * Get all favorite symbols.
 */
export async function getFavorites(): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: DEMO_USER_ID },
    select: { favorites: true },
  });
  return user?.favorites || [];
}
