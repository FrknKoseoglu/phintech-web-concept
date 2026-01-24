import { describe, it, expect } from "vitest";

/**
 * Helper function to calculate available balance based on quote currency
 * Extracted from TradePageClient.tsx for testing
 */
function calculateAvailableBalance(
  quoteCurrency: "TRY" | "USD" | "USDT",
  userBalance: number,
  portfolio: Array<{ symbol: string; quantity: number }>
): number {
  if (quoteCurrency === "TRY") {
    return userBalance;
  } else if (quoteCurrency === "USD") {
    const usdHolding = portfolio.find((p) => p.symbol === "USD");
    return usdHolding?.quantity || 0;
  } else if (quoteCurrency === "USDT") {
    const usdtHolding = portfolio.find((p) => p.symbol === "USDT");
    return usdtHolding?.quantity || 0;
  }

  return userBalance;
}

describe("Trade Currency Balance Logic", () => {
  describe("BUY Operations - Quote Currency Selection", () => {
    it("should use TRY balance for TRY-denominated assets (e.g., AAPL)", () => {
      const userBalance = 100000; // 100k TRY
      const portfolio = [
        { symbol: "USD", quantity: 1000 },
        { symbol: "USDT", quantity: 500 },
      ];

      const availableBalance = calculateAvailableBalance("TRY", userBalance, portfolio);

      expect(availableBalance).toBe(100000);
    });

    it("should use USD balance for USD-denominated assets", () => {
      const userBalance = 100000; // TRY (should be ignored)
      const portfolio = [
        { symbol: "USD", quantity: 1000 },
        { symbol: "USDT", quantity: 500 },
      ];

      const availableBalance = calculateAvailableBalance("USD", userBalance, portfolio);

      expect(availableBalance).toBe(1000);
    });

    it("should use USDT balance for USDT-denominated assets (e.g., BTC/USDT)", () => {
      const userBalance = 100000; // TRY (should be ignored)
      const portfolio = [
        { symbol: "USD", quantity: 1000 },
        { symbol: "USDT", quantity: 500 },
      ];

      const availableBalance = calculateAvailableBalance("USDT", userBalance, portfolio);

      expect(availableBalance).toBe(500);
    });

    it("should return 0 if USD holding does not exist", () => {
      const userBalance = 100000;
      const portfolio = [{ symbol: "USDT", quantity: 500 }]; // No USD

      const availableBalance = calculateAvailableBalance("USD", userBalance, portfolio);

      expect(availableBalance).toBe(0);
    });

    it("should return 0 if USDT holding does not exist", () => {
      const userBalance = 100000;
      const portfolio = [{ symbol: "USD", quantity: 1000 }]; // No USDT

      const availableBalance = calculateAvailableBalance("USDT", userBalance, portfolio);

      expect(availableBalance).toBe(0);
    });
  });

  describe("Trade Validation - Insufficient Balance", () => {
    it("should prevent BTC/USDT buy when USDT balance is 0", () => {
      const userBalance = 100000; // Has TRY
      const portfolio: Array<{ symbol: string; quantity: number }> = []; // No USDT

      const availableBalance = calculateAvailableBalance("USDT", userBalance, portfolio);
      const btcPrice = 50000;
      const quantityToBuy = 0.1; // 0.1 BTC
      const totalCost = btcPrice * quantityToBuy; // 5000 USDT

      expect(availableBalance).toBe(0);
      expect(totalCost > availableBalance).toBe(true); // Should fail
    });

    it("should allow AAPL buy when TRY balance is sufficient", () => {
      const userBalance = 10000; // 10k TRY
      const portfolio = [{ symbol: "USDT", quantity: 0 }];

      const availableBalance = calculateAvailableBalance("TRY", userBalance, portfolio);
      const aaplPrice = 150 * 34; // $150 * 34 TRY/USD = 5100 TRY
      const quantityToBuy = 1;
      const totalCost = aaplPrice * quantityToBuy;

      expect(availableBalance).toBe(10000);
      expect(totalCost <= availableBalance).toBe(true); // Should succeed
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty portfolio gracefully", () => {
      const userBalance = 100000;
      const portfolio: Array<{ symbol: string; quantity: number }> = [];

      const tryBalance = calculateAvailableBalance("TRY", userBalance, portfolio);
      const usdBalance = calculateAvailableBalance("USD", userBalance, portfolio);
      const usdtBalance = calculateAvailableBalance("USDT", userBalance, portfolio);

      expect(tryBalance).toBe(100000);
      expect(usdBalance).toBe(0);
      expect(usdtBalance).toBe(0);
    });

    it("should handle fractional currency amounts", () => {
      const userBalance = 100000;
      const portfolio = [
        { symbol: "USD", quantity: 999.99 },
        { symbol: "USDT", quantity: 0.01 },
      ];

      const usdBalance = calculateAvailableBalance("USD", userBalance, portfolio);
      const usdtBalance = calculateAvailableBalance("USDT", userBalance, portfolio);

      expect(usdBalance).toBe(999.99);
      expect(usdtBalance).toBe(0.01);
    });
  });
});
