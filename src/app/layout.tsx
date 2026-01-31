import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import NavigationProgress from "@/components/NavigationProgress";
import { BRAND_FULL_NAME } from "@/lib/brand-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: BRAND_FULL_NAME,
  description: "Desktop trading interface - A concept project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        {/* Script to set theme before React hydrates to prevent flash */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('midas-theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 antialiased min-h-screen flex flex-col transition-colors duration-200`}
      >
        <AuthProvider>
          <ThemeProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
            <Toaster 
              position="top-right" 
              richColors
              theme="dark"
              offset="80px"
              toastOptions={{
                style: {
                  background: '#1C1C1E',
                  border: '1px solid #2C2C2E',
                  color: '#FFFFFF',
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
