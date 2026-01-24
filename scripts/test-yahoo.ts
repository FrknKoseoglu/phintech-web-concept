
import YahooFinance from 'yahoo-finance2';

async function testConnection() {
  console.log("📡 Testing Yahoo Finance Connection...");
  const yahooFinance = new YahooFinance();
  try {
    const quote = await yahooFinance.quote('AAPL');
    console.log("✅ Connection Successful!");
    console.log(`📈 AAPL Price: $${quote.regularMarketPrice}`);
    console.log("ℹ️  IP Status: Clean (Not Rate Limited)");
  } catch (error: any) {
    console.log("❌ Connection Failed");
    if (error?.message?.includes('429')) {
      console.log("⚠️  STATUS: 429 Too Many Requests");
      console.log("ℹ️  Meaning: Your IP is temporarily rate limited.");
    } else {
      console.log("⚠️  Error:", error.message);
    }
  }
}

testConnection();
