import {
  Wallet,
  TrendingUp,
  Globe,
  Bitcoin,
  History,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/wallet", label: "Varlık Özeti", icon: Wallet, active: true },
  { href: "/wallet/bist", label: "Borsa İstanbul", icon: TrendingUp },
  { href: "/wallet/us", label: "ABD Borsaları", icon: Globe },
  { href: "/wallet/crypto", label: "Kripto Varlıklar", icon: Bitcoin },
  { href: "/wallet/history", label: "İşlem Geçmişi", icon: History },
];

export default function WalletSidebar() {
  return (
    <div className="hidden lg:block lg:col-span-1 space-y-2">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
            item.active
              ? "bg-surface-light dark:bg-surface-dark text-primary font-medium shadow-sm border border-primary/10"
              : "text-gray-500 dark:text-gray-400 hover:bg-surface-light dark:hover:bg-surface-dark hover:text-gray-900 dark:hover:text-white"
          )}
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </Link>
      ))}
    </div>
  );
}
