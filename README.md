# 🦁 PhinTech Finance Platform

A modern, high-performance web interface concept for the PhinTech investment ecosystem. Built with Next.js 14+, Tailwind CSS, and a robust data integration layer.

## 🚀 Features

-   **Real-Time Market Data**: Integration with Yahoo Finance, CoinGecko, and TCMB for Stocks (US & BIST), Crypto, and Commodities.
-   **Smart Data Resiliency**: "Hostile Environment" defense strategy with 3-layer caching and fallback mechanisms.
-   **Asset Branding**: Automated logo fetching via `logo.dev` with intelligent caching and color-coded fallbacks.
-   **Mathematical Consistency**: Fallback calculations based on "Previous Close" to ensure price/change consistency when APIs are rate-limited.
-   **Responsive UI**: Mobile-first design using Tailwind CSS, optimized for both desktop and mobile web experiences.
-   **Dark Mode**: Native dark mode support.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Database**: Prisma (PostgreSQL on Neon)
-   **Data Sources**:
    -   Yahoo Finance (Stocks, KPIs)
    -   CoinGecko (Crypto)
    -   TCMB (Currency Exchange Rates)
    -   Logo.dev (Asset Branding)

## ⚡ Getting Started

### 1. Requirements
-   Node.js 18+
-   npm or pnpm

### 2. Installation

```bash
git clone <repository-url>
cd phintech-web-concept
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory. You can use `.env.local.example` as a template.

```bash
cp .env.local.example .env.local
```

**Required Variables:**

```env
# Logo.dev API Token (Required for Asset Icons)
# Get key from: https://logo.dev/
NEXT_PUBLIC_LOGO_DEV_TOKEN=pk_your_publishable_key

# Database URL (Prisma)
DATABASE_URL="postgresql://..."

# NextAuth Secret
NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏛️ Architecture Highlights

### Data Integration Layer
We treat external APIs as unreliable ("Hostile Environment"). Our data strategy involves:
1.  **Caching**: All external calls are wrapped in `unstable_cache` with specific revalidation periods.
2.  **Fallback Logic**:
    *   **Live Data**: Primary source.
    *   **Calculated Fallback**: If live price exists but change% is missing, we calculate it dynamically using `regularMarketPreviousClose`.
    *   **Static Snapshot**: If fully offline, we serve a consistent static snapshot to keep the UI functional.

### Logo Service
Logos are handled via a centralized service (`src/lib/logo-service.ts`) that:
-   Differentiates between Crypto (`img.logo.dev/crypto`) and Stocks (`img.logo.dev/ticker`).
-   Caches resolved URLs for 24 hours.
-   Provides visual uniformity with absolute border-radius and padding.

## 📄 License

This project is a concept proof-of-work.
