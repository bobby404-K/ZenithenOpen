"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trophy,
  GitPullRequest,
  CheckSquare,
  Flame,
  Award,
  Sparkles,
  Info,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_LEADERBOARD } from "@/lib/data/mock-data";

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = React.useState<"monthly" | "allTime">("monthly");
  const [sortBy, setSortBy] = React.useState<"prs" | "reviews" | "commits">("prs");

  const sortedLeaderboard = [...MOCK_LEADERBOARD].sort((a, b) => {
    if (sortBy === "prs") return b.prsMerged - a.prsMerged;
    if (sortBy === "reviews") return b.codeReviews - a.codeReviews;
    return b.commitsCount - a.commitsCount;
  });

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-purple-600 font-mono">
            <Trophy className="h-4 w-4" />
            <span>Open Source Recognition</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-2">
            Contributor Leaderboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
            Celebrating S-VYASA student developers who contribute, review, and ship code together.
            We prioritize steady progress and constructive code reviews over raw volume.
          </p>

          {/* Philosophy Banner */}
          <div className="mt-4 flex items-center space-x-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-xl max-w-2xl">
            <Info className="h-4 w-4 text-purple-600 shrink-0" />
            <span>
              <strong>Psychological Safety First:</strong> Every contribution counts—from fixing documentation typos to shipping distributed systems.
            </span>
          </div>

          {/* Controls Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                onClick={() => setTimeframe("monthly")}
                className={`px-4 py-1.5 rounded-lg font-semibold transition-colors ${
                  timeframe === "monthly"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                October 2026 (Monthly)
              </button>
              <button
                onClick={() => setTimeframe("allTime")}
                className={`px-4 py-1.5 rounded-lg font-semibold transition-colors ${
                  timeframe === "allTime"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All-Time Hall
              </button>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>Sort by:</span>
              <button
                onClick={() => setSortBy("prs")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  sortBy === "prs"
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                }`}
              >
                PRs Merged
              </button>
              <button
                onClick={() => setSortBy("reviews")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  sortBy === "reviews"
                    ? "border-purple-300 bg-purple-50 text-purple-700"
                    : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                }`}
              >
                Code Reviews
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Entries or Zero State */}
        {sortedLeaderboard.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 mb-4">
              <Trophy className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Leaderboard Awaiting First Pull Request</h3>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              When student pull requests and code reviews are merged in GitHub repositories, rankings are computed automatically.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/learning">
                <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs shadow-sm">
                  <span>Start a Learning Roadmap</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
