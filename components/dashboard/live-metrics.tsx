"use client";

import * as React from "react";
import {
  Users,
  GitPullRequest,
  FolderGit2,
  GitCommit,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { COMMUNITY_METRICS } from "@/lib/data/mock-data";

export function LiveMetricsDashboard() {
  const [metrics, setMetrics] = React.useState(COMMUNITY_METRICS);

  React.useEffect(() => {
    fetch("/api/metrics")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setMetrics(json.data || json);
      })
      .catch(() => {});
  }, []);

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
        {/* Section Header */}
        <div className="pb-6 border-b border-slate-200/80 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Our community
          </h2>
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
