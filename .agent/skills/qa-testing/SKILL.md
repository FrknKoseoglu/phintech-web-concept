---
name: qa-testing
description: Strategy for verifying code correctness. Use this to generate test plans or sanity checks BEFORE marking a task as complete.
---

# 🧪 Quality Assurance & Testing Strategy

"Trust, but Verify." In a financial app, a bug costs money.

## 📐 The Testing Pyramid

1.  **Unit Tests (Critical):** Math logic and Utility functions.
2.  **Integration Tests:** Server Actions + DB interactions.
3.  **UI/Sanity Checks:** Does the button actually work?

## 📋 The "Self-Correction" Checklist (Agent Must Run This)

Before confirming a task is done, ask yourself:

1.  **The Money Test:**
    - If I buy 1 AAPL at $150.00, does the USD balance drop exactly 150.00?
    - What happens if balance is $149.99? (Boundary Value Analysis)
2.  **The Concurrency Test:**
    - What happens if the user clicks "Buy" twice instantly? (Is the button disabled?)
3.  **The "Empty" Test:**
    - How does the UI look if the user has 0 stocks? (Empty State)

## 🐛 Defect Prevention
-   **Mocking:** When testing UI, mock the financial data. Do not rely on live Yahoo Finance API for tests.
-   **Error States:** Verify that network errors show a graceful Toast message, not a crashed white screen.

## 📝 Output Requirement
When asked to "Test this feature," produce a **Test Scenario Table**:
| Scenario | Input | Expected Outcome |
|----------|-------|------------------|
| Insufficient Funds | Buy $1000 w/ $500 balance | Error: "Yetersiz Bakiye" |
| Exact Amount | Buy $500 w/ $500 balance | Success, Balance = 0 |