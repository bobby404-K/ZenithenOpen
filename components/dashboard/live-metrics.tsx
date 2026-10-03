"use client";

import * as React from "react";
import {
  Users,
  GitPullRequest,
  FolderGit2,
  GitCommit,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { COMMUNITY_METRICS } from "@/lib/data/mock-data";

export function LiveMetricsDashboard() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [metrics, setMetrics] = React.useState(COMMUNITY_METRICS);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/metrics");
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.data || json);
      }
    } catch {
      // Fallback
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const metricCards = [
    {
      label: "Registered Contributors",
      value: metrics.totalMembers,
      formatted: `${metrics.totalMembers}`,
      subtext: "Students linked via GitHub OAuth",
      icon: Users,
      glowColor: "from-blue-600/20 to-blue-400/5",
      iconColor: "text-blue-400",
    },
    {
      label: "Pull Requests Merged",
      value: metrics.prsMerged,
      formatted: `${metrics.prsMerged}`,
      subtext: "Merged into campus repositories",
      icon: GitPullRequest,
      glowColor: "from-purple-600/20 to-purple-400/5",
      iconColor: "text-purple-400",
    },
    {
      label: "Synced Repositories",
      value: metrics.activeRepositories,
      formatted: `${metrics.activeRepositories}`,
      subtext: "Tracked from IST-ZenithenLab",
      icon: FolderGit2,
      glowColor: "from-indigo-600/20 to-indigo-400/5",
      iconColor: "text-indigo-400",
    },
    {
      label: "Code Reviewers",
      value: metrics.codeReviewsCount,
      formatted: `${metrics.codeReviewsCount}`,
      subtext: "Peer reviews & architectural guidance",
      icon: GitCommit,
      glowColor: "from-emerald-600/20 to-emerald-400/5",
      iconColor: "text-emerald-400",
    },
    {
      label: "First PRs Celebrated",
      value: metrics.firstPrsMerged,
      formatted: `${metrics.firstPrsMerged}`,
      subtext: "First-time open source contributors",
      icon: Sparkles,
      glowColor: "from-amber-600/20 to-amber-400/5",
      iconColor: "text-amber-400",
    },
    {
      label: "Monthly Activity",
      value: metrics.contributionsThisMonth,
      formatted: `${metrics.contributionsThisMonth}`,
      subtext: "Commits, reviews & issue triage",
      icon: TrendingUp,
      glowColor: "from-cyan-600/20 to-cyan-400/5",
      iconColor: "text-cyan-400",
    },
  ];

  return (
    <section className="relative w-full py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header & Sync status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 font-mono">
                Live GitHub Telemetry
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Community Metrics Engine
            </h2>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <span className="flex items-center space-x-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-mono text-[11px]">Real-time Sync</span>
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
              />
              <span>{isRefreshing ? "Querying..." : "Sync Now"}</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {metricCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="group relative overflow-hidden p-6 hover:border-slate-300 hover:shadow-md transition-all"
              >
                {/* Subtle ambient light */}
                <div
                  className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${item.glowColor} blur-2xl transition-all duration-300 group-hover:scale-150`}
                />

                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
                      {item.formatted}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {item.subtext}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl bg-slate-50 p-3 border border-slate-200 group-hover:border-blue-300 transition-colors ${item.iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
