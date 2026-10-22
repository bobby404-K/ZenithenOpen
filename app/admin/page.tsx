"use client";

import * as React from "react";
import {
  ShieldCheck,
  Users,
  FolderGit2,
  Compass,
  CheckCircle2,
  Lock,
  RefreshCw,
  ExternalLink,
  Star,
  GitFork,
  Tag,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Member, Project, Opportunity } from "@/types";

interface CommunityMetricsState {
  totalMembers: number;
  totalContributors: number;
  prsMerged: number;
  qualityPrsMerged: number;
  activeRepositories: number;
  openSourceProjects: number;
  lastUpdated?: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = React.useState<"members" | "projects" | "opportunities">("members");
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<string | null>(null);

  const [metrics, setMetrics] = React.useState<CommunityMetricsState | null>(null);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAdminData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsRes, membersRes, projectsRes, oppsRes] = await Promise.all([
        fetch("/api/metrics", { cache: "no-store" }),
        fetch("/api/members", { cache: "no-store" }),
        fetch("/api/projects", { cache: "no-store" }),
        fetch("/api/opportunities", { cache: "no-store" }),
      ]);

      if (metricsRes.ok) {
        const mJson = await metricsRes.json();
        if (mJson.data || mJson.metrics) {
          setMetrics(mJson.data || mJson.metrics);
        }
      }

      if (membersRes.ok) {
        const memJson = await membersRes.json();
        if (Array.isArray(memJson.members)) {
          setMembers(memJson.members);
        }
      }

      if (projectsRes.ok) {
        const pJson = await projectsRes.json();
        if (Array.isArray(pJson.projects)) {
          setProjects(pJson.projects);
        }
      }

      if (oppsRes.ok) {
        const oJson = await oppsRes.json();
        if (Array.isArray(oJson.opportunities)) {
          setOpportunities(oJson.opportunities);
        }
      }
    } catch (err) {
      console.error("[AdminPage] Error loading platform data:", err);
      setError("Failed to stream live telemetry from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleSyncTrigger = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus("Triggering organization GitHub sync...");

      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "all" }),
      });

      const json = await res.json().catch(() => ({}));

      // Revalidate and fetch fresh telemetry
      await fetchAdminData();

      const memberCount = json.stats?.syncedMembersCount ?? members.length;
      const prCount = json.stats?.totalPrsSynced ?? 0;
      setSyncStatus(`Sync complete: ${memberCount} members & ${prCount} PRs updated!`);
      setTimeout(() => {
        setSyncStatus(null);
      }, 4000);
    } catch (err) {
      console.error("[AdminPage] Sync failed:", err);
      setSyncStatus("Sync failed. Check API logs.");
      setTimeout(() => {
        setSyncStatus(null);
      }, 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  const membersCount = metrics?.totalMembers ?? members.length;
  const reposCount = metrics?.activeRepositories ?? projects.length;
  const issuesCount = opportunities.length;

  return (
    <div className="py-16 bg-background text-foreground min-h-screen transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-border pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
              <ShieldCheck className="h-4 w-4" />
              <span>Governance & Administration</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">
              Admin Governance Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Platform telemetry, repository indexing, mentor assignments, and role access controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {syncStatus && (
              <span className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-accent/15 text-accent border border-accent/25 font-mono">
                <CheckCircle2 className="h-3 w-3" />
                <span>{syncStatus}</span>
              </span>
            )}
            <button
              onClick={handleSyncTrigger}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 bg-card hover:bg-muted px-3 py-1.5 rounded-lg border border-border text-xs text-foreground shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
              <span>{isSyncing ? "Triggering Sync..." : "Trigger GitHub Sync"}</span>
            </button>
            <span className="flex items-center space-x-1.5 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg text-xs text-primary font-mono">
              <Lock className="h-3 w-3 text-primary" />
              <span>ADMIN_MODE</span>
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 text-xs font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Governance Stat Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <Card className="p-6 border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Registered Members
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-1 font-mono">
                  {loading ? "..." : membersCount}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary p-1.5 rounded-xl bg-primary/10 border border-primary/20" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1 text-accent" />
              <span>{membersCount > 0 ? "Connected via Supabase Database" : "Awaiting first user OAuth registration"}</span>
            </p>
          </Card>

          <Card className="p-6 border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Managed Repositories
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-1 font-mono">
                  {loading ? "..." : reposCount}
                </p>
              </div>
              <FolderGit2 className="h-8 w-8 text-secondary p-1.5 rounded-xl bg-secondary/10 border border-secondary/20" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Organization sync target: IST-ZenithenLab
            </p>
          </Card>

          <Card className="p-6 border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Open Starter Issues
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-1 font-mono">
                  {loading ? "..." : issuesCount}
                </p>
              </div>
              <Compass className="h-8 w-8 text-accent p-1.5 rounded-xl bg-accent/10 border border-accent/20" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 flex items-center">
              <span>{issuesCount > 0 ? "Live GitHub issues indexed" : "Ready for GitHub issue webhook ingestion"}</span>
            </p>
          </Card>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
          <div className="flex space-x-2">
            {(
              [
                { id: "members", label: "Members", count: members.length },
                { id: "projects", label: "Projects", count: projects.length },
                { id: "opportunities", label: "Opportunities", count: opportunities.length },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === "members" && (
          <div>
            {members.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
                <ShieldCheck className="mx-auto h-8 w-8 text-primary mb-2" />
                <p className="text-sm font-semibold text-foreground">No members registered yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  When students verify their college USN and link their GitHub profiles, they will appear here with full telemetry.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <Card
                    key={member.id}
                    className="p-4 border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="h-10 w-10 rounded-full border border-border bg-muted object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-foreground">{member.name}</p>
                          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          @{member.username} • {member.department} • {member.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-mono">
                      <div>
                        <span className="text-muted-foreground">PRs: </span>
                        <span className="font-bold text-foreground">{member.mergedPrCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contributions: </span>
                        <span className="font-bold text-primary">{member.totalContributions}</span>
                      </div>
                      <a
                        href={`https://github.com/${member.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "projects" && (
          <div>
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
                <FolderGit2 className="mx-auto h-8 w-8 text-secondary mb-2" />
                <p className="text-sm font-semibold text-foreground">No projects registered yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Repositories from IST-ZenithenLab will appear here once indexed into Supabase.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="p-5 border border-border bg-card shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-foreground">{project.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-mono border-border">
                          {project.primaryLanguage}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Star className="h-3.5 w-3.5 text-accent" />
                          <span>{project.stars}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <GitFork className="h-3.5 w-3.5" />
                          <span>{project.forks}</span>
                        </span>
                        <span>{project.openIssuesCount} issues</span>
                      </div>
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 text-primary hover:underline"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "opportunities" && (
          <div>
            {opportunities.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
                <Compass className="mx-auto h-8 w-8 text-accent mb-2" />
                <p className="text-sm font-semibold text-foreground">No starter opportunities open</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  When good-first-issues or help-wanted tickets are tagged on GitHub, they will be listed here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <Card
                    key={opp.id}
                    className="p-4 border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-muted-foreground">#{opp.issueNumber}</span>
                        <h4 className="text-sm font-bold text-foreground">{opp.title}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-[10px] font-mono border-accent/30 text-accent">
                          {opp.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono border-border">
                          {opp.language}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">{opp.repoFullName}</span>
                      </div>
                    </div>
                    <a
                      href={opp.issueUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 text-xs text-primary font-mono hover:underline shrink-0"
                    >
                      <span>View Issue</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
