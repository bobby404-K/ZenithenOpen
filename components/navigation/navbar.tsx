"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code2,
  LogOut,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-context";
import { useTheme } from "@/components/theme/theme-provider";
import { useNavigation } from "@/components/navigation/navigation-context";
import { CommandPalette } from "@/components/navigation/command-palette";

const PAGE_TOP_NAV: Record<string, { label: string; id: string }[]> = {
  "/programs": [
    { label: "Open Source", id: "open-source" },
    { label: "Projects", id: "projects" },
    { label: "GSoC", id: "gsoc" },
    { label: "GSSoC Hall of Fame", id: "gssoc" },
    { label: "ESoC & SOB", id: "esoc-sob" },
  ],
  "/community": [
    { label: "About", id: "about" },
    { label: "Journey", id: "journey" },
    { label: "Members", id: "members" },
    { label: "Rewards", id: "rewards" },
    { label: "Featured", id: "featured" },
  ],
  "/events": [
    { label: "Upcoming", id: "upcoming" },
    { label: "Hackathons", id: "hackathons" },
    { label: "Achievements", id: "achievements" },
  ],
  "/resources": [
    { label: "Learn to PR", id: "learn-to-pr" },
    { label: "Make First PR", id: "make-first-pr" },
    { label: "Blog", id: "blog" },
  ],
};

export function Navbar() {
  const pathname = usePathname();
  const { user, openLoginModal, logout } = useAuth();
  const { toggleMenu, isMenuOpen, menuAnchor, theme } = useTheme();
  const { isSidebarOpen, toggleSidebar, activeSection, setActiveSection } = useNavigation();
  const [scrolled, setScrolled] = React.useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    let lastScrolled = window.scrollY > 20;
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== lastScrolled) {
        lastScrolled = isScrolled;
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isThemeActiveOnNavbar = isMenuOpen && menuAnchor === "navbar";
  const currentNavItems = PAGE_TOP_NAV[pathname] || null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-150",
        scrolled
          ? "border-b border-border/80 bg-background/90 backdrop-blur-xl shadow-xs"
          : "border-b border-transparent bg-background/70 backdrop-blur-md"
      )}
    >
      <div className="relative w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Area: Hamburger Trigger + Logo Theme Button + Homepage Link */}
        <div className="flex items-center justify-start space-x-2.5 shrink-0 z-10">
          {/* Integrated 3-Line Hamburger Menu Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar-navigation"
            title={isSidebarOpen ? "Close navigation (Esc)" : "Open navigation"}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-muted-foreground",
              "hover:text-foreground hover:bg-muted hover:border-primary/40 active:scale-95 transition-colors duration-150 cursor-pointer",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isSidebarOpen && "bg-primary/15 text-primary border-primary/40 ring-1 ring-primary/40"
            )}
          >
            <div className="flex flex-col items-center justify-center space-y-1 w-4 h-4" aria-hidden="true">
              <span
                className={cn(
                  "block h-0.5 w-3.5 bg-current rounded-full transition-transform duration-200",
                  isSidebarOpen && "translate-y-1.5 rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-3 bg-current rounded-full transition-opacity duration-150",
                  isSidebarOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-3.5 bg-current rounded-full transition-transform duration-200",
                  isSidebarOpen && "-translate-y-1.5 -rotate-45"
                )}
              />
            </div>
          </button>

          {/* Logo Theme Trigger Button */}
          <button
            type="button"
            data-theme-trigger="navbar"
            onClick={() => toggleMenu("navbar")}
            aria-label={`Switch theme (current: ${theme})`}
            aria-haspopup="dialog"
            aria-expanded={isThemeActiveOnNavbar}
            title="Click to change theme"
            className={cn(
              "group relative flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer",
              "bg-gradient-to-br from-primary via-secondary to-accent p-0.5 shadow-md shadow-primary/20",
              "hover:scale-105 active:scale-95 transition-transform",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isThemeActiveOnNavbar && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-card transition-colors group-hover:bg-card/80">
              <Code2 className="h-4.5 w-4.5 text-primary group-hover:text-secondary transition-colors" />
            </div>
          </button>

          {/* Brand Name Link - Returns to First Page */}
          <Link
            href="/"
            className="flex flex-col group select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 transition-all"
            title="Go to ZenithenOpen Homepage"
          >
            <span className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Zenithen<span className="text-primary">Open</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground tracking-wider uppercase group-hover:text-foreground transition-colors">
              Open Source Community
            </span>
          </Link>
        </div>

        {/* Page-Specific Top Navigation Options - Centered in middle */}
        {currentNavItems && (
          <nav
            aria-label="Page navigation"
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar py-1 px-2 max-w-[55vw]"
          >
            {currentNavItems.map((item) => {
              const isValidActive = currentNavItems.some((n) => n.id === activeSection);
              const currentActive = isValidActive ? activeSection : currentNavItems[0]?.id;
              const isSelected = currentActive === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer border",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                      : "bg-card/80 border-border text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Action buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 z-10">
          {/* Quick Search & Command Palette Trigger */}
          <button
            id="open-command-palette-btn"
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            aria-label="Search platform (Cmd+K)"
            title="Search contributors, repositories, and pages (⌘K or Ctrl+K)"
            className={cn(
              "flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl border border-border/80 bg-card/80 text-muted-foreground",
              "hover:text-foreground hover:bg-muted hover:border-primary/40 active:scale-95 transition-all cursor-pointer"
            )}
          >
            <Search className="h-4 w-4 text-primary shrink-0" />
            <span className="hidden xl:inline text-xs font-medium text-muted-foreground">Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted/80 border border-border text-[10px] font-mono font-semibold text-muted-foreground">
              <span>⌘K</span>
            </kbd>
          </button>

          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 rounded-xl border border-border bg-card px-2.5 py-1 text-xs">
                <img
                  src={user.avatarUrl}
                  alt={user.githubUsername}
                  className="h-6 w-6 rounded-full object-cover ring-1 ring-primary"
                />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-foreground leading-tight truncate max-w-[120px]">
                    @{user.githubUsername}
                  </span>
                  <span className="text-[10px] text-accent font-mono leading-tight">{user.usn}</span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Log in Button */}
              <button
                type="button"
                onClick={openLoginModal}
                className="flex items-center space-x-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted shadow-xs transition-colors cursor-pointer"
              >
                Log in
              </button>

              {/* Sign up Button */}
              <Button
                size="sm"
                onClick={openLoginModal}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/25 cursor-pointer"
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </header>
  );
}
