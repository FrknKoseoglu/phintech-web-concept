---
name: data-integration-layer
description: Standards for reliably fetching, validating, and caching 3rd party data (e.g., Yahoo Finance). Use this whenever external data is needed.
---

# 🌐 Data Integration & Resilience Strategy

We treat external APIs (Yahoo Finance, etc.) as "Hostile Environments". They will fail, they will be slow, and they will change data formats. We must be ready.

## 🛡️ The 3-Layer Defense Protocol

### 1. The Cache Layer (Performance)
NEVER fetch raw data inside a Component. Wrap everything in Next.js Cache.

```typescript
import { unstable_cache } from 'next/cache';

// Example: Fetch Stock Price
export const getStockPrice = unstable_cache(
  async (symbol: string) => {
    // ... logic
  },
  ['stock-price-key'], 
  { revalidate: 30, tags: [`stock-${symbol}`] } // Cache for 30s
);