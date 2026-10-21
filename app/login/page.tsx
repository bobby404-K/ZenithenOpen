"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";
import { VerifiedStudent } from "@/lib/auth/usn-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GithubIcon } from "@/components/ui/icons";
import confetti from "canvas-confetti";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  GitPullRequest,
  Trophy,
  Sparkles,
  LogOut,
  FolderGit2,
  Users,
  RefreshCw,
  Clock,
  Laptop,
} from "lucide-react";

export default function LoginPage() {
  const { user, loginUser, logout } = useAuth();

  const [step, setStep] = React.useState<1 | 2>(1);
  const [usnInput, setUsnInput] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [verifiedStudent, setVerifiedStudent] = React.useState<VerifiedStudent | null>(null);

  const [githubInput, setGithubInput] = React.useState("");
  const [isConnectingGithub, setIsConnectingGithub] = React.useState(false);
  const [sessionCopied, setSessionCopied] = React.useState(false);

  // Quick preset accounts for demonstration & campus testing
  const PRESET_STUDENTS = [
    { usn: "1SV23CS001", label: "1SV23CS001 (CS • 2nd Year)", github: "alex-chen" },
    { usn: "1SV23AI012", label: "1SV23AI012 (AI • 2nd Year)", github: "priya-sharma" },
    { usn: "1SV22CS045", label: "1SV22CS045 (CS • 3rd Year)", github: "vikram-patel" },
  ];

  // Step 1: Verify USN against university registry
  const handleVerifyUSN = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsn = usnInput.trim().toUpperCase();
    if (!cleanUsn) {
      setErrorMessage("Please enter your university USN.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-usn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usn: cleanUsn }),
      });
      const data = await res.json();

      const isValid = Boolean(data.valid || data.verified);
      if (!res.ok || !isValid) {
        setErrorMessage(data.error || "Invalid USN. Ensure you enter a valid IST enrollment number (1SV... or SV...).");
        setIsVerifying(false);
        return;
      }

      setVerifiedStudent(data.student);
      setStep(2);
    } catch {
      setErrorMessage("Unable to connect to USN verification service. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2: Associate with GitHub username & log in via backend API
  const handleConnectGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = githubInput.trim().replace(/^@/, "");
    if (!cleanUsername) {
      setErrorMessage("Please enter a GitHub username.");
      return;
    }

    if (!verifiedStudent) {
      setErrorMessage("USN verification expired. Please verify again.");
      setStep(1);
      return;
    }

    setIsConnectingGithub(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usn: verifiedStudent.usn,
          githubUsername: cleanUsername,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to authenticate student profile on server.");
        setIsConnectingGithub(false);
        return;
      }

      // Celebrate successful authentication
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback if confetti canvas is not supported
      }

      loginUser(verifiedStudent, cleanUsername, data.user?.stats);
    } catch {
      setErrorMessage("Unable to connect to authentication server. Please try again.");
    } finally {
      setIsConnectingGithub(false);
    }
  };

  const selectPreset = (preset: { usn: string; github: string }) => {
    setUsnInput(preset.usn);
    setGithubInput(preset.github);
    setErrorMessage(null);
  };

  return (
    <div className="relative min-h-[85vh] py-16 px-4 flex flex-col items-center justify-center bg-background bg-grid-pattern overflow-hidden transition-colors">
      {/* Ambient background glow matching platform aesthetic */}
      <div
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: "var(--glow, #3b82f6)" }}
      />
      <div
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "var(--glow-secondary, #8b5cf6)" }}
      />

      <div className="relative z-10 w-full max-w-xl">
        {/* ============================================================== */}
        {/* STATE A: AUTHENTICATED STUDENT SESSION VIEW                   */}
        {/* ============================================================== */}
        {user ? (
          <div className="rounded-3xl border border-border bg-card/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-foreground animate-in fade-in duration-300">
            {/* Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-5">
              <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>IST Student Verified • Session Persistent</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] font-mono text-muted-foreground">
                <Laptop className="h-3.5 w-3.5 text-primary" />
                <span>Cross-Tab Synchronized</span>
              </div>
            </div>

            {/* Student Profile Identity Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl bg-muted/40 border border-border/60">
              <div className="relative shrink-0">
                <img
                  src={user.avatarUrl || `https://github.com/${user.githubUsername}.png`}
                  alt={user.githubUsername}
                  className="h-20 w-20 rounded-2xl border-2 border-primary/40 object-cover shadow-lg shadow-primary/10"
                  onError={(e) => {
                    // Fallback to default avatar on broken images
                    (e.target as HTMLImageElement).src = `https://github.com/identicons/${user.githubUsername}.png`;
                  }}
                />
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center text-[10px] text-white font-bold" title="Verified Campus Contributor">
                  ✓
                </span>
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-extrabold tracking-tight text-foreground truncate">
                    {user.name}
                  </h2>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">
                    {user.usn}
                  </span>
                </div>

                <a
                  href={`https://github.com/${user.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  <span>@{user.githubUsername}</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>

                <p className="text-xs text-muted-foreground">
                  {user.department} • {user.year} • {user.college}
                </p>
              </div>
            </div>

            {/* Real-time Synced GitHub PR Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/80 bg-background/80 p-3.5 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                  Merged PRs
                </span>
                <span className="text-lg font-extrabold text-foreground font-mono">
                  {user.stats?.mergedPrs ?? 0}
                </span>
              </div>

              <div className="rounded-xl border border-border/80 bg-background/80 p-3.5 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 block">
                  Quality PRs
                </span>
                <span className="text-lg font-extrabold text-amber-500 font-mono">
                  {user.stats?.qualityPrs ?? 0}
                </span>
              </div>

              <div className="rounded-xl border border-border/80 bg-background/80 p-3.5 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                  Open PRs
                </span>
                <span className="text-lg font-extrabold text-foreground font-mono">
                  {user.stats?.openPrs ?? 0}
                </span>
              </div>

              <div className="rounded-xl border border-border/80 bg-background/80 p-3.5 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary block">
                  Role
                </span>
                <span className="text-xs font-bold text-primary font-mono block mt-1">
                  {user.role || "MEMBER"}
                </span>
              </div>
            </div>

            {/* Session Persistence Details */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px]">
                <span className="flex items-center space-x-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Session Authenticated:</span>
                </span>
                <span className="text-foreground">
                  {new Date(user.loggedInAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px]">
                <span>Storage Key:</span>
                <span className="text-primary font-semibold">zenithen_student_session (localStorage)</span>
              </div>
            </div>

            {/* Quick Campus Platform Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <Link
                href="/projects"
                className="flex items-center justify-center space-x-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs py-2.5 px-3 transition-colors shadow-sm"
              >
                <FolderGit2 className="h-4 w-4" />
                <span>Campus Repos</span>
              </Link>

              <Link
                href="/leaderboard"
                className="flex items-center justify-center space-x-2 rounded-xl border border-border hover:bg-muted text-foreground font-semibold text-xs py-2.5 px-3 transition-colors"
              >
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>Hall of Fame</span>
              </Link>

              <Link
                href={`/members/${user.githubUsername}`}
                className="flex items-center justify-center space-x-2 rounded-xl border border-border hover:bg-muted text-foreground font-semibold text-xs py-2.5 px-3 transition-colors"
              >
                <Users className="h-4 w-4 text-primary" />
                <span>My Profile</span>
              </Link>
            </div>

            {/* Sign Out / Switch Account */}
            <div className="border-t border-border/70 pt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(user, null, 2));
                  setSessionCopied(true);
                  setTimeout(() => setSessionCopied(false), 2000);
                }}
                className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {sessionCopied ? "✓ Session JSON Copied!" : "Copy Session JSON"}
              </button>

              <Button
                variant="ghost"
                onClick={logout}
                className="gap-2 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Switch Contributor Account</span>
              </Button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* STATE B: INTERACTIVE IN-PAGE LOGIN & OAUTH LINKING FLOW       */
          /* ============================================================== */
          <div className="rounded-3xl border border-border bg-card/90 backdrop-blur-2xl p-6 sm:p-9 shadow-2xl text-foreground animate-in fade-in duration-300">
            {/* Header / Brand */}
            <div className="text-center mb-6">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4 shadow-inner">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>IST Contributor Access</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Student Authentication
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                Verify your campus enrollment using your University Serial Number (USN), link your authentic GitHub profile, and synchronize your open-source pull requests.
              </p>
            </div>

            {/* Interactive Step Progress Indicator */}
            <div className="flex items-center justify-center space-x-3 mb-6 pb-4 border-b border-border/70">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step === 1
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
                }`}
              >
                {step === 2 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
              </div>
              <span className={`text-xs font-mono font-semibold ${step === 1 ? "text-foreground" : "text-muted-foreground"}`}>
                1. USN Verification
              </span>

              <div className={`h-0.5 w-8 ${step === 2 ? "bg-primary" : "bg-border"}`} />

              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step === 2
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                2
              </div>
              <span className={`text-xs font-mono font-semibold ${step === 2 ? "text-foreground" : "text-muted-foreground"}`}>
                2. GitHub Linking
              </span>
            </div>

            {/* Global Error Banner */}
            {errorMessage && (
              <div className="mb-5 flex items-start space-x-2.5 rounded-xl bg-destructive/10 border border-destructive/30 p-3.5 text-xs text-destructive animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: USN ENROLLMENT VERIFICATION */}
            {step === 1 && (
              <form onSubmit={handleVerifyUSN} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    University Serial Number (USN)
                  </label>
                  <Input
                    required
                    autoFocus
                    placeholder="e.g. 1SV23CS001"
                    value={usnInput}
                    onChange={(e) => {
                      setUsnInput(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="border-border bg-background text-foreground text-sm uppercase font-mono tracking-wider focus:border-primary py-2.5"
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Accepts authentic IST enrollment formats starting with <code className="font-mono text-primary font-semibold">1SV</code> or <code className="font-mono text-primary font-semibold">SV</code>.
                  </p>
                </div>

                {/* Quick Preset Selector */}
                <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block font-mono">
                    Quick Fill Campus Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_STUDENTS.map((preset) => (
                      <button
                        key={preset.usn}
                        type="button"
                        onClick={() => selectPreset(preset)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
                          usnInput.toUpperCase() === preset.usn
                            ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                            : "bg-background/80 border-border text-foreground hover:border-primary/50"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/25 py-2.5 cursor-pointer mt-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying Enrollment...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Enrollment & Proceed</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* STEP 2: GITHUB OAUTH & PROFILE LINKING */}
            {step === 2 && verifiedStudent && (
              <form onSubmit={handleConnectGitHub} className="space-y-4">
                {/* Verified USN Summary Pill */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-500">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>IST Student Verified</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded border border-emerald-500/40">
                      {verifiedStudent.usn}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {verifiedStudent.name} • {verifiedStudent.department} • {verifiedStudent.year}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Your GitHub Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                      @
                    </span>
                    <Input
                      required
                      autoFocus
                      placeholder="github-username"
                      value={githubInput}
                      onChange={(e) => {
                        setGithubInput(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="pl-8 border-border bg-background text-foreground text-xs font-mono focus:border-primary py-2.5"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
                    Pull requests merged into official campus repositories (<code className="font-mono text-primary font-semibold">ZenithenOpen</code> and <code className="font-mono text-primary font-semibold">First-PR</code>) will be tracked to this account.
                  </p>
                </div>

                {/* Suggested Campus Usernames */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
                  <span>Suggested Handles:</span>
                  {["alex-chen", "priya-sharma", "vikram-patel", "ananya-rao", "rahul-verma"].map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => setGithubInput(handle)}
                      className="font-mono text-primary hover:underline hover:text-primary/80 cursor-pointer"
                    >
                      @{handle}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    type="submit"
                    disabled={isConnectingGithub}
                    className="w-full gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-xs shadow-lg shadow-secondary/25 py-2.5 cursor-pointer"
                  >
                    {isConnectingGithub ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Authenticating Profile...</span>
                      </>
                    ) : (
                      <>
                        <GithubIcon className="h-4 w-4" />
                        <span>Authorize with GitHub Profile</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep(1);
                      setErrorMessage(null);
                    }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Change USN Enrollment</span>
                  </Button>
                </div>
              </form>
            )}

            {/* Platform Security Footer */}
            <div className="mt-6 pt-4 border-t border-border/60 text-center">
              <p className="text-[11px] text-muted-foreground">
                ZenithenOpen stores student sessions securely in browser local storage and verifies real-time pull request activity directly with the GitHub REST API.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
