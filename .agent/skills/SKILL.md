---
name: midas-architecture-master
description: THE ROOT SKILL. Use this whenever starting a NEW FEATURE (e.g., "Add Limit Orders", "Create Portfolio Page"). It orchestrates the usage of Prisma, Financial Math, and Server Actions skills.
---

# 🏛️ Midas Web Concept: Architectural Master Plan

This skill acts as the **Orchestrator** for the Midas Web Project. It defines the strictly ordered workflow for implementing features to ensure financial integrity and system stability.

## 🔄 The "Feature Implementation Pipeline"

When the user asks for a new feature (e.g., "Implement Buy Order logic"), you **MUST** follow this 4-step execution order. Do not skip steps.

### PHASE 1: Data Modeling (The Foundation)
**Refer to Skill:** `prisma-data-modeling`

1.  Analyze if the feature requires new tables or field modifications.
2.  **STOP & THINK:** Does this involve money? If yes, are fields `Decimal(19,4)`?
3.  **CHECK:** Are there high-frequency queries involved (like Cron Jobs)? If yes, define composite indexes.
4.  *Action:* Generate/Update `schema.prisma`.

### PHASE 2: Math & Logic Strategy (The Rules)
**Refer to Skill:** `financial-math`

1.  Identify the currencies involved (TRY, USD, or USDT).
2.  Determine the source of funds (User Balance vs. Portfolio Balance).
3.  **CRITICAL:** Plan how to handle precision. (e.g., "I will use `decimal.js` for the price calculation before sending to DB").
4.  *Action:* Write a mental (or scratchpad) plan for the calculation logic.

### PHASE 3: Backend Implementation (The Engine)
**Refer to Skill:** `nextjs-server-actions`

1.  Create the Server Action in `src/actions/`.
2.  **AUTH FIRST:** Ensure `auth()` is the first line.
3.  **VALIDATION:** Define the Zod schema.
4.  **ATOMICITY:** Wrap DB writes in `prisma.$transaction`.
5.  *Action:* Write the code implementing the logic defined in Phase 2.

### PHASE 4: UI Integration (The Facade)
1.  Connect the Server Action to the UI Component.
2.  Use `useTransition` or `sonner` (toast) for user feedback.
3.  **Types:** Ensure the UI receives serialized data (convert Decimals to strings if passing to Client Components).

---

## 🚦 Scenario-Based Decisions

### Scenario A: "User wants to buy Apple Stock (AAPL)"
1.  **Orchestrator:** This is a `US_STOCK` trade.
2.  **Math Skill:** Check `portfolio['USD']` balance. NOT `user.balance` (TRY).
3.  **Prisma Skill:** Ensure `Transaction` record is created.
4.  **Action:** Execute trade.

### Scenario B: "User wants to Withdraw Money to Bank"
1.  **Orchestrator:** Only TRY (`user.balance`) can be withdrawn.
2.  **Math Skill:** Ensure requested amount <= `user.balance`.
3.  **Action:** Create a `Transaction` with type `WITHDRAW`.

## 🚫 Forbidden Patterns (Anti-Patterns)
- **Logic in UI:** Never calculate trade totals inside a React Component. Do it in the Server Action.
- **Mixed Currency Math:** Never sum `user.balance` (TRY) + `portfolio.value` (USD) without an explicit FX rate conversion.

### PHASE 4: Frontend Implementation (The Facade)
**Refer to Skill:** `frontend-construction`

1.  Create UI components using `cn()` and Tailwind.
2.  Connect Server Actions.
3.  **Security Check:** Refer to `security-audit` to ensure no sensitive data is leaked to Client Components.

### PHASE 5: Refactoring & Verification (The Polish)
**Refer to Skills:** `qa-testing`, `clean-code-refactoring`

1.  **Refactor:** Is the file too long? Extract logic. Are magic numbers used?
2.  **Test:** Run the "Self-Correction" checklist (Money Test, Edge Cases).
3.  **Verify:** Does it look and feel like a premium app?

### PHASE 6: Documentation (The Legacy)
**Refer to Skill:** `documentation-standard`

1.  Add JSDoc to new functions.
2.  Update `README.md` if this is a major feature.
3.  *Action:* Confirm task completion to the user.

---

## 🚦 Scenario: "User wants to see Stock Detail Page"
1.  **Orchestrator:** Needs UI + Data.
2.  **Data Skill:** Fetch data from Yahoo via `unstable_cache`.
3.  **Frontend Skill:** Build page with `<Suspense>` and Skeleton.
4.  **Docs Skill:** Add comments explaining the caching strategy.