---
name: financial-math
description: Handles high-precision financial calculations and multi-currency logic. Use this whenever performing arithmetic operations on prices, balances, or quantities.
---

# Financial Math & Currency Handling Skill

This skill governs how monetary values are handled in the Midas Web Concept project.

## 🚨 ZERO TOLERANCE RULES

1.  **NO FLOATING POINTS:** Never use standard JavaScript `number` type for financial calculations.
2.  **LIBRARY USAGE:** Always use `decimal.js` (client-side) or `Prisma.Decimal` (server-side/DB).
3.  **CURRENCY ISOLATION:** Never add/subtract values of different currencies (e.g., `USD + TRY`).

## 🛠 Implementation Guidelines

### 1. Database & Type Definition
- In `schema.prisma`, all monetary fields must be `Decimal(19, 4)`.
- In TypeScript interfaces, map these fields to `Decimal` or `string` (never `number`).

### 2. Calculation Pattern
When calculating Portfolio Value or Trade Totals:

```typescript
import Decimal from 'decimal.js';

// BAD ❌
const total = price * quantity; 

// GOOD ✅
const priceDec = new Decimal(price);
const qtyDec = new Decimal(quantity);
const total = priceDec.times(qtyDec);