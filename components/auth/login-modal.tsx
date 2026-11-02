"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  X,
  Sparkles,
  Clock,
  Laptop,
  Check,
  Zap,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-context";
import { VerifiedStudent, sanitizeUsernameHandle } from "@/lib/auth/usn-verification";
import confetti from "canvas-confetti";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginUser, rememberedAccounts } = useAuth();

  // Mode: "onboard" (3-step flow) or "returning" (fast 1-click for saved accounts)
  const [activeTab, setActiveTab] = React.useState<"onboard" | "returning">("onboard");

  // Step 1: USN -> Step 2: GitHub OAuth -> Step 3: LinkedIn OAuth
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [usnInput, setUsnInput] = React.useState("");
  const [githubUsernameInput, setGithubUsernameInput] = React.useState("");
  const [linkedinUsernameInput, setLinkedinUsernameInput] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [verifiedStudent, setVerifiedStudent] = React.useState<VerifiedStudent | null>(null);

  // Authorized identities
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
  const [fastLoginLoadingId, setFastLoginLoadingId] = React.useState<string | null>(null);

  // Reset modal state on open
  React.useEffect(() => {
    if (isLoginModalOpen) {
      setStep(1);
      setErrorMessage(null);
      setAuthorizedGithub(null);
      setAuthorizedLinkedin(null);
      setGithubUsernameInput("");
      setLinkedinUsernameInput("");
      if (rememberedAccounts.length > 0) {
        setActiveTab("returning");
      } else {
        setActiveTab("onboard");
      }
    }
  }, [isLoginModalOpen, rememberedAccounts.length]);

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

        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // no-op
        }

        loginUser(data.user);
        closeLoginModal();
      } catch {
        setErrorMessage("Unable to connect to authentication server. Please try again.");
      } finally {
        setIsFinalizing(false);
        setIsAuthorizingLinkedin(false);
      }
    },
    [verifiedStudent, authorizedGithub, loginUser, closeLoginModal]
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

  if (!isLoginModalOpen) return null;

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
      setErrorMessage("Unable to connect to verification service. Please try again.");
    } finally {
      setIsVerifying(false);
    }
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
        setErrorMessage(exchangeData.error || "GitHub account verification failed.");
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
      setErrorMessage("Unable to connect to GitHub service. Please try again.");
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
      // Graceful fallback to direct username verification
      await handleVerifyAndConnectGitHub();
    } finally {
      setIsAuthorizingGithub(false);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 3: Official LinkedIn Authorization & Finalize Registration
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
        setErrorMessage(exchangeData.error || "LinkedIn verification failed.");
        setIsAuthorizingLinkedin(false);
        return;
      }

      const liProfile = exchangeData.user;
      setAuthorizedLinkedin(liProfile);
      await finalizeRegistration(liProfile);
    } catch {
      setErrorMessage("Unable to complete LinkedIn verification. Please try again.");
      setIsAuthorizingLinkedin(false);
    }
  };


  // ---------------------------------------------------------------------------
  // Fast 1-Click Login for Returning Contributors
  // ---------------------------------------------------------------------------
  const handleFastLogin = async (account: {
    usn: string;
    githubUsername: string;
    linkedinUsername?: string;
  }) => {
    setErrorMessage(null);
    setFastLoginLoadingId(account.usn);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fastLogin: true,
          provider: "github",
          identifier: account.githubUsername,
          usn: account.usn,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Fast login failed. Please verify your credentials.");
        setFastLoginLoadingId(null);
        return;
      }

      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch {
        // no-op
      }

      loginUser(data.user);
      closeLoginModal();
    } catch {
      setErrorMessage("Unable to connect to login service. Please try again.");
    } finally {
      setFastLoginLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 md:p-8 shadow-2xl overflow-hidden text-foreground">
        {/* Ambient background light responding to theme */}
        <div
          className="absolute -top-20 -right-20 h-44 w-44 rounded-full blur-3xl pointer-events-none"
          style={{ background: "var(--glow)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full blur-3xl pointer-events-none"
          style={{ background: "var(--glow-secondary)" }}
        />

        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top Header & Mode Toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-border/70 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                <span>IST Contributor Portal</span>
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </h2>
              <p className="text-[11px] text-muted-foreground">USN • GitHub • LinkedIn Authorization</p>
            </div>
          </div>

          {rememberedAccounts.length > 0 && (
            <div className="flex rounded-lg bg-muted/60 p-0.5 border border-border text-[11px] font-medium mr-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("returning");
                  setErrorMessage(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === "returning"
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="h-3 w-3 text-primary" />
                <span>Fast Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("onboard");
                  setErrorMessage(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === "onboard"
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Link USN</span>
              </button>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 flex items-start space-x-2 rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: RETURNING CONTRIBUTOR FAST 1-CLICK */}
        {activeTab === "returning" && rememberedAccounts.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span>Welcome Back, IST Contributor</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Select your linked profile for 1-click authentication without re-typing credentials.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {rememberedAccounts.map((account) => {
                const isLoading = fastLoginLoadingId === account.usn;
                return (
                  <div
                    key={account.usn}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/60 hover:bg-accent/10 hover:border-accent/40 transition-all text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                        {account.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">{account.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                            {account.usn}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <GithubIcon className="h-2.5 w-2.5" />
                            <span>@{account.githubUsername}</span>
                          </span>
                          {account.linkedinUsername && (
                            <span className="flex items-center gap-1 text-primary">
                              <LinkedinIcon className="h-2.5 w-2.5" />
                              <span>in/{account.linkedinUsername}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleFastLogin(account)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 h-8 px-3 cursor-pointer shadow-sm"
                    >
                      {isLoading ? (
                        <span>Authenticating...</span>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Have a new USN to link?</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("onboard");
                  setStep(1);
                }}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Link New USN Flow →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: 3-STEP ONBOARDING WORKFLOW */}
        {activeTab === "onboard" && (
          <div>
            {/* Step Visual Progress Track */}
            <div className="flex items-center justify-between mb-5 px-1">
              {/* Step 1 badge */}
              <div className="flex items-center space-x-1.5">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                    step > 1
                      ? "bg-emerald-500 text-white"
                      : step === 1
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
                </div>
                <span className={`text-[11px] font-medium ${step === 1 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  USN
                </span>
              </div>

              <div className={`h-0.5 flex-1 mx-2 transition-colors ${step > 1 ? "bg-emerald-500" : "bg-border"}`} />

              {/* Step 2 badge */}
              <div className="flex items-center space-x-1.5">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                    step > 2
                      ? "bg-emerald-500 text-white"
                      : step === 2
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > 2 ? <Check className="h-3.5 w-3.5" /> : "2"}
                </div>
                <span className={`text-[11px] font-medium ${step === 2 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  GitHub
                </span>
              </div>

              <div className={`h-0.5 flex-1 mx-2 transition-colors ${step > 2 ? "bg-emerald-500" : "bg-border"}`} />

              {/* Step 3 badge */}
              <div className="flex items-center space-x-1.5">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                    step === 3
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  3
                </div>
                <span className={`text-[11px] font-medium ${step === 3 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  LinkedIn
                </span>
              </div>
            </div>

            {/* STEP 1: IST USN VERIFICATION */}
            {step === 1 && (
              <div className="animate-in fade-in">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-foreground">Step 1: Verify Campus Enrollment</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ZenithenOpen is student-exclusive. Enter your University Serial Number to confirm your active IST enrollment.
                  </p>
                </div>

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
                      className="border-border bg-background text-foreground text-sm uppercase font-mono tracking-wider focus:border-primary"
                    />

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="font-medium">Quick Test USNs:</span>
                      <button
                        type="button"
                        onClick={() => setUsnInput("1SV23CS001")}
                        className="px-2 py-0.5 rounded bg-muted hover:bg-accent/20 hover:text-accent font-mono text-[10px] text-primary transition-colors cursor-pointer"
                      >
                        1SV23CS001
                      </button>
                      <button
                        type="button"
                        onClick={() => setUsnInput("1SV23AI012")}
                        className="px-2 py-0.5 rounded bg-muted hover:bg-accent/20 hover:text-accent font-mono text-[10px] text-primary transition-colors cursor-pointer"
                      >
                        1SV23AI012
                      </button>
                      <button
                        type="button"
                        onClick={() => setUsnInput("1SV22CS045")}
                        className="px-2 py-0.5 rounded bg-muted hover:bg-accent/20 hover:text-accent font-mono text-[10px] text-primary transition-colors cursor-pointer"
                      >
                        1SV22CS045
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md py-2.5 cursor-pointer gap-1.5"
                  >
                    {isVerifying ? (
                      <span>Verifying Enrollment...</span>
                    ) : (
                      <>
                        <span>Verify USN & Next: GitHub OAuth</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* STEP 2: OFFICIAL GITHUB OAUTH */}
            {step === 2 && verifiedStudent && (
              <div className="animate-in fade-in space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Step 2: Connect GitHub Developer Identity</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Link your authentic GitHub developer account to automatically sync your pull requests, code achievements, and community rank.
                  </p>
                </div>

                {/* Verified USN card */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{verifiedStudent.name}</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                      {verifiedStudent.usn}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {verifiedStudent.department} • {verifiedStudent.year} • {verifiedStudent.college}
                  </p>
                </div>

                {/* GitHub Username Input & OAuth Action */}
                <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                      <GithubIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">GitHub Developer Profile</h4>
                      <p className="text-[11px] text-muted-foreground">Confirm your GitHub username or authorize via OAuth</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                      <span>GitHub Username</span>
                      <span className="text-[10px] text-muted-foreground">e.g. your-github-handle</span>
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
                        className="pl-7 font-mono text-xs border-border bg-background focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Trust Banner */}
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span><strong>Campus Verified:</strong> Connects your public GitHub portfolio without requiring invasive permissions or scary popups.</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Button
                      type="button"
                      disabled={isAuthorizingGithub || !githubUsernameInput.trim()}
                      onClick={() => handleVerifyAndConnectGitHub(githubUsernameInput)}
                      className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow py-2.5 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{isAuthorizingGithub ? "Connecting..." : `Link GitHub Account (@${githubUsernameInput.replace(/^@/, '') || 'handle'})`}</span>
                    </Button>

                    <div className="flex items-center justify-between px-1">
                      <button
                        type="button"
                        onClick={() => handleLaunchGitHubOAuth()}
                        className="text-[11px] text-muted-foreground hover:text-foreground hover:underline transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <GithubIcon className="h-3 w-3" />
                        <span>Optional: Sign in via GitHub OAuth popup</span>
                      </button>
                      <span className="text-[10px] text-muted-foreground font-mono">100% Safe</span>
                    </div>
                  </div>

                  {/* Preset profiles for quick testing in dev sandbox */}
                  <div className="pt-2 border-t border-border/60">
                    <p className="text-[10px] text-muted-foreground mb-1.5">Or choose a mock developer profile:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setGithubUsernameInput("alex-chen");
                          handleVerifyAndConnectGitHub("alex-chen");
                        }}
                        className="px-2 py-1 rounded-md bg-muted hover:bg-accent/20 text-foreground text-[10px] font-mono transition-colors cursor-pointer"
                      >
                        @alex-chen
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGithubUsernameInput("priya-sharma");
                          handleVerifyAndConnectGitHub("priya-sharma");
                        }}
                        className="px-2 py-1 rounded-md bg-muted hover:bg-accent/20 text-foreground text-[10px] font-mono transition-colors cursor-pointer"
                      >
                        @priya-sharma
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGithubUsernameInput("vikram-patel");
                          handleVerifyAndConnectGitHub("vikram-patel");
                        }}
                        className="px-2 py-1 rounded-md bg-muted hover:bg-accent/20 text-foreground text-[10px] font-mono transition-colors cursor-pointer"
                      >
                        @vikram-patel
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Step 1 (Change USN)</span>
                </Button>
              </div>
            )}

            {/* STEP 3: OFFICIAL LINKEDIN OAUTH */}
            {step === 3 && verifiedStudent && authorizedGithub && (
              <div className="animate-in fade-in space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Step 3: Professional LinkedIn Verification</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Link your LinkedIn professional profile to complete 2-factor student & developer verification.
                  </p>
                </div>

                {/* Preceding linked badges */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase">USN Verified</p>
                    <p className="font-mono text-xs font-semibold text-foreground truncate">{verifiedStudent.usn}</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10">
                    <p className="text-[10px] font-bold text-purple-400 uppercase">GitHub Verified</p>
                    <p className="font-mono text-xs font-semibold text-foreground truncate">@{authorizedGithub.username}</p>
                  </div>
                </div>

                {/* LinkedIn Authorization Action */}
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A66C2] text-white">
                      <LinkedinIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Link LinkedIn Profile</h4>
                      <p className="text-[11px] text-muted-foreground">Verifies your professional student identity</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                      <span>LinkedIn Handle / Vanity URL</span>
                      <span className="text-[10px] text-muted-foreground">e.g. in/alex-chen or vanity handle</span>
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
                        className="pl-8 font-mono text-xs border-border bg-background focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Trust Banner */}
                  <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-sky-500 shrink-0" />
                    <span><strong>Campus Verified:</strong> Connects your public professional profile without requesting sensitive account credentials.</span>
                  </div>

                  <Button
                    type="button"
                    disabled={isAuthorizingLinkedin || isFinalizing || !linkedinUsernameInput.trim()}
                    onClick={() => handleAuthorizeLinkedIn(linkedinUsernameInput)}
                    className="w-full gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-xs shadow py-2.5 cursor-pointer"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                    <span>
                      {isAuthorizingLinkedin || isFinalizing
                        ? "Verifying & Linking Profile..."
                        : `Authorize & Link LinkedIn Profile`}
                    </span>
                  </Button>

                  {/* Preset sandbox LinkedIn profiles */}
                  <div className="pt-2 border-t border-border/60">
                    <p className="text-[10px] text-muted-foreground mb-1.5">Or choose a mock profile handle:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLinkedinUsernameInput("alex-chen-dev");
                          handleAuthorizeLinkedIn("alex-chen-dev");
                        }}
                        className="px-2 py-1 rounded-md bg-muted hover:bg-sky-500/20 text-foreground text-[10px] font-mono transition-colors cursor-pointer"
                      >
                        in/alex-chen-dev
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkedinUsernameInput("priya-sharma-ai");
                          handleAuthorizeLinkedIn("priya-sharma-ai");
                        }}
                        className="px-2 py-1 rounded-md bg-muted hover:bg-sky-500/20 text-foreground text-[10px] font-mono transition-colors cursor-pointer"
                      >
                        in/priya-sharma-ai
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkedinUsernameInput("vikram-patel-oss");
                          handleAuthorizeLinkedIn("vikram-patel-oss");
                        }}
                        className="px-2 py-1 rounded-md bg-muted hover:bg-sky-500/20 text-foreground text-[10px] font-mono transition-colors cursor-pointer"
                      >
                        in/vikram-patel-oss
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Step 2 (Change GitHub)</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
