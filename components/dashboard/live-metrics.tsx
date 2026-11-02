"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Users,
  GitPullRequest,
  GitPullRequestClosed,
  FolderGit2,
  Award,
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
        if (json) {
          const payload = json.metrics || json.data || json;
          setMetrics(payload);
        }
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
      glowColor: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      label: "Quality PRs Merged",
      value: metrics.qualityPrsMerged ?? 0,
      formatted: `${metrics.qualityPrsMerged ?? 0}`,
      subtext: "Merged in top repositories",
      icon: Award,
      glowColor: "from-secondary/20 to-secondary/5",
      iconColor: "text-secondary",
    },
    {
      label: "Campus Repositories",
      value: metrics.activeRepositories,
      formatted: `${metrics.activeRepositories}`,
      subtext: "Tracked from IST-ZenithenLab",
      icon: FolderGit2,
      glowColor: "from-primary/20 to-secondary/5",
      iconColor: "text-primary",
    },
    {
      label: "Pull Requests Merged",
      value: metrics.prsMerged,
      formatted: `${metrics.prsMerged}`,
      subtext: "Merged into campus repositories",
      icon: GitPullRequest,
      glowColor: "from-accent/20 to-accent/5",
      iconColor: "text-accent",
    },
    {
      label: "Open PRs",
      value: metrics.openPrs ?? 0,
      formatted: `${metrics.openPrs ?? 0}`,
      subtext: "Under review & active triage",
      icon: GitPullRequest,
      glowColor: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-400",
    },
    {
      label: "Closed PRs",
      value: metrics.closedPrs ?? 0,
      formatted: `${metrics.closedPrs ?? 0}`,
      subtext: "Completed & archived work",
      icon: GitPullRequestClosed,
      glowColor: "from-rose-500/20 to-rose-500/5",
      iconColor: "text-rose-400",
    },
    {
      label: "First PRs Celebrated",
      value: metrics.firstPrsMerged,
      formatted: `${metrics.firstPrsMerged}`,
      subtext: "First-time open source contributors",
      icon: Sparkles,
      glowColor: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-400",
    },
    {
      label: "Monthly Activity",
      value: metrics.contributionsThisMonth,
      formatted: `${metrics.contributionsThisMonth}`,
      subtext: "Commits, reviews & issue triage",
      icon: TrendingUp,
      glowColor: "from-accent/20 to-primary/5",
      iconColor: "text-accent",
    },
  ];

  return (
    <section className="relative w-full py-14 bg-background transition-colors overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with 3D Entrance */}
        <motion.div
          className="pb-6 border-b border-border mb-8 transform-gpu"
          initial={{ opacity: 0, y: -24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Our community
          </h2>
        </motion.div>

        {/* Metrics Grid with Hardware-Accelerated 3D Pop Entrance */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 [perspective:1000px]"
        >
          {metricCards.map((item, index) => {
            const Icon = item.icon;
            const colIndex = index % 4;
            const initialRotateY = colIndex === 0 ? -6 : colIndex === 1 ? -2 : colIndex === 2 ? 2 : 6;

            return (
              <motion.div
                key={item.label}
                initial={{
                  opacity: 0,
                  y: -50,
                  rotateX: 16,
                  rotateY: initialRotateY,
                  scale: 0.94,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  rotateY: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                className="h-full transform-gpu will-change-transform"
              >
                <Card
                  className="group relative overflow-hidden p-6 hover:border-primary/40 hover:shadow-lg transition-all border-border bg-card h-full"
                >
                  {/* Subtle ambient light */}
                  <div
                    className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${item.glowColor} blur-2xl transition-transform duration-300 group-hover:scale-125 pointer-events-none transform-gpu`}
                  />

                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                        {item.formatted}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {item.subtext}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl bg-muted/50 p-3 border border-border group-hover:border-primary/40 transition-colors ${item.iconColor}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
