"use client";

import {
  Wallet,
  TrendingUp,
  Globe,
  Bitcoin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/wallet", category: undefined, label: "Tümü", icon: Wallet },
  { href: "/wallet?category=stock", category: "stock", label: "Hisseler", icon: TrendingUp },
  { href: "/wallet?category=crypto", category: "crypto", label: "Kripto", icon: Bitcoin },
  { href: "/wallet?category=commodity", category: "commodity", label: "Emtia & Döviz", icon: Globe },
];

export default function WalletSidebar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <div className="hidden lg:block lg:col-span-1 space-y-2">
      {menuItems.map((item) => {
        const isActive = currentCategory === item.category || 
          (item.category === undefined && !currentCategory);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              isActive
                ? "bg-white/5 text-primary font-medium border border-gray-800"
                : "text-gray-500 dark:text-gray-400 hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}

      {/* Midas Pro Link */}
      <Link
        href="/analysis"
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-amber-500 hover:from-yellow-500/20 hover:to-amber-500/20 border border-amber-500/20 mt-4"
      >
        <Sparkles className="w-5 h-5" />
        Midas Pro
      </Link>
    </div>
  );
}
