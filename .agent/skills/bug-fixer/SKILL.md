---
name: bug-fixer
description: Standardized debugging protocol. Use this IMMEDIATELY when an error occurs (Runtime Error, Build Fail, or Logic Bug). Orchestrates other skills to solve the root cause.
---

# 🕵️ Bug Fixing & Troubleshooting Protocol

"Don't just patch the symptom; cure the disease."

When you encounter an error, **DO NOT** immediately write code to fix it. Follow this 4-Step Investigation Protocol first.

## 🚨 Step 1: Triage (Diagnosis)
Analyze the error stack trace or behavior. Categorize the issue:

-   **Type A: Financial/Calculation Error** (e.g., `NaN`, `0.300004`, Wrong Balance)
    * 👉 **Directive:** You MUST consult the `financial-math` skill.
    * *Check:* Are we using `number` instead of `Decimal`? Are we mixing currencies?

-   **Type B: Database/Prisma Error** (e.g., `Foreign key constraint failed`, `Connection limit`)
    * 👉 **Directive:** You MUST consult the `prisma-data-modeling` skill.
    * *Check:* Are relations correct? Is the ID valid? Is the migration applied?

-   **Type C: Security/Auth Error** (e.g., `Unauthorized`, `403 Forbidden`)
    * 👉 **Directive:** You MUST consult the `security-audit` skill.
    * *Check:* Is `auth()` called? Is the user modifying their own data?

-   **Type D: Fetch/Network Error** (e.g., `Failed to fetch`, `500 Internal Server Error`)
    * 👉 **Directive:** You MUST consult the `data-integration-layer` skill.
    * *Check:* Is the API down? Do we have a fallback?

## 🧠 Step 2: Reproduction Strategy
Before fixing, prove you understand the bug.
-   Create a mental (or actual) reproduction case: *"If I call `buyStock` with negative amount, it crashes."*

## 🛠️ Step 3: The Surgical Fix
Apply the fix based on the consulted Skill's rules.

-   **ANTI-PATTERN:** Wrapping everything in `try/catch` and returning `null` just to silence the error. **NEVER DO THIS.**
-   **CORRECT:** Fix the logic validation or data type.

## ✅ Step 4: Verification
**Refer to Skill:** `qa-testing`

1.  Run the reproduction case again. Does it pass?
2.  **Regression Check:** Did this fix break something else? (e.g., Fixing Buy logic shouldn't break Sell logic).

---

## 🛑 Example Scenario
**Error:** `Invalid value: 150.234234234 for field amount`
**Bot Thought Process:**
1.  *Triage:* This is a DB/Math error.
2.  *Consult:* `financial-math` says "No floats" and `prisma-data-modeling` says "Decimal(19,4)".
3.  *Root Cause:* We are passing a raw JS float to Prisma.
4.  *Fix:* Wrap the value in `new Decimal(amount).toFixed(4)`.
5.  *Verify:* Run test.