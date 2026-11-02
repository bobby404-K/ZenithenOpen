"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trophy,
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
import { ContributorRankingsTable } from "@/components/leaderboard/contributor-rankings-table";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = React.useState<"week" | "month" | "overall">("month");
  const [sortBy, setSortBy] = React.useState<"merged" | "issues" | "open" | "closed">("merged");
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

  // Sort competitors: Tier 1: Merged PRs -> Tier 2: Issues Opened -> Tier 3: Open PRs -> Tier 4: Closed PRs
  const sortedCompetitors = React.useMemo(() => {
    return [...competitors].sort((a, b) => {
      const statsA = a[timeframe];
      const statsB = b[timeframe];
      if (sortBy === "merged") {
        const mDiff = (statsB.mergedPrs ?? 0) - (statsA.mergedPrs ?? 0);
        if (mDiff !== 0) return mDiff;
        const iDiff = (statsB.issuesOpened ?? 0) - (statsA.issuesOpened ?? 0);
        if (iDiff !== 0) return iDiff;
        const openDiff = (statsB.openPrs ?? 0) - (statsA.openPrs ?? 0);
        if (openDiff !== 0) return openDiff;
        const closedDiff = (statsB.closedPrs ?? 0) - (statsA.closedPrs ?? 0);
        if (closedDiff !== 0) return closedDiff;
        return a.username.localeCompare(b.username);
      }
      if (sortBy === "issues") {
        const iDiff = (statsB.issuesOpened ?? 0) - (statsA.issuesOpened ?? 0);
        if (iDiff !== 0) return iDiff;
        const mDiff = (statsB.mergedPrs ?? 0) - (statsA.mergedPrs ?? 0);
        if (mDiff !== 0) return mDiff;
        return (statsB.openPrs ?? 0) - (statsA.openPrs ?? 0);
      }
      if (sortBy === "open") return (statsB.openPrs ?? 0) - (statsA.openPrs ?? 0);
      if (sortBy === "closed") return (statsB.closedPrs ?? 0) - (statsA.closedPrs ?? 0);
      return 0;
    });
  }, [competitors, timeframe, sortBy]);

  const topThree = sortedCompetitors.slice(0, 3);

  const tableContributors = React.useMemo(() => {
    return sortedCompetitors.map((student, idx) => ({
      id: student.id,
      name: student.name,
      username: student.username,
      avatarUrl: student.avatarUrl,
      mergedPrs: student[timeframe]?.mergedPrs ?? 0,
      issuesOpened: student[timeframe]?.issuesOpened ?? 0,
      openPrs: student[timeframe]?.openPrs ?? 0,
      closedPrs: student[timeframe]?.closedPrs ?? 0,
      rank: idx + 1,
      githubUrl: student.githubUrl,
      linkedinUrl: student.linkedinUrl,
    }));
  }, [sortedCompetitors, timeframe]);

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
                Celebrating authentic student developers ranked by open-source contributions across merged PRs, opened issues, active PRs, and closed PRs.
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

            {/* Sort Filter: Merged, Issues Opened, PR Open, Closed PR */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground self-start sm:self-auto">
              <span>Sort by:</span>
              <button
                onClick={() => setSortBy("merged")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === "merged"
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-500 font-semibold"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Merged
              </button>
              <button
                onClick={() => setSortBy("issues")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === "issues"
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-500 font-semibold"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Issues Opened
              </button>
              <button
                onClick={() => setSortBy("open")}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === "open"
                    ? "border-blue-500/40 bg-blue-500/15 text-blue-500 font-semibold"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                PR Open
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
                  const stats = student[timeframe];
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <Link
                              href={`/members/${student.username}`}
                              className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 font-mono"
                            >
                              <span>@{student.username}</span>
                            </Link>
                            <a
                              href={student.githubUrl || `https://github.com/${student.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground p-0.5 transition-colors cursor-pointer"
                              title={`Verified GitHub: @${student.username}`}
                              aria-label={`GitHub profile for ${student.username}`}
                            >
                              <GithubIcon className="h-3.5 w-3.5" />
                            </a>
                            <a
                              href={student.linkedinUrl || `https://linkedin.com/in/${student.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0A66C2] hover:text-[#004182] p-0.5 transition-colors cursor-pointer"
                              title={`Verified LinkedIn: ${student.name}`}
                              aria-label={`LinkedIn profile for ${student.name}`}
                            >
                              <LinkedinIcon className="h-3.5 w-3.5" />
                            </a>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{student.year}</p>
                        </div>
                      </div>

                      {/* Stats: Merged, Issues Opened, PR Open, Closed PR */}
                      <div className="mt-6 pt-4 border-t border-border grid grid-cols-4 gap-1.5 text-center">
                        <div className="rounded-lg bg-emerald-500/10 p-1.5 border border-emerald-500/20">
                          <p className="text-sm font-extrabold text-emerald-500">{stats.mergedPrs ?? 0}</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold truncate" title="Merged PRs">
                            Merged
                          </p>
                        </div>
                        <div className="rounded-lg bg-amber-500/10 p-1.5 border border-amber-500/20">
                          <p className="text-sm font-extrabold text-amber-500">{stats.issuesOpened ?? 0}</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold truncate" title="Issues Opened">
                            Issues
                          </p>
                        </div>
                        <div className="rounded-lg bg-blue-500/10 p-1.5 border border-blue-500/20">
                          <p className="text-sm font-extrabold text-blue-500">{stats.openPrs ?? 0}</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold truncate" title="Open PRs">
                            PR Open
                          </p>
                        </div>
                        <div className="rounded-lg bg-rose-500/10 p-1.5 border border-rose-500/20">
                          <p className="text-sm font-extrabold text-rose-500">{stats.closedPrs ?? 0}</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold truncate" title="Closed PRs">
                            Closed PR
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
            <ContributorRankingsTable
              contributors={tableContributors}
              title="All Contributor Rankings"
              subtitle={`Real-time verified pull requests for ${timeframe === "week" ? "this week" : timeframe === "month" ? "this month" : "all-time"}.`}
              developerCountLabel={`${sortedCompetitors.length} active developers`}
            />
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
