"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Users2,
  Calendar,
  GraduationCap,
  X,
  Code2,
  ChevronRight,
  Trophy,
  FolderGit2,
  Briefcase,
} from "lucide-react";
import { useNavigation } from "./navigation-context";
import { cn } from "@/lib/utils";

interface NavEntry {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  sectionTitle: string;
  items: NavEntry[];
}

const SIDEBAR_SECTIONS: NavSection[] = [
  {
    sectionTitle: "LEADERBOARD",
    items: [
      {
        title: "Hall of Fame",
        description: "Student rankings & verified PR merges",
        href: "/leaderboard",
        icon: Trophy,
      },
    ],
  },
  {
    sectionTitle: "PROJECTS & OPPORTUNITIES",
    items: [
      {
        title: "Campus Repositories",
        description: "Explore open-source repos & contribute",
        href: "/projects",
        icon: FolderGit2,
      },
      {
        title: "Good First Issues",
        description: "Curated beginner-friendly campus issues",
        href: "/opportunities",
        icon: Briefcase,
      },
    ],
  },
  {
    sectionTitle: "PROGRAMS",
    items: [
      {
        title: "Programs",
        description: "All programs, nothing is big or small",
        href: "/programs",
        icon: Rocket,
      },
    ],
  },
  {
    sectionTitle: "COMMUNITY",
    items: [
      {
        title: "Community & Rewards",
        description: "Stories, updates & contributor merchandise",
        href: "/community",
        icon: Users2,
      },
      {
        title: "Members Directory",
        description: "Student developer profiles & portfolios",
        href: "/members",
        icon: Users2,
      },
    ],
  },
  {
    sectionTitle: "EVENTS",
    items: [
      {
        title: "Events",
        description: "Upcoming hackathons & workshops",
        href: "/events",
        icon: Calendar,
      },
    ],
  },
  {
    sectionTitle: "RESOURCES",
    items: [
      {
        title: "Resources",
        description: "Learn Git and make your first PR",
        href: "/resources",
        icon: GraduationCap,
      },
    ],
  },
];

export function SidebarMenu() {
  const { isSidebarOpen, closeSidebar } = useNavigation();
  const pathname = usePathname();
  const sidebarRef = React.useRef<HTMLElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus close button on open for accessibility
  React.useEffect(() => {
    if (isSidebarOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isSidebarOpen]);

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop Overlay for Outside Click Dismissal */}
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onClick={closeSidebar}
            aria-hidden="true"
            className="fixed inset-0 z-50 bg-black/60 transition-colors will-change-[opacity]"
          />

          {/* Left-Side Sliding Navigation Drawer */}
          <motion.aside
            key="sidebar-drawer"
            ref={sidebarRef}
            role="dialog"
            aria-modal="true"
            aria-label="Sidebar navigation"
            id="sidebar-navigation"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(
              "fixed top-0 bottom-0 left-0 z-50",
              "w-[300px] sm:w-[360px] max-w-[85vw] h-full",
              "flex flex-col justify-between",
              "bg-card border-r border-border shadow-xl shadow-black/40",
              "text-foreground select-none will-change-transform transform-gpu"
            )}
          >
            {/* Header: Brand & Close X Button */}
            <div className="p-5 pb-4 border-b border-border/80 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/80 border border-border text-foreground">
                    <Code2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-base font-bold tracking-tight text-foreground">
                      Zenithen<span className="text-primary">Open</span>
                    </span>
                    <span className="text-[9px] font-medium text-muted-foreground tracking-wider uppercase">
                      Open Source Community
                    </span>
                  </div>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeSidebar}
                  aria-label="Close navigation"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground",
                    "hover:text-foreground hover:bg-muted/80 border border-transparent hover:border-border transition-colors duration-150 cursor-pointer",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin">
              {SIDEBAR_SECTIONS.map((section) => (
                <div key={section.sectionTitle} className="space-y-1.5">
                  <h3 className="px-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                    {section.sectionTitle}
                  </h3>
                  <nav className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={closeSidebar}
                          className={cn(
                            "group flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors duration-150 text-left border",
                            isActive
                              ? "bg-muted/90 border-border text-foreground shadow-xs font-medium"
                              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border/40"
                          )}
                        >
                          <div className="flex items-center space-x-3 min-w-0 pr-2">
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors shrink-0",
                                isActive
                                  ? "bg-background border-border text-primary"
                                  : "bg-muted/50 border-border/60 text-muted-foreground group-hover:text-foreground group-hover:border-border"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold leading-tight truncate text-foreground">
                                {item.title}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-normal leading-snug line-clamp-1">
                                {item.description}
                              </span>
                            </div>
                          </div>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 shrink-0 transition-transform duration-150",
                              isActive
                                ? "text-primary opacity-100"
                                : "text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5"
                            )}
                          />
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
