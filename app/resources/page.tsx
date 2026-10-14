"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  GitPullRequest,
  CheckCircle2,
  Terminal,
  Newspaper,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/components/navigation/navigation-context";
import { InteractiveFirstPrGuide } from "@/components/resources/interactive-first-pr-guide";

const VALID_RESOURCE_TABS = ["learn-to-pr", "make-first-pr", "blog"] as const;
type ResourceTab = (typeof VALID_RESOURCE_TABS)[number];

export default function ResourcesPage() {
  const { activeSection } = useNavigation();
  // Robust algorithm matching Programs: safely falls back to default if activeSection is invalid or null
  const defaultTab: ResourceTab = "learn-to-pr";
  const currentTab: ResourceTab = VALID_RESOURCE_TABS.includes(activeSection as ResourceTab)
    ? (activeSection as ResourceTab)
    : defaultTab;

  const learnConcepts = [
    {
      title: "Understanding the Pull Request Lifecycle",
      category: "Git Architecture",
      description:
        "A pull request (PR) is a formal proposal to merge changes from your independent branch or fork into an upstream codebase. It provides a collaborative forum for peer code reviews, automated CI checks, and architectural validation before code hits production.",
      keyTakeaways: [
        "Origin vs. Upstream: Maintain a synchronized link with the main campus repository",
        "Feature Branches: Always isolate your work onto dedicated branch names",
        "Atomic Commits: Keep each commit focused on one cohesive logical change",
      ],
    },
    {
      title: "Conventional Commit Standards",
      category: "Engineering Etiquette",
      description:
        "ZenithenOpen projects enforce the Conventional Commits specification to generate automated release changelogs and maintain clean git histories.",
      keyTakeaways: [
        "feat: Introduces a new user-facing feature (e.g., feat: add dark theme switcher)",
        "fix: Patches an existing software defect (e.g., fix: resolve sidebar overflow on mobile)",
        "docs: Updates documentation, markdown files, or guides",
        "refactor: Restructures existing code without altering external behavior",
      ],
    },
    {
      title: "Resolving Git Merge Conflicts",
      category: "Advanced Workflow",
      description:
        "Merge conflicts happen when two branches modify the same lines of code. Resolving them cleanly is a critical skill for any professional open-source software engineer.",
      keyTakeaways: [
        "Pull latest changes from upstream main before opening or updating a PR",
        "Use git rebase upstream/main to replay your commits cleanly on top",
        "Resolve conflicts in your IDE, verify builds, and push with confidence",
      ],
    },
  ];



  const blogPosts = [
    {
      title: "How I Cracked My First GSoC as a Sophomore Developer",
      author: "IST Alumni Scholar",
      date: "October 2026",
      readTime: "6 min read",
      category: "Career & Fellowships",
      excerpt:
        "A tactical breakdown of proposal writing, communicating with maintainers, and turning small documentation pull requests into an accepted Google Summer of Code project.",
    },
    {
      title: "Understanding Git Under the Hood: Blobs, Trees, and Commits",
      author: "ZenithenOpen Core Team",
      date: "September 2026",
      readTime: "8 min read",
      category: "Engineering Deep Dive",
      excerpt:
        "Demystifying the internal object database of Git. Learn how directed acyclic graphs (DAGs) and SHA hashes power modern distributed version control.",
    },
    {
      title: "Building Real-Time Multi-Theme Engines with CSS Variables",
      author: "Lead Frontend Maintainer",
      date: "August 2026",
      readTime: "5 min read",
      category: "Web Architecture",
      excerpt:
        "A case study on architecting ZenithenOpen's 7-preset instant theme system using HSL color variables, localStorage persistence, and zero page reloads.",
    },
    {
      title: "Why Campus Open-Source Matters for Your Engineering Career",
      author: "Community Mentors",
      date: "July 2026",
      readTime: "4 min read",
      category: "Community Insights",
      excerpt:
        "How shipping verified pull requests into production repositories accelerates technical interviews and outshines generic classroom resume projects.",
    },
  ];

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

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Developer Enablement & Knowledge</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Developer Resources
          </h1>

          <div className="p-4 rounded-xl border border-border bg-card/60">
            <p className="text-base font-semibold text-primary">
              &ldquo;Learn to make first PR&rdquo;
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Step-by-step guidance, git fundamentals, interactive pull request checklists, and in-depth technical blogs. Switch between resources using the top navbar options.
            </p>
          </div>
        </div>

        {/* ONLY THE SELECTED RESOURCE SECTION - NO OTHER THINGS */}
        <div className="mt-10">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Section: Learn to PR */}
          {currentTab === "learn-to-pr" && (
            <section className="space-y-6 rounded-2xl border-2 border-primary/30 bg-card p-6 sm:p-10 shadow-lg shadow-primary/5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25 text-primary">
                  <GitPullRequest className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2.5 py-0.5 rounded-md bg-muted border border-border">
                    Foundational Knowledge
                  </span>
                  <h2 className="text-2xl font-bold text-foreground mt-1">
                    Learn Pull Requests (Learn to PR)
                  </h2>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {learnConcepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                        {concept.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground">
                      {concept.title}
                    </h3>

                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {concept.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-border/80 space-y-2">
                      {concept.keyTakeaways.map((point, pIdx) => (
                        <div key={pIdx} className="flex items-start space-x-2 text-xs text-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="leading-snug text-muted-foreground">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Make First PR */}
          {currentTab === "make-first-pr" && (
            <section className="space-y-6">
              <InteractiveFirstPrGuide />
            </section>
          )}

          {/* Section: Blog */}
          {currentTab === "blog" && (
            <section className="space-y-6 rounded-2xl border-2 border-primary/30 bg-card p-6 sm:p-10 shadow-lg shadow-primary/5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25 text-primary">
                  <Newspaper className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2.5 py-0.5 rounded-md bg-muted border border-border">
                    Engineering Articles
                  </span>
                  <h2 className="text-2xl font-bold text-foreground mt-1">
                    Technical Blog & Engineering Stories
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {blogPosts.map((post, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                          {post.category}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-foreground leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border/80 flex items-center justify-between text-xs">
                      <div className="flex items-center text-muted-foreground font-mono text-[11px]">
                        <Calendar className="h-3 w-3 mr-1 text-primary" />
                        <span>{post.date} &bull; {post.author}</span>
                      </div>
                      <Link href="https://github.com/IST-ZenithenLab/ZenithenOpen" target="_blank" rel="noreferrer">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          <span>Read Article</span>
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
