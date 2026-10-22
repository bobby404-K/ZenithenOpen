"use client";

import * as React from "react";
import Link from "next/link";
import {
  FolderGit2,
  Star,
  GitFork,
  ExternalLink,
  ArrowLeft,
  Copy,
  Check,
  Code2,
  GitPullRequest,
  Users2,
  Terminal,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Compass,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectMaintainer {
  id: string;
  role: string;
  name: string;
  username: string;
  avatarUrl: string;
}

interface ProjectContributor {
  username: string;
  name: string;
  avatarUrl: string;
  mergedPrs: number;
  qualityPrs: number;
  points: number;
}

interface ProjectOpportunity {
  id: string;
  title: string;
  issueNumber: number;
  issueUrl: string;
  difficulty: string;
  labels: string[];
}

interface ProjectContribution {
  id: string;
  title: string;
  prNumber: number;
  url: string;
  status: string;
  isQualityPr: boolean;
  mergedAt: string | null;
  contributor: {
    username: string;
    name: string;
    avatarUrl: string;
  };
}

interface ProjectDetails {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  repositoryUrl: string;
  demoUrl: string | null;
  primaryLanguage: string;
  languageColor: string;
  tags: string[];
  isFeatured: boolean;
  status: string;
  starsCount: number;
  forksCount: number;
  openIssuesCount: number;
  goodFirstIssuesCount: number;
  stats: {
    totalContributions: number;
    mergedPrs: number;
    openPrs: number;
    qualityPrs: number;
  };
  maintainers: ProjectMaintainer[];
  topContributors: ProjectContributor[];
  recentContributions: ProjectContribution[];
  opportunities: ProjectOpportunity[];
}

export default function ProjectDeepDivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const unwrappedParams = React.use(params);
  const slug = unwrappedParams.slug;

  const [project, setProject] = React.useState<ProjectDetails | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedClone, setCopiedClone] = React.useState<boolean>(false);
  const [copiedShare, setCopiedShare] = React.useState<boolean>(false);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchProject() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/projects/${encodeURIComponent(slug)}`);
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.success && data.project) {
          setProject(data.project);
        } else {
          setError(data.error || `Project '${slug}' could not be found.`);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("[ProjectDeepDive] Fetch error:", err);
        setError("Failed to load project details. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProject();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const cloneCommand = project?.repositoryUrl
    ? `git clone ${project.repositoryUrl}.git`
    : `git clone https://github.com/IST-ZenithenLab/${slug}.git`;

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const handleCopyShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-4 w-24" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-48 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {error || `The repository '${slug}' is not registered on ZenithenOpen.`}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Link href="/projects">
              <Button variant="default" className="gap-2 text-xs">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Projects Catalog</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Projects Catalog</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyShare}
              className="text-xs h-8 gap-1.5 border-border"
            >
              {copiedShare ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Share</span>
                </>
              )}
            </Button>
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground">
                <GithubIcon className="h-3.5 w-3.5" />
                <span>GitHub</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </Button>
            </a>
          </div>
        </div>

        {/* Hero Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <FolderGit2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {project.name}
                    </h1>
                    <Badge
                      variant="outline"
                      className="bg-accent/10 text-accent border-accent/30 text-xs font-semibold px-2.5 py-0.5"
                    >
                      {project.status || "Active"}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    IST-ZenithenLab / {project.slug}
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                {project.tagline || project.description}
              </p>
            </div>

            {/* Language & Primary Attributes */}
            <div className="flex sm:flex-col items-end gap-2 shrink-0">
              <div className="inline-flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5 border border-border/60 text-xs font-semibold">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: project.languageColor || "#3178c6" }}
                />
                <span>{project.primaryLanguage}</span>
              </div>
              {project.isFeatured && (
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <Sparkles className="h-3 w-3" />
                  <span>Featured Campus Project</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border/60 pt-6">
            <div className="rounded-xl bg-muted/30 border border-border/50 p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">Stars</span>
              </div>
              <p className="text-xl font-bold text-foreground">{project.starsCount ?? 0}</p>
            </div>

            <div className="rounded-xl bg-muted/30 border border-border/50 p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
                <GitFork className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">Forks</span>
              </div>
              <p className="text-xl font-bold text-foreground">{project.forksCount ?? 0}</p>
            </div>

            <div className="rounded-xl bg-muted/30 border border-border/50 p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
                <GitPullRequest className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">Merged PRs</span>
              </div>
              <p className="text-xl font-bold text-emerald-500">
                {project.stats?.mergedPrs ?? project.stats?.totalContributions ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-muted/30 border border-border/50 p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Compass className="h-3.5 w-3.5 text-purple-500" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">Opportunities</span>
              </div>
              <p className="text-xl font-bold text-purple-500">
                {project.goodFirstIssuesCount ?? project.opportunities?.length ?? 0}
              </p>
            </div>
          </div>

          {/* Quick Clone Snippet */}
          <div className="mt-6 rounded-xl bg-muted/50 border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 font-mono text-xs text-foreground overflow-x-auto">
              <Terminal className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground select-none">$</span>
              <span className="select-all">{cloneCommand}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyClone}
              className="text-xs h-8 gap-1.5 border-border shrink-0"
            >
              {copiedClone ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Copy Command</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (2 spans) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Narrative */}
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Code2 className="h-4 w-4 text-primary" />
                  <span>About the Project</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {project.description ||
                    "Collaborative campus open-source project empowering student engineers at IST to contribute quality pull requests."}
                </p>

                {project.tags && project.tags.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5 border-t border-border/60">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Starter Opportunities & Good First Issues */}
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Compass className="h-4 w-4 text-purple-500" />
                    <span>Starter Opportunities & Good First Issues</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {project.opportunities?.length ?? 0} Available
                  </Badge>
                </div>

                {(!project.opportunities || project.opportunities.length === 0) ? (
                  <div className="rounded-xl bg-muted/20 border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    No open starter issues currently registered for this repository. Check back soon or open a new issue on GitHub.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {project.opportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="rounded-xl border border-border/70 bg-card hover:border-primary/40 p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">#{opp.issueNumber}</span>
                            <span className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                              {opp.title}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                                opp.difficulty === "beginner"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : opp.difficulty === "intermediate"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                  : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                              }`}
                            >
                              {opp.difficulty}
                            </span>
                            {opp.labels?.map((label) => (
                              <span
                                key={label}
                                className="text-[10px] font-mono bg-muted/60 text-muted-foreground px-2 py-0.5 rounded border border-border/50"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>

                        <a
                          href={opp.issueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-border">
                            <span>Claim Issue</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Merged Contributions */}
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <GitPullRequest className="h-4 w-4 text-emerald-500" />
                    <span>Recent Pull Request Activity</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {project.recentContributions?.length ?? 0} Audited
                  </Badge>
                </div>

                {(!project.recentContributions || project.recentContributions.length === 0) ? (
                  <div className="rounded-xl bg-muted/20 border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    No student pull requests recorded yet. Be the first to land a merged contribution!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {project.recentContributions.slice(0, 10).map((contrib) => (
                      <div
                        key={contrib.id}
                        className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={contrib.contributor?.avatarUrl || "https://github.com/ghost.png"}
                            alt={contrib.contributor?.name || "Contributor"}
                            className="h-8 w-8 rounded-full border border-border shrink-0"
                          />
                          <div>
                            <a
                              href={contrib.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                            >
                              <span>{contrib.title}</span>
                              <span className="text-muted-foreground font-mono">#{contrib.prNumber}</span>
                            </a>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              <Link
                                href={`/members/${contrib.contributor?.username}`}
                                className="hover:text-primary transition-colors font-mono"
                              >
                                @{contrib.contributor?.username}
                              </Link>
                              {contrib.isQualityPr && (
                                <span className="text-amber-500 font-semibold">• Quality PR</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                          {contrib.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column (1 span) */}
          <div className="space-y-8">
            {/* Maintainers Card */}
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Repository Maintainers</span>
                </div>

                <div className="space-y-3">
                  {project.maintainers?.map((maintainer) => (
                    <div
                      key={maintainer.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 p-2.5 border border-border/50 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={maintainer.avatarUrl}
                          alt={maintainer.name}
                          className="h-9 w-9 rounded-full border border-border object-cover"
                        />
                        <div>
                          <p className="font-semibold text-foreground leading-tight">{maintainer.name}</p>
                          <Link
                            href={`/members/${maintainer.username}`}
                            className="text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors"
                          >
                            @{maintainer.username}
                          </Link>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                        {maintainer.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Student Contributors */}
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Users2 className="h-4 w-4 text-emerald-500" />
                    <span>Top Contributors</span>
                  </div>
                  <Link
                    href="/leaderboard"
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    View All
                  </Link>
                </div>

                {(!project.topContributors || project.topContributors.length === 0) ? (
                  <p className="text-xs text-muted-foreground">
                    Contributions currently open for this semester cohort.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {project.topContributors.slice(0, 5).map((contributor, idx) => (
                      <Link
                        key={contributor.username}
                        href={`/members/${contributor.username}`}
                        className="flex items-center justify-between gap-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 p-2 border border-border/40 transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-muted-foreground w-4 text-center">
                            #{idx + 1}
                          </span>
                          <img
                            src={contributor.avatarUrl}
                            alt={contributor.name}
                            className="h-7 w-7 rounded-full border border-border"
                          />
                          <div>
                            <p className="font-semibold text-foreground leading-tight truncate max-w-[120px]">
                              {contributor.name}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                              @{contributor.username}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{contributor.mergedPrs} Merged</p>
                          <p className="text-[10px] text-amber-500 font-semibold">{contributor.qualityPrs} Quality</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links / Guide */}
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span>Contribution Guide</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fork the repository, clone it locally, and follow our standardized PR guidelines to earn verified campus badges.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link href="/resources">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start gap-2 border-border">
                      <Code2 className="h-3.5 w-3.5 text-primary" />
                      <span>Learn How to PR</span>
                    </Button>
                  </Link>
                  <Link href="/programs">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start gap-2 border-border">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      <span>Learning Paths</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
