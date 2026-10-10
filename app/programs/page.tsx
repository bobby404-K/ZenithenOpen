"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Rocket,
  Code2,
  FolderGit2,
  Globe2,
  Trophy,
  Coins,
  ExternalLink,
  CheckCircle2,
  Compass,
  ChevronDown,
  Flame,
  Medal,
  Award,
  Sparkles,
  GitPullRequest,
  GitCommit,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Project } from "@/types";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { MOCK_PROJECTS } from "@/lib/data/mock-data";
import {
  STUDENT_COMPETITORS,
  CompetitionTimeframe,
} from "@/lib/data/student-competition";
import { useNavigation } from "@/components/navigation/navigation-context";
import { cn } from "@/lib/utils";

interface ProgramItem {
  id: string;
  category: string;
  title: string;
  badge: string;
  description: string;
  details: string[];
  actionLabel: string;
  actionHref: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PROGRAMS: ProgramItem[] = [
  {
    id: "open-source",
    category: "Open Source",
    title: "Open Source Foundations",
    badge: "Core Community",
    description:
      "The foundational open-source movement at IST Bengaluru. Designed to empower students with verified code reviews, git hygiene, and production pull requests.",
    details: [
      "Zero-barrier onboarding: No contribution is considered too big or too small",
      "Mentored pull request reviews by senior student engineers",
      "Open-source software licensing, governance, and architectural discussions",
      "Direct integration with the campus contributor leaderboard",
    ],
    actionLabel: "View Competition Arena",
    actionHref: "#student-competition",
    icon: Code2,
  },
  {
    id: "projects",
    category: "Projects",
    title: "Campus Open-Source Projects",
    badge: "Production Repos",
    description:
      "Production-grade web applications, developer tools, and automation bots created and maintained by IST student developers for real campus impact.",
    details: [
      "ZenithenOpen Platform (Next.js, TypeScript, Tailwind CSS, Theme Engine)",
      "Campus LMS Automation Bot (Python, FastAPI, Telegram API)",
      "Developer Portfolio & Resume Generator (React, GitHub REST API)",
      "Campus Transit & Resource Tracker (Go, PostgreSQL, Docker)",
    ],
    actionLabel: "View Project Directory",
    actionHref: "/projects",
    icon: FolderGit2,
  },
  {
    id: "gsoc",
    category: "GSoC",
    title: "Google Summer of Code (GSoC)",
    badge: "Global Fellowship",
    description:
      "A prestigious global fellowship program bringing student developers into open-source software organizations with international mentorship and stipends.",
    details: [
      "Comprehensive proposal drafting workshops and architectural templates",
      "Target organization selection strategy (Apache, Linux Foundation, CNCF, Python)",
      "One-on-one proposal reviews with past accepted IST scholars",
      "Milestone execution support for mid-term and final evaluations",
    ],
    actionLabel: "View GSoC Resources",
    actionHref: "/resources",
    icon: Globe2,
  },
  {
    id: "gssoc",
    category: "GSSoC Hall of Fame",
    title: "GirlScript Summer of Code (GSSoC) Hall of Fame",
    badge: "Milestones & Awards",
    description:
      "Honoring high-velocity contributors and milestone achievers in India's premier 3-month open-source sprint.",
    details: [
      "Celebration of student contributors who achieved top country-wide ranks",
      "Over 450+ verified pull requests merged across participating organizations",
      "Hall of Fame digital badges and community recognition certificates",
      "Sprint retrospectives and open-source portfolio spotlights",
    ],
    actionLabel: "View Hall of Fame",
    actionHref: "/achievements",
    icon: Trophy,
  },
  {
    id: "esoc-sob",
    category: "ESoC & SOB",
    title: "ESoC & Summer of Bitcoin (SOB)",
    badge: "Protocol & Enterprise",
    description:
      "Specialized open-source fellowship cohorts focused on decentralized networks, Bitcoin Core protocol development, and enterprise distributed systems.",
    details: [
      "Summer of Bitcoin (SOB): Cryptography, Bitcoin Core consensus, and lightning protocols",
      "Enterprise Summer of Code (ESoC): Cloud-native architecture, Kubernetes, and enterprise tooling",
      "Full application bootcamp with coding challenge preparation",
      "Stipend guidance and international mentor networking",
    ],
    actionLabel: "Explore Fellowship Resources",
    actionHref: "/resources",
    icon: Coins,
  },
];

export default function ProgramsPage() {
  const { activeSection } = useNavigation();
  const [isCompetitionOpen, setIsCompetitionOpen] = React.useState(true);
  const [competitionTimeframe, setCompetitionTimeframe] = React.useState<CompetitionTimeframe>("week");

  // Default to Open Source
  const defaultProgramId = "open-source";
  const currentSelectedId = activeSection || defaultProgramId;
  const currentProgram = PROGRAMS.find((p) => p.id === currentSelectedId) || PROGRAMS[0];

  const CurrentIcon = currentProgram.icon;
  const [campusProjects, setCampusProjects] = React.useState<Project[]>(() => MOCK_PROJECTS.slice(0, 2));
  const [isAddProjectOpen, setIsAddProjectOpen] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectRepo, setNewProjectRepo] = React.useState("");
  const [newProjectTagline, setNewProjectTagline] = React.useState("");
  const [newProjectLang, setNewProjectLang] = React.useState("TypeScript");
  const [newProjectStudentId, setNewProjectStudentId] = React.useState("");
  const [newProjectTags, setNewProjectTags] = React.useState("");
  const [repoError, setRepoError] = React.useState("");
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedRepo = newProjectRepo.trim().toLowerCase();
    const trimmedId = newProjectStudentId.trim().toLowerCase();

    // Verification: Must be under IST organization or have IST student credentials
    const isIstAffiliated =
      trimmedRepo.includes("github.com/ist-zenithenlab") ||
      trimmedRepo.startsWith("ist-zenithenlab/") ||
      trimmedId.includes("ist");

    if (!isIstAffiliated) {
      setRepoError("Access restricted: Only projects engineered by IST student developers and maintained under official IST repositories (e.g. https://github.com/IST-ZenithenLab/...) can be listed.");
      return;
    }

    const colorMap: Record<string, string> = {
      TypeScript: "#3178c6",
      "C++": "#f34b7d",
      Python: "#3572A5",
      Go: "#00ADD8",
      Rust: "#dea584",
    };

    const formattedUrl = newProjectRepo.trim().startsWith("http")
      ? newProjectRepo.trim()
      : `https://github.com/${newProjectRepo.trim()}`;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      slug: newProjectName.toLowerCase().replace(/\s+/g, "-"),
      name: newProjectName.trim(),
      tagline: newProjectTagline.trim(),
      description: `Official open-source IST campus project engineered by IST student developer ${newProjectStudentId.trim()}.`,
      repositoryUrl: formattedUrl,
      stars: 1,
      forks: 0,
      openIssuesCount: 0,
      goodFirstIssuesCount: 0,
      primaryLanguage: newProjectLang,
      languageColor: colorMap[newProjectLang] || "#3178c6",
      tags: newProjectTags
        ? newProjectTags.split(",").map((t) => t.trim()).filter(Boolean)
        : ["IST", "Campus Project", "Open Source"],
      featured: true,
      status: "Active",
      maintainers: [
        {
          name: `IST Student (${newProjectStudentId.trim()})`,
          username: newProjectStudentId.trim(),
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newProjectStudentId)}`,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    setCampusProjects((prev) => [newProject, ...prev]);
    setSubmitSuccess(true);
    setRepoError("");

    setTimeout(() => {
      setSubmitSuccess(false);
      setIsAddProjectOpen(false);
      setNewProjectName("");
      setNewProjectRepo("");
      setNewProjectTagline("");
      setNewProjectStudentId("");
      setNewProjectTags("");
    }, 1200);
  };

  // Sorted students for competition arena based on active timeframe
  const sortedStudents = [...STUDENT_COMPETITORS].sort(
    (a, b) => a[competitionTimeframe].rank - b[competitionTimeframe].rank
  );
  const podiumStudents = sortedStudents.slice(0, 3);
  const remainingStudents = sortedStudents.slice(3);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-5xl">
        {/* Top Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        {/* Header Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            <Rocket className="h-3.5 w-3.5" />
            <span>Initiatives & Fellowships</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            ZenithenOpen Programs
          </h1>

          <div className="p-4 rounded-xl border border-border bg-card/60">
            <p className="text-base font-semibold text-primary">
              &ldquo;All programs, nothing is big or small&rdquo;
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Every initiative at ZenithenOpen is treated with equal engineering dedication. Switch between programs using the top navbar options.
            </p>
          </div>
        </div>

        {/* ONLY THE SELECTED PROGRAM INFO - NO OTHER THINGS */}
        <div className="mt-10">
          {currentProgram.id === "projects" ? (
            /* Component matching Picture 3: Campus Project Catalog */
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
                    <FolderGit2 className="h-4 w-4" />
                    <span>Ecosystem Repositories</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
                    Campus Project Catalog
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                    Open-source software maintained by IST engineers and student contributors.
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddProjectOpen((prev) => !prev)}
                  size="sm"
                  className="group text-xs bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 cursor-pointer shadow-md shadow-primary/20 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90 duration-200" />
                  <span>add new project?</span>
                </Button>
              </div>

              {/* Add New Project Inline Form Modal / Card */}
              <AnimatePresence>
                {isAddProjectOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <Card className="border-2 border-primary/40 bg-card/95 backdrop-blur-md shadow-xl p-5 sm:p-6 rounded-2xl">
                      <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                            <Plus className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold text-foreground">
                              Add New IST Campus Project
                            </CardTitle>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              Verified submissions for IST student developers only
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAddProjectOpen(false)}
                          className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* IST Only Notice Banner */}
                      <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                        <div>
                          <strong className="font-semibold">IST Campus Verification:</strong> Only open-source projects engineered by IST student developers and maintained under official IST student repositories (<code className="font-mono font-bold bg-amber-500/20 px-1 py-0.5 rounded">IST-ZenithenLab/*</code>) or student handles can be listed on our platform.
                        </div>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleAddProjectSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Project Name *</label>
                            <Input
                              required
                              placeholder="e.g. ZenithenDocs"
                              value={newProjectName}
                              onChange={(e) => setNewProjectName(e.target.value)}
                              className="text-xs bg-muted/50 border-border"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Repository URL * (IST Only)</label>
                            <Input
                              required
                              placeholder="https://github.com/IST-ZenithenLab/..."
                              value={newProjectRepo}
                              onChange={(e) => {
                                setNewProjectRepo(e.target.value);
                                setRepoError("");
                              }}
                              className={cn(
                                "text-xs bg-muted/50 border-border font-mono",
                                repoError && "border-rose-500 focus-visible:ring-rose-500"
                              )}
                            />
                            {repoError && (
                              <p className="text-[11px] text-rose-500 font-semibold">{repoError}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Tagline / Pitch *</label>
                          <Input
                            required
                            placeholder="Official documentation portal and knowledge hub for IST developers"
                            value={newProjectTagline}
                            onChange={(e) => setNewProjectTagline(e.target.value)}
                            className="text-xs bg-muted/50 border-border"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Primary Language *</label>
                            <select
                              value={newProjectLang}
                              onChange={(e) => setNewProjectLang(e.target.value)}
                              className="w-full text-xs bg-muted/50 border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="TypeScript">TypeScript</option>
                              <option value="C++">C++</option>
                              <option value="Python">Python</option>
                              <option value="Go">Go</option>
                              <option value="Rust">Rust</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">IST Student Lead / ID *</label>
                            <Input
                              required
                              placeholder="e.g. 2024IST-CSE-042 or @student-ist"
                              value={newProjectStudentId}
                              onChange={(e) => setNewProjectStudentId(e.target.value)}
                              className="text-xs bg-muted/50 border-border font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">Tags (comma-separated)</label>
                            <Input
                              placeholder="Next.js, Tailwind, Docs"
                              value={newProjectTags}
                              onChange={(e) => setNewProjectTags(e.target.value)}
                              className="text-xs bg-muted/50 border-border"
                            />
                          </div>
                        </div>

                        {submitSuccess && (
                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span>Project successfully verified and published to the Campus Project Catalog!</span>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAddProjectOpen(false)}
                            className="text-xs cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs gap-1.5 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Project to Catalog</span>
                          </Button>
                        </div>
                      </form>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Project Cards Grid matching Picture 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campusProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="group relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-colors duration-150 border-border bg-card"
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
                        <Badge variant="outline" className="text-xs text-muted-foreground border-border/80 font-normal px-2.5 py-0.5 rounded-md">
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
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline" className="text-xs gap-1.5 shadow-xs cursor-pointer">
                          <GithubIcon className="h-3.5 w-3.5" />
                          <span>GitHub</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Student Contributor Leaderboard */}
              <div className="pt-8 border-t border-border/80">
                <StudentLeaderboardSection
                  timeframe={competitionTimeframe}
                  setTimeframe={setCompetitionTimeframe}
                  podiumStudents={podiumStudents}
                  remainingStudents={remainingStudents}
                  isCampusReposOnly={true}
                />
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <motion.div
                key={currentProgram.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="rounded-2xl border-2 border-primary/30 bg-card p-6 sm:p-10 shadow-lg shadow-primary/5 transition-colors duration-150"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25 text-primary shrink-0 shadow-xs">
                      <CurrentIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary uppercase font-mono">
                          {currentProgram.badge}
                        </span>
                        <span className="rounded-md bg-muted border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground font-mono">
                          Program Information
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
                        {currentProgram.title}
                      </h2>
                      <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                        {currentProgram.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 sm:self-start">
                    {currentProgram.id === "open-source" ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsCompetitionOpen((prev) => !prev);
                          if (!isCompetitionOpen) {
                            setTimeout(() => {
                              document.getElementById("student-competition")?.scrollIntoView({ behavior: "smooth" });
                            }, 100);
                          }
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer shadow-md shadow-primary/25 gap-1.5"
                      >
                        <Trophy className="h-3.5 w-3.5 text-amber-300" />
                        <span>{isCompetitionOpen ? "Hide Competition Arena" : "View Competition Arena"}</span>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform duration-200",
                            isCompetitionOpen && "rotate-180"
                          )}
                        />
                      </Button>
                    ) : (
                      <Link href={currentProgram.actionHref}>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer shadow-md shadow-primary/25"
                        >
                          <span>{currentProgram.actionLabel}</span>
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Key Bullet Highlights */}
                <div className="mt-8 pt-6 border-t border-border/70 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
                    Key Initiatives & Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentProgram.details.map((detail, index) => (
                      <div key={index} className="flex items-start space-x-2.5 text-xs sm:text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="leading-snug text-muted-foreground">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Student Competition Arena - rendered on the same page */}
              {currentProgram.id === "open-source" && isCompetitionOpen && (
                <StudentLeaderboardSection
                  timeframe={competitionTimeframe}
                  setTimeframe={setCompetitionTimeframe}
                  podiumStudents={podiumStudents}
                  remainingStudents={remainingStudents}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StudentLeaderboardSectionProps {
  timeframe: CompetitionTimeframe;
  setTimeframe: (timeframe: CompetitionTimeframe) => void;
  podiumStudents: typeof STUDENT_COMPETITORS;
  remainingStudents: typeof STUDENT_COMPETITORS;
  isCampusReposOnly?: boolean;
}

function StudentLeaderboardSection({
  timeframe,
  setTimeframe,
  podiumStudents,
  remainingStudents,
  isCampusReposOnly = false,
}: StudentLeaderboardSectionProps) {
  // Only students contributing to official campus repos are shown when on campus repos view
  const campusRepoFilter = (student: (typeof STUDENT_COMPETITORS)[number]) => {
    const repo = student[timeframe].topContribution.repo.toLowerCase();
    return repo.startsWith("ist-zenithenlab/") || repo.includes("zenithen");
  };

  const displayPodium = isCampusReposOnly
    ? podiumStudents.filter(campusRepoFilter)
    : podiumStudents;

  const displayRemaining = isCampusReposOnly
    ? remainingStudents.filter(campusRepoFilter)
    : remainingStudents;
  return (
    <motion.div
      id="student-competition"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6 pt-2"
    >
      {/* Competition Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>{isCampusReposOnly ? "IST Campus Repositories Contributors" : "Student Competition Arena"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            {isCampusReposOnly ? "Campus Repository Contributor Leaderboard" : "Campus Contributor Leaderboard"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            {isCampusReposOnly
              ? "Only student developers actively contributing to official IST campus repositories (ZenithenOpen & ZenithenLab) are featured on this page."
              : "Tracking top student developers across weekly sprints, monthly rankings, and all-time achievements."}
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/70 rounded-xl border border-border shrink-0">
          <button
            onClick={() => setTimeframe("week")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              timeframe === "week"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            )}
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>Top of the Week</span>
          </button>
          <button
            onClick={() => setTimeframe("month")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              timeframe === "month"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            )}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Top of the Month</span>
          </button>
          <button
            onClick={() => setTimeframe("overall")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              timeframe === "overall"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            )}
          >
            <Award className="h-3.5 w-3.5 text-blue-400" />
            <span>Overall</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        {displayPodium.map((student) => {
          const stats = student[timeframe];
          const isFirst = stats.rank === 1;
          const isSecond = stats.rank === 2;

          return (
            <Card
              key={student.id}
              className={cn(
                "relative overflow-hidden flex flex-col justify-between border-2 transition-all duration-200",
                isFirst && "border-amber-500/50 bg-gradient-to-b from-amber-500/10 via-card to-card shadow-md shadow-amber-500/5 md:-translate-y-1.5",
                isSecond && "border-slate-400/50 bg-gradient-to-b from-slate-400/10 via-card to-card",
                stats.rank === 3 && "border-amber-700/40 bg-gradient-to-b from-amber-700/10 via-card to-card"
              )}
            >
              <CardHeader className="pb-3">
                {/* Rank Ribbon */}
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs",
                      isFirst && "bg-amber-500/20 text-amber-600 border-amber-500/40",
                      isSecond && "bg-slate-400/20 text-slate-600 border-slate-400/40",
                      stats.rank === 3 && "bg-amber-700/20 text-amber-700 border-amber-700/40"
                    )}
                  >
                    {isFirst ? "🥇 1st Place Champion" : isSecond ? "🥈 2nd Place" : "🥉 3rd Place"}
                  </Badge>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-muted/80 border border-border/60 text-muted-foreground">
                    {stats.points} PTS
                  </span>
                </div>

                {/* Student Profile Info */}
                <div className="flex items-center space-x-3">
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="h-12 w-12 rounded-full border-2 border-primary/30 bg-muted/80 shrink-0 p-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-bold text-foreground truncate">
                      {student.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      @{student.username}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      {student.department} • {student.year}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3.5">
                {/* Badge */}
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md border", student.badgeColor)}>
                    {student.badge}
                  </span>
                </div>

                {/* Competition Stats Metrics (Merged, Quality Pt, Open PR, Closed PR) */}
                <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-muted/50 border border-border/60 text-center">
                  <div>
                    <div className="text-base font-extrabold text-foreground">
                      {stats.mergedPrs ?? stats.prs}
                    </div>
                    <div className="text-[10px] uppercase font-mono text-muted-foreground font-semibold">
                      Merged
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-emerald-600">
                      {stats.qualityPrs}
                    </div>
                    <div className="text-[10px] uppercase font-mono text-muted-foreground font-semibold">
                      Quality Pt
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-amber-500">
                      {stats.openPrs ?? 1}
                    </div>
                    <div className="text-[10px] uppercase font-mono text-muted-foreground font-semibold">
                      Open PR
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-purple-500">
                      {stats.closedPrs ?? (stats.prs + 1)}
                    </div>
                    <div className="text-[10px] uppercase font-mono text-muted-foreground font-semibold">
                      Closed PR
                    </div>
                  </div>
                </div>

                {/* Top Contribution Highlight */}
                <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Top Contribution</span>
                  </div>
                  <p className="text-xs text-foreground font-medium leading-snug line-clamp-2">
                    {stats.topContribution.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-0.5">
                    <span>{stats.topContribution.repo}</span>
                    {isCampusReposOnly && (
                      <span className="text-[9px] bg-primary/10 text-primary border border-primary/25 px-1.5 py-0.5 rounded font-mono font-semibold">
                        Campus Repo
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-border/60 mt-auto grid grid-cols-2 gap-2">
                <a
                  href={student.githubUrl || `https://github.com/${student.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs gap-1.5 cursor-pointer shadow-xs hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <GithubIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">GitHub</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground shrink-0" />
                  </Button>
                </a>
                <a
                  href={student.linkedinUrl || `https://www.linkedin.com/in/${student.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs gap-1.5 cursor-pointer shadow-xs hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-all"
                  >
                    <LinkedinIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">LinkedIn</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground shrink-0" />
                  </Button>
                </a>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Rest of Competitors (Ranks 4+) */}
      <div className="mt-8 space-y-3 pt-4 border-t border-border/80">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
            Contender Rankings (Ranks 4 - 6)
          </h3>
          <Link href="/leaderboard">
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/90 h-7 px-2">
              <span>See All Student Rankings</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayRemaining.map((student) => {
            const stats = student[timeframe];
            return (
              <Card
                key={student.id}
                className="flex flex-col justify-between border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        #{stats.rank}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                        {stats.points} PTS
                      </span>
                    </div>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md border", student.badgeColor)}>
                      {student.badge}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="h-9 w-9 rounded-full border border-border bg-muted p-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-foreground truncate">
                        {student.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                        @{student.username} • {student.department}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 p-2 rounded-lg bg-muted/40 text-center text-xs">
                    <div>
                      <div className="font-bold text-foreground">{stats.mergedPrs ?? stats.prs}</div>
                      <div className="text-[9px] text-muted-foreground font-mono uppercase font-semibold">Merged</div>
                    </div>
                    <div>
                      <div className="font-bold text-emerald-600">{stats.qualityPrs}</div>
                      <div className="text-[9px] text-muted-foreground font-mono uppercase font-semibold">Quality Pt</div>
                    </div>
                    <div>
                      <div className="font-bold text-amber-500">{stats.openPrs ?? 1}</div>
                      <div className="text-[9px] text-muted-foreground font-mono uppercase font-semibold">Open PR</div>
                    </div>
                    <div>
                      <div className="font-bold text-purple-500">{stats.closedPrs ?? (stats.prs + 1)}</div>
                      <div className="text-[9px] text-muted-foreground font-mono uppercase font-semibold">Closed PR</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                    &ldquo;{stats.topContribution.title}&rdquo;
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-border/50 grid grid-cols-2 gap-2">
                  <a
                    href={student.githubUrl || `https://github.com/${student.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-xs h-7 gap-1 text-muted-foreground hover:text-foreground border border-border/40 hover:border-border cursor-pointer shadow-xs"
                    >
                      <GithubIcon className="h-3 w-3 shrink-0" />
                      <span className="truncate">GitHub</span>
                      <ExternalLink className="h-2.5 w-2.5 ml-auto shrink-0" />
                    </Button>
                  </a>
                  <a
                    href={student.linkedinUrl || `https://www.linkedin.com/in/${student.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-xs h-7 gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-500 border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer shadow-xs"
                    >
                      <LinkedinIcon className="h-3 w-3 shrink-0" />
                      <span className="truncate">LinkedIn</span>
                      <ExternalLink className="h-2.5 w-2.5 ml-auto shrink-0" />
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
