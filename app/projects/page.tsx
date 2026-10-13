"use client";

import * as React from "react";
import Link from "next/link";
import {
  FolderGit2,
  Search,
  Star,
  GitFork,
  ExternalLink,
  Filter,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GithubIcon } from "@/components/ui/icons";
import { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("All");

  // Modal State for Registering a Project
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [projName, setProjName] = React.useState("");
  const [projTagline, setProjTagline] = React.useState("");
  const [projRepoUrl, setProjRepoUrl] = React.useState("");
  const [projLanguage, setProjLanguage] = React.useState("TypeScript");
  const [projTags, setProjTags] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const languages = ["All", "TypeScript", "Python", "Go", "Rust", "C++"];

  // Fetch projects from live API
  const fetchProjects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLanguage !== "All") params.append("language", selectedLanguage);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("[ProjectsPage] Failed to fetch projects:", err);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLanguage, searchQuery]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  // Handle registering a new project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!projName.trim() || !projRepoUrl.trim()) {
      setFormError("Project Name and Repository URL are required.");
      return;
    }

    setSubmitting(true);
    try {
      const parsedTags = projTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projName.trim(),
          tagline: projTagline.trim() || `Open-source project ${projName.trim()}`,
          repositoryUrl: projRepoUrl.trim(),
          primaryLanguage: projLanguage,
          tags: parsedTags.length > 0 ? parsedTags : [projLanguage],
          isFeatured: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to register project in catalog.");
        return;
      }

      setSuccessMessage(`Repository '${projName}' registered successfully!`);
      await fetchProjects();

      setTimeout(() => {
        setCreateModalOpen(false);
        setSuccessMessage(null);
        setProjName("");
        setProjTagline("");
        setProjRepoUrl("");
        setProjTags("");
      }, 1800);
    } catch (_err: unknown) {
      setFormError("Network error connecting to projects service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-background text-foreground min-h-screen transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            <FolderGit2 className="h-4 w-4" />
            <span>Campus Repositories</span>
          </div>
          <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Open-Source Project Catalog
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Production codebases engineered by IST student developers and maintained under IST-ZenithenLab.
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
                <span>Register Repository</span>
              </Button>
              <a
                href="https://github.com/IST-ZenithenLab"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2 border-border text-xs cursor-pointer">
                  <GithubIcon className="h-4 w-4" />
                  <span>GitHub Org</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by name, tag, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border text-foreground text-xs focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground mr-2 flex items-center">
                <Filter className="h-3 w-3 mr-1" /> Language:
              </span>
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium cursor-pointer ${
                    selectedLanguage === lang
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-muted border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid or Zero-State */}
        {isLoading ? (
          <div className="mt-16 flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Loading open-source project catalog...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-16 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4">
              <FolderGit2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Repositories Found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              No repositories match the current query. Register your campus open-source project to feature it on ZenithenOpen.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Register Project</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all duration-200 border-border bg-card overflow-hidden"
              >
                <div className="p-6">
                  {/* Top Bar: Title & Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                        <FolderGit2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                          <Link
                            href={`/projects/${project.slug || project.id}`}
                            className="inline-flex items-center gap-1.5"
                          >
                            <span>{project.name}</span>
                          </Link>
                        </CardTitle>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">
                          {project.tagline}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-xs font-semibold px-2.5 py-0.5">
                      {project.status}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground border-t border-border/60 pt-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: project.languageColor }}
                      />
                      <span className="font-semibold text-foreground">{project.primaryLanguage}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                      <span>{project.stars}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{project.forks}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Explore & GitHub Navigation Buttons */}
                <div className="p-6 pt-0 border-t border-border/60 bg-muted/20 rounded-b-xl flex items-center justify-between gap-2.5 mt-auto">
                  <Link
                    href={`/projects/${project.slug || project.id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="default"
                      className="w-full gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold py-2.5 shadow-xs cursor-pointer"
                    >
                      <span>Explore</span>
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </Button>
                  </Link>

                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <Button
                      variant="outline"
                      className="gap-1.5 border-border text-xs font-semibold py-2.5 cursor-pointer"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                      <span>Repo</span>
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Register Project */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Register Campus Repository</h3>
                    <p className="text-xs text-muted-foreground">Add student open-source project to catalog</p>
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
                  <p className="text-sm font-semibold text-foreground">Registration Successful</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{successMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleCreateProject} className="mt-6 space-y-4">
                  {formError && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Project Name
                    </label>
                    <Input
                      required
                      placeholder="e.g. ZenithenCore"
                      value={projName}
                      onChange={(e) => setProjName(e.target.value)}
                      className="bg-background border-border text-foreground text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Repository URL
                    </label>
                    <Input
                      required
                      placeholder="https://github.com/IST-ZenithenLab/..."
                      value={projRepoUrl}
                      onChange={(e) => setProjRepoUrl(e.target.value)}
                      className="bg-background border-border text-foreground text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Tagline / Brief Summary
                    </label>
                    <Input
                      placeholder="High-performance utilities for campus developers"
                      value={projTagline}
                      onChange={(e) => setProjTagline(e.target.value)}
                      className="bg-background border-border text-foreground text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Primary Language
                      </label>
                      <select
                        value={projLanguage}
                        onChange={(e) => setProjLanguage(e.target.value)}
                        className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="TypeScript">TypeScript</option>
                        <option value="Python">Python</option>
                        <option value="Go">Go</option>
                        <option value="Rust">Rust</option>
                        <option value="C++">C++</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Tags (comma separated)
                      </label>
                      <Input
                        placeholder="Systems, API, ML"
                        value={projTags}
                        onChange={(e) => setProjTags(e.target.value)}
                        className="bg-background border-border text-foreground text-xs"
                      />
                    </div>
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
                          <span>Registering...</span>
                        </>
                      ) : (
                        <span>Register Project</span>
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
