"use client";

import * as React from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Filter,
  ExternalLink,
  BookOpen,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GithubIcon } from "@/components/ui/icons";
import { Opportunity } from "@/types";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>("all");

  // Modal State for Curating an Issue
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [issueTitle, setIssueTitle] = React.useState("");
  const [repoFullName, setRepoFullName] = React.useState("IST-ZenithenLab/ZenithenOpen");
  const [issueNumber, setIssueNumber] = React.useState("");
  const [issueUrl, setIssueUrl] = React.useState("");
  const [issueLanguage, setIssueLanguage] = React.useState("TypeScript");
  const [issueDifficulty, setIssueDifficulty] = React.useState("beginner");
  const [issueLabels, setIssueLabels] = React.useState("good-first-issue, frontend");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Fetch opportunities from live backend API
  const fetchOpportunities = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (difficultyFilter !== "all") params.append("difficulty", difficultyFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.opportunities)) {
        setOpportunities(data.opportunities);
      } else {
        setOpportunities([]);
      }
    } catch (err) {
      console.error("[OpportunitiesPage] Failed to fetch opportunities:", err);
      setOpportunities([]);
    } finally {
      setIsLoading(false);
    }
  }, [difficultyFilter, searchQuery]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchOpportunities();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchOpportunities]);

  // Handle curating a new issue
  const handleCurateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const num = parseInt(issueNumber.trim(), 10);
    if (!issueTitle.trim() || !issueUrl.trim() || isNaN(num) || num <= 0) {
      setFormError("Valid title, repository, positive issue number, and URL are required.");
      return;
    }

    setSubmitting(true);
    try {
      const parsedLabels = issueLabels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: issueTitle.trim(),
          repoFullName: repoFullName.trim(),
          issueNumber: num,
          issueUrl: issueUrl.trim(),
          language: issueLanguage,
          difficulty: issueDifficulty,
          labels: parsedLabels.length > 0 ? parsedLabels : ["good-first-issue"],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to curate opportunity.");
        return;
      }

      setSuccessMessage(`Opportunity #${num} successfully added to board!`);
      await fetchOpportunities();

      setTimeout(() => {
        setCreateModalOpen(false);
        setSuccessMessage(null);
        setIssueTitle("");
        setIssueNumber("");
        setIssueUrl("");
        setIssueLabels("good-first-issue, frontend");
      }, 1800);
    } catch (_err: unknown) {
      setFormError("Network error connecting to opportunities service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-background text-foreground min-h-screen transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-accent font-mono">
            <Compass className="h-4 w-4" />
            <span>Open Source Issue Finder</span>
          </div>
          <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Opportunity Board
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Curated, triaged GitHub issues from ZenithenOpen repositories categorized for student developers.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setFormError(null);
                  setSuccessMessage(null);
                  setCreateModalOpen(true);
                }}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md text-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Curate Issue</span>
              </Button>
              <a
                href="https://github.com/issues?q=is%3Aopen+is%3Aissue+archived%3Afalse+label%3Agood-first-issue"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2 border-border text-xs cursor-pointer">
                  <GithubIcon className="h-4 w-4" />
                  <span>Global Issues</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues by title, label, or repository..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border text-foreground text-xs focus:border-primary"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground flex items-center">
                <Filter className="h-3 w-3 mr-1" /> Difficulty:
              </span>
              {(["all", "beginner", "intermediate", "advanced"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize font-medium transition-colors cursor-pointer ${
                    difficultyFilter === diff
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-muted border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Issues Grid or Zero State */}
        {isLoading ? (
          <div className="mt-16 flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Loading open-source opportunities...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-16 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 border border-accent/30 text-accent mb-4">
              <Compass className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Issues Found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              No open opportunities match the selected criteria. Curate an issue or explore starter guides.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Curate Starter Issue</span>
              </Button>
              <Link href="/resources">
                <Button variant="outline" className="text-xs border-border">
                  <BookOpen className="h-4 w-4 mr-1.5" />
                  <span>View Guides</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {opportunities.map((opp) => (
              <Card
                key={opp.id}
                className="group relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-colors duration-150 border-border bg-card"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold text-primary">
                          {opp.repoFullName}#{opp.issueNumber}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        <a
                          href={opp.issueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {opp.title}
                        </a>
                      </CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-md capitalize shrink-0 ${
                        opp.difficulty === "beginner"
                          ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/30"
                          : opp.difficulty === "intermediate"
                          ? "text-amber-600 bg-amber-500/10 border-amber-500/30"
                          : "text-rose-600 bg-rose-500/10 border-rose-500/30"
                      }`}
                    >
                      {opp.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {opp.labels.map((label) => (
                      <span
                        key={label.name}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/50"
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/60 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          opp.language === "TypeScript"
                            ? "#3178c6"
                            : opp.language === "C++"
                            ? "#f34b7d"
                            : opp.language === "Python"
                            ? "#3572A5"
                            : "#10b981",
                      }}
                    />
                    <span className="font-semibold text-foreground">{opp.language}</span>
                  </div>
                  <a
                    href={opp.issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 shadow-xs cursor-pointer">
                      <GithubIcon className="h-3.5 w-3.5" />
                      <span>View on GitHub</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Curate Issue */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Curate Starter Issue</h3>
                    <p className="text-xs text-muted-foreground">Add open GitHub issue to opportunity board</p>
                  </div>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {successMessage ? (
                <div className="mt-6 py-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">Issue Curated</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{successMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleCurateIssue} className="mt-6 space-y-4">
                  {formError && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Issue Title
                    </label>
                    <Input
                      required
                      placeholder="e.g. Implement responsive navigation bar drawer"
                      value={issueTitle}
                      onChange={(e) => setIssueTitle(e.target.value)}
                      className="bg-background border-border text-foreground text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Repository
                      </label>
                      <Input
                        required
                        placeholder="IST-ZenithenLab/ZenithenOpen"
                        value={repoFullName}
                        onChange={(e) => setRepoFullName(e.target.value)}
                        className="bg-background border-border text-foreground text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Issue #
                      </label>
                      <Input
                        required
                        type="number"
                        placeholder="42"
                        value={issueNumber}
                        onChange={(e) => setIssueNumber(e.target.value)}
                        className="bg-background border-border text-foreground text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Issue URL
                    </label>
                    <Input
                      required
                      placeholder="https://github.com/IST-ZenithenLab/ZenithenOpen/issues/..."
                      value={issueUrl}
                      onChange={(e) => setIssueUrl(e.target.value)}
                      className="bg-background border-border text-foreground text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Difficulty
                      </label>
                      <select
                        value={issueDifficulty}
                        onChange={(e) => setIssueDifficulty(e.target.value)}
                        className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary capitalize"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Language
                      </label>
                      <select
                        value={issueLanguage}
                        onChange={(e) => setIssueLanguage(e.target.value)}
                        className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="TypeScript">TypeScript</option>
                        <option value="Python">Python</option>
                        <option value="Go">Go</option>
                        <option value="Rust">Rust</option>
                        <option value="C++">C++</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Labels (comma separated)
                    </label>
                    <Input
                      placeholder="good-first-issue, frontend, ui/ux"
                      value={issueLabels}
                      onChange={(e) => setIssueLabels(e.target.value)}
                      className="bg-background border-border text-foreground text-xs"
                    />
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCreateModalOpen(false)}
                      disabled={submitting}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs cursor-pointer gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Curating...</span>
                        </>
                      ) : (
                        <span>Curate Issue</span>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
