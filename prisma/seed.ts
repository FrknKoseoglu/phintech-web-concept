import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user with $100k starting balance
  const user = await prisma.user.upsert({
    where: { id: "demo_user_001" },
    update: {},
    create: {
      id: "demo_user_001",
      email: "demo@midas.app",
      name: "Demo User",
      balance: 100000,
      favorites: ["BTC", "ETH", "AAPL"],
    },
  });

  console.log("✅ Created demo user:", user.email);
  console.log("💰 Balance: $" + user.balance.toLocaleString());
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
