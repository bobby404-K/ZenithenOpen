"use client";

import Link from "next/link";
import {
  ArrowRight,
  Terminal,
  CheckCircle2,
  Sparkles,
  GitBranch,
  FolderGit2,
  ExternalLink,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingOrgBadges } from "@/components/hero/floating-org-badges";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-32 min-h-[820px] flex items-center justify-center bg-white border-b border-slate-100">
      {/* Floating Badges Constellation of Top GitHub Organizations */}
      <FloatingOrgBadges />

      {/* Ambient background glow highlights: Soft pastel violet/blue radial glow */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/8 to-purple-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-gradient-to-tr from-blue-500/8 via-purple-500/8 to-emerald-500/6 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/6 blur-[110px] pointer-events-none rounded-full" />

      <div className="relative z-10 pointer-events-none mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Status Pill */}
        <div className="inline-flex pointer-events-auto items-center space-x-2.5 rounded-full border border-slate-200/90 bg-white/80 px-4 py-1.5 text-xs text-slate-700 backdrop-blur-xl shadow-sm mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-800">S-VYASA University Open Source Chapter</span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-600 font-mono text-[11px] font-semibold">IST-ZenithenLab</span>
        </div>

        {/* Hero Title */}
        <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 leading-[1.1]">
          We don&apos;t just learn to code. <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            We build & ship.
          </span>
        </h1>

        {/* Subtitle - Authentic & honest */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          The collaborative open-source engineering workspace for S-VYASA students and mentors.
          Connect your GitHub account to sync real repositories, claim verified beginner issues, and master distributed development.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex pointer-events-auto flex-wrap items-center justify-center gap-4">
          <a
            href="https://github.com/IST-ZenithenLab"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="gap-2.5 shadow-xl shadow-blue-600/25 bg-blue-600 hover:bg-blue-700 font-semibold text-white">
              <GithubIcon className="h-4 w-4" />
              <span>Connect GitHub Org</span>
              <ArrowRight className="h-4 w-4 ml-0.5" />
            </Button>
          </a>

          <Link href="/learning">
            <Button size="lg" variant="outline" className="gap-2 border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 shadow-sm">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>Explore Curriculum Roadmaps</span>
            </Button>
          </Link>
        </div>

        {/* High-Tech Terminal Console Card */}
        <div className="mx-auto mt-16 max-w-3xl pointer-events-auto rounded-2xl border border-slate-200/80 bg-[#090d16] p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl text-left font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-[11px] text-slate-400">zenithen-open-cli — v1.0.0</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Daemon Ready</span>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-slate-300 leading-relaxed">
            <p className="text-slate-400">
              <span className="text-emerald-400">$</span> zenithen connect --org <span className="text-blue-300">IST-ZenithenLab</span>
            </p>
            <p className="text-blue-400">
              ✔ Authenticated with GitHub OAuth & Octokit API client
            </p>
            <p className="text-slate-400">
              ✔ PostgreSQL 16 & Redis 7 cache services healthy
            </p>
            <p className="text-amber-300">
              ℹ Repository sync pending: Awaiting webhook setup or manual repository trigger
            </p>
            <p className="text-purple-300">
              ✦ Ready to track live pull requests, code reviews, and student contributors!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
