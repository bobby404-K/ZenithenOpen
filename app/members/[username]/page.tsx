"use client";

import * as React from "react";
import Link from "next/link";
import {
  GitPullRequest,
  GitMerge,
  CircleSlash,
  Star,
  ExternalLink,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  CodeXml,
  BookOpen,
  Trophy,
  Quote,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

interface MemberStory {
  journey: string;
  keyLearnings: string[];
  milestones: string[];
  advice: string;
}

interface MemberProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  roleSubtitle?: string;
  department: string;
  yearOfStudy: string;
  role: string;
  linkedinUrl: string;
  portfolioUrl: string;
  joinedAt: string;
  stats: MemberStats;
  skills: string[];
  achievements: MemberAchievement[];
  recentContributions: MemberContribution[];
  story?: MemberStory;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-36 bg-neutral-800" />
            <Skeleton className="h-9 w-28 rounded-full bg-neutral-800" />
          </div>
          <div className="text-center space-y-6">
            <Skeleton className="h-32 w-32 rounded-full mx-auto bg-neutral-800" />
            <Skeleton className="h-12 w-64 mx-auto bg-neutral-800" />
            <Skeleton className="h-6 w-96 mx-auto bg-neutral-800" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-28 rounded-3xl bg-neutral-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white py-24 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Member Not Found</h1>
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              {error || `The student profile '@${username}' is not registered on ZenithenOpen.`}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Link href="/leaderboard">
              <Button variant="outline" className="gap-2 text-xs rounded-full border-white/10 hover:bg-white/10">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Hall of Fame</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const defaultJourney =
    profile.bio ||
    "My development journey started after exploring modern web engineering and open source software. Building real-world tools, collaborating on production repositories, and continuously raising the standard for code quality drives everything I build.";

  const defaultLearnings = [
    "Failure is simply feedback — not every pull request gets merged, and each setback highlights what to improve.",
    "Consistency matters more than perfection.",
    "Asking questions or seeking guidance is much better than staying stuck.",
    "Master the fundamentals instead of trying to learn too many technologies at once.",
    "Focus on your own progress instead of comparing yourself with others.",
  ];

  const defaultMilestones = [
    "Contributed to core frontend and architectural features across open-source web platforms.",
    "Raised pull requests with end-to-end type safety, automated tests, and accessible components.",
    "Progressed from foundational programming to deploying production web systems with Git and CI/CD.",
  ];

  const defaultAdvice =
    "Don't compare your beginning with someone else's years of experience. Focus on building strong fundamentals, create projects instead of only watching tutorials, and don't hesitate to ask for help. Join developer communities early and stay consistent. The most important thing is to keep learning and never stop building. 🚀";

  const story = profile.story || {
    journey: defaultJourney,
    keyLearnings: defaultLearnings,
    milestones: defaultMilestones,
    advice: defaultAdvice,
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-400 selection:text-black relative">
      {/* Top Floating Glass Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium text-sm sm:text-base">Back to Hall of Fame</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyShare}
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white text-xs h-9 px-4 gap-1.5 transition-all cursor-pointer"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Profile</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Share Profile</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Glowing Ambience */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Chromatic ambient glow orbs */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyan-400/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          {/* Avatar with cyan border glow */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-cyan-400/30 shadow-[0_0_40px_rgba(34,211,238,0.25)] ring-4 ring-cyan-500/10">
            <img
              src={profile.avatarUrl || `https://github.com/${profile.username}.png`}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Verified Contributor Badge Pill */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold tracking-wider">VERIFIED CONTRIBUTOR</span>
              <Sparkles className="w-3 h-3 text-cyan-300 opacity-80" />
            </div>
          </div>

          {/* Big Typography Name */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white">
            {profile.name}
          </h1>

          {/* Gradient Role / Subtitle */}
          <p className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-violet-300 font-medium mb-8">
            {profile.roleSubtitle || profile.bio || "Frontend Builder · Early Open Source"}
          </p>

          {/* Social Icons Navigation */}
          <div className="flex justify-center items-center gap-4">
            <a
              href={profile.portfolioUrl || `https://github.com/${profile.username}`}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-neutral-900 border border-neutral-800 rounded-full hover:bg-neutral-800 hover:border-cyan-400 transition-all text-neutral-400 hover:text-cyan-400 hover:scale-110 shadow-lg"
              title="GitHub Profile"
            >
              <GithubIcon className="w-6 h-6" />
            </a>
            <a
              href={profile.linkedinUrl || `https://linkedin.com/in/${profile.username}`}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-neutral-900 border border-neutral-800 rounded-full hover:bg-neutral-800 hover:border-blue-500 transition-all text-neutral-400 hover:text-blue-500 hover:scale-110 shadow-lg"
              title="LinkedIn Profile"
            >
              <LinkedinIcon className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Open Source Contributions Metrics Section */}
      <section className="py-12 border-y border-white/5 bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl font-bold mb-8 text-center text-white">Open Source Contributions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Total PRs */}
            <div className="p-6 rounded-3xl text-center bg-neutral-900/60 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all">
              <div className="text-4xl font-bold text-white mb-2">{profile.stats?.totalPrs ?? 0}</div>
              <div className="text-neutral-500 text-sm font-medium uppercase tracking-wider">Total PRs</div>
            </div>

            {/* Merged */}
            <div className="bg-neutral-900/90 p-6 rounded-3xl border border-purple-500/20 text-center backdrop-blur-md hover:border-purple-500/40 transition-all">
              <GitMerge className="w-6 h-6 mx-auto text-purple-400 mb-2" />
              <div className="text-3xl font-bold text-white mb-1">{profile.stats?.mergedPrs ?? 0}</div>
              <div className="text-purple-400/80 text-sm font-medium">Merged</div>
            </div>

            {/* Open */}
            <div className="bg-neutral-900/90 p-6 rounded-3xl border border-green-500/20 text-center backdrop-blur-md hover:border-green-500/40 transition-all">
              <GitPullRequest className="w-6 h-6 mx-auto text-green-400 mb-2" />
              <div className="text-3xl font-bold text-white mb-1">{profile.stats?.openPrs ?? 0}</div>
              <div className="text-green-400/80 text-sm font-medium">Open</div>
            </div>

            {/* Closed */}
            <div className="bg-neutral-900/90 p-6 rounded-3xl border border-red-500/20 text-center backdrop-blur-md hover:border-red-500/40 transition-all">
              <CircleSlash className="w-6 h-6 mx-auto text-red-400 mb-2" />
              <div className="text-3xl font-bold text-white mb-1">{profile.stats?.closedPrs ?? 0}</div>
              <div className="text-red-400/80 text-sm font-medium">Closed</div>
            </div>
          </div>

          {/* Quality Merge Highlight (Zenithen Core Algorithm Tie-breaker) */}
          {(profile.stats?.qualityPrs ?? 0) > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs sm:text-sm text-amber-300">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold">Quality Merges:</span>
              </div>
              <span className="font-bold text-white text-base bg-amber-500/20 px-3 py-0.5 rounded-full border border-amber-500/30">
                {profile.stats.qualityPrs}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Story Sections: The Journey, Key Learnings, Proudest Milestones, Advice */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid gap-16">
            {/* 1. The Journey */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-cyan-400/20 text-cyan-400 rounded-xl">
                  <CodeXml className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-bold text-white">The Journey</h2>
              </div>
              <div className="border border-white/10 bg-neutral-900/40 p-8 rounded-3xl backdrop-blur-md shadow-xl">
                <p className="text-neutral-300 text-lg leading-relaxed">{story.journey}</p>
              </div>
            </div>

            {/* 2. Key Learnings */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-bold text-white">Key Learnings</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {story.keyLearnings.map((learning, idx) => (
                  <div
                    key={idx}
                    className="border border-white/10 bg-neutral-900/40 p-6 rounded-2xl hover:border-purple-500/50 transition-colors backdrop-blur-md"
                  >
                    <p className="text-neutral-300 leading-relaxed">{learning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Proudest Milestones */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-xl">
                  <Trophy className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-bold text-white">Proudest Milestones</h2>
              </div>
              <ul className="space-y-3">
                {story.milestones.map((milestone, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 border border-white/10 bg-neutral-900/40 p-5 rounded-2xl hover:border-yellow-500/40 transition-colors backdrop-blur-md"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2.5 flex-shrink-0" />
                    <p className="text-neutral-300 leading-relaxed">{milestone}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Advice to Juniors */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
                  <Quote className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-bold text-white">Advice to Juniors</h2>
              </div>
              <blockquote className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 p-8 rounded-3xl backdrop-blur-md">
                <p className="text-neutral-200 text-lg leading-relaxed italic">
                  “{story.advice}”
                </p>
                <footer className="mt-4 text-sm text-green-400 font-semibold not-italic">
                  — {profile.name}
                </footer>
              </blockquote>
            </div>

            {/* Verified PR Contributions (if any recorded) */}
            {profile.recentContributions && profile.recentContributions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                      <GitPullRequest className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Verified Contributions</h2>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono">
                    {profile.recentContributions.length} Recorded
                  </Badge>
                </div>

                <div className="space-y-3">
                  {profile.recentContributions.map((contrib) => (
                    <div
                      key={contrib.id}
                      className="rounded-2xl border border-white/10 bg-neutral-900/40 hover:border-emerald-500/40 p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs backdrop-blur-md"
                    >
                      <div className="space-y-1">
                        <a
                          href={contrib.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-white hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-sm"
                        >
                          <span>{contrib.title}</span>
                          <span className="text-neutral-500 font-mono">#{contrib.prNumber}</span>
                        </a>
                        <div className="flex flex-wrap items-center gap-2 text-neutral-400">
                          <span>Repository: {contrib.type}</span>
                          {contrib.isQualityPr && (
                            <span className="text-amber-400 font-semibold">• Quality Contribution (≥100★)</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full border ${
                            contrib.status === "MERGED"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : contrib.status === "OPEN"
                              ? "bg-emerald-500/10 text-green-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {contrib.status}
                        </span>
                        <a
                          href={contrib.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills / Tech Stack */}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Skills & Core Technologies</h2>
                </div>
                <div className="flex flex-wrap gap-2 border border-white/10 bg-neutral-900/40 p-6 rounded-3xl backdrop-blur-md">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-xl bg-neutral-800/80 px-3.5 py-1.5 text-xs font-mono font-medium text-neutral-300 border border-white/5 hover:border-cyan-400/50 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black/50">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-1">
              Zenithen<span className="text-cyan-400">Open</span>
            </h3>
            <p className="text-neutral-500 text-sm">
              Premier developer & open-source community at IST Bengaluru.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <Link href="/leaderboard" className="hover:text-cyan-400 transition-colors">
              Hall of Fame
            </Link>
            <Link href="/projects" className="hover:text-cyan-400 transition-colors">
              Projects
            </Link>
            <Link href="/members" className="hover:text-cyan-400 transition-colors">
              Members
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
