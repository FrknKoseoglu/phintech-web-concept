import Link from "next/link";
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Menu,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Panel", active: true },
  { href: "/markets", label: "Piyasalar" },
  { href: "/trade", label: "Al-Sat" },
  { href: "/wallet", label: "Portföy" },
  { href: "/analysis", label: "Analiz" },
  { href: "/news", label: "Haberler" },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark shadow-sm h-16">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Logo & Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              M
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors tracking-tight">
              Midas<span className="text-primary">Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  link.active
                    ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                    : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Search */}
          <div className="relative hidden xl:block">
            <input
              type="text"
              placeholder="Sembol, İsim vb. ara..."
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 pl-9 pr-12 text-sm w-64 focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400"
            />
            <Search className="absolute left-2.5 top-2 text-gray-400 w-4 h-4" />
            <div className="absolute right-2 top-1.5 flex items-center space-x-1 pointer-events-none">
              <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 rounded">
                ⌘K
              </span>
            </div>
          </div>

          {/* Help Button */}
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors hidden sm:block">
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white dark:ring-surface-dark" />
          </button>

          {/* Divider */}
          <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block" />

          {/* User Profile */}
          <button className="flex items-center space-x-2 pl-1 pr-1 sm:pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              E
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 group-hover:text-primary">
                Emre Y.
              </span>
              <span className="text-[10px] text-gray-400">Pro Üye</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </button>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
