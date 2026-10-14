"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  FolderGit2,
  Trophy,
  Compass,
  Users2,
  ExternalLink,
} from "lucide-react";
import { HeroSection } from "@/components/dashboard/hero-section";
import { LiveMetricsDashboard } from "@/components/dashboard/live-metrics";
import { CampusEvolutionSection } from "@/components/dashboard/campus-evolution-section";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { Project, Opportunity } from "@/types";
import { StudentContributor } from "@/lib/data/student-competition";

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = React.useState<Project[]>([]);
  const [_featuredOpportunities, setFeaturedOpportunities] = React.useState<Opportunity[]>([]);
  const [topContributors, setTopContributors] = React.useState<StudentContributor[]>([]);

  React.useEffect(() => {
    // 1. Fetch featured projects
    fetch("/api/projects?limit=4")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.projects)) {
          setFeaturedProjects(data.projects.slice(0, 4));
        }
      })
      .catch((err) => console.warn("[HomePage] Projects fetch notice:", err));

    // 2. Fetch starter opportunities
    fetch("/api/opportunities?difficulty=beginner&limit=3")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.opportunities)) {
          setFeaturedOpportunities(data.opportunities.slice(0, 3));
        }
      })
      .catch((err) => console.warn("[HomePage] Opportunities fetch notice:", err));

    // 3. Fetch monthly top competitors (top 7)
    fetch("/api/students/leaderboard?timeframe=month&limit=7")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.competitors)) {
          setTopContributors(data.competitors.slice(0, 7));
        }
      })
      .catch((err) => console.warn("[HomePage] Leaderboard fetch notice:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Live Metrics Dashboard */}
      <LiveMetricsDashboard />

      {/* 2.5. Campus Genesis & Evolution 3D Chronicle */}
      <CampusEvolutionSection />

      {/* 3. Featured Open-Source Projects */}
      <section id="campus-catalog" className="py-20 border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
                <FolderGit2 className="h-4 w-4" />
                <span>Ecosystem Repositories</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">
                Campus Project Catalog
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Open-source software maintained by IST engineers and student contributors.
              </p>
            </div>
            <Link href="/projects">
              <Button variant="outline" size="sm" className="group text-xs border-border cursor-pointer">
                <span>View Project Directory</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {featuredProjects.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4">
                <FolderGit2 className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No Repositories Synced Yet</h3>
              <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Connect the <code className="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded border border-primary/20">IST-ZenithenLab</code> GitHub organization or register repository URLs to populate the catalog.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="https://github.com/IST-ZenithenLab"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="default" className="gap-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
                    <GithubIcon className="h-3.5 w-3.5" />
                    <span>View GitHub Organization</span>
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="group relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all border-border bg-card"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          <a
                            href={project.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {project.name}
                          </a>
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                          {project.tagline}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-xs font-semibold px-2.5 py-0.5">
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 border-t border-border/60 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: project.languageColor }}
                      />
                      <span className="font-semibold text-foreground">{project.primaryLanguage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.slug === "zenithen-open" && (
                        <a
                          href="https://github.com/IST-ZenithenLab/ZenithenOpen/issues?q=is%3Aissue+is%3Aopen+label%3Agood-first-issue"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline" className="text-xs gap-1.5 border-border hover:border-primary/40 text-foreground cursor-pointer">
                            <span>Good First Issues</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      )}
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="default" className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer">
                          <GithubIcon className="h-3.5 w-3.5" />
                          <span>GitHub</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Opportunity Board Highlight */}
      <section className="py-20 border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-accent font-mono">
                <Compass className="h-4 w-4" />
                <span>Beginner Gateway</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">
                Good First Issues
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Triaged GitHub issues curated for first-time open-source contributors with mentor assistance.
              </p>
            </div>
            <Link href="/opportunities">
              <Button variant="outline" size="sm" className="group text-xs border-border cursor-pointer">
                <span>Browse Opportunities</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. ZenithenOpen Good First Issues Card */}
            <Card className="flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all border-border bg-card p-6 group">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-primary mb-2">
                  <a
                    href="https://github.com/IST-ZenithenLab/ZenithenOpen/issues?q=is%3Aissue+is%3Aopen+label%3Agood-first-issue"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1.5 font-semibold text-primary"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                    <span>IST-ZenithenLab/ZenithenOpen</span>
                  </a>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                    Good First Issues
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mt-2">
                  <a
                    href="https://github.com/IST-ZenithenLab/ZenithenOpen/issues?q=is%3Aissue+is%3Aopen+label%3Agood-first-issue"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ZenithenOpen — Community Platform Good First Issues
                  </a>
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Curated beginner-friendly tasks and bug fixes on the official open-source platform. Claim issues labeled with good-first-issue to start your contributor journey.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-medium">
                    good-first-issue
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border/50">
                    TypeScript
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border/50">
                    Next.js
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border/50">
                    Tailwind CSS
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#3178c6]" />
                  <span>TypeScript</span>
                </span>
                <a
                  href="https://github.com/IST-ZenithenLab/ZenithenOpen/issues?q=is%3Aissue+is%3Aopen+label%3Agood-first-issue"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold"
                >
                  <span>Explore Good First Issues</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </Card>

            {/* 2. First-PR Onboarding Repo Card */}
            <Card className="flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all border-border bg-card p-6 group">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-primary mb-2">
                  <a
                    href="https://github.com/IST-ZenithenLab/First-PR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1.5 font-semibold text-primary"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                    <span>IST-ZenithenLab/First-PR</span>
                  </a>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                    First PR Repo
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mt-2">
                  <a
                    href="https://github.com/IST-ZenithenLab/First-PR"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    First-PR — Practice Your First Pull Request
                  </a>
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  The designated campus starter repository for beginners to learn Git workflow basics: fork the repo, create a branch, submit your pull request, and get celebrated.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-medium">
                    first-pr
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border/50">
                    onboarding
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border/50">
                    Git Workflow
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border/50">
                    Markdown
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#083fa1]" />
                  <span>Markdown / Git</span>
                </span>
                <a
                  href="https://github.com/IST-ZenithenLab/First-PR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold"
                >
                  <span>Open First-PR Repo</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Contributor Leaderboard & Hall of Fame */}
      <section className="py-20 border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Leaderboard Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-secondary font-mono">
                    <Trophy className="h-4 w-4" />
                    <span>Contributor Standings</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                    Monthly Leaderboard
                  </h2>
                </div>
                <Link href="/leaderboard">
                  <Button variant="ghost" size="sm" className="text-xs text-secondary hover:text-secondary hover:bg-secondary/10 cursor-pointer">
                    Full Standings →
                  </Button>
                </Link>
              </div>

              {topContributors.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center shadow-xs">
                  <Trophy className="mx-auto h-8 w-8 text-secondary mb-2" />
                  <p className="text-sm font-semibold text-foreground">Leaderboard Awaiting First Pull Request</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Contributions will be ranked automatically by merged PRs and code reviews once students link their GitHub accounts.
                  </p>
                  <Link href="/programs#student-competition" className="inline-block mt-4">
                    <Button size="sm" variant="outline" className="text-xs border-border cursor-pointer">
                      Explore Open Source Arena
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {topContributors.map((student, idx) => {
                    const stats = (student.month as unknown as { mergedPrs?: number; qualityPrs?: number; prs?: number }) || {};
                    const mergedCount = stats.mergedPrs ?? student.month.prs ?? 0;
                    const qualityCount = stats.qualityPrs ?? student.month.qualityPrs ?? 0;

                    return (
                      <div
                        key={student.id}
                        className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-all group"
                      >
                        <Link
                          href={`/members/${encodeURIComponent(student.username)}`}
                          className="flex items-center space-x-3.5 flex-1 min-w-0"
                        >
                          <span className="font-mono font-bold text-xs text-muted-foreground w-6">
                            #{idx + 1}
                          </span>
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="h-10 w-10 rounded-full border border-border object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-foreground text-sm leading-tight group-hover:text-primary transition-colors truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate">
                              @{student.username} • {student.department}
                            </p>
                          </div>
                        </Link>

                        <div className="flex items-center space-x-2.5 justify-end">
                          {/* Direct GitHub & LinkedIn Social Action Icons */}
                          <div className="flex items-center space-x-1.5 mr-1">
                            <a
                              href={`https://github.com/${student.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`@${student.username} on GitHub`}
                              className="h-8 w-8 rounded-full bg-muted/60 hover:bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                            >
                              <GithubIcon className="h-4 w-4" />
                            </a>
                            <a
                              href={student.linkedinUrl || `https://linkedin.com/in/${student.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`@${student.username} on LinkedIn`}
                              className="h-8 w-8 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 hover:text-blue-400 transition-all hover:scale-110"
                            >
                              <LinkedinIcon className="h-4 w-4" />
                            </a>
                          </div>

                          {/* Metric Badges */}
                          <div className="flex items-center space-x-2 text-right">
                            <span className="font-bold text-xs font-mono px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                              {mergedCount} Merged
                            </span>
                            {qualityCount > 0 && (
                              <span className="font-semibold text-[11px] font-mono px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                {qualityCount} Quality
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Option at the bottom to view all students */}
                  <div className="pt-2 text-center">
                    <Link href="/programs#student-competition">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold gap-1.5 border-border hover:bg-muted cursor-pointer">
                        <span>View All Campus Contributors in Open Source Arena</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Hall of Fame Column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-accent font-mono">
                  <Sparkles className="h-4 w-4" />
                  <span>Recognition</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                  First PR Hall of Fame
                </h2>
              </div>

              {topContributors.some((s) => ((s.overall as unknown as { mergedPrs?: number })?.mergedPrs ?? s.overall?.prs ?? 0) > 0) ? (
                <div className="space-y-3">
                  {topContributors
                    .filter((s) => ((s.overall as unknown as { mergedPrs?: number })?.mergedPrs ?? s.overall?.prs ?? 0) > 0)
                    .slice(0, 3)
                    .map((student) => (
                      <div
                        key={`hof-${student.id}`}
                        className="p-4 rounded-xl border border-accent/30 bg-card/60 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="h-10 w-10 rounded-full border border-border object-cover"
                          />
                          <div>
                            <p className="font-bold text-sm text-foreground">{student.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">@{student.username}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-xs font-semibold px-2.5 py-1">
                          Shipped First PR 🚀
                        </Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-8 text-center shadow-xs">
                  <Sparkles className="mx-auto h-8 w-8 text-accent mb-2" />
                  <p className="text-sm font-semibold text-foreground">Celebrate Your First Contribution</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Every student who merges their first pull request receives permanent recognition in the community Hall of Fame.
                  </p>
                  <Link href="/programs#student-competition" className="inline-block mt-4">
                    <Button size="sm" variant="outline" className="text-xs border-border cursor-pointer">
                      Join Sprint Arena
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Bottom Call to Action */}
      <section className="py-24 border-t border-border bg-gradient-to-b from-card/30 via-background to-card/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Ready to ship your first commit?
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join IST&apos;s open-source engineering chapter.
            Connect with campus mentors, choose a roadmap, and see your code merged into production.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/programs">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer">
                <Compass className="h-5 w-5" />
                <span>Explore Programs</span>
              </Button>
            </Link>
            <Link href="/members">
              <Button size="lg" variant="outline" className="gap-2 border-border cursor-pointer">
                <Users2 className="h-5 w-5" />
                <span>Join Directory</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
