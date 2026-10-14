"use client";

import * as React from "react";
import {
  ShieldCheck,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Sparkles,
  X,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkedinIcon } from "@/components/ui/icons";

export interface ProofOfWorkBadgeData {
  username: string;
  name: string;
  department?: string;
  year?: string;
  qualityPrs?: number;
  campusMerges?: number;
  totalPrs?: number;
  verificationUrl?: string;
}

interface ProofOfWorkBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProofOfWorkBadgeData;
}

export function ProofOfWorkBadgeModal({
  isOpen,
  onClose,
  data,
}: ProofOfWorkBadgeModalProps) {
  const [copiedType, setCopiedType] = React.useState<"markdown" | "html" | "link" | null>(null);

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://zenithenopen.ist.edu.in";
  const badgeImageUrl = `${origin}/api/resume/badge/${encodeURIComponent(data.username)}`;
  const verificationUrl = data.verificationUrl || `${origin}/resume?username=${encodeURIComponent(data.username)}`;

  const markdownSnippet = `[![ZenithenOpen Proof of Work](${badgeImageUrl})](${verificationUrl})`;
  const htmlSnippet = `<a href="${verificationUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeImageUrl}" alt="Verified Open-Source Engineer - ZenithenOpen IST" /></a>`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;

  const handleCopy = async (type: "markdown" | "html" | "link", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.warn("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/95 via-slate-950 to-black p-6 sm:p-8 overflow-hidden shadow-2xl z-10 text-foreground">
        <div className="absolute inset-0 bg-radial-at-t from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Verified Student Credential</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Proof-of-Work Badge Card
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Verifiable open-source credential for LinkedIn, personal portfolios, and GitHub profile READMEs.
        </p>

        {/* Live Card Preview */}
        <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-5 relative overflow-hidden shadow-xl ring-1 ring-cyan-500/20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                VERIFIED CAMPUS ENGINEER
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 font-mono">
              IST BENGALURU
            </span>
          </div>

          <div className="mt-4 flex items-center space-x-3.5">
            <div className="relative">
              <img
                src={`https://github.com/${data.username}.png`}
                alt={data.name}
                className="h-12 w-12 rounded-full border-2 border-cyan-400/80 ring-2 ring-cyan-500/20 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-white text-base leading-tight truncate">
                {data.name}
              </h4>
              <p className="text-xs text-slate-400 font-mono truncate">
                @{data.username} • {data.department || "Engineering"}
              </p>
            </div>
          </div>

          {/* 3 Stat Badges */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-center">
              <p className="text-lg font-bold text-amber-400 font-mono">{data.qualityPrs ?? 0}</p>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold truncate">Quality Merges</p>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-center">
              <p className="text-lg font-bold text-cyan-400 font-mono">{data.campusMerges ?? 0}</p>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold truncate">Campus Merges</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-center">
              <p className="text-lg font-bold text-emerald-400 font-mono">{data.totalPrs ?? 0}</p>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold truncate">Total Merged</p>
            </div>
          </div>

          <div className="mt-3 text-right">
            <span className="text-[9px] text-slate-400 font-mono">zenithenopen.ist/verify</span>
          </div>
        </div>

        {/* Share & Export Controls */}
        <div className="mt-5 space-y-2.5">
          {/* LinkedIn Direct Share */}
          <div className="flex items-center gap-2">
            <a
              href={linkedInShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                size="sm"
                className="w-full h-9 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs gap-1.5 shadow-md cursor-pointer"
              >
                <LinkedinIcon className="h-4 w-4" />
                <span>Share Proof-of-Work to LinkedIn</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </Button>
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy("link", verificationUrl)}
              className="h-9 text-xs border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white gap-1.5 cursor-pointer"
            >
              {copiedType === "link" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedType === "link" ? "Copied!" : "Copy URL"}</span>
            </Button>
          </div>

          {/* Markdown & HTML Snippet Copy Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy("markdown", markdownSnippet)}
              className="h-9 text-xs border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white gap-1.5 cursor-pointer"
            >
              {copiedType === "markdown" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Code2 className="h-3.5 w-3.5 text-cyan-400" />}
              <span>{copiedType === "markdown" ? "Markdown Copied!" : "README Markdown"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy("html", htmlSnippet)}
              className="h-9 text-xs border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white gap-1.5 cursor-pointer"
            >
              {copiedType === "html" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Code2 className="h-3.5 w-3.5 text-emerald-400" />}
              <span>{copiedType === "html" ? "HTML Copied!" : "HTML Embed"}</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Image Link Callout */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="truncate mr-2 font-mono">{badgeImageUrl}</span>
          <a
            href={badgeImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-semibold shrink-0 flex items-center gap-1"
          >
            <span>Raw SVG</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
