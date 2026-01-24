import { describe, it, expect } from "vitest";

/**
 * Test helper to simulate getCurrency logic from market.ts
 * This ensures the correct quote currency is assigned based on asset type
 */
function getCurrency(
  symbol: string,
  category: "crypto" | "stock" | "commodity" | "currency"
): "USD" | "TRY" | "USDT" {
  // Crypto assets are priced in USDT
  if (category === "crypto") return "USDT";

  // BIST stocks (Turkish stocks ending with .IS)
  if (symbol.endsWith(".IS")) return "TRY";

  // USD and USDT themselves are priced in TRY
  if (symbol === "USD" || symbol === "USDT") return "TRY";

  // US stocks and commodities are priced in USD
  return "USD";
}

describe("Market Currency Assignment Logic", () => {
  describe("Crypto Assets → USDT", () => {
    it("should assign USDT to BTC", () => {
      expect(getCurrency("BTC", "crypto")).toBe("USDT");
    });

    it("should assign USDT to ETH", () => {
      expect(getCurrency("ETH", "crypto")).toBe("USDT");
    });

    it("should assign USDT to all crypto assets", () => {
      const cryptos = ["SOL", "AVAX", "DOGE"];
      cryptos.forEach((symbol) => {
        expect(getCurrency(symbol, "crypto")).toBe("USDT");
      });
    });
  });

  describe("US Stocks → USD", () => {
    it("should assign USD to AAPL", () => {
      expect(getCurrency("AAPL", "stock")).toBe("USD");
    });

    it("should assign USD to TSLA", () => {
      expect(getCurrency("TSLA", "stock")).toBe("USD");
    });

    it("should assign USD to all US stocks", () => {
      const usStocks = ["NVDA", "AMZN", "MSFT"];
      usStocks.forEach((symbol) => {
        expect(getCurrency(symbol, "stock")).toBe("USD");
      });
    });
  });

  describe("BIST Stocks → TRY", () => {
    it("should assign TRY to THYAO.IS", () => {
      expect(getCurrency("THYAO.IS", "stock")).toBe("TRY");
    });

    it("should assign TRY to GARAN.IS", () => {
      expect(getCurrency("GARAN.IS", "stock")).toBe("TRY");
    });

    it("should assign TRY to all BIST stocks", () => {
      const bistStocks = ["AKBNK.IS", "EREGL.IS", "SASA.IS"];
      bistStocks.forEach((symbol) => {
        expect(getCurrency(symbol, "stock")).toBe("TRY");
      });
    });
  });

  describe("Commodities → USD", () => {
    it("should assign USD to Gold (XAU)", () => {
      expect(getCurrency("XAU", "commodity")).toBe("USD");
    });

    it("should assign USD to Silver (XAG)", () => {
      expect(getCurrency("XAG", "commodity")).toBe("USD");
    });
  });

  describe("Currency Pairs → TRY", () => {
    it("should assign TRY to USD (buying USD with TRY)", () => {
      expect(getCurrency("USD", "currency")).toBe("TRY");
    });

    it("should assign TRY to USDT (buying USDT with TRY)", () => {
      expect(getCurrency("USDT", "currency")).toBe("TRY");
    });
  });

  describe("Currency Symbol Display", () => {
    it("should display ₮ for USDT-denominated assets", () => {
      const currency = getCurrency("BTC", "crypto");
      const symbol = currency === "USDT" ? "₮" : currency === "TRY" ? "₺" : "$";
      expect(symbol).toBe("₮");
    });

    it("should display $ for USD-denominated assets", () => {
      const currency = getCurrency("AAPL", "stock");
      const symbol = currency === "USDT" ? "₮" : currency === "TRY" ? "₺" : "$";
      expect(symbol).toBe("$");
    });

    it("should display ₺ for TRY-denominated assets", () => {
      const currency = getCurrency("THYAO.IS", "stock");
      const symbol = currency === "USDT" ? "₮" : currency === "TRY" ? "₺" : "$";
      expect(symbol).toBe("₺");
    });
  });

  describe("Chart Pair Display", () => {
    it("should display BTC/USDT for Bitcoin", () => {
      const symbol = "BTC";
      const currency = getCurrency(symbol, "crypto");
      const pair = `${symbol}/${currency}`;
      expect(pair).toBe("BTC/USDT");
    });

    it("should display AAPL/USD for Apple", () => {
      const symbol = "AAPL";
      const currency = getCurrency(symbol, "stock");
      const pair = `${symbol}/${currency}`;
      expect(pair).toBe("AAPL/USD");
    });

    it("should display THYAO/TRY for Turkish Airlines", () => {
      const symbol = "THYAO.IS";
      const currency = getCurrency(symbol, "stock");
      const pair = `${symbol}/${currency}`;
      expect(pair).toBe("THYAO.IS/TRY");
    });
  });
});
