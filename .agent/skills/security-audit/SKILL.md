---
name: security-audit
description: Security hardening guidelines. Use this to review Server Actions and Data Access patterns for vulnerabilities.
---

# 🛡️ Security & Hardening Protocols

We are building a fortress, not a tent. Every line of code processing user input is a potential attack vector.

## 🚫 OWASP Top Risks Mitigation

### 1. IDOR (Insecure Direct Object References) - **CRITICAL**
Never trust IDs sent from the client blindly.
-   **BAD:** `db.order.cancel({ where: { id: inputId } })` -> Attacker can cancel anyone's order.
-   **GOOD:** ```typescript
    db.order.cancel({ 
      where: { 
        id: inputId, 
        userId: session.user.id // 🔒 Enforce ownership
      } 
    })
    ```

### 2. Authentication & Authorization
-   Verify `session` in **EVERY** Server Action.
-   Don't rely on UI hiding. If a button is hidden, the API endpoint is still exposed.

### 3. Input Validation (Sanitization)
-   All inputs are "Guilty until proven innocent".
-   Use `Zod` to strip unknown fields (`.strict()`).
-   Prevent Negative Numbers in trades (`z.number().positive()`).

### 4. Rate Limiting (Logic Layer)
-   Prevent "Spam Buying".
-   If implementing a Cron Job, ensure it cannot be triggered via public URL.

## 🕵️ Code Review Trigger
If the code involves **Money Transfer**, **Profile Update**, or **Data Deletion**, apply this skill immediately.