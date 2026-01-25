"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Toggle a symbol in user's favorites list.
 */
export async function toggleFavorite(symbol: string): Promise<{ success: boolean; isFavorite: boolean }> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { success: false, isFavorite: false };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
      where: { id: session.user.id },
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
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { favorites: true },
  });
  return user?.favorites?.includes(symbol) || false;
}

/**
 * Get all favorite symbols.
 */
export async function getFavorites(): Promise<string[]> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { favorites: true },
  });
  return user?.favorites || [];
}
