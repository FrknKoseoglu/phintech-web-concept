---
name: nextjs-server-actions
description: Generates secure and type-safe Next.js 15 Server Actions. Use this when implementing backend logic, form submissions, or data mutations.
---

# Next.js Server Actions Architecture

This skill defines the standard for writing Server Actions in `src/actions/*`.

## 🛡️ Security Protocol

1.  **Authentication:** Every public action must check `auth()` session first.
2.  **Validation:** All inputs must be validated using `Zod` schemas.
3.  **Error Handling:** Never leak database errors to the client. Use `safe-action` pattern or standard `return { error: string }`.

## 📝 Code Template

Follow this structure for all actions (e.g., `placeOrder`, `cancelOrder`):

```typescript
'use server'

import { auth } from "@/auth" // or your auth path
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// 1. Define Zod Schema
const ActionSchema = z.object({
  symbol: z.string().min(1),
  quantity: z.number().positive(), // Handle as string/decimal if needed
  // ...
});

export async function yourActionName(prevState: any, formData: FormData) {
  // 2. Auth Check
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  // 3. Validation
  const validatedFields = ActionSchema.safeParse({
    symbol: formData.get("symbol"),
    // ...
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields", details: validatedFields.error.flatten() };
  }

  const { symbol, quantity } = validatedFields.data;

  try {
    // 4. Business Logic (DB Operations)
    // Always use transactions for money movement!
    await prisma.$transaction(async (tx) => {
        // ... logic here
    });

    // 5. Revalidation
    revalidatePath("/dashboard");
    return { success: true, message: "Operation successful" };
    
  } catch (error) {
    console.error("Action Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}