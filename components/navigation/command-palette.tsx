"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  User,
  FolderGit2,
  FileCode,
  Compass,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchResultItem } from "@/app/api/search/route";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input on open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Fetch search results from /api/search
  React.useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.append("q", query.trim());
        if (activeCategory !== "all") params.append("category", activeCategory);
        params.append("limit", "16");

        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        if (isMounted && data.success && Array.isArray(data.results)) {
          setResults(data.results);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.warn("[CommandPalette] Search fetch notice:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 80);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, activeCategory, isOpen]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        results.length > 0 ? (prev - 1 + results.length) % results.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    router.push(item.url);
  };

  if (!isOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onKeyDown={handleKeyDown}
    >
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Command Palette Card */}
      <div
        id="command-palette-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Global Search and Quick Navigation"
        className="relative w-full max-w-2xl rounded-2xl border border-border/80 bg-gradient-to-b from-card via-background to-card/95 shadow-2xl overflow-hidden z-10 text-foreground ring-1 ring-primary/20"
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-border/70 relative">
          <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contributors, campus repositories, roadmaps, pages..."
            className="w-full bg-transparent text-sm sm:text-base font-medium placeholder:text-muted-foreground focus:outline-none text-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-muted-foreground hover:text-foreground mr-2 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            id="close-command-palette-btn"
            onClick={onClose}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-mono border border-border cursor-pointer transition-colors"
          >
            <span>ESC</span>
          </button>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/40 bg-muted/20 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: "all", label: "All Items" },
            { id: "contributor", label: "Contributors" },
            { id: "project", label: "Repositories" },
            { id: "page", label: "Pages" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {loading && results.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Searching campus platform...
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No results found matching &quot;{query}&quot;. Try another term.
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  id={`command-item-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all",
                    isSelected
                      ? "bg-primary/15 text-primary border border-primary/30 shadow-xs"
                      : "hover:bg-muted/60 text-foreground border border-transparent"
                  )}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
                        item.category === "contributor"
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                          : item.category === "project"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                      )}
                    >
                      {item.category === "contributor" ? (
                        <User className="h-4 w-4" />
                      ) : item.category === "project" ? (
                        <FolderGit2 className="h-4 w-4" />
                      ) : (
                        <Compass className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm leading-tight text-foreground truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[10px] font-mono px-2 py-0.5 rounded border font-semibold shrink-0",
                              item.badgeColor || "text-primary bg-primary/10 border-primary/20"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="ml-3 shrink-0 flex items-center text-muted-foreground">
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-primary font-semibold">
                        <span>Jump</span>
                        <CornerDownLeft className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2.5 border-t border-border/70 bg-card/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">↓</kbd>
              <span className="text-[10px]">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">↵</kbd>
              <span className="text-[10px]">Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">ESC</kbd>
              <span className="text-[10px]">Close</span>
            </span>
          </div>
          <span className="hidden sm:inline text-primary font-semibold">ZenithenOpen Fast Jump</span>
        </div>
      </div>
    </div>
  );
}
