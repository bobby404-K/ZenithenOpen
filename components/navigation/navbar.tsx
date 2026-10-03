"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code2,
  Trophy,
  Sparkles,
  FileText,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-context";

const NAV_LINKS = [
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Hall of Fame", href: "/achievements", icon: Sparkles },
  { name: "Resume", href: "/resume", icon: FileText },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, openLoginModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xs"
          : "border-b border-transparent bg-white/70 backdrop-blur-md"
      )}
    >
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo - Moved to far left edge with small padding */}
        <div className="flex items-center flex-1 justify-start">
          <Link href="/" className="group flex items-center space-x-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white">
                <Code2 className="h-5 w-5 text-blue-600 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Zenithen<span className="text-blue-600">Open</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                Open Source Community
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav Links - Centered in middle */}
        <nav className="hidden lg:flex items-center justify-center space-x-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold shadow-xs border border-blue-200/60"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action buttons - Moved to far right edge with small padding */}
        <div className="hidden sm:flex items-center flex-1 justify-end space-x-3">
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
                <img
                  src={user.avatarUrl}
                  alt={user.githubUsername}
                  className="h-6 w-6 rounded-full object-cover ring-1 ring-blue-500"
                />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-slate-900 leading-tight">@{user.githubUsername}</span>
                  <span className="text-[10px] text-emerald-600 font-mono leading-tight">{user.usn}</span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Log in Button (outlined/dark style) */}
              <button
                type="button"
                onClick={openLoginModal}
                className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
              >
                Log in
              </button>

              {/* Sign up Button (solid blue style) */}
              <Button
                size="sm"
                onClick={openLoginModal}
                className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold shadow-md shadow-blue-600/20 text-white"
              >
                Sign up
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/95 px-4 pt-3 pb-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col space-y-1 mb-4">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg p-2.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold border border-blue-200"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col space-y-2 pt-2 border-t border-slate-200">
            {user ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full ring-1 ring-blue-500" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900">@{user.githubUsername}</p>
                    <p className="text-[10px] text-emerald-600 font-mono">{user.usn}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="w-1/2 border-slate-200 text-xs py-2 text-slate-700"
                  size="sm"
                >
                  Log in
                </Button>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-xs py-2 text-white"
                  size="sm"
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
