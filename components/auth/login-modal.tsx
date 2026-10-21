"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
  X,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-context";
import { VerifiedStudent } from "@/lib/auth/usn-verification";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginUser } = useAuth();

  const [step, setStep] = React.useState<1 | 2>(1);
  const [usnInput, setUsnInput] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [verifiedStudent, setVerifiedStudent] = React.useState<VerifiedStudent | null>(null);

  const [githubInput, setGithubInput] = React.useState("");
  const [isConnectingGithub, setIsConnectingGithub] = React.useState(false);

  // Reset modal state on open/close
  React.useEffect(() => {
    if (isLoginModalOpen) {
      setStep(1);
      setErrorMessage(null);
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

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
        setErrorMessage(data.error || "Invalid USN. Ensure you enter a valid IST enrollment number.");
        setIsVerifying(false);
        return;
      }

      setVerifiedStudent(data.student);
      setStep(2);
    } catch {
      setErrorMessage("Unable to connect to verification service. Please try again.");
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
      setErrorMessage("USN session expired. Please verify again.");
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

      loginUser(verifiedStudent, cleanUsername, data.user?.stats);
      closeLoginModal();
    } catch {
      setErrorMessage("Unable to connect to authentication server. Please try again.");
    } finally {
      setIsConnectingGithub(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-2xl overflow-hidden text-foreground">
        {/* Ambient background light responding to theme */}
        <div
          className="absolute -top-16 -right-16 h-36 w-36 rounded-full blur-3xl pointer-events-none"
          style={{ background: "var(--glow)" }}
        />
        <div
          className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full blur-3xl pointer-events-none"
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

        {/* Step Indicator */}
        <div className="flex items-center space-x-2 mb-6">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step === 1 ? "bg-primary text-primary-foreground" : "bg-accent/20 text-accent border border-accent/40"
            }`}
          >
            {step === 2 ? <CheckCircle2 className="h-3.5 w-3.5" /> : "1"}
          </div>
          <div className={`h-0.5 w-8 ${step === 2 ? "bg-accent" : "bg-border"}`} />
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            2
          </div>
          <span className="text-[11px] font-mono text-muted-foreground ml-2">
            {step === 1 ? "Step 1: USN Verification" : "Step 2: GitHub Linking"}
          </span>
        </div>

        {/* STEP 1: IST USN VERIFICATION */}
        {step === 1 && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                  Student Verification
                </h2>
                <p className="text-xs text-muted-foreground">IST Contributor Access</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-5">
              ZenithenOpen is exclusive to IST engineering students. Enter your University Serial Number (USN) to confirm your campus enrollment.
            </p>

            {errorMessage && (
              <div className="mb-4 flex items-start space-x-2 rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyUSN} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  University Serial Number (USN)
                </label>
                <div className="relative">
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
                </div>
                <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                  <span>Test USNs:</span>
                  <button
                    type="button"
                    onClick={() => setUsnInput("1SV23CS001")}
                    className="text-primary hover:underline font-mono font-medium cursor-pointer"
                  >
                    1SV23CS001
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setUsnInput("1SV23AI012")}
                    className="text-primary hover:underline font-mono font-medium cursor-pointer"
                  >
                    1SV23AI012
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setUsnInput("1SV22CS045")}
                    className="text-primary hover:underline font-mono font-medium cursor-pointer"
                  >
                    1SV22CS045
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md py-2.5 cursor-pointer"
              >
                {isVerifying ? "Verifying Enrollment..." : "Verify USN & Proceed →"}
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2: GITHUB OAUTH LOGIN */}
        {step === 2 && verifiedStudent && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/15 border border-secondary/30 text-secondary">
                <GithubIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                  Link GitHub Account
                </h2>
                <p className="text-xs text-muted-foreground">Associate your developer profile</p>
              </div>
            </div>

            {/* Verified student identity badge */}
            <div className="mb-5 rounded-xl border border-accent/30 bg-accent/10 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-xs font-semibold text-accent">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>IST Student Verified</span>
                </span>
                <span className="font-mono text-xs font-bold text-accent bg-accent/20 px-2 py-0.5 rounded border border-accent/40">
                  {verifiedStudent.usn}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {verifiedStudent.department} • {verifiedStudent.year}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 flex items-start space-x-2 rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleConnectGitHub} className="space-y-4">
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
                    onChange={(e) => setGithubInput(e.target.value)}
                    className="pl-8 border-border bg-background text-foreground text-xs font-mono focus:border-primary"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Your PRs and open-source contributions will be tied to this account.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Button
                  type="submit"
                  disabled={isConnectingGithub}
                  className="w-full gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-xs shadow-md py-2.5 cursor-pointer"
                >
                  <GithubIcon className="h-4 w-4" />
                  <span>{isConnectingGithub ? "Authenticating..." : "Authorize with GitHub"}</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Change USN</span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
