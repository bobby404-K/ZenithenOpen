"use client";

import * as React from "react";
import Link from "next/link";
import {
  GraduationCap,
  GitPullRequest,
  GitMerge,
  CircleSlash,
  Star,
  Award,
  ExternalLink,
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  CheckCircle2,
  FileText,
  AlertCircle,
  Send,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface MemberStats {
  totalContributions: number;
  totalPrs: number;
  mergedPrs: number;
  openPrs: number;
  closedPrs: number;
  qualityPrs: number;
  codeReviews: number;
  commits: number;
  followers: number;
  publicRepos: number;
}

interface MemberAchievement {
  id: string;
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: string;
  unlockedAt: string;
}

interface MemberContribution {
  id: string;
  title: string;
  url: string;
  prNumber: number;
  type: string;
  status: string;
  isQualityPr: boolean;
  mergedAt: string | null;
  createdAt: string;
}

interface MemberProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  department: string;
  yearOfStudy: string;
  role: string;
  isMentor: boolean;
  mentorshipTopics: string[];
  linkedinUrl: string;
  portfolioUrl: string;
  joinedAt: string;
  stats: MemberStats;
  skills: string[];
  achievements: MemberAchievement[];
  recentContributions: MemberContribution[];
}

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const unwrappedParams = React.use(params);
  const username = unwrappedParams.username;

  const [profile, setProfile] = React.useState<MemberProfile | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedShare, setCopiedShare] = React.useState<boolean>(false);

  // Mentorship Modal State
  const [mentorshipModalOpen, setMentorshipModalOpen] = React.useState<boolean>(false);
  const [menteeName, setMenteeName] = React.useState<string>("");
  const [menteeEmail, setMenteeEmail] = React.useState<string>("");
  const [mentorshipTopic, setMentorshipTopic] = React.useState<string>("GSoC Preparation");
  const [mentorshipGoal, setMentorshipGoal] = React.useState<string>("");
  const [submittingMentorship, setSubmittingMentorship] = React.useState<boolean>(false);
  const [mentorshipSent, setMentorshipSent] = React.useState<boolean>(false);
  const [mentorshipError, setMentorshipError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchMember() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/members/${encodeURIComponent(username)}`);
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.username) {
          setProfile(data);
          if (data.mentorshipTopics && data.mentorshipTopics.length > 0) {
            setMentorshipTopic(data.mentorshipTopics[0]);
          }
        } else {
          setError(data.error || `Member '@${username}' was not found.`);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("[MemberProfilePage] Fetch error:", err);
        setError("Failed to load contributor profile. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMember();
    return () => {
      isMounted = false;
    };
  }, [username]);

  const handleCopyShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleSendMentorship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingMentorship(true);
    setMentorshipError(null);

    try {
      const res = await fetch("/api/mentorship/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menteeName: menteeName.trim(),
          menteeEmail: menteeEmail.trim(),
          topic: mentorshipTopic,
          message: mentorshipGoal.trim(),
          mentorId: profile.id,
          mentorUsername: profile.username,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMentorshipSent(true);
        setTimeout(() => {
          setMentorshipSent(false);
          setMentorshipModalOpen(false);
          setMentorshipGoal("");
        }, 2200);
      } else {
        setMentorshipError(data.error || "Failed to submit mentorship request.");
      }
    } catch (err) {
      console.error("[MemberProfilePage] Mentorship request error:", err);
      setMentorshipError("Failed to submit request. Please verify network connectivity.");
    } finally {
      setSubmittingMentorship(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-4 w-24" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
            <div className="flex items-center space-x-5">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Member Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {error || `The student profile '@${username}' is not registered on ZenithenOpen.`}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Link href="/members">
              <Button variant="default" className="gap-2 text-xs">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Member Directory</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Hall of Fame</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link href={`/resume?username=${encodeURIComponent(profile.username)}`}>
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 border-border">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Proof-of-Work Resume</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyShare}
              className="text-xs h-8 gap-1.5 border-border"
            >
              {copiedShare ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Share Profile</span>
                </>
              )}
            </Button>

            {(profile.isMentor || profile.role === "MENTOR" || profile.mentorshipTopics?.length > 0) && (
              <Button
                size="sm"
                onClick={() => setMentorshipModalOpen(true)}
                className="text-xs h-8 gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Request Mentorship</span>
              </Button>
            )}
          </div>
        </div>

        {/* Hero Profile Card - Strictly Matching 1st Reference Image */}
        <div className="relative rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black p-8 sm:p-12 overflow-hidden shadow-2xl text-center">
          <div className="absolute inset-0 bg-radial-at-t from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Centered Circular Avatar with Cyan Glow */}
          <div className="relative mx-auto w-fit">
            <img
              src={profile.avatarUrl || `https://github.com/${profile.username}.png`}
              alt={profile.name}
              className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-2 border-cyan-400/60 ring-4 ring-cyan-500/20 object-cover shadow-2xl mx-auto"
            />
          </div>

          {/* Name */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-5">
            {profile.name}
          </h1>

          {/* Role / Subtitle */}
          <p className="text-sm sm:text-base font-medium text-cyan-400 mt-2">
            {profile.bio || profile.department || "Frontend Builder · Early Open Source"}
          </p>

          {/* Direct Circular GitHub and LinkedIn Icons Navigation */}
          <div className="flex items-center justify-center gap-3.5 mt-5">
            <a
              href={profile.portfolioUrl || `https://github.com/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`@${profile.username} on GitHub`}
              className="h-10 w-10 rounded-full bg-slate-950/80 border border-slate-700/80 hover:border-slate-400 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
            <a
              href={profile.linkedinUrl || `https://linkedin.com/in/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`@${profile.username} on LinkedIn`}
              className="h-10 w-10 rounded-full bg-slate-950/80 border border-slate-700/80 hover:border-blue-400 text-slate-300 hover:text-blue-400 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
            >
              <LinkedinIcon className="h-5 w-5" />
            </a>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <span className="font-mono">@{profile.username}</span>
            <span className="text-slate-700">•</span>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" />
              <span>Verified IST Student</span>
            </div>
            {profile.yearOfStudy && (
              <>
                <span className="text-slate-700">•</span>
                <span>{profile.yearOfStudy}</span>
              </>
            )}
          </div>
        </div>

        {/* Open Source Contributions Section Title */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground text-center">
            Open Source Contributions
          </h2>

          {/* 5 Stat Cards Grid: Quality Merge, TOTAL PRS, Open, Closed, Merged */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {/* 1. Quality Merge */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-1">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400 mb-2" />
              <span className="text-3xl font-extrabold text-amber-400">{profile.stats?.qualityPrs ?? 0}</span>
              <span className="text-xs font-semibold text-amber-400/90 tracking-wide mt-2">Quality Merge</span>
            </div>

            {/* 2. TOTAL PRS */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-1">
              <span className="text-3xl font-extrabold text-foreground mt-1">{profile.stats?.totalPrs ?? 0}</span>
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mt-3">TOTAL PRS</span>
            </div>

            {/* 3. Open */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-1">
              <GitPullRequest className="h-5 w-5 text-emerald-400 mb-2" />
              <span className="text-3xl font-extrabold text-emerald-400">{profile.stats?.openPrs ?? 0}</span>
              <span className="text-xs font-semibold text-emerald-400/90 tracking-wide mt-2">Open</span>
            </div>

            {/* 4. Closed */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-1">
              <CircleSlash className="h-5 w-5 text-rose-400 mb-2" />
              <span className="text-3xl font-extrabold text-rose-400">{profile.stats?.closedPrs ?? 0}</span>
              <span className="text-xs font-semibold text-rose-400/90 tracking-wide mt-2">Closed</span>
            </div>

            {/* 5. Merged */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-1">
              <GitMerge className="h-5 w-5 text-purple-400 mb-2" />
              <span className="text-3xl font-extrabold text-purple-400">{profile.stats?.mergedPrs ?? 0}</span>
              <span className="text-xs font-semibold text-purple-400/90 tracking-wide mt-2">Merged</span>
            </div>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (2 spans) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Verified Pull Request Contributions */}
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <GitPullRequest className="h-4 w-4 text-emerald-500" />
                    <span>Verified Pull Request Contributions</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {profile.recentContributions?.length ?? 0} Recorded
                  </Badge>
                </div>

                {(!profile.recentContributions || profile.recentContributions.length === 0) ? (
                  <div className="rounded-xl bg-muted/20 border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    No pull requests recorded yet. Verified contributions will sync automatically from GitHub commits.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile.recentContributions.map((contrib) => (
                      <div
                        key={contrib.id}
                        className="rounded-xl border border-border/70 bg-card hover:border-primary/40 p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <a
                            href={contrib.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                          >
                            <span>{contrib.title}</span>
                            <span className="text-muted-foreground font-mono">#{contrib.prNumber}</span>
                          </a>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            <span>Type: {contrib.type}</span>
                            {contrib.isQualityPr && (
                              <span className="text-amber-500 font-semibold">• Quality Contribution</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                              contrib.status === "MERGED"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : contrib.status === "OPEN"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {contrib.status}
                          </span>
                          <a
                            href={contrib.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Unlocked Badges & Achievements */}
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Award className="h-4 w-4 text-purple-500" />
                    <span>Unlocked Badges & Honors</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {profile.achievements?.length ?? 0} Unlocked
                  </Badge>
                </div>

                {(!profile.achievements || profile.achievements.length === 0) ? (
                  <div className="rounded-xl bg-muted/20 border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    Student achievements will unlock as pull requests are authored, reviewed, and merged.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.achievements.map((ach) => (
                      <div
                        key={ach.id}
                        className="rounded-xl border border-border/70 bg-card p-3.5 flex items-start space-x-3"
                      >
                        <div className="text-2xl shrink-0 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                          {ach.badgeIcon || "🏆"}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-xs">{ach.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                            {ach.description}
                          </p>
                          <span className="text-[10px] font-mono text-purple-500 mt-1 block">
                            {ach.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column (1 span) */}
          <div className="space-y-8">
            {/* Skills & Technologies */}
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Skills & Core Technologies</span>
                </div>

                {(!profile.skills || profile.skills.length === 0) ? (
                  <p className="text-xs text-muted-foreground">
                    Skills will populate as contributions are verified across repositories.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-mono font-medium text-muted-foreground border border-border/50"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mentorship Availability Banner */}
            {(profile.isMentor || profile.mentorshipTopics?.length > 0) && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-600">
                    <BookOpen className="h-4 w-4" />
                    <span>Peer Mentorship Availability</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Available to mentor junior developers and conduct pull request architectural reviews.
                  </p>

                  {profile.mentorshipTopics && profile.mentorshipTopics.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-foreground">Topics Guided:</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.mentorshipTopics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-mono"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setMentorshipModalOpen(true)}
                    className="w-full text-xs bg-amber-500 hover:bg-amber-600 text-white gap-2 shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Request Mentorship Session</span>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Academic Information */}
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span>Academic Affiliation</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Institution:</span>
                    <p className="font-semibold text-foreground">Institute of Science and Technology (IST)</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-semibold text-foreground">{profile.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cohort:</span>
                    <p className="font-semibold text-foreground">{profile.yearOfStudy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mentorship Request Modal */}
      {mentorshipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Request Mentorship</h3>
                  <p className="text-xs text-muted-foreground">Connect with @{profile.username}</p>
                </div>
              </div>
              <button
                onClick={() => setMentorshipModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {mentorshipSent ? (
              <div className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-foreground">Session Request Dispatched!</h4>
                <p className="text-xs text-muted-foreground">
                  Your mentorship request has been forwarded to @{profile.username}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMentorship} className="mt-6 space-y-4">
                {mentorshipError && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{mentorshipError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Your Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. John Doe"
                    value={menteeName}
                    onChange={(e) => setMenteeName(e.target.value)}
                    className="bg-background border-border text-foreground text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Your Campus Email
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="student@zenithen.ist"
                    value={menteeEmail}
                    onChange={(e) => setMenteeEmail(e.target.value)}
                    className="bg-background border-border text-foreground text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Guidance Topic
                  </label>
                  <select
                    value={mentorshipTopic}
                    onChange={(e) => setMentorshipTopic(e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {profile.mentorshipTopics && profile.mentorshipTopics.length > 0 ? (
                      profile.mentorshipTopics.map((topic, idx) => (
                        <option key={idx} value={topic}>
                          {topic}
                        </option>
                      ))
                    ) : (
                      <option value="GSoC Preparation">GSoC Preparation</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    What would you like to achieve?
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your current PR roadblock or learning goal..."
                    value={mentorshipGoal}
                    onChange={(e) => setMentorshipGoal(e.target.value)}
                    className="w-full rounded-md border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setMentorshipModalOpen(false)}
                    disabled={submittingMentorship}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingMentorship}
                    className="text-xs bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                  >
                    {submittingMentorship ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Request</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
