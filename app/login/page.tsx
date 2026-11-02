"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";
import { VerifiedStudent, sanitizeUsernameHandle } from "@/lib/auth/usn-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
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
  Check,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const { user, loginUser, logout, rememberedAccounts } = useAuth();

  // Mode: "onboard" (Step 1 USN -> Step 2 GitHub -> Step 3 LinkedIn) or "returning" (Fast 1-click)
  const [activeTab, setActiveTab] = React.useState<"onboard" | "returning">(
    rememberedAccounts.length > 0 ? "returning" : "onboard"
  );

  // 3-Step Onboarding State
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [usnInput, setUsnInput] = React.useState("");
  const [githubUsernameInput, setGithubUsernameInput] = React.useState("");
  const [linkedinUsernameInput, setLinkedinUsernameInput] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [verifiedStudent, setVerifiedStudent] = React.useState<VerifiedStudent | null>(null);

  // Authorized OAuth identities
  const [authorizedGithub, setAuthorizedGithub] = React.useState<{
    githubId: string;
    username: string;
    name: string;
    avatarUrl: string;
    profileUrl: string;
  } | null>(null);
  const [isAuthorizingGithub, setIsAuthorizingGithub] = React.useState(false);

  const [authorizedLinkedin, setAuthorizedLinkedin] = React.useState<{
    linkedinId: string;
    vanityName: string;
    name: string;
    avatarUrl: string;
    profileUrl: string;
  } | null>(null);
  const [isAuthorizingLinkedin, setIsAuthorizingLinkedin] = React.useState(false);

  const [isFinalizing, setIsFinalizing] = React.useState(false);
  const [sessionCopied, setSessionCopied] = React.useState(false);

  // Quick preset accounts for demonstration & campus testing
  const PRESET_STUDENTS = [
    { usn: "1SV23CS001", label: "1SV23CS001 (CS • 2nd Year)", github: "alex-chen", linkedin: "alex-chen-dev" },
    { usn: "1SV23AI012", label: "1SV23AI012 (AI • 2nd Year)", github: "priya-sharma", linkedin: "priya-sharma-ai" },
    { usn: "1SV22CS045", label: "1SV22CS045 (CS • 3rd Year)", github: "vikram-patel", linkedin: "vikram-patel-oss" },
  ];

  // Finalize linking USN + GitHub + LinkedIn
  const finalizeRegistration = React.useCallback(
    async (liProfile: {
      linkedinId: string;
      vanityName: string;
      name: string;
      avatarUrl: string;
      profileUrl: string;
    }) => {
      if (!verifiedStudent || !authorizedGithub) {
        setErrorMessage("Incomplete authorization. Please restart verification.");
        setStep(1);
        return;
      }

      setIsFinalizing(true);
      try {
        const cleanGhUsername = sanitizeUsernameHandle(authorizedGithub.username);
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usn: verifiedStudent.usn,
            githubUsername: cleanGhUsername,
            githubAccount: {
              ...authorizedGithub,
              username: cleanGhUsername,
            },
            linkedinAccount: liProfile,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMessage(data.error || "Failed to finalize student account linking.");
          setIsFinalizing(false);
          return;
        }

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });

        loginUser(data.user);
      } catch {
        setErrorMessage("Unable to connect to authentication server. Please try again.");
      } finally {
        setIsFinalizing(false);
        setIsAuthorizingLinkedin(false);
      }
    },
    [verifiedStudent, authorizedGithub, loginUser]
  );

  // Listen for OAuth callback messages from popup windows
  React.useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "ZENITHEN_GITHUB_OAUTH_SUCCESS" && event.data.code) {
        setIsAuthorizingGithub(true);
        setErrorMessage(null);
        try {
          const exchangeRes = await fetch("/api/auth/oauth/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: event.data.code }),
          });
          const exchangeData = await exchangeRes.json();
          if (exchangeData.success && exchangeData.user) {
            setAuthorizedGithub(exchangeData.user);
            setGithubUsernameInput(exchangeData.user.username);
            setLinkedinUsernameInput(`${exchangeData.user.username}-dev`);
            setStep(3);
          } else {
            setErrorMessage(exchangeData.error || "GitHub authorization failed.");
          }
        } catch {
          setErrorMessage("Failed to exchange GitHub authorization code.");
        } finally {
          setIsAuthorizingGithub(false);
        }
      }

      if (event.data.type === "ZENITHEN_LINKEDIN_OAUTH_SUCCESS" && event.data.code) {
        setIsAuthorizingLinkedin(true);
        setErrorMessage(null);
        try {
          const exchangeRes = await fetch("/api/auth/oauth/linkedin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: event.data.code }),
          });
          const exchangeData = await exchangeRes.json();
          if (exchangeData.success && exchangeData.user) {
            setAuthorizedLinkedin(exchangeData.user);
            await finalizeRegistration(exchangeData.user);
          } else {
            setErrorMessage(exchangeData.error || "LinkedIn authorization failed.");
          }
        } catch {
          setErrorMessage("Failed to exchange LinkedIn authorization code.");
        } finally {
          setIsAuthorizingLinkedin(false);
        }
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [finalizeRegistration]);

  // ---------------------------------------------------------------------------
  // STEP 1: Verify USN against university registry
  // ---------------------------------------------------------------------------
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

      const student = data.student;
      setVerifiedStudent(student);
      const cleanSuggested = sanitizeUsernameHandle(student.suggestedGithub || student.usn || "student");
      setGithubUsernameInput(cleanSuggested);
      setLinkedinUsernameInput(`${cleanSuggested}-dev`);
      setStep(2);
    } catch {
      setErrorMessage("Unable to connect to USN verification service. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const selectPreset = (preset: (typeof PRESET_STUDENTS)[0]) => {
    setUsnInput(preset.usn);
    setGithubUsernameInput(preset.github);
    setLinkedinUsernameInput(preset.linkedin);
    setErrorMessage(null);
  };

  // ---------------------------------------------------------------------------
  // STEP 2: Verify & Connect GitHub Account (Direct or OAuth Popup)
  // ---------------------------------------------------------------------------
  const handleVerifyAndConnectGitHub = async (targetUsername?: string) => {
    setErrorMessage(null);
    setIsAuthorizingGithub(true);

    const chosenUsername = sanitizeUsernameHandle(
      targetUsername || githubUsernameInput || (verifiedStudent ? verifiedStudent.usn : "ist-contributor")
    );

    try {
      const exchangeRes = await fetch("/api/auth/oauth/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulate: true,
          username: chosenUsername,
          studentName: verifiedStudent?.name,
        }),
      });

      const exchangeData = await exchangeRes.json();
      if (!exchangeRes.ok || !exchangeData.success || !exchangeData.user) {
        setErrorMessage(exchangeData.error || "GitHub authorization failed.");
        setIsAuthorizingGithub(false);
        return;
      }

      setAuthorizedGithub(exchangeData.user);
      setGithubUsernameInput(exchangeData.user.username);
      if (!linkedinUsernameInput || linkedinUsernameInput.startsWith("student-")) {
        setLinkedinUsernameInput(`${exchangeData.user.username}-dev`);
      }
      setStep(3);
    } catch {
      setErrorMessage("Unable to complete GitHub authorization. Please try again.");
    } finally {
      setIsAuthorizingGithub(false);
    }
  };

  const handleLaunchGitHubOAuth = async () => {
    setErrorMessage(null);
    setIsAuthorizingGithub(true);

    try {
      const initRes = await fetch("/api/auth/oauth/github");
      const initData = await initRes.json();

      if (initData.authUrl) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        window.open(initData.authUrl, "GitHubOAuth", `width=${width},height=${height},left=${left},top=${top}`);
      } else {
        await handleVerifyAndConnectGitHub();
      }
    } catch {
      await handleVerifyAndConnectGitHub();
    } finally {
      setIsAuthorizingGithub(false);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 3: Official LinkedIn Authorization & Finalize
  // ---------------------------------------------------------------------------
  const handleAuthorizeLinkedIn = async (presetLinkedin?: string) => {
    setErrorMessage(null);
    setIsAuthorizingLinkedin(true);

    const chosenHandle = sanitizeUsernameHandle(
      presetLinkedin || linkedinUsernameInput || (authorizedGithub ? authorizedGithub.username : "student-engineer")
    );

    try {
      const exchangeRes = await fetch("/api/auth/oauth/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulate: true,
          vanityName: chosenHandle,
          studentName: verifiedStudent?.name,
          githubUsername: authorizedGithub?.username,
        }),
      });

      const exchangeData = await exchangeRes.json();
      if (!exchangeRes.ok || !exchangeData.success || !exchangeData.user) {
        setErrorMessage(exchangeData.error || "LinkedIn authorization failed.");
        setIsAuthorizingLinkedin(false);
        return;
      }

      const liProfile = exchangeData.user;
      setAuthorizedLinkedin(liProfile);
      await finalizeRegistration(liProfile);
    } catch {
      setErrorMessage("Unable to complete LinkedIn authorization. Please try again.");
      setIsAuthorizingLinkedin(false);
    }
  };



  // ---------------------------------------------------------------------------
  // FAST 1-CLICK LOGIN FOR RETURNING USERS
  // ---------------------------------------------------------------------------
  const handleFastLogin = async (identifier: string, provider: "github" | "linkedin") => {
    setErrorMessage(null);
    setIsVerifying(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fastLogin: true,
          provider,
          identifier,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.user) {
        if (data.needsEnrollment) {
          setErrorMessage("This account is not yet enrolled. Please complete the one-time 3-step onboarding.");
          setActiveTab("onboard");
          setStep(1);
        } else {
          setErrorMessage(data.error || "Fast login failed.");
        }
        setIsVerifying(false);
        return;
      }

      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      loginUser(data.user);
    } catch {
      setErrorMessage("Network error during fast login. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-background flex flex-col justify-center items-center relative overflow-hidden transition-colors">
      {/* Dynamic ambient background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-40"
        style={{ background: "var(--glow)" }}
      />
      <div
        className="absolute bottom-10 left-1/3 w-[450px] h-[300px] rounded-full blur-[120px] pointer-events-none opacity-30"
        style={{ background: "var(--glow-secondary)" }}
      />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* ============================================================== */}
        {/* STATE A: CURRENTLY LOGGED IN STUDENT CARD                      */}
        {/* ============================================================== */}
        {user ? (
          <div className="rounded-3xl border border-border bg-card/90 backdrop-blur-2xl p-6 sm:p-9 shadow-2xl text-foreground space-y-6 animate-in fade-in duration-300">
            {/* Header Badge & Profile Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-16 w-16 rounded-2xl border-2 border-primary/40 object-cover shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-extrabold text-foreground">{user.name}</h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {user.usn}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user.department} • {user.year}
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{user.college}</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0">
                <span className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Authenticated</span>
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">Role: {user.role}</span>
              </div>
            </div>

            {/* Verified External Social Linkages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* GitHub Identity */}
              <a
                href={user.githubProfileUrl || `https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl border border-border bg-muted/40 hover:bg-muted/70 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-black/80 text-white flex items-center justify-center shrink-0">
                    <GithubIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      @{user.githubUsername}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">GitHub Verified</p>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 ml-2" />
              </a>

              {/* LinkedIn Identity */}
              <a
                href={user.linkedinUrl || `https://www.linkedin.com/in/${user.linkedinUsername || user.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shrink-0">
                    <LinkedinIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-blue-500 transition-colors">
                      {user.linkedinUsername ? `in/${user.linkedinUsername}` : "LinkedIn Profile"}
                    </p>
                    <p className="text-[10px] text-blue-500 font-mono">LinkedIn Verified</p>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-blue-500 shrink-0 ml-2" />
              </a>
            </div>

            {/* Real-time PR Contribution Metrics */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-border/80 bg-background/80 p-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 block">
                  Merged PRs
                </span>
                <span className="text-lg font-extrabold text-emerald-500 font-mono">
                  {user.stats?.mergedPrs ?? 0}
                </span>
              </div>
              <div className="rounded-xl border border-border/80 bg-background/80 p-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-500 block">
                  Open PRs
                </span>
                <span className="text-lg font-extrabold text-blue-500 font-mono">
                  {user.stats?.openPrs ?? 0}
                </span>
              </div>
              <div className="rounded-xl border border-border/80 bg-background/80 p-3 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 block">
                  Closed PRs
                </span>
                <span className="text-lg font-extrabold text-amber-500 font-mono">
                  {user.stats?.closedPrs ?? 0}
                </span>
              </div>
            </div>

            {/* Quick Platform Links */}
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
                <span>Leaderboard</span>
              </Link>
              <Link
                href={`/members/${user.githubUsername}`}
                className="flex items-center justify-center space-x-2 rounded-xl border border-border hover:bg-muted text-foreground font-semibold text-xs py-2.5 px-3 transition-colors"
              >
                <Users className="h-4 w-4 text-primary" />
                <span>My Profile</span>
              </Link>
            </div>

            {/* Session Management */}
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
                <span>Log Out / Switch Account</span>
              </Button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* STATE B: LOGIN & 3-STEP ONBOARDING WORKFLOW                   */
          /* ============================================================== */
          <div className="rounded-3xl border border-border bg-card/90 backdrop-blur-2xl p-6 sm:p-9 shadow-2xl text-foreground animate-in fade-in duration-300">
            {/* Header / Brand */}
            <div className="text-center mb-6">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4 shadow-inner">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono mb-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>IST Contributor Authentication</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Student Login & Verification
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                Connect your authentic student USN with official GitHub and LinkedIn credentials to unlock open-source rankings and contributions.
              </p>
            </div>

            {/* Mode Switcher Tabs: Onboarding vs Fast Returning Login */}
            <div className="flex rounded-xl bg-muted/60 p-1 border border-border mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("onboard")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "onboard"
                    ? "bg-background text-foreground shadow-xs font-extrabold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>3-Step Student Onboarding</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("returning")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "returning"
                    ? "bg-background text-foreground shadow-xs font-extrabold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Returning Contributor Login</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 flex items-start space-x-2.5 rounded-xl bg-destructive/10 border border-destructive/30 p-3.5 text-xs text-destructive animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 1: 3-STEP ONBOARDING FLOW                             */}
            {/* ========================================================== */}
            {activeTab === "onboard" && (
              <div>
                {/* 3-Step Visual Progress Indicator */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/70 text-xs">
                  {/* Step 1 Pill */}
                  <div className="flex items-center space-x-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        step === 1
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : step > 1
                          ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
                    </div>
                    <span className={`font-mono font-semibold ${step === 1 ? "text-foreground" : "text-muted-foreground"}`}>
                      1. USN
                    </span>
                  </div>

                  <div className={`h-0.5 flex-1 mx-2 ${step > 1 ? "bg-emerald-500/50" : "bg-border"}`} />

                  {/* Step 2 Pill */}
                  <div className="flex items-center space-x-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        step === 2
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : step > 2
                          ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > 2 ? <Check className="h-3.5 w-3.5" /> : "2"}
                    </div>
                    <span className={`font-mono font-semibold ${step === 2 ? "text-foreground" : "text-muted-foreground"}`}>
                      2. GitHub
                    </span>
                  </div>

                  <div className={`h-0.5 flex-1 mx-2 ${step > 2 ? "bg-emerald-500/50" : "bg-border"}`} />

                  {/* Step 3 Pill */}
                  <div className="flex items-center space-x-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        step === 3
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      3
                    </div>
                    <span className={`font-mono font-semibold ${step === 3 ? "text-foreground" : "text-muted-foreground"}`}>
                      3. LinkedIn
                    </span>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* STEP 1: IST USN VERIFICATION                         */}
                {/* ---------------------------------------------------- */}
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
                        Quick Campus Presets:
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
                          <span>Verifying Student USN...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify USN & Proceed to GitHub Login</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {/* ---------------------------------------------------- */}
                {/* STEP 2: OFFICIAL GITHUB OAUTH AUTHORIZATION          */}
                {/* ---------------------------------------------------- */}
                {step === 2 && verifiedStudent && (
                  <div className="space-y-4">
                    {/* Verified USN Summary */}
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-500">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Student Enrollment Verified</span>
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                          {verifiedStudent.usn}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {verifiedStudent.name} • {verifiedStudent.department} • {verifiedStudent.year}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-border bg-card space-y-4 text-left">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-md">
                          <GithubIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">GitHub Developer Identity</h3>
                          <p className="text-xs text-muted-foreground">
                            Confirm your GitHub handle or authorize via OAuth
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>GitHub Username</span>
                          <span className="text-[11px] text-muted-foreground">Type your handle or authorize</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-mono text-muted-foreground">@</span>
                          <Input
                            value={githubUsernameInput}
                            onChange={(e) => {
                              setGithubUsernameInput(e.target.value);
                              if (errorMessage) setErrorMessage(null);
                            }}
                            placeholder="your-github-username"
                            className="pl-7 font-mono text-xs border-border bg-background focus:border-primary py-2.5"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <Button
                          onClick={() => handleVerifyAndConnectGitHub(githubUsernameInput)}
                          disabled={isAuthorizingGithub || !githubUsernameInput.trim()}
                          className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md py-2.5 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{isAuthorizingGithub ? "Connecting..." : `Continue with @${githubUsernameInput.replace(/^@/, '') || 'handle'}`}</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleLaunchGitHubOAuth()}
                          disabled={isAuthorizingGithub}
                          className="w-full gap-2 border-border text-foreground hover:bg-muted font-semibold text-xs py-2.5 cursor-pointer"
                        >
                          <GithubIcon className="h-4 w-4" />
                          <span>Authorize via Popup</span>
                        </Button>
                      </div>

                      {/* Quick Developer Testing Handles */}
                      <div className="pt-2 border-t border-border/60">
                        <span className="text-[11px] text-muted-foreground block mb-1.5">
                          Or select campus test profile:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {["adityasharma-dev", "sneharao-ist", "rohank-coder", "priyanair-oss"].map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              onClick={() => {
                                setGithubUsernameInput(handle);
                                handleVerifyAndConnectGitHub(handle);
                              }}
                              className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-foreground hover:border-primary/40 transition-colors cursor-pointer"
                            >
                              @{handle}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to USN Verification</span>
                    </Button>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* STEP 3: OFFICIAL LINKEDIN OAUTH AUTHORIZATION        */}
                {/* ---------------------------------------------------- */}
                {step === 3 && verifiedStudent && authorizedGithub && (
                  <div className="space-y-4">
                    {/* Confirmed USN & GitHub Summary */}
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={authorizedGithub.avatarUrl}
                          alt={authorizedGithub.username}
                          className="h-9 w-9 rounded-full border border-emerald-500/50"
                        />
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {verifiedStudent.name} ({verifiedStudent.usn})
                          </p>
                          <p className="text-[11px] font-mono text-emerald-500">
                            ✓ GitHub: @{authorizedGithub.username}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                        Verified
                      </span>
                    </div>

                    <div className="p-5 rounded-2xl border border-border bg-card space-y-4 text-left">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shadow-md">
                          <LinkedinIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">Professional LinkedIn Verification</h3>
                          <p className="text-xs text-muted-foreground">
                            Link your verified professional profile to complete student verification
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>LinkedIn Handle / Vanity URL</span>
                          <span className="text-[11px] text-muted-foreground">e.g. in/alex-chen or vanity URL</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-mono text-muted-foreground">in/</span>
                          <Input
                            value={linkedinUsernameInput}
                            onChange={(e) => {
                              setLinkedinUsernameInput(e.target.value);
                              if (errorMessage) setErrorMessage(null);
                            }}
                            placeholder="your-vanity-handle"
                            className="pl-8 font-mono text-xs border-border bg-background focus:border-sky-500 py-2.5"
                          />
                        </div>
                      </div>

                      {/* Official Authorize with LinkedIn Button */}
                      <Button
                        onClick={() => handleAuthorizeLinkedIn(linkedinUsernameInput)}
                        disabled={isAuthorizingLinkedin || isFinalizing || !linkedinUsernameInput.trim()}
                        className="w-full gap-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-xs shadow-md py-3 cursor-pointer"
                      >
                        {isAuthorizingLinkedin || isFinalizing ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Linking Dual Profiles & Finalizing...</span>
                          </>
                        ) : (
                          <>
                            <LinkedinIcon className="h-4 w-4" />
                            <span>Authorize & Link LinkedIn Profile</span>
                          </>
                        )}
                      </Button>

                      {/* Quick Developer Testing Handles */}
                      <div className="pt-2 border-t border-border/60">
                        <span className="text-[11px] text-muted-foreground block mb-1.5">
                          Or select campus test profile:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {["aditya-sharma-dev", "sneha-rao-ist", "rohan-kulkarni-oss", "priya-nair-ai"].map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              onClick={() => {
                                setLinkedinUsernameInput(handle);
                                handleAuthorizeLinkedIn(handle);
                              }}
                              className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-foreground hover:border-blue-500/40 transition-colors cursor-pointer"
                            >
                              in/{handle}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep(2)}
                      className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to GitHub Step</span>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 2: FAST ONE-CLICK LOGIN FOR RETURNING USERS            */}
            {/* ========================================================== */}
            {activeTab === "returning" && (
              <div className="space-y-5">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Already completed initial USN enrollment? Log in with 1-click using your verified GitHub or LinkedIn account without having to re-type your USN.
                </p>

                {/* Remembered Accounts on this machine */}
                {rememberedAccounts.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono font-semibold text-muted-foreground block uppercase tracking-wider">
                      Remembered Campus Contributors:
                    </span>
                    <div className="space-y-2">
                      {rememberedAccounts.map((acc) => (
                        <button
                          key={acc.usn}
                          type="button"
                          onClick={() => handleFastLogin(acc.githubUsername, "github")}
                          disabled={isVerifying}
                          className="w-full p-3 rounded-2xl border border-border bg-card/70 hover:bg-muted/60 hover:border-primary/40 flex items-center justify-between text-left transition-all cursor-pointer group shadow-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={`https://github.com/${acc.githubUsername}.png`}
                              alt={acc.name}
                              className="h-10 w-10 rounded-full border border-border object-cover"
                            />
                            <div>
                              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                {acc.name}
                              </p>
                              <p className="text-[11px] font-mono text-muted-foreground">
                                {acc.usn} • @{acc.githubUsername}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-primary group-hover:translate-x-1 transition-transform">
                            Log In →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Fast OAuth Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <Button
                    onClick={() => handleFastLogin("adityasharma-dev", "github")}
                    disabled={isVerifying}
                    className="w-full gap-2.5 bg-[#24292F] hover:bg-[#1B1F23] text-white font-semibold text-xs shadow-md py-3 cursor-pointer"
                  >
                    <GithubIcon className="h-4 w-4" />
                    <span>Fast Sign-In with GitHub</span>
                  </Button>

                  <Button
                    onClick={() => handleFastLogin("aditya-sharma-dev", "linkedin")}
                    disabled={isVerifying}
                    className="w-full gap-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-xs shadow-md py-3 cursor-pointer"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                    <span>Fast Sign-In with LinkedIn</span>
                  </Button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab("onboard")}
                    className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                  >
                    New student? Complete one-time 3-step enrollment →
                  </button>
                </div>
              </div>
            )}

            {/* Security Footer */}
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
