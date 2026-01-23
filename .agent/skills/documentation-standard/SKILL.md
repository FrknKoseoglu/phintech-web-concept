---
name: documentation-standard
description: Standards for JSDoc comments and README updates. Use this immediately after coding a complex function or finishing a feature.
---

# 📚 Documentation Standards

"Code tells you how, comments tell you why."

## 📝 JSDoc Requirement
All exported functions in `src/actions`, `src/lib`, and `src/hooks` MUST have JSDoc.

**Template:**
```typescript
/**
 * Short description of what the function does.
 * * @param {string} symbol - The stock ticker (e.g., "THYAO.IS").
 * @param {Decimal} amount - The amount in currency (not quantity!).
 * @returns {Promise<Transaction>} The resulting DB record.
 * @throws {InsufficientFundsError} If wallet balance is low.
 * * @example
 * const tx = await placeMarketOrder("AAPL", 150.00);
 */