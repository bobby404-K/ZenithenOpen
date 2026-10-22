"use client";

import * as React from "react";
import { THEMES } from "@/lib/themes";
import { useTheme } from "./theme-provider";
import { Check, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeMenu() {
  const { theme, setTheme, isMenuOpen, closeMenu, menuAnchor } = useTheme();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const activeItemRef = React.useRef<HTMLButtonElement>(null);

  // Click outside to dismiss
  React.useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Check if click originated from theme triggers
        const target = event.target as HTMLElement | null;
        if (target?.closest("[data-theme-trigger]")) {
          return;
        }
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, closeMenu]);

  // Focus active item when menu opens
  React.useEffect(() => {
    if (isMenuOpen && activeItemRef.current) {
      activeItemRef.current.focus();
    }
  }, [isMenuOpen]);

  // Keyboard navigation through themes (Arrow Up/Down)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (index + 1) % THEMES.length;
      const buttons = menuRef.current?.querySelectorAll<HTMLButtonElement>("[data-theme-option]");
      buttons?.[nextIndex]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + THEMES.length) % THEMES.length;
      const buttons = menuRef.current?.querySelectorAll<HTMLButtonElement>("[data-theme-option]");
      buttons?.[prevIndex]?.focus();
    }
  };

  if (!isMenuOpen) return null;

  // Compute position based on anchor: navbar or bottom-left floating
  const positionClasses =
    menuAnchor === "navbar"
      ? "top-16 left-4 sm:left-8 origin-top-left"
      : "bottom-20 left-4 sm:left-6 origin-bottom-left";

  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-label="Theme selection menu"
      aria-modal="true"
      className={cn(
        "fixed z-50 w-[320px] max-w-[calc(100vw-32px)] rounded-2xl p-3",
        "bg-card/95 backdrop-blur-2xl border border-border shadow-2xl shadow-black/50",
        "animate-in fade-in-0 zoom-in-95 duration-200 ease-out",
        positionClasses
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-tight text-foreground">
              Themes
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Instant design token switching
            </p>
          </div>
        </div>
        <button
          onClick={closeMenu}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Close theme menu"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Theme List */}
      <div className="mt-2 space-y-1 max-h-[360px] overflow-y-auto pr-0.5" role="menu">
        {THEMES.map((item, index) => {
          const isSelected = theme === item.id;
          return (
            <button
              key={item.id}
              ref={isSelected ? activeItemRef : undefined}
              data-theme-option={item.id}
              role="menuitemradio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onClick={() => {
                setTheme(item.id);
                closeMenu();
              }}
              className={cn(
                "group w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                isSelected
                  ? "bg-primary/10 border border-primary/30 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* 3-Color Swatch Preview */}
                <div
                  className="flex items-center -space-x-1 shrink-0 p-0.5 rounded-full bg-background/80 border border-border/80"
                  title={`${item.name} color palette`}
                >
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-background"
                    style={{ backgroundColor: item.swatches[0] }}
                  />
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-background"
                    style={{ backgroundColor: item.swatches[1] }}
                  />
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-background"
                    style={{ backgroundColor: item.swatches[2] }}
                  />
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("truncate font-medium", isSelected ? "text-foreground" : "text-foreground/90")}>
                      {item.name}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-primary/20 text-primary border border-primary/30">
                        active
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {item.tagline}
                  </div>
                </div>
              </div>

              {/* Checkmark Indicator */}
              <div className="shrink-0 pl-2">
                {isSelected ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border border-border/70 group-hover:border-foreground/30 transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between px-2 text-[10px] text-muted-foreground font-mono">
        <span>Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">ESC</kbd> to exit</span>
        <span className="text-primary font-semibold capitalize">{theme}</span>
      </div>
    </div>
  );
}
