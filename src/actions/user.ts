"use server";

import { revalidatePath } from "next/cache";
import { getUser, updateUser } from "@/lib/db";

/**
 * Toggle a symbol in user's favorites list.
 */
export async function toggleFavorite(symbol: string): Promise<{ success: boolean; isFavorite: boolean }> {
  try {
    const user = await getUser();
    
    // Ensure favorites array exists
    if (!user.favorites) {
      user.favorites = [];
    }

    const index = user.favorites.indexOf(symbol);
    const isFavorite = index === -1;

    if (isFavorite) {
      // Add to favorites
      user.favorites.push(symbol);
    } else {
      // Remove from favorites
      user.favorites.splice(index, 1);
    }

    await updateUser(user);
    
    // Revalidate trade page
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
  const user = await getUser();
  return user.favorites?.includes(symbol) || false;
}

/**
 * Get all favorite symbols.
 */
export async function getFavorites(): Promise<string[]> {
  const user = await getUser();
  return user.favorites || [];
}
