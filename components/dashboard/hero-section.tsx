"use client";

import { ArrowRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { FloatingOrgBadges } from "@/components/hero/floating-org-badges";
import { useNavigation } from "@/components/navigation/navigation-context";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { isSidebarOpen } = useNavigation();

  return (
    <section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-32 min-h-[820px] flex items-center justify-center bg-background border-b border-border transition-colors">
      {/* Floating Badges Constellation of Top GitHub Organizations - Smoothly fades out when menu opens */}
      <div
        className={cn(
          "absolute inset-0 overflow-hidden pointer-events-none transition-all duration-300 ease-in-out",
          isSidebarOpen
            ? "opacity-0 scale-98 pointer-events-none"
            : "opacity-100 scale-100"
        )}
        aria-hidden={isSidebarOpen}
      >
        <FloatingOrgBadges isPaused={isSidebarOpen} />
      </div>

      {/* Ambient background glow highlights responding to theme tokens with GPU acceleration */}
      <div
        className={cn(
          "absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[400px] blur-3xl pointer-events-none rounded-full transition-opacity duration-300 transform-gpu will-change-[opacity]",
          isSidebarOpen ? "opacity-20" : "opacity-70"
        )}
        style={{
          background: "radial-gradient(circle, var(--glow) 0%, transparent 70%)",
        }}
      />
      <div
        className={cn(
          "absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] blur-3xl pointer-events-none rounded-full transition-opacity duration-300 transform-gpu will-change-[opacity]",
          isSidebarOpen ? "opacity-20" : "opacity-70"
        )}
        style={{
          background: "radial-gradient(circle, var(--glow-secondary) 0%, transparent 70%)",
        }}
      />

      {/* Left-Aligned Hero Content - Smoothly animates toward left when menu opens */}
      <div
        className={cn(
          "relative z-10 pointer-events-none w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left",
          "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
          isSidebarOpen
            ? "-translate-x-4 sm:-translate-x-10 md:-translate-x-16 lg:-translate-x-20 xl:-translate-x-24"
            : "translate-x-0"
        )}
      >
        {/* Hero Title */}
        <h1 className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
          <span className="text-foreground block">Every contributor makes us stronger,</span>
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent block mt-2">
            No contribution is too small.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
          The collaborative open-source engineering workspace for IST student developers.
          Connect your GitHub account to sync real repositories, claim verified beginner issues, and master distributed development.
        </p>

        {/* Action Button - Connect GitHub Org */}
        <div className="mt-8 flex pointer-events-auto items-center justify-start gap-4">
          <a
            href="https://github.com/IST-ZenithenLab"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="gap-2.5 shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 font-semibold text-primary-foreground">
              <GithubIcon className="h-4 w-4" />
              <span>Connect GitHub Org</span>
              <ArrowRight className="h-4 w-4 ml-0.5" />
            </Button>
          </a>
        </div>

        {/* High-Tech Terminal Console Card */}
        <div className="mt-16 max-w-3xl pointer-events-auto rounded-2xl border border-border bg-card/90 p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl text-left font-mono text-xs transition-colors">
          <div className="flex items-center justify-between border-b border-border/80 pb-3 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-[11px] text-muted-foreground">zenithen-open-cli — v1.0.0</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span>Daemon Ready</span>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-foreground/80 leading-relaxed">
            <p className="text-muted-foreground">
              <span className="text-accent">$</span> zenithen connect --org <span className="text-primary">IST-ZenithenLab</span>
            </p>
            <p className="text-primary">
              ✔ Authenticated with GitHub OAuth & Octokit API client
            </p>
            <p className="text-muted-foreground">
              ✔ PostgreSQL 16 & Redis 7 cache services healthy
            </p>
            <p className="text-amber-400">
              ℹ Repository sync pending: Awaiting webhook setup or manual repository trigger
            </p>
            <p className="text-secondary">
              ✦ Ready to track live pull requests, code reviews, and student contributors!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
