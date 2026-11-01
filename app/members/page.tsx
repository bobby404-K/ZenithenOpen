"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users2,
  Search,
  Filter,
  GitPullRequest,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Member } from "@/types";

export default function MembersPage() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("All");

  // Modal State
  const [connectModalOpen, setConnectModalOpen] = React.useState(false);
  const [usnInput, setUsnInput] = React.useState("");
  const [githubInput, setGithubInput] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successResult, setSuccessResult] = React.useState<string | null>(null);

  const roles = ["All", "Contributors"];

  // Fetch real members from backend API
  const fetchMembers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "All") params.append("role", "MEMBER");
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/members?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        setMembers(data.members);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error("[MembersPage] Failed to fetch members:", err);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, searchQuery]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  // Handle student login & profile linkage
  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessResult(null);

    const cleanUsn = usnInput.trim();
    const cleanGithub = githubInput.trim().replace(/^@/, "");

    if (!cleanUsn) {
      setFormError("Please enter your University Serial Number (USN).");
      return;
    }
    if (!cleanGithub) {
      setFormError("Please enter your GitHub username.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usn: cleanUsn,
          githubUsername: cleanGithub,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Verification failed. Only students of IST are eligible.");
        return;
      }

      setSuccessResult(
        `Welcome @${cleanGithub}! Your student profile (${data.user?.department || "IST Bengaluru"}) has been verified and linked.`
      );

      // Refresh directory
      await fetchMembers();

      // Reset form after short delay
      setTimeout(() => {
        setConnectModalOpen(false);
        setSuccessResult(null);
        setUsnInput("");
        setGithubInput("");
      }, 2000);
    } catch (err: any) {
      setFormError("Network error connecting to verification service. Please try again.");
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
            <Users2 className="h-4 w-4" />
            <span>Community Directory</span>
          </div>
          <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Members & Contributors
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Student developers and open-source maintainers building across IST Bengaluru.
              </p>
            </div>
            <Button
              onClick={() => {
                setFormError(null);
                setSuccessResult(null);
                setConnectModalOpen(true);
              }}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md text-xs shrink-0 self-start md:self-auto cursor-pointer"
            >
              <GithubIcon className="h-4 w-4" />
              <span>Link GitHub Account</span>
            </Button>
          </div>

          {/* Search & Role Filters */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username, skill (e.g. Rust, PyTorch)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border text-foreground text-xs focus:border-primary"
              />
            </div>

            <div className="flex items-center space-x-1.5 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground mr-2 flex items-center">
                <Filter className="h-3 w-3 mr-1" /> Filter:
              </span>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    roleFilter === r
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-muted border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Member Grid or Clean Empty State */}
        {isLoading ? (
          <div className="mt-16 flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Loading verified student contributors...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-16 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4">
              <Users2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Members Connected Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Be the founding student contributor to link your GitHub profile to the IST directory.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => setConnectModalOpen(true)}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs cursor-pointer"
              >
                <GithubIcon className="h-4 w-4" />
                <span>Join Community Directory</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <Card
                key={member.id}
                className="p-6 flex flex-col justify-between border-border bg-card hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Top Bar: Avatar & Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <Link href={`/members/${member.username}`} className="shrink-0">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="h-12 w-12 rounded-full border border-border object-cover hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-base hover:scale-105 transition-transform">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </Link>
                      <div>
                        <Link href={`/members/${member.username}`}>
                          <h3 className="font-bold text-foreground text-base hover:text-primary transition-colors">
                            {member.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground font-mono">@{member.username}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
                      {member.badge || "Contributor"}
                    </span>
                  </div>

                  {/* Academic Department & Year */}
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    <span className="truncate">{member.department}</span>
                    <span className="text-border">•</span>
                    <span className="shrink-0">{member.year}</span>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {member.bio}
                    </p>
                  )}

                  {/* Skills Chips */}
                  {member.skills && member.skills.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {member.skills.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-muted/60 text-[11px] font-mono text-muted-foreground border border-border/50"
                        >
                          {s.name}
                        </span>
                      ))}
                      {member.skills.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-muted/40 text-[10px] text-muted-foreground">
                          +{member.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Metrics & GitHub Link */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1" title="Merged Pull Requests">
                      <GitPullRequest className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="font-semibold text-foreground">{member.mergedPrCount}</span>
                      <span className="text-[11px]">merged</span>
                    </div>
                    {member.badge && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                        {member.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/members/${member.username}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-xs"
                    >
                      <span>Profile</span>
                    </Link>
                    <a
                      href={`https://github.com/${member.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                      title="GitHub Profile"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Link GitHub Modal */}
        {connectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <GithubIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Connect GitHub Profile</h3>
                    <p className="text-xs text-muted-foreground">Link your IST student account to ZenithenOpen</p>
                  </div>
                </div>
                <button
                  onClick={() => setConnectModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {successResult ? (
                <div className="mt-6 py-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">Verification Successful</p>
                  <p className="text-xs text-muted-foreground leading-relaxed px-4">{successResult}</p>
                </div>
              ) : (
                <form onSubmit={handleLinkAccount} className="mt-6 space-y-4">
                  {formError && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      University Serial Number (USN)
                    </label>
                    <Input
                      required
                      placeholder="e.g. 1SV23CS042"
                      value={usnInput}
                      onChange={(e) => setUsnInput(e.target.value)}
                      className="bg-background border-border text-foreground text-xs font-mono uppercase"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Must be an authentic IST USN (prefix 1SV... or SV...)
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Your GitHub Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                        @
                      </span>
                      <Input
                        required
                        placeholder="your-github-handle"
                        value={githubInput}
                        onChange={(e) => setGithubInput(e.target.value)}
                        className="pl-8 bg-background border-border text-foreground text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-[11px] text-foreground leading-relaxed">
                    Connecting your GitHub account automatically verifies pull requests, assigns student role badges, and tracks leaderboard rankings.
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConnectModalOpen(false)}
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
                          <span>Verifying with Database...</span>
                        </>
                      ) : (
                        <span>Verify & Connect Profile</span>
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
