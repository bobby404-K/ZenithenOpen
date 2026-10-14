"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trophy,
  Info,
  ArrowRight,
  GitPullRequest,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentPreviewModal, StudentPreviewData } from "@/components/members/student-preview-modal";
import { StudentContributor } from "@/lib/data/student-competition";

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = React.useState<"week" | "month" | "overall">("month");
  const [sortBy, setSortBy] = React.useState<"quality" | "prs" | "open" | "closed" | "merged">("quality");
  const [competitors, setCompetitors] = React.useState<StudentContributor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Quick-Preview Student Card Modal State
  const [previewStudent, setPreviewStudent] = React.useState<StudentPreviewData | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = React.useState(false);

  const openStudentPreview = React.useCallback(
    (student: StudentContributor, stats: { qualityPrs?: number; prs?: number; openPrs?: number; closedPrs?: number; mergedPrs?: number }) => {
      setPreviewStudent({
        username: student.username,
        name: student.name,
        avatarUrl: student.avatarUrl,
        department: student.department,
        year: student.year,
        badge: student.badge,
        badgeColor: student.badgeColor,
        linkedinUrl: student.linkedinUrl,
        githubUrl: `https://github.com/${student.username}`,
        qualityPrs: stats.qualityPrs,
        totalPrs: stats.prs,
        openPrs: stats.openPrs,
        closedPrs: stats.closedPrs,
        mergedPrs: stats.mergedPrs ?? stats.prs,
      });
      setPreviewModalOpen(true);
    },
    []
  );

  // Fetch live student rankings from API
  const fetchLeaderboard = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/students/leaderboard?timeframe=${timeframe}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.competitors)) {
        setCompetitors(data.competitors);
      } else {
        setCompetitors([]);
      }
    } catch (err) {
      console.error("[LeaderboardPage] Failed to fetch leaderboard:", err);
      setCompetitors([]);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  React.useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      await fetch("/api/students/sync", { method: "POST" });
      await fetchLeaderboard();
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sort competitors: Tier 1: Quality Merge -> Tier 2: Quality Open PR -> Tier 3: Quality Closed PR -> Tier 4: Total Merges
  const sortedCompetitors = React.useMemo(() => {
    return [...competitors].sort((a, b) => {
      const statsA = a[timeframe] as unknown as { qualityPrs?: number; qualityOpenPrs?: number; qualityClosedPrs?: number; prs?: number; openPrs?: number; closedPrs?: number; mergedPrs?: number };
      const statsB = b[timeframe] as unknown as { qualityPrs?: number; qualityOpenPrs?: number; qualityClosedPrs?: number; prs?: number; openPrs?: number; closedPrs?: number; mergedPrs?: number };
      if (sortBy === "quality") {
        // Tier 1: Quality Merge (>=100 stars && >=100 forks, merged)
        const qDiff = (statsB.qualityPrs ?? 0) - (statsA.qualityPrs ?? 0);
        if (qDiff !== 0) return qDiff;

        // Tier 2: Quality Open PR (>=100 stars && >=100 forks, open)
        const qOpenB = statsB.qualityOpenPrs ?? statsB.openPrs ?? 0;
        const qOpenA = statsA.qualityOpenPrs ?? statsA.openPrs ?? 0;
        const openDiff = qOpenB - qOpenA;
        if (openDiff !== 0) return openDiff;

        // Tier 3: Quality Closed PR (>=100 stars && >=100 forks, closed unmerged)
        const qClosedB = statsB.qualityClosedPrs ?? statsB.closedPrs ?? 0;
        const qClosedA = statsA.qualityClosedPrs ?? statsA.closedPrs ?? 0;
        const closedDiff = qClosedB - qClosedA;
        if (closedDiff !== 0) return closedDiff;

        // Tier 4: Total Merges (all merged PRs on user's account)
        const mergeDiff = (statsB.mergedPrs ?? 0) - (statsA.mergedPrs ?? 0);
        if (mergeDiff !== 0) return mergeDiff;

        return a.username.localeCompare(b.username);
      }
      if (sortBy === "prs") return (statsB.prs ?? 0) - (statsA.prs ?? 0);
      if (sortBy === "open") return (statsB.openPrs ?? 0) - (statsA.openPrs ?? 0);
      if (sortBy === "closed") return (statsB.closedPrs ?? 0) - (statsA.closedPrs ?? 0);
      if (sortBy === "merged") return (statsB.mergedPrs ?? 0) - (statsA.mergedPrs ?? 0);
      return 0;
    });
  }, [competitors, timeframe, sortBy]);

  const topThree = sortedCompetitors.slice(0, 3);

  return (
    <div className="py-16 bg-background text-foreground min-h-screen transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            <Trophy className="h-4 w-4" />
            <span>Open Source Recognition</span>
          </div>
          <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Contributor Leaderboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Celebrating authentic IST student developers ranked by merged and quality pull requests across ZenithenOpen and global open-source repositories.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="gap-2 text-xs border-border cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Live PRs"}</span>
              </Button>
              <Link href="/programs#student-competition">
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md text-xs shrink-0 cursor-pointer">
                  <Sparkles className="h-4 w-4" />
                  <span>Sprint Arena & Rules</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Philosophy Banner */}
          <div className="mt-6 flex items-center space-x-2.5 text-xs text-foreground bg-card border border-border p-3.5 rounded-xl max-w-3xl">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>
              <strong>Quality Merge Standard:</strong> A pull request is recognized as a Quality Merge only if the repository has at least 100 stars AND 100 forks (&ge;100 stars and &ge;100 forks).
            </span>
          </div>

          {/* Controls Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Timeframe Selector */}
            <div className="flex rounded-xl bg-card p-1 border border-border text-xs w-full sm:w-auto">
              <button
                onClick={() => setTimeframe("week")}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  timeframe === "week"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Weekly Sprint
              </button>
              <button
                onClick={() => setTimeframe("month")}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  timeframe === "month"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Hall
              </button>
              <button
                onClick={() => setTimeframe("overall")}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  timeframe === "overall"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All-Time Rank
              </button>
            </div>

            {/* Sort Filter */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground self-start sm:self-auto">
              <span>Sort by:</span>
              <button
                onClick={() => setSortBy("quality")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === "quality"
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-500 font-semibold"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Quality Merge
              </button>
              <button
                onClick={() => setSortBy("prs")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === "prs"
                    ? "border-primary/40 bg-primary/15 text-primary font-semibold"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Total PR
              </button>
              <button
                onClick={() => setSortBy("open")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === "open"
                    ? "border-blue-500/40 bg-blue-500/15 text-blue-500 font-semibold"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Open PR
              </button>
              <button
                onClick={() => setSortBy("closed")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === "closed"
                    ? "border-rose-500/40 bg-rose-500/15 text-rose-500 font-semibold"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Closed PR
              </button>
              <button
                onClick={() => setSortBy("merged")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === "merged"
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-500 font-semibold"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Total Merges
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="mt-20 flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Computing live contributor rankings...</p>
          </div>
        ) : sortedCompetitors.length === 0 ? (
          /* Empty State */
          <div className="mt-12 rounded-2xl border border-border bg-card p-16 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 text-primary mb-4">
              <Trophy className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Leaderboard Awaiting First Pull Request</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              When student pull requests and code reviews are merged in GitHub repositories, rankings are computed automatically.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/programs#student-competition">
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-xs cursor-pointer">
                  <span>Explore Programs & Competitions</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {/* Top 3 Podium Cards */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topThree.map((student, idx) => {
                  const stats = (student[timeframe] as unknown as { mergedPrs?: number; qualityPrs?: number; openPrs?: number; closedPrs?: number; prs?: number; topContribution?: { title: string; prUrl: string } }) || {};
                  const rankNum = idx + 1;
                  const medalEmoji = rankNum === 1 ? "🥇" : rankNum === 2 ? "🥈" : "🥉";
                  const borderAccent =
                    rankNum === 1
                      ? "border-amber-500/50 shadow-amber-500/10 shadow-lg"
                      : rankNum === 2
                      ? "border-slate-400/50"
                      : "border-amber-700/50";

                  return (
                    <Card
                      key={student.id}
                      className={`relative p-6 bg-card border ${borderAccent} flex flex-col justify-between overflow-hidden group hover:shadow-xl transition-all`}
                    >
                      {/* Top Rank Badge & Quick Card Preview */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{medalEmoji}</span>
                          <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
                            Rank #{rankNum}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${student.badgeColor}`}>
                            {student.badge}
                          </Badge>
                        </div>
                      </div>

                      {/* Student Profile Info */}
                      <div className="mt-5 flex items-center space-x-4">
                        <Link href={`/members/${student.username}`} className="shrink-0">
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="h-14 w-14 rounded-full border-2 border-border object-cover group-hover:scale-105 transition-transform"
                          />
                        </Link>
                        <div>
                          <Link href={`/members/${student.username}`}>
                            <h3 className="font-bold text-foreground text-lg leading-tight hover:text-primary transition-colors">
                              {student.name}
                            </h3>
                          </Link>
                          <Link
                            href={`/members/${student.username}`}
                            className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 font-mono"
                          >
                            <span>@{student.username}</span>
                          </Link>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{student.department}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mt-6 pt-4 border-t border-border grid grid-cols-5 gap-1 text-center">
                        <div className="rounded-lg bg-amber-500/10 p-1.5 border border-amber-500/20">
                          <p className="text-sm font-extrabold text-amber-500">{stats.qualityPrs ?? 0}</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold truncate" title="Quality Merge">
                            Quality
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-1.5">
                          <p className="text-sm font-extrabold text-foreground">{stats.prs ?? 0}</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold truncate" title="Total PR">
                            Total PR
                          </p>
                        </div>
                        <div className="rounded-lg bg-blue-500/10 p-1.5 border border-blue-500/20">
                          <p className="text-sm font-extrabold text-blue-500">{stats.openPrs ?? 0}</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold truncate" title="Open PR">
                            Open
                          </p>
                        </div>
                        <div className="rounded-lg bg-rose-500/10 p-1.5 border border-rose-500/20">
                          <p className="text-sm font-extrabold text-rose-500">{stats.closedPrs ?? 0}</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold truncate" title="Closed PR">
                            Closed
                          </p>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 p-1.5 border border-emerald-500/20">
                          <p className="text-sm font-extrabold text-emerald-500">{stats.mergedPrs ?? stats.prs ?? 0}</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold truncate" title="Total Merges">
                            Merges
                          </p>
                        </div>
                      </div>

                      {/* Top Contribution Snippet */}
                      {stats.topContribution && (
                        <div className="mt-4 pt-3 border-t border-border/60 text-xs">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                            Top Contribution:
                          </p>
                          <a
                            href={stats.topContribution.prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:text-primary transition-colors line-clamp-1 font-medium flex items-center gap-1.5"
                          >
                            <GitPullRequest className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span>{stats.topContribution.title}</span>
                          </a>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Complete Rankings Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-base">All Contributor Rankings</h3>
                  <p className="text-xs text-muted-foreground">
                    Real-time verified pull requests for {timeframe === "week" ? "this week" : timeframe === "month" ? "this month" : "all-time"}.
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {sortedCompetitors.length} active developers
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border uppercase font-mono text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-16">Rank</th>
                      <th className="py-3 px-4">Contributor</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-center">Quality Merge</th>
                      <th className="py-3 px-4 text-center">Total PR</th>
                      <th className="py-3 px-4 text-center">Open PR</th>
                      <th className="py-3 px-4 text-center">Closed PR</th>
                      <th className="py-3 px-4 text-center">Total Merges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedCompetitors.map((student, idx) => {
                      const stats = (student[timeframe] as unknown as { mergedPrs?: number; qualityPrs?: number; openPrs?: number; closedPrs?: number; prs?: number }) || {};
                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-muted-foreground">
                            #{idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <Link href={`/members/${student.username}`} className="shrink-0">
                                <img
                                  src={student.avatarUrl}
                                  alt={student.name}
                                  className="h-8 w-8 rounded-full border border-border object-cover hover:scale-105 transition-transform"
                                />
                              </Link>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <Link
                                    href={`/members/${student.username}`}
                                    className="font-bold text-foreground hover:text-primary transition-colors block"
                                  >
                                    {student.name}
                                  </Link>
                                </div>
                                <Link
                                  href={`/members/${student.username}`}
                                  className="text-[11px] text-muted-foreground hover:text-primary font-mono inline-flex items-center gap-1"
                                >
                                  @{student.username}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                            {student.department}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-amber-500 text-sm">
                            {stats.qualityPrs ?? 0}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-foreground">
                            {stats.prs ?? 0}
                          </td>
                          <td className="py-3.5 px-4 text-center text-blue-500 font-semibold">
                            {stats.openPrs ?? 0}
                          </td>
                          <td className="py-3.5 px-4 text-center text-rose-500 font-semibold">
                            {stats.closedPrs ?? 0}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-emerald-600 text-sm">
                            {stats.mergedPrs ?? stats.prs ?? 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Quick-Preview Student Card Modal */}
        <StudentPreviewModal
          student={previewStudent}
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
        />
      </div>
    </div>
  );
}
