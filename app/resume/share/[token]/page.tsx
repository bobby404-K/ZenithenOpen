"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Download,
  Copy,
  Check,
  Printer,
  ExternalLink,
  Code2,
  Calendar,
  Eye,
  AlertCircle,
  FileText,
  Star,
  GraduationCap,
  Award,
  Layers,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SharedSnapshotPayload {
  success: boolean;
  shareToken: string;
  username: string;
  createdAt: string;
  expiresAt: string | null;
  viewCount: number;
  profile: {
    fullName: string;
    githubUsername: string;
    email: string;
    headline: string;
    summary: string;
    department: string;
    socialLinks: {
      github?: string;
      linkedin?: string;
      portfolio?: string;
    };
    skills: {
      languages: string[];
      frameworks: string[];
      tools: string[];
    };
    highlightedRepos: Array<{
      name: string;
      description: string;
      stars: number;
      language: string;
      prsAuthored: number;
      impacts: string[];
    }>;
    education: {
      institution: string;
      degree: string;
      field: string;
      graduationYear: string;
      gpa?: string;
    };
    achievements: string[];
  };
  markdown: string;
  error?: string;
}

export default function PublicSharedResumePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const unwrappedParams = React.use(params);
  const token = unwrappedParams.token;

  const [data, setData] = React.useState<SharedSnapshotPayload | null>(null);
  const [daysLeft, setDaysLeft] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedMd, setCopiedMd] = React.useState<boolean>(false);
  const [copiedLink, setCopiedLink] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<"dossier" | "ats">("dossier");

  React.useEffect(() => {
    let isMounted = true;
    async function fetchSharedSnapshot() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/resume/share/${encodeURIComponent(token)}`);
        const json: SharedSnapshotPayload = await res.json();

        if (!isMounted) return;

        if (res.ok && json.success) {
          setData(json);
          if (json.expiresAt) {
            const diff = Math.max(
              0,
              Math.ceil((new Date(json.expiresAt).getTime() - Date.now()) / (1000 * 86400))
            );
            setDaysLeft(diff);
          }
        } else {
          setError(json.error || "Shared resume snapshot not found or has expired");
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load resume snapshot";
        setError(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (token) {
      fetchSharedSnapshot();
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleCopyMarkdown = async () => {
    if (!data?.markdown) return;
    try {
      await navigator.clipboard.writeText(data.markdown);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleDownloadMarkdown = () => {
    if (!data?.markdown || !data?.username) return;
    const blob = new Blob([data.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.username}-verified-resume.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <Skeleton className="h-8 w-48 bg-slate-800" />
            <Skeleton className="h-6 w-32 bg-slate-800" />
          </div>
          <Card className="border-slate-800 bg-slate-900/60 p-8 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4 bg-slate-800" />
              <Skeleton className="h-6 w-1/2 bg-slate-800" />
              <Skeleton className="h-4 w-full bg-slate-800" />
            </div>
            <div className="space-y-3 pt-6 border-t border-slate-800">
              <Skeleton className="h-32 w-full bg-slate-800" />
              <Skeleton className="h-32 w-full bg-slate-800" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-rose-900/40 bg-slate-900/90 p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Resume Snapshot Unavailable
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {error || "This shared resume link is either invalid, revoked, or has expired."}
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800 flex justify-center gap-3">
            <Button asChild variant="outline" className="border-slate-700 hover:bg-slate-800">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to ZenithenOpen
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { profile } = data;
  const createdDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30">
      {/* Top Recruiter Telemetry Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur sticky top-0 z-40 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
            >
              <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="tracking-tight hidden sm:inline">ZenithenOpen</span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <Badge
              variant="outline"
              className="bg-emerald-950/40 text-emerald-400 border-emerald-800/60 text-xs px-2.5 py-0.5 flex items-center gap-1.5 font-mono"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Candidate Dossier
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden md:inline-flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Frozen on {createdDate}
            </span>
            {daysLeft !== null && (
              <span className="hidden sm:inline-flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-amber-300">
                Expires in {daysLeft}d
              </span>
            )}
            <span className="inline-flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              {data.viewCount} {data.viewCount === 1 ? "view" : "views"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Verification Banner */}
        <div className="rounded-xl border border-cyan-900/40 bg-gradient-to-r from-cyan-950/40 via-indigo-950/20 to-slate-900/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                Authentic Proof-of-Work Verification
              </h2>
              <p className="text-xs text-slate-400">
                Directly audited against live GitHub repositories with $\ge 100$ stars and $\ge 100$ forks. Zero self-reported fluff.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyShareLink}
              className="text-xs border-slate-700 hover:bg-slate-800 flex-1 sm:flex-initial"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Share Link
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadMarkdown}
              className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white flex-1 sm:flex-initial"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download .md
            </Button>
          </div>
        </div>

        {/* Candidate Dossier Header */}
        <Card className="border-slate-800 bg-slate-900/70 backdrop-blur shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500" />
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {profile.fullName}
                  </h1>
                  <Badge variant="outline" className="bg-cyan-950/50 text-cyan-400 border-cyan-800/60 font-mono text-xs">
                    @{profile.githubUsername}
                  </Badge>
                  <Badge variant="outline" className="bg-indigo-950/50 text-indigo-300 border-indigo-800/60 text-xs">
                    IST Bengaluru
                  </Badge>
                </div>
                <p className="text-base font-medium text-cyan-300/90 leading-snug">
                  {profile.headline}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  {profile.summary}
                </p>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap md:flex-col gap-2 shrink-0 print:hidden">
                <Button
                  size="sm"
                  asChild
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <GithubIcon className="w-4 h-4 mr-2" />
                    GitHub Profile
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-70" />
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyMarkdown}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  {copiedMd ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                      Markdown Copied!
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 mr-2 text-cyan-400" />
                      Copy ATS Markdown
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrint}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Printer className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  Print / Save PDF
                </Button>
              </div>
            </div>

            {/* Quick Contact & Department Info */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                {profile.department}
              </span>
              <span className="h-3 w-px bg-slate-800" />
              <span className="flex items-center gap-1.5 font-mono">
                {profile.email}
              </span>
              {profile.socialLinks?.linkedin && (
                <>
                  <span className="h-3 w-px bg-slate-800" />
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* View Tabs Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 print:hidden">
          <button
            onClick={() => setActiveTab("dossier")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "dossier"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            Verified Dossier
          </button>
          <button
            onClick={() => setActiveTab("ats")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "ats"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-4 h-4" />
            ATS Markdown Preview
          </button>
        </div>

        {/* TAB 1: Visual Dossier */}
        {activeTab === "dossier" && (
          <div className="space-y-8">
            {/* Highlighted Open Source Repositories & Quality Contributions */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  Verified Open-Source Contributions & Quality PRs
                </h3>
                <Badge variant="outline" className="text-xs text-slate-400 border-slate-800">
                  {profile.highlightedRepos?.length || 0} Tier-1 Repositories
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.highlightedRepos?.map((repo) => (
                  <Card
                    key={repo.name}
                    className="border-slate-800/80 bg-slate-900/50 hover:border-slate-700 transition-colors"
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <a
                            href={`https://github.com/${repo.name}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-base font-semibold text-cyan-400 hover:underline flex items-center gap-1.5"
                          >
                            {repo.name}
                            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                          </a>
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {repo.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/40">
                          <Star className="w-3 h-3 fill-amber-300" />
                          {repo.stars.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">
                          {repo.language}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-emerald-950/30 text-emerald-300 border-emerald-900/50 text-[11px]"
                        >
                          {repo.prsAuthored} {repo.prsAuthored === 1 ? "PR Merged" : "PRs Merged"}
                        </Badge>
                      </div>

                      {repo.impacts && repo.impacts.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Key Architectural Impacts:
                          </p>
                          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                            {repo.impacts.map((impact, i) => (
                              <li key={i} className="leading-relaxed">
                                {impact}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Technical Proficiencies Matrix */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                Technical Proficiencies & Toolchain
              </h3>
              <Card className="border-slate-800/80 bg-slate-900/50">
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Programming Languages:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.languages?.map((lang) => (
                        <span
                          key={lang}
                          className="px-2.5 py-1 text-xs rounded-md bg-slate-800 text-slate-200 border border-slate-700 font-mono"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Frameworks & Core Libraries:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.frameworks?.map((fw) => (
                        <span
                          key={fw}
                          className="px-2.5 py-1 text-xs rounded-md bg-slate-800 text-cyan-300 border border-slate-700"
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Systems, Cloud & Developer Tooling:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.tools?.map((tool) => (
                        <span
                          key={tool}
                          className="px-2.5 py-1 text-xs rounded-md bg-slate-800 text-emerald-300 border border-slate-700"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Academic Credentials & Achievements */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-slate-800/80 bg-slate-900/50">
                <CardContent className="p-6 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    Academic Accreditation
                  </h4>
                  <div className="text-xs space-y-1.5 text-slate-300">
                    <p className="font-semibold text-slate-100 text-sm">
                      {profile.education?.institution}
                    </p>
                    <p>
                      {profile.education?.degree} in {profile.education?.field}
                    </p>
                    <p className="text-slate-400">
                      Expected Graduation: {profile.education?.graduationYear}
                    </p>
                    {profile.education?.gpa && (
                      <p className="text-slate-400 font-mono">GPA: {profile.education.gpa}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800/80 bg-slate-900/50">
                <CardContent className="p-6 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Verified Badges & Accolades
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {profile.achievements?.map((ach, i) => (
                      <li key={i} className="leading-relaxed">
                        {ach}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {/* TAB 2: ATS Markdown Raw View */}
        {activeTab === "ats" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Machine-readable Markdown strictly optimized for Applicant Tracking Systems (ATS) and hiring engines.
              </p>
              <Button
                size="sm"
                onClick={handleCopyMarkdown}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
              >
                {copiedMd ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy Markdown
                  </>
                )}
              </Button>
            </div>
            <pre className="p-6 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {data.markdown}
            </pre>
          </div>
        )}

        {/* Verification Guarantee Footer */}
        <footer className="pt-8 border-t border-slate-800/80 text-center space-y-2 text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified by ZenithenOpen • International School of Technology (IST) Bengaluru
          </p>
          <p className="text-[11px] text-slate-400">
            Share Token: <code className="font-mono text-slate-400 bg-slate-900 px-1 py-0.5 rounded">{data.shareToken}</code>
          </p>
        </footer>
      </main>
    </div>
  );
}
