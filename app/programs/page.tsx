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
  ChevronDown,
  Flame,
  Award,
  Sparkles,
  Plus,
  X,
  AlertCircle,
  BookOpen,
  Search,
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
import { Project, LearningPath } from "@/types";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import {
  STUDENT_COMPETITORS,
  CompetitionTimeframe,
  StudentContributor,
} from "@/lib/data/student-competition";
import { useNavigation } from "@/components/navigation/navigation-context";
import { ContributorRankingsTable } from "@/components/leaderboard/contributor-rankings-table";
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
      "Detailed pull request reviews by senior student engineers",
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
      "Developer Portfolio & Proof-of-Work Showcase (React, GitHub REST API)",
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
      "A prestigious global fellowship program bringing student developers into open-source software organizations with expert guidance and stipends.",
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
      "Stipend guidance and international developer networking",
    ],
    actionLabel: "Explore Fellowship Resources",
    actionHref: "/resources",
    icon: Coins,
  },
  {
    id: "learning-paths",
    category: "Learning Roadmaps",
    title: "Engineering Curriculums & Roadmaps",
    badge: "Structured Tracks",
    description:
      "Curated, step-by-step engineering tracks designed for IST students. Master full-stack Next.js, applied AI systems, cloud containerization, and open-source fellowship playbooks.",
    details: [
      "Full-Stack Web with Next.js & TypeScript (6 Weeks)",
      "Applied AI & Open Data Science (8 Weeks)",
      "DevOps, Containers & Cloud Engineering (6 Weeks)",
      "Google Summer of Code (GSoC) Playbook (8 Weeks)",
    ],
    actionLabel: "Explore Learning Paths",
    actionHref: "#learning-paths-catalog",
    icon: Rocket,
  },
];

export default function ProgramsPage() {
  const { activeSection } = useNavigation();
  const [isCompetitionOpen, setIsCompetitionOpen] = React.useState(true);
  const [competitionTimeframe, setCompetitionTimeframe] = React.useState<CompetitionTimeframe>("week");
  const [competitors, setCompetitors] = React.useState<StudentContributor[]>(STUDENT_COMPETITORS);

  React.useEffect(() => {
    let isMounted = true;
    async function loadLeaderboard() {
      try {
        const res = await fetch(`/api/students/leaderboard?timeframe=${competitionTimeframe}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.competitors) && data.competitors.length > 0) {
            setCompetitors(data.competitors);
          }
        }
      } catch (err) {
        console.warn("[Competition Arena] Live leaderboard fetch notice:", err);
      }
    }

    loadLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [competitionTimeframe]);

  // Default to Open Source
  const defaultProgramId = "open-source";
  const currentSelectedId = activeSection || defaultProgramId;
  const currentProgram = PROGRAMS.find((p) => p.id === currentSelectedId) || PROGRAMS[0];

  const CurrentIcon = currentProgram.icon;
  const [campusProjects, setCampusProjects] = React.useState<Project[]>([]);
  const [isAddProjectOpen, setIsAddProjectOpen] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectRepo, setNewProjectRepo] = React.useState("");
  const [newProjectTagline, setNewProjectTagline] = React.useState("");
  const [newProjectLang, setNewProjectLang] = React.useState("TypeScript");
  const [newProjectStudentId, setNewProjectStudentId] = React.useState("");
  const [newProjectTags, setNewProjectTags] = React.useState("");
  const [repoError, setRepoError] = React.useState("");
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  React.useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.projects) && data.projects.length > 0) {
            setCampusProjects(data.projects);
          }
        }
      } catch (err) {
        console.warn("[Programs] Live projects fetch error:", err);
      }
    }
    loadProjects();
  }, []);

  const handleAddProjectSubmit = async (e: React.FormEvent) => {
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

    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newProject.slug,
          name: newProject.name,
          tagline: newProject.tagline,
          description: newProject.description,
          repositoryUrl: newProject.repositoryUrl,
          primaryLanguage: newProject.primaryLanguage,
          tags: newProject.tags,
        }),
      });
    } catch (err) {
      console.warn("[Programs] Project registration notice:", err);
    }

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
  const sortedStudents = [...competitors].sort(
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

              {/* Engineering Learning Paths & Roadmaps */}
              {currentProgram.id === "learning-paths" && (
                <LearningPathsSection />
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
  podiumStudents: StudentContributor[];
  remainingStudents: StudentContributor[];
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
  const campusRepoFilter = (student: StudentContributor) => {
    const repo = student[timeframe].topContribution.repo.toLowerCase();
    return repo.startsWith("ist-zenithenlab/") || repo.includes("zenithen");
  };

  const displayPodium = isCampusReposOnly
    ? podiumStudents.filter(campusRepoFilter)
    : podiumStudents;

  const displayRemaining = isCampusReposOnly
    ? remainingStudents.filter(campusRepoFilter)
    : remainingStudents;

  const allContributorsTableItems = React.useMemo(() => {
    const list = [...displayPodium, ...displayRemaining];
    list.sort((a, b) => {
      const statsA = a[timeframe];
      const statsB = b[timeframe];
      const mDiff = (statsB.mergedPrs ?? 0) - (statsA.mergedPrs ?? 0);
      if (mDiff !== 0) return mDiff;
      const iDiff = (statsB.issuesOpened ?? 0) - (statsA.issuesOpened ?? 0);
      if (iDiff !== 0) return iDiff;
      const oDiff = (statsB.openPrs ?? 0) - (statsA.openPrs ?? 0);
      if (oDiff !== 0) return oDiff;
      const cDiff = (statsB.closedPrs ?? 0) - (statsA.closedPrs ?? 0);
      if (cDiff !== 0) return cDiff;
      return a.username.localeCompare(b.username);
    });
    return list.map((student, idx) => ({
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
  }, [displayPodium, displayRemaining, timeframe]);

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
              ? "Only student developers actively contributing to official IST campus repositories (ZenithenOpen & First-PR) are featured on this page."
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
                </div>

                {/* Student Profile Info */}
                <Link
                  href={`/members/${encodeURIComponent(student.username)}`}
                  className="flex items-center space-x-3 group hover:opacity-90 transition-opacity"
                >
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="h-12 w-12 rounded-full border-2 border-primary/30 bg-muted/80 shrink-0 p-0.5 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {student.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      @{student.username}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      {student.year}
                    </p>
                  </div>
                </Link>
              </CardHeader>

              <CardContent className="pt-0 space-y-3.5">
                {/* Badge */}
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md border", student.badgeColor)}>
                    {student.badge}
                  </span>
                </div>

                {/* Competition Stats Metrics: Merged, Issues Opened, PR Open, Closed PR */}
                <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-muted/50 border border-border/60 text-center">
                  <div>
                    <div className="text-sm font-extrabold text-emerald-500">
                      {stats.mergedPrs ?? 0}
                    </div>
                    <div className="text-[9px] uppercase font-mono text-muted-foreground font-semibold truncate" title="Merged PRs">
                      Merged
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-amber-500">
                      {stats.issuesOpened ?? 0}
                    </div>
                    <div className="text-[9px] uppercase font-mono text-muted-foreground font-semibold truncate" title="Issues Opened">
                      Issues
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-blue-500">
                      {stats.openPrs ?? 0}
                    </div>
                    <div className="text-[9px] uppercase font-mono text-muted-foreground font-semibold truncate" title="Open PRs">
                      PR Open
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-rose-500">
                      {stats.closedPrs ?? 0}
                    </div>
                    <div className="text-[9px] uppercase font-mono text-muted-foreground font-semibold truncate" title="Closed PRs">
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

      {/* Complete Rankings Table */}
      <div className="mt-8 space-y-4 pt-4 border-t border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Complete Open-Source Contributor Standings
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified ranking based strictly on open-source contributions: merged PRs, opened issues, active PRs, and closed PRs.
            </p>
          </div>
          <Link href="/leaderboard" className="shrink-0">
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/90 h-7 px-2">
              <span>View Dedicated Leaderboard</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>

        <ContributorRankingsTable
          contributors={allContributorsTableItems}
          title="All Contributor Rankings"
          subtitle={`Real-time verified pull requests for ${timeframe === "week" ? "this week" : timeframe === "month" ? "this month" : "all-time"}.`}
          developerCountLabel={`${allContributorsTableItems.length} active developers`}
        />
      </div>
    </motion.div>
  );
}

function LearningPathsSection() {
  const [paths, setPaths] = React.useState<LearningPath[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedLevel, setSelectedLevel] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [expandedSlug, setExpandedSlug] = React.useState<string | null>(null);
  const [enrolledMap, setEnrolledMap] = React.useState<Record<string, { currentWeek: number; completedWeeks: number[] }>>({});

  React.useEffect(() => {
    let active = true;
    async function loadPaths() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (selectedLevel !== "all") query.set("level", selectedLevel);
        if (searchQuery.trim()) query.set("search", searchQuery.trim());
        const res = await fetch(`/api/learning-paths?${query.toString()}`);
        const data = await res.json();
        if (active && data.success && Array.isArray(data.paths)) {
          setPaths(data.paths);
        }
      } catch (err) {
        console.warn("Failed to load learning paths:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPaths();
    return () => {
      active = false;
    };
  }, [selectedLevel, searchQuery]);

  const toggleExpand = (slug: string) => {
    setExpandedSlug((prev) => (prev === slug ? null : slug));
  };

  const handleProgress = async (path: LearningPath) => {
    const current = enrolledMap[path.slug] || { currentWeek: 1, completedWeeks: [] };
    const nextWeek = Math.min(current.currentWeek + 1, path.estimatedWeeks);
    const newCompleted = Array.from(new Set([...current.completedWeeks, current.currentWeek]));

    setEnrolledMap((prev) => ({
      ...prev,
      [path.slug]: { currentWeek: nextWeek, completedWeeks: newCompleted },
    }));

    try {
      await fetch(`/api/learning-paths/${path.slug}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user",
          currentWeek: nextWeek,
          completedWeeks: newCompleted,
          isCompleted: nextWeek >= path.estimatedWeeks,
        }),
      });
    } catch (e) {
      console.warn("Progress update failed:", e);
    }
  };

  return (
    <motion.div
      id="learning-paths-catalog"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-6 pt-2"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Structured Tracks</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Engineering Learning Roadmaps
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Step-by-step engineering tracks authored for IST student contributors. Master foundational systems, applied AI, and cloud architectures.
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border/60 bg-muted/30">
          {(["all", "beginner", "intermediate", "advanced"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all capitalize font-mono",
                selectedLevel === lvl
                  ? "bg-background text-foreground shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by skill (e.g. Next.js, PyTorch, Docker)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-xs font-mono h-9 bg-muted/20 border-border/60"
        />
      </div>

      {/* Roadmaps Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-xl border border-border/40 bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : paths.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-border/60 text-muted-foreground text-sm font-mono">
          No learning paths found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {paths.map((path) => {
            const isExpanded = expandedSlug === path.slug;
            const progress = enrolledMap[path.slug];
            const isStarted = Boolean(progress);

            return (
              <Card
                key={path.id || path.slug}
                className="relative overflow-hidden border border-border/60 bg-card hover:border-primary/40 transition-all shadow-sm"
              >
                {/* Accent line */}
                <div
                  className="h-1 w-full"
                  style={{ backgroundColor: path.color || "var(--primary)" }}
                />

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                      {path.level}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span>{path.estimatedWeeks} Weeks</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground mt-2">
                    {path.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                    {path.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pb-3">
                  {/* Target Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {path.targetSkills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Progress indicator if started */}
                  {isStarted && (
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs font-mono">
                      <div className="flex justify-between items-center text-muted-foreground mb-1">
                        <span>Current Week</span>
                        <span className="font-bold text-primary">
                          Week {progress.currentWeek} of {path.estimatedWeeks}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (progress.completedWeeks.length / path.estimatedWeeks) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expandable Weekly Curriculum */}
                  {isExpanded && path.curriculum && path.curriculum.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-2 border-t border-border/40"
                    >
                      <div className="text-[11px] font-mono font-semibold text-muted-foreground uppercase">
                        Weekly Modules
                      </div>
                      {path.curriculum.map((week) => (
                        <div
                          key={week.weekNumber}
                          className="p-2 rounded-md bg-muted/30 border border-border/40 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">
                              Week {week.weekNumber}: {week.title}
                            </span>
                            {progress?.completedWeeks?.includes(week.weekNumber) && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            {week.summary}
                          </p>
                          {week.milestoneProject && (
                            <div className="text-[10px] font-mono text-primary flex items-center gap-1 mt-1">
                              <Rocket className="h-2.5 w-2.5" />
                              <span>Project: {week.milestoneProject}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleExpand(path.slug)}
                    className="text-xs h-8 text-muted-foreground hover:text-foreground font-mono gap-1"
                  >
                    <span>{isExpanded ? "Hide Modules" : "View Curriculum"}</span>
                    <ChevronDown className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")} />
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleProgress(path)}
                    className="text-xs h-8 font-mono gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{isStarted ? "Log Next Week" : "Start Roadmap"}</span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
