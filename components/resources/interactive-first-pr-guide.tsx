"use client";

import * as React from "react";
import {
  Check,
  Copy,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  GitPullRequest,
  Terminal,
  ShieldCheck,
  Code2,
  FolderGit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepConfig {
  id: number;
  title: string;
  category: string;
  description: string;
  getCommand: (username: string, featureSlug: string) => string;
  linkText?: string;
  linkUrl?: string;
  tip?: string;
}

const STEPS: StepConfig[] = [
  {
    id: 1,
    title: "Find a Good First Issue",
    category: "Step 1: Discover",
    description:
      "Explore open issues on the official ZenithenOpen campus repository. Look for issues labeled 'good first issue' or 'help wanted' that match your technical stack (React, Next.js, Prisma, Tailwind).",
    getCommand: () =>
      "https://github.com/IST-ZenithenLab/ZenithenOpen/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22",
    linkText: "View Good First Issues on GitHub",
    linkUrl:
      "https://github.com/IST-ZenithenLab/ZenithenOpen/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22",
    tip: "Comment on the issue expressing your interest so campus maintainers can assign it to you before you start coding.",
  },
  {
    id: 2,
    title: "Fork the Upstream Repository",
    category: "Step 2: Fork",
    description:
      "Create your personal fork of IST-ZenithenLab/ZenithenOpen on GitHub so you can safely develop and push commits without touching upstream main directly.",
    getCommand: () => "gh repo fork IST-ZenithenLab/ZenithenOpen --clone=false",
    linkText: "Fork IST-ZenithenLab/ZenithenOpen",
    linkUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen/fork",
    tip: "Uncheck 'Copy the main branch only' if you want full commit histories.",
  },
  {
    id: 3,
    title: "Clone Your Personal Fork Locally",
    category: "Step 3: Setup",
    description:
      "Download your personal fork to your machine and configure the official campus repository as the upstream remote to stay synchronized.",
    getCommand: (user) =>
      `git clone https://github.com/${user || "<your-github-username>"}/ZenithenOpen.git; cd ZenithenOpen; git remote add upstream https://github.com/IST-ZenithenLab/ZenithenOpen.git`,
    tip: "Running 'git remote -v' will verify you have origin (your fork) and upstream (IST-ZenithenLab).",
  },
  {
    id: 4,
    title: "Install Dependencies & Create Feature Branch",
    category: "Step 4: Branch",
    description:
      "Install required dependencies and spin up an isolated branch named with conventional prefixes (feature/*, fix/*, or docs/*).",
    getCommand: (_user, slug) =>
      `npm install --ignore-scripts; git checkout -b feature/${slug || "my-first-contribution"}`,
    tip: "Never work directly on main. Branch names should be lowercase and hyphen-separated.",
  },
  {
    id: 5,
    title: "Implement Changes & Verify Code Quality",
    category: "Step 5: Quality Check",
    description:
      "Develop your code changes, then run local validation to ensure type checking and automated tests pass before committing.",
    getCommand: () => "npm run typecheck; npm test",
    tip: "Running local checks catches TypeScript errors before CI workflows run on GitHub.",
  },
  {
    id: 6,
    title: "Commit and Push to Your Fork",
    category: "Step 6: Push",
    description:
      "Stage your modifications, craft a Conventional Commit message, and push your branch to your origin repository.",
    getCommand: (_user, slug) =>
      `git add -A; git commit -m "feat: implement ${slug || "contributor-feature"}"; git push -u origin feature/${slug || "my-first-contribution"}`,
    tip: "Use conventional commit prefixes: feat:, fix:, docs:, refactor:, test:.",
  },
  {
    id: 7,
    title: "Open Pull Request to IST-ZenithenLab",
    category: "Step 7: Submit",
    description:
      "Head to the ZenithenOpen repository and click 'Compare & pull request'. Fill in what your PR solves and reference the relevant issue.",
    getCommand: () => "https://github.com/IST-ZenithenLab/ZenithenOpen/compare",
    linkText: "Open Pull Request on GitHub",
    linkUrl: "https://github.com/IST-ZenithenLab/ZenithenOpen/compare",
    tip: "Add 'Closes #<issue_number>' in your PR description so GitHub automatically closes the issue once merged.",
  },
];

export function InteractiveFirstPrGuide() {
  const [username, setUsername] = React.useState("");
  const [featureSlug, setFeatureSlug] = React.useState("my-campus-feature");
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const [copiedId, setCopiedId] = React.useState<number | null>(null);
  const [preflights, setPreflights] = React.useState<{ [key: string]: boolean }>({
    lint: false,
    scope: false,
    convention: false,
    issue: false,
  });

  // Load saved progress from localStorage on mount
  React.useEffect(() => {
    try {
      const savedUser = localStorage.getItem("zenithen_pr_username");
      if (savedUser) setUsername(savedUser);

      const savedSlug = localStorage.getItem("zenithen_pr_slug");
      if (savedSlug) setFeatureSlug(savedSlug);

      const savedSteps = localStorage.getItem("zenithen_pr_steps");
      if (savedSteps) setCompletedSteps(JSON.parse(savedSteps));
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const handleUsernameChange = (val: string) => {
    const cleaned = val.trim().replace(/^@/, "");
    setUsername(cleaned);
    try {
      localStorage.setItem("zenithen_pr_username", cleaned);
    } catch {}
  };

  const handleSlugChange = (val: string) => {
    const cleaned = val
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    setFeatureSlug(cleaned);
    try {
      localStorage.setItem("zenithen_pr_slug", cleaned);
    } catch {}
  };

  const toggleStep = (stepId: number) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId];
      try {
        localStorage.setItem("zenithen_pr_steps", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetProgress = () => {
    setCompletedSteps([]);
    setPreflights({
      lint: false,
      scope: false,
      convention: false,
      issue: false,
    });
    try {
      localStorage.removeItem("zenithen_pr_steps");
    } catch {}
  };

  const copyCommand = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePreflight = (key: string) => {
    setPreflights((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const progressPercentage = Math.round((completedSteps.length / STEPS.length) * 100);
  const isAllCompleted = completedSteps.length === STEPS.length;

  return (
    <div className="space-y-6">
      {/* Header and Customization Toolbar */}
      <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-primary uppercase tracking-wider">
              <FolderGit2 className="h-4 w-4" />
              <span>Interactive Workflow Engine</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Personalized First PR Walkthrough
            </h3>
            <p className="text-xs text-muted-foreground">
              Enter your GitHub details to customize all terminal commands in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={resetProgress}
              className="text-xs h-8 cursor-pointer border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              <span>Reset Guide</span>
            </Button>
          </div>
        </div>

        {/* Inputs for Personalization */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 font-mono">
              Your GitHub Username:
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="e.g. aditya-ist"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Commands will use <code className="text-primary font-semibold">https://github.com/{username || "&lt;username&gt;"}</code>
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 font-mono">
              Contribution Slug / Branch Name:
            </label>
            <div className="relative">
              <input
                type="text"
                value={featureSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. add-student-badges"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Branch will be <code className="text-primary font-semibold">feature/{featureSlug || "my-branch"}</code>
            </span>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-6 pt-5 border-t border-border/80">
          <div className="flex items-center justify-between text-xs font-semibold font-mono mb-2">
            <div className="flex items-center space-x-2 text-foreground">
              <span>PR Readiness Progress:</span>
              <span className="text-primary">{completedSteps.length} of {STEPS.length} Completed</span>
            </div>
            <span className="text-primary font-bold">{progressPercentage}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-primary to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 100% Celebration Banner */}
      {isAllCompleted && (
        <div className="rounded-2xl border-2 border-primary bg-primary/10 p-6 text-foreground shadow-lg shadow-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">
                🎉 All 7 Steps Completed — You are Ready to Submit!
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Head over to IST-ZenithenLab/ZenithenOpen to submit your Pull Request. Once merged, your verified student proof-of-work badge will automatically unlock!
              </p>
            </div>
          </div>
          <a
            href="https://github.com/IST-ZenithenLab/ZenithenOpen/compare"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button className="h-9 px-4 text-xs font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
              <GitPullRequest className="h-4 w-4 mr-2" />
              <span>Open PR on GitHub</span>
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </Button>
          </a>
        </div>
      )}

      {/* The 7 Interactive Steps */}
      <div className="space-y-4">
        {STEPS.map((step) => {
          const isDone = completedSteps.includes(step.id);
          const commandText = step.getCommand(username, featureSlug);

          return (
            <div
              key={step.id}
              className={`rounded-2xl border transition-all p-5 shadow-xs ${
                isDone
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-xl border text-xs font-bold font-mono transition-colors cursor-pointer shrink-0 ${
                      isDone
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/60 text-muted-foreground hover:border-primary hover:text-foreground"
                    }`}
                    title={isDone ? "Mark incomplete" : "Mark completed"}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                        {step.category}
                      </span>
                      <h4
                        className={`text-sm font-bold ${
                          isDone ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-start shrink-0">
                  {step.linkUrl && (
                    <a
                      href={step.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center font-semibold font-mono"
                    >
                      <span>{step.linkText || "Open link"}</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                  <Button
                    variant={isDone ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => toggleStep(step.id)}
                    className="h-7 text-[11px] px-2.5 cursor-pointer font-mono"
                  >
                    {isDone ? "Undo" : "Mark as Done"}
                  </Button>
                </div>
              </div>

              {/* Command Snippet Block */}
              <div className="mt-3 ml-0 sm:ml-10">
                <div className="flex items-center justify-between rounded-xl bg-muted/70 border border-border/80 px-3.5 py-2.5 font-mono text-xs text-foreground overflow-x-auto">
                  <div className="flex items-center space-x-2 truncate mr-2">
                    <Terminal className="h-3.5 w-3.5 text-primary shrink-0" />
                    <code className="text-[11px] truncate text-primary/90 font-medium">
                      {commandText}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCommand(commandText, step.id)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                    title="Copy command"
                  >
                    {copiedId === step.id ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {step.tip && (
                  <p className="mt-1.5 text-[11px] text-muted-foreground italic flex items-center space-x-1.5">
                    <span className="font-semibold text-primary">Pro-tip:</span>
                    <span>{step.tip}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pre-flight PR Quality Checklist */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center space-x-2.5 mb-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-bold text-foreground font-mono uppercase tracking-wide">
            Pre-flight Quality Checklist Before Submitting
          </h4>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Campus maintainers review each PR carefully. Check these items off to ensure rapid review and zero merge delays:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              key: "lint",
              label: "TypeScript checks pass cleanly (npm run typecheck)",
            },
            {
              key: "scope",
              label: "Changes are focused on a single issue without unrelated diffs",
            },
            {
              key: "convention",
              label: "Commit messages follow Conventional Commits (feat:, fix:, docs:)",
            },
            {
              key: "issue",
              label: "PR description clearly references issue (e.g. Closes #42)",
            },
          ].map((item) => (
            <label
              key={item.key}
              onClick={() => togglePreflight(item.key)}
              className="flex items-start space-x-3 p-3 rounded-xl border border-border/80 bg-background/50 hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={preflights[item.key] || false}
                onChange={() => {}}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-xs text-foreground leading-snug">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
