"use client";

import * as React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  School,
  Lock,
  ExternalLink,
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

      if (!res.ok || !data.valid) {
        setErrorMessage(data.error || "USN could not be verified in S-VYASA student database.");
        setIsVerifying(false);
        return;
      }

      setVerifiedStudent(data.student);
      setStep(2);
    } catch {
      setErrorMessage("Network error during verification. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2: Complete GitHub Login
  const handleConnectGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedStudent) return;

    const username = githubInput.trim();
    if (!username) {
      setErrorMessage("Please enter your GitHub username.");
      return;
    }

    setIsConnectingGithub(true);
    // Simulate GitHub OAuth verification handoff
    setTimeout(() => {
      loginUser(verifiedStudent, username);
      setIsConnectingGithub(false);
      closeLoginModal();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl overflow-hidden">
        {/* Ambient background light */}
        <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-purple-100/60 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2 mb-6">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step === 1 ? "bg-blue-600 text-white" : "bg-emerald-100 text-emerald-700 border border-emerald-300"
            }`}
          >
            {step === 2 ? <CheckCircle2 className="h-3.5 w-3.5" /> : "1"}
          </div>
          <div className={`h-0.5 w-8 ${step === 2 ? "bg-emerald-500" : "bg-slate-200"}`} />
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step === 2 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            2
          </div>
          <span className="text-[11px] font-mono text-slate-500 ml-2">
            {step === 1 ? "Step 1: USN Verification" : "Step 2: GitHub Linking"}
          </span>
        </div>

        {/* STEP 1: S-VYASA USN VERIFICATION */}
        {step === 1 && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Student Verification
                </h2>
                <p className="text-xs text-slate-500">S-VYASA University Contributor Access</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              ZenithenOpen is exclusive to S-VYASA engineering students. Enter your University Serial Number (USN) to confirm your campus enrollment.
            </p>

            {errorMessage && (
              <div className="mb-4 flex items-start space-x-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyUSN} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
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
                    className="border-slate-200 bg-white text-slate-900 text-sm uppercase font-mono tracking-wider focus:border-blue-500"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-500">
                  <span>Test USNs:</span>
                  <button
                    type="button"
                    onClick={() => setUsnInput("1SV23CS001")}
                    className="text-blue-600 hover:underline font-mono font-medium"
                  >
                    1SV23CS001
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setUsnInput("1SV23AI012")}
                    className="text-blue-600 hover:underline font-mono font-medium"
                  >
                    1SV23AI012
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setUsnInput("1SV22CS045")}
                    className="text-blue-600 hover:underline font-mono font-medium"
                  >
                    1SV22CS045
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-blue-600 hover:bg-blue-700 font-semibold text-xs shadow-md py-2.5"
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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-purple-600">
                <GithubIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Link GitHub Account
                </h2>
                <p className="text-xs text-slate-500">Associate your developer profile</p>
              </div>
            </div>

            {/* Verified student identity badge */}
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>S-VYASA Student Verified</span>
                </span>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                  {verifiedStudent.usn}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {verifiedStudent.department} • {verifiedStudent.year}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 flex items-start space-x-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleConnectGitHub} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Your GitHub Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                    @
                  </span>
                  <Input
                    required
                    autoFocus
                    placeholder="github-username"
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    className="pl-8 border-slate-200 bg-white text-slate-900 text-xs font-mono focus:border-blue-500"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Your PRs and open-source contributions will be tied to this account.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Button
                  type="submit"
                  disabled={isConnectingGithub}
                  className="w-full gap-2 bg-purple-600 hover:bg-purple-700 font-semibold text-xs shadow-md py-2.5 text-white"
                >
                  <GithubIcon className="h-4 w-4" />
                  <span>{isConnectingGithub ? "Authenticating..." : "Authorize with GitHub"}</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="w-full text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-1"
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
