---
name: frontend-construction
description: Standards for building UI components using Next.js 15, Tailwind CSS, and Shadcn/ui principles. Use this when creating pages, layouts, or interactive elements.
---

# 🎨 Frontend Architecture & UI Guidelines

This skill defines how pixels get painted on the screen. The goal is an "App-like" feel, consistent with the Midas brand identity.

## 📱 Core Principles

1.  **Mobile-First Always:** Design for iPhone SE/13 width first, then scale up to Desktop.
2.  **Server Components by Default:**
    - Fetch data in `page.tsx` or `layout.tsx`.
    - Push interactivity to leaves (small components) with `'use client'`.
3.  **No Layout Shift:** Use Skeletons (`<Skeleton />`) while data is loading via Suspense.

## 🛠️ Tech Stack Rules

-   **Styling:** Tailwind CSS only. No custom `.css` files.
-   **Class Management:** ALWAYS use `cn()` utility (clsx + tailwind-merge) for conditional classes.
    ```tsx
    // BAD
    className={`p-4 ${isActive ? 'bg-blue-500' : ''}`}
    
    // GOOD
    className={cn("p-4 transition-colors", isActive && "bg-primary text-primary-foreground")}
    ```
-   **Icons:** Lucide React.
-   **Numbers:** Use `Intl.NumberFormat` for currency display. NEVER display raw DB decimals.

## 🧩 Component Structure

When creating a new UI feature (e.g., StockCard):
1.  **Container:** Handles layout (Server Component).
2.  **Interactive Part:** Handles clicks/state (Client Component).
3.  **Feedback:** Use `sonner` for toast notifications on success/error.

## ⚠️ Forbidden
-   Don't use `useEffect` for data fetching. Use Server Actions or React Query (if configured).
-   Don't leak business logic (tax calculations) into UI components.