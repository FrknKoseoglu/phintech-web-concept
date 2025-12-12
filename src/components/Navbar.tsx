"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

const navLinks = [
  { href: "/", label: "Panel" },
  { href: "/markets", label: "Piyasalar" },
  { href: "/trade", label: "Al-Sat" },
  { href: "/wallet", label: "Portföy" },
  { href: "/analysis", label: "Analiz" },
  { href: "/news", label: "Haberler" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-[#1C1C1E] h-16">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Logo & Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 items-center justify-center text-white font-bold text-xl">
              <svg
                width="60"
                height="38.3"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 62.7 38.3"
                xmlSpace="preserve"
                className="h-full w-full"
              >
                <style type="text/css">{`.st0{fill:#4E55FF;}`}</style>
                <ellipse
                  transform="matrix(0.1797 -0.9837 0.9837 0.1797 -25.2876 32.4364)"
                  className="st0"
                  cx="6.8"
                  cy="31.4"
                  rx="6.9"
                  ry="6.8"
                ></ellipse>
                <path
                  className="st0"
                  d="M11.8,1l-1.3,0.6c-0.1,0.1-0.3,0.2-0.4,0.3C10,2,10,2.2,9.9,2.3c0,0.1-0.1,0.3-0.1,0.4c0,0.2,0,0.3,0.1,0.4
        L24,32.5c0.6,1.2,1.3,2.2,2.3,3s2.1,1.5,3.2,1.9s2.5,0.6,3.7,0.5s2.5-0.4,3.6-1l1.3-0.6c0.1-0.1,0.3-0.2,0.4-0.3s0.2-0.2,0.2-0.4
        s0.1-0.3,0.1-0.4s0-0.3-0.1-0.4L24.7,5.5c-0.6-1.2-1.3-2.2-2.3-3S20.3,1,19.2,0.5C18,0.1,16.7-0.1,15.4,0C14.2,0.1,12.9,0.4,11.8,1z
        "
                ></path>
                <path
                  className="st0"
                  d="M35.6,1l-1.3,0.6C34,1.8,33.8,2,33.7,2.3s-0.1,0.6,0.1,0.9l14.1,29.3c0.6,1.2,1.3,2.2,2.3,3s2.1,1.5,3.2,1.9
        s2.5,0.6,3.7,0.5s2.5-0.4,3.6-1l1.3-0.6c0.3-0.1,0.5-0.4,0.6-0.7s0.1-0.6-0.1-0.9L48.5,5.5c-0.6-1.2-1.3-2.2-2.3-3S44.2,1,43,0.5
        c-1.2-0.4-2.5-0.6-3.7-0.5C38,0.1,36.7,0.4,35.6,1z"
                ></path>
              </svg>
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
          <div className="relative hidden xl:block">
            <input
              type="text"
              placeholder="Sembol, İsim vb. ara..."
              className="bg-[#1C1C1E] border-0 rounded-xl py-2 pl-10 pr-12 text-sm w-64 focus:ring-2 focus:ring-primary text-white placeholder-text-muted"
            />
            <Search className="absolute left-3 top-2.5 text-text-muted w-4 h-4" />
            <div className="absolute right-3 top-2 flex items-center space-x-1 pointer-events-none">
              <span className="text-[10px] bg-[#2C2C2E] text-text-muted px-1.5 py-0.5 rounded">
                ⌘K
              </span>
            </div>
          </div>

          {/* Help Button */}
          <button className="p-2 rounded-full hover:bg-[#1C1C1E] text-text-muted hover:text-white transition-colors hidden sm:block">
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
          <button className="p-2 rounded-full hover:bg-[#1C1C1E] text-text-muted hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-black" />
          </button>

          {/* Divider */}
          <div className="h-8 w-[1px] bg-[#1C1C1E] mx-2 hidden sm:block" />

          {/* User Profile */}
          <button className="flex items-center space-x-2 pl-1 pr-1 sm:pr-3 py-1 rounded-full hover:bg-[#1C1C1E] border border-transparent hover:border-[#2C2C2E] transition-all group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              E
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-semibold text-white group-hover:text-primary">
                Emre Y.
              </span>
              <span className="text-[10px] text-text-muted">Pro Üye</span>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block" />
          </button>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 rounded-full hover:bg-[#1C1C1E] text-text-muted">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
