"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";
import { toast } from "sonner";
import GlobalSearch from "@/components/GlobalSearch";
import BrandLogo from "@/components/BrandLogo";

const navLinks = [
  { href: "/", label: "Panel" },
  { href: "/trade", label: "Al-Sat" },
  { href: "/market", label: "Piyasalar" },
  { href: "/wallet", label: "Portföy" },
  { href: "/analysis", label: "Analiz" },
  { href: "/news", label: "Haberler" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    setShowDropdown(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Logo & Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 items-center justify-center text-white font-bold text-xl">
              <BrandLogo className="h-full w-full" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-all",
                    isActive
                      ? "text-white bg-[#1C1C1E]"
                      : "text-text-muted hover:text-white hover:bg-[#1C1C1E]/50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Search */}
          <div 
            className="relative hidden xl:block cursor-pointer"
            onClick={() => setSearchOpen(true)}
          >
            <input
              type="text"
              placeholder="Sembol, İsim vb. ara..."
              readOnly
              className="bg-[#1C1C1E] border-0 rounded-xl py-2 pl-10 pr-12 text-sm w-64 focus:ring-2 focus:ring-primary text-white placeholder-text-muted cursor-pointer"
            />
            <Search className="absolute left-3 top-2.5 text-text-muted w-4 h-4 pointer-events-none" />
            <div className="absolute right-3 top-2 flex items-center space-x-1 pointer-events-none">
              <span className="text-[10px] bg-[#2C2C2E] text-text-muted px-1.5 py-0.5 rounded">
                ⌘K
              </span>
            </div>
          </div>

          {/* Global Search Modal */}
          <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

          {/* Help Button */}
          <button 
            onClick={() => toast.info('Yardım özelliği Konsept Projede mevcut değildir')}
            className="p-2 rounded-full hover:bg-[#1C1C1E] text-text-muted hover:text-white transition-colors hidden sm:block"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[#1C1C1E] text-text-muted hover:text-white transition-colors"
            title={isDark ? "Açık mod" : "Koyu mod"}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button 
            onClick={() => toast.info('Bildirimler özelliği Konsept Projede mevcut değildir')}
            className="p-2 rounded-full hover:bg-[#1C1C1E] text-text-muted hover:text-white transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-black" />
          </button>

          {/* Divider */}
          <div className="h-8 w-[1px] bg-[#1C1C1E] mx-2 hidden sm:block" />

          {/* User Profile / Login Button */}
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-[#1C1C1E] animate-pulse" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 pl-1 pr-1 sm:pr-3 py-1 rounded-full hover:bg-[#1C1C1E] border border-transparent hover:border-[#2C2C2E] transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-semibold text-white group-hover:text-primary">
                    {session.user?.name || "Hesabım"}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {session.user?.email?.split("@")[0] || "Kullanıcı"}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 top-12 w-56 bg-[#1C1C1E] rounded-xl border border-gray-800 shadow-xl z-20 py-2">
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-xs text-gray-400">Giriş yapıldı</p>
                      <p className="text-sm text-white truncate font-medium">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/wallet"
                      onClick={() => setShowDropdown(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#2C2C2E] transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Portföy</p>
                        <p className="text-xs text-gray-400">Bakiyeni görüntüle</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <div className="border-t border-gray-800 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-all"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Giriş Yap</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 rounded-full hover:bg-[#1C1C1E] text-text-muted">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
