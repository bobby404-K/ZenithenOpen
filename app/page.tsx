import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  FolderGit2,
  Trophy,
  Compass,
  GraduationCap,
  Users2,
  ExternalLink,
  Flame,
  Award,
  BookOpen,
  GitPullRequest,
  CheckCircle2,
  GitBranch,
} from "lucide-react";
import { HeroSection } from "@/components/dashboard/hero-section";
import { LiveMetricsDashboard } from "@/components/dashboard/live-metrics";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GithubIcon } from "@/components/ui/icons";
import {
  MOCK_PROJECTS,
  MOCK_MEMBERS,
  MOCK_OPPORTUNITIES,
  MOCK_FIRST_PR_STORIES,
  MOCK_LEADERBOARD,
  MOCK_LEARNING_PATHS,
} from "@/lib/data/mock-data";

export default function HomePage() {
  const featuredProjects = MOCK_PROJECTS.slice(0, 4);
  const featuredOpportunities = MOCK_OPPORTUNITIES.slice(0, 3);
  const topContributors = MOCK_LEADERBOARD.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Live Metrics Dashboard */}
      <LiveMetricsDashboard />

      {/* 3. Featured Open-Source Projects */}
      <section className="py-20 border-t border-slate-200/80 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
                <FolderGit2 className="h-4 w-4" />
                <span>Ecosystem Repositories</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                Campus Project Catalog
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Open-source software maintained by S-VYASA engineers and student contributors.
              </p>
            </div>
            <Link href="/projects">
              <Button variant="outline" size="sm" className="group text-xs">
                <span>View Project Directory</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {featuredProjects.length === 0 ? (
            /* Clean, high-tech empty state */
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-4">
                <FolderGit2 className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Repositories Synced Yet</h3>
              <p className="mt-2 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Connect the <code className="text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded border border-blue-200">IST-ZenithenLab</code> GitHub organization or add repository URLs in the admin governance console to populate the catalog.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="https://github.com/IST-ZenithenLab"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="default" className="gap-2 text-xs bg-blue-600 hover:bg-blue-700">
                    <GithubIcon className="h-3.5 w-3.5" />
                    <span>View GitHub Organization</span>
                  </Button>
                </a>
                <Link href="/admin">
                  <Button size="sm" variant="outline" className="text-xs">
                    Open Admin Console
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="group relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      {project.tagline}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Opportunity Board Highlight */}
      <section className="py-20 border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 font-mono">
                <Compass className="h-4 w-4" />
                <span>Beginner Gateway</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                Good First Issues
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Triaged GitHub issues curated for first-time open-source contributors with mentor assistance.
              </p>
            </div>
            <Link href="/opportunities">
              <Button variant="outline" size="sm" className="group text-xs">
                <span>Browse Opportunities</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {featuredOpportunities.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mb-4">
                <Compass className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Open Issues Ingested Yet</h3>
              <p className="mt-2 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Once repositories are connected and issues are labeled with <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 font-mono">good-first-issue</code> on GitHub, they will appear dynamically here.
              </p>
              <div className="mt-6">
                <Link href="/learning">
                  <Button size="sm" variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-700">
                    Prepare with Roadmaps
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* 5. Contributor Leaderboard & Hall of Fame */}
      <section className="py-20 border-t border-slate-200/80 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Leaderboard Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-purple-600 font-mono">
                    <Trophy className="h-4 w-4" />
                    <span>Contributor Standings</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                    Monthly Leaderboard
                  </h2>
                </div>
                <Link href="/leaderboard">
                  <Button variant="ghost" size="sm" className="text-xs text-purple-600 hover:text-purple-700">
                    Full Standings →
                  </Button>
                </Link>
              </div>

              {topContributors.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <Trophy className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                  <p className="text-sm font-semibold text-slate-900">Leaderboard Awaiting First Pull Request</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Contributions will be ranked automatically by merged PRs and code reviews once GitHub accounts are linked.
                  </p>
                  <Link href="/learning" className="inline-block mt-4">
                    <Button size="sm" variant="outline" className="text-xs">
                      Start First Roadmap
                    </Button>
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Hall of Fame Column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-amber-600 font-mono">
                  <Sparkles className="h-4 w-4" />
                  <span>Recognition</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                  First PR Hall of Fame
                </h2>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <Sparkles className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                <p className="text-sm font-semibold text-slate-900">Celebrate Your First Contribution</p>
                <p className="text-xs text-slate-500 mt-1">
                  Every student who merges their first pull request receives permanent recognition in the community Hall of Fame.
                </p>
                <Link href="/achievements" className="inline-block mt-4">
                  <Button size="sm" variant="outline" className="text-xs">
                    View Hall of Fame
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Learning Paths Teaser */}
      <section className="py-20 border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs text-purple-700 mb-4 font-medium">
            <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
            <span>Structured Curriculums</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            From First Commit to Google Summer of Code
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
            Guided roadmaps curated for S-VYASA students to master open source and distributed software development.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            {MOCK_LEARNING_PATHS.map((path) => (
              <div
                key={path.id}
                className="rounded-xl border border-slate-200 bg-white p-6 hover:border-blue-400 hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${path.color}15`, border: `1px solid ${path.color}30` }}
                >
                  <BookOpen className="h-5 w-5" style={{ color: path.color }} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{path.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{path.description}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">{path.estimatedWeeks} Weeks</span>
                  <Badge variant="outline" className="text-[10px]">
                    {path.level}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/learning">
              <Button size="lg" className="shadow-md bg-blue-600 hover:bg-blue-700">
                Explore All Curriculum Modules
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Bottom Call to Action */}
      <section className="py-24 border-t border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-slate-100/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Ready to ship your first commit?
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Join S-VYASA University&apos;s open-source engineering chapter.
            Connect with campus mentors, choose a roadmap, and see your code merged into production.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/learning">
              <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md">
                <Compass className="h-5 w-5" />
                <span>Start Learning</span>
              </Button>
            </Link>
            <Link href="/mentorship">
              <Button size="lg" variant="outline" className="gap-2">
                <Users2 className="h-5 w-5" />
                <span>Mentorship Program</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
