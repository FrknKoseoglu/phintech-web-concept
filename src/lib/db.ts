// ============================================
// Midas Web Interface - File System Database Driver
// ============================================

import { promises as fs } from "fs";
import path from "path";
import type { DbSchema, User, Asset } from "@/types";
import { SEED_ASSETS } from "./market";

const DB_PATH = path.join(process.cwd(), "db.json");

/**
 * Default user with $10,000 starting balance.
 */
const DEFAULT_USER: User = {
  id: "user_001",
  balance: 10000,
  portfolio: [],
};

/**
 * Default database schema.
 */
const DEFAULT_DB: DbSchema = {
  user: DEFAULT_USER,
  market: SEED_ASSETS,
};

/**
 * Reads and parses the database file.
 * Initializes with default data if file doesn't exist.
 */
export async function readDb(): Promise<DbSchema> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data) as DbSchema;
  } catch (error) {
    // If file doesn't exist, initialize it
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeDb(DEFAULT_DB);
      return DEFAULT_DB;
    }
    throw error;
  }
}

/**
 * Writes data to the database file.
 */
export async function writeDb(data: DbSchema): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Gets the current user from the database.
 */
export async function getUser(): Promise<User> {
  const db = await readDb();
  return db.user;
}

/**
 * Updates the user in the database.
 */
export async function updateUser(user: User): Promise<void> {
  const db = await readDb();
  db.user = user;
  await writeDb(db);
}

/**
 * Resets the database to default state.
 */
export async function resetDb(): Promise<void> {
  await writeDb(DEFAULT_DB);
}
